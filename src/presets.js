import { combineRgb } from '@companion-module/base'
import { patternIcons } from './pattern_icons.js'

const white = combineRgb(255, 255, 255)
const black = combineRgb(0, 0, 0)

// A preset feedback without a style blanks the button when active.
const greenStyle = { bgcolor: combineRgb(0, 160, 0), color: white }
const orangeStyle = { bgcolor: combineRgb(230, 130, 0), color: black }
const redStyle = { bgcolor: combineRgb(200, 0, 0), color: white }

function button(category, name, text, actions, feedbacks = [], bgcolor = black) {
	return {
		type: 'button',
		category,
		name,
		style: { text, size: 'auto', color: white, bgcolor },
		steps: [{ down: actions, up: [] }],
		feedbacks,
	}
}

/** [count]: number of cue buttons (the player's cues, 12 before it is
 * known); [patterns]: the player's test patterns, the first one is Off. */
export function getPresets(count = 12, patterns = Object.keys(patternIcons)) {
	const presets = {
		go: button(
			'Transport',
			'GO',
			'GO\\n$(pixplayer:standby_number)',
			[{ actionId: 'go', options: {} }],
			[],
			combineRgb(0, 110, 0),
		),
		play_pause: button(
			'Transport',
			'Play / pause',
			'PLAY\\nPAUSE',
			[{ actionId: 'play_pause', options: {} }],
			[{ feedbackId: 'state', options: { state: 'playing' }, style: greenStyle }],
		),
		stop: button('Transport', 'Stop', 'STOP', [{ actionId: 'stop', options: {} }], [], combineRgb(140, 0, 0)),
		...Object.fromEntries(
			[30, 20, 10].map((sec) => [
				`goto_${sec}`,
				button('Transport', `Go to ${sec} s before the end`, `GOTO\\n-${sec}s`, [
					{ actionId: 'goto_end', options: { seconds: sec } },
				]),
			]),
		),
		remaining: button(
			'Display',
			'Remaining time',
			'$(pixplayer:remaining)',
			[],
			[{ feedbackId: 'state', options: { state: 'playing' }, style: greenStyle }],
		),
		position: button('Display', 'Elapsed time', '$(pixplayer:position)', []),
		title: button('Display', 'Cue on air', '$(pixplayer:title)', []),
		tone: button(
			'Tests',
			'1 kHz tone',
			'TONE',
			[{ actionId: 'tone', options: { mode: 'toggle' } }],
			[{ feedbackId: 'tone', options: {}, style: orangeStyle }],
		),
	}
	// The preset list shows what each display is; the buttons only the value.
	presets.remaining.previewStyle = { text: 'COUNTDOWN' }
	presets.position.previewStyle = { text: 'COUNT' }
	presets.title.previewStyle = { text: 'CUE ON AIR' }
	for (const [i, pattern] of patterns.entries()) {
		const off = i === 0
		presets[`pattern_${i}`] = {
			type: 'button',
			category: 'Test patterns',
			name: off ? 'Stop test pattern' : pattern,
			style: {
				text: off ? 'STOP\\nPATTERN' : pattern,
				size: '14',
				color: white,
				bgcolor: black,
				alignment: 'center:bottom',
				png64: patternIcons[pattern],
				pngalignment: 'center:center',
			},
			steps: [
				{
					down: [off ? { actionId: 'stop_pattern', options: {} } : { actionId: 'pattern', options: { pattern } }],
					up: [],
				},
			],
			feedbacks: off
				? []
				: [{ feedbackId: 'pattern', options: { pattern }, style: { color: combineRgb(255, 160, 0) } }],
		}
	}
	for (let n = 1; n <= count; n++) {
		presets[`cue_${n}`] = button(
			'Cues',
			`Standby cue ${n}`,
			`$(pixplayer:cue_${n})`,
			[{ actionId: 'standby_cue', options: { cue: n } }],
			[
				{ feedbackId: 'cue_standby', options: { cue: n }, style: orangeStyle },
				{ feedbackId: 'cue_on_air', options: { cue: n } },
				{ feedbackId: 'cue_playing', options: { cue: n } },
			],
		)
	}
	return presets
}
