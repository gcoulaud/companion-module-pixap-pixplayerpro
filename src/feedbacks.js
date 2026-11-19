import { combineRgb } from '@companion-module/base'
import { cueOption } from './cues.js'

const green = { bgcolor: combineRgb(0, 160, 0), color: combineRgb(255, 255, 255) }
const orange = { bgcolor: combineRgb(230, 130, 0), color: combineRgb(0, 0, 0) }

export function getFeedbacks(self) {
	return {
		state: {
			type: 'boolean',
			name: 'Player state',
			defaultStyle: green,
			options: [
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'playing',
					choices: [
						{ id: 'playing', label: 'Playing' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'stopped', label: 'Stopped' },
					],
				},
			],
			callback: ({ options }) => self.state.state === options.state,
		},
		cue_playing: {
			// Beats like a heart while on air (bright red on the beats);
			// "Cue N on air (dark)" underneath fills the rests.
			type: 'boolean',
			name: 'Cue N on air (heartbeat)',
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			options: [
				cueOption(self),
				{ type: 'checkbox', id: 'steady', label: 'No heartbeat (steady red)', default: false },
			],
			callback: ({ options }) =>
				self.state.cues.some((c) => c.number === Number(options.cue) && c.playing) &&
				(self.beat || options.steady === true),
		},
		cue_on_air: {
			type: 'boolean',
			name: 'Cue N on air (dark)',
			defaultStyle: { bgcolor: combineRgb(90, 0, 0), color: combineRgb(255, 255, 255) },
			options: [cueOption(self)],
			callback: ({ options }) => self.state.cues.some((c) => c.number === Number(options.cue) && c.playing),
		},
		cue_standby: {
			type: 'boolean',
			name: 'Cue N in standby',
			defaultStyle: orange,
			options: [cueOption(self)],
			callback: ({ options }) => self.state.cues.some((c) => c.number === Number(options.cue) && c.standby),
		},
		pattern: {
			type: 'boolean',
			name: 'Test pattern shown',
			defaultStyle: orange,
			options: [
				{
					type: 'dropdown',
					id: 'pattern',
					label: 'Pattern',
					default: self.state.patterns[1] ?? 'Grid',
					choices: self.state.patterns.map((p) => ({ id: p, label: p })),
					allowCustom: true,
				},
			],
			callback: ({ options }) => self.state.pattern === options.pattern,
		},
		tone: {
			type: 'boolean',
			name: 'Test tone on',
			defaultStyle: orange,
			options: [],
			callback: () => self.state.tone,
		},
		connected: {
			type: 'boolean',
			name: 'Connected to piXplayer',
			defaultStyle: green,
			options: [],
			callback: () => self.state.connected,
		},
	}
}
