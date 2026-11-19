import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import WebSocket from 'ws'
import { getActions } from './actions.js'
import { getFeedbacks } from './feedbacks.js'
import { getPresets } from './presets.js'
import { getVariables } from './variables.js'
import { upgradeScripts } from './upgrades.js'
import { cueLabel } from './cues.js'

// Values the player only sends when asked: polled while connected.
const POLL_MS = 500
const RECONNECT_MS = 2000

class PiXplayerInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.ws = null
		this.pollTimer = null
		this.reconnectTimer = null
		this.state = {
			connected: false,
			state: 'stopped',
			title: '',
			position: '',
			remaining: '',
			duration: '',
			cues: [],
			pattern: '',
			patterns: [],
			tone: false,
		}
	}

	async init(config) {
		this.config = config
		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
		this.setVariableDefinitions(getVariables())
		this.setPresetDefinitions(getPresets())
		this.updateVariables()
		// Heartbeat of the cue on air: two beats, then a rest (1.2 s).
		const beats = [1, 0, 1, 0, 0, 0, 0, 0]
		let step = 0
		this.beat = false
		this.beatTimer = setInterval(() => {
			const on = beats[step++ % beats.length] === 1
			if (on === this.beat || !this.state.cues.some((c) => c.playing)) return
			this.beat = on
			this.checkFeedbacks('cue_playing')
		}, 150)
		this.connect()
	}

	async destroy() {
		clearInterval(this.beatTimer)
		this.disconnect()
	}

	async configUpdated(config) {
		this.config = config
		this.disconnect()
		this.connect()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'piXplayer IP',
				width: 8,
				default: '127.0.0.1',
			},
			{
				type: 'number',
				id: 'port',
				label: 'Port',
				width: 4,
				min: 1024,
				max: 65535,
				default: 8766,
			},
		]
	}

	connect() {
		const host = (this.config?.host || '').trim()
		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No IP')
			return
		}
		this.updateStatus(InstanceStatus.Connecting)
		const ws = new WebSocket(`ws://${host}:${this.config.port || 8766}/`)
		this.ws = ws
		ws.on('open', () => {
			this.setConnected(true)
			this.updateStatus(InstanceStatus.Ok)
			// Streamed every 200 ms by the player once asked.
			this.send('positionTc')
			this.send('countdownTc')
			this.send('pattern')
			this.poll()
			this.pollTimer = setInterval(() => this.poll(), POLL_MS)
		})
		ws.on('message', (data) => this.onMessage(data.toString()))
		ws.on('error', (err) => {
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})
		ws.on('close', () => {
			if (this.ws !== ws) {
				return
			}
			this.stopPolling()
			this.ws = null
			this.setConnected(false)
			this.updateStatus(InstanceStatus.Disconnected)
			this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_MS)
		})
	}

	disconnect() {
		clearTimeout(this.reconnectTimer)
		this.stopPolling()
		const ws = this.ws
		this.ws = null
		ws?.terminate()
		this.setConnected(false)
	}

	stopPolling() {
		clearInterval(this.pollTimer)
		this.pollTimer = null
	}

	poll() {
		this.send('state')
		this.send('title')
		this.send('durationTc')
		this.send('cues')
	}

	/** Sends `{"cmd": cmd}`, plus `value` when given. */
	send(cmd, value) {
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return
		}
		this.ws.send(JSON.stringify(value === undefined ? { cmd } : { cmd, value }))
	}

	setConnected(connected) {
		if (this.state.connected !== connected) {
			this.state.connected = connected
			this.checkFeedbacks('connected')
		}
	}

	onMessage(text) {
		let msg
		try {
			msg = JSON.parse(text)
		} catch {
			return
		}
		const s = this.state
		switch (msg.type) {
			case 'state':
				s.state = msg.value ?? 'stopped'
				this.checkFeedbacks('state')
				break
			case 'title':
				s.title = msg.value ?? ''
				break
			case 'positionTc':
				s.position = msg.value ?? ''
				break
			case 'countdownTc':
				// Without the player's leading "-": Companion leaves a button
				// blank when its text starts that way.
				s.remaining = (msg.value ?? '').replace(/^-/, '')
				break
			case 'durationTc':
				s.duration = msg.value ?? ''
				break
			case 'cues': {
				const cues = Array.isArray(msg.value) ? msg.value : []
				const names = (list) => list.map(cueLabel).join('\n')
				const changed = names(cues) !== names(s.cues)
				s.cues = cues
				if (changed) {
					// Cue variables, presets and dropdowns follow the list.
					this.setVariableDefinitions(getVariables(cues))
					this.setActionDefinitions(getActions(this))
					this.setFeedbackDefinitions(getFeedbacks(this))
					this.updatePresets()
				}
				this.checkFeedbacks('cue_playing', 'cue_on_air', 'cue_standby')
				break
			}
			case 'pattern': {
				s.pattern = msg.value ?? ''
				s.tone = !!msg.tone
				const choices = Array.isArray(msg.choices) ? msg.choices : []
				if (choices.join() !== s.patterns.join()) {
					s.patterns = choices
					// Pattern dropdowns and buttons list the player's own choices.
					this.setActionDefinitions(getActions(this))
					this.setFeedbackDefinitions(getFeedbacks(this))
					this.updatePresets()
				}
				this.checkFeedbacks('tone', 'pattern')
				break
			}
			case 'error':
				this.log('warn', `piXplayer: ${msg.message}`)
				return
			default:
				return
		}
		this.updateVariables()
	}

	updatePresets() {
		const s = this.state
		this.setPresetDefinitions(getPresets(s.cues.length || 12, s.patterns.length ? s.patterns : undefined))
	}

	updateVariables() {
		const s = this.state
		const standby = s.cues.find((c) => c.standby)
		const playing = s.cues.find((c) => c.playing)
		this.setVariableValues({
			state: s.state,
			title: s.title,
			// Nothing on air: labels instead of empty buttons, and the standby
			// cue's duration as the countdown.
			position: s.state === 'stopped' ? 'COUNT' : noHours(s.position, s.duration),
			remaining:
				s.state === 'stopped'
					? standby?.duration
						? noFrames(standby.duration, noHours(standby.duration, standby.duration))
						: 'COUNTDOWN'
					: noFrames(s.remaining, noHours(s.remaining, s.duration)),
			duration: noHours(s.duration, s.duration),
			standby_number: standby?.number ?? '',
			standby_name: standby?.name ?? '',
			playing_number: playing?.number ?? '',
			cue_count: s.cues.length,
			pattern: s.pattern,
			tone: s.tone ? 'on' : 'off',
			...Object.fromEntries(s.cues.map((c) => [`cue_${c.number}`, cueLabel(c)])),
			// No countdown on the cue buttons (kept empty for old buttons).
			...Object.fromEntries(s.cues.map((c) => [`cue_${c.number}_remaining`, ''])),
		})
	}
}

runEntrypoint(PiXplayerInstance, upgradeScripts)

/** Drops the hours when the media (ref) lasts under an hour ("17:42:10"),
 *  and the minutes too under a minute ("42:10"). */
function noHours(tc, ref) {
	let t = tc ?? ''
	if (/^00:/.test(ref ?? '')) t = t.replace(/^00:/, '')
	if (/^00:00:/.test(ref ?? '')) t = t.replace(/^00:/, '')
	return t
}

/** Frames only in the last minute: "17:42" until 00:00:59:24 is left. */
function noFrames(raw, tc) {
	return /^00:00:/.test(raw ?? '') ? tc : tc.replace(/:\d+$/, '')
}
