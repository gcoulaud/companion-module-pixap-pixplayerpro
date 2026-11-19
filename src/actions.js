import { cueOption } from './cues.js'

export function getActions(self) {
	const patterns = self.state.patterns.length ? self.state.patterns : ['Off']
	return {
		go: {
			name: 'GO (standby cue)',
			options: [],
			callback: () => {
				self.send('go')
				self.poll()
			},
		},
		go_cue: {
			name: 'GO cue N',
			options: [cueOption(self)],
			callback: ({ options }) => self.send(`go ${Number(options.cue)}`),
		},
		standby_cue: {
			name: 'Standby cue N',
			options: [cueOption(self)],
			callback: ({ options }) => {
				self.send(`standby ${Number(options.cue)}`)
				// Standby shows at once on the buttons, not at the next poll.
				self.poll()
			},
		},
		play: {
			name: 'Play (resume)',
			options: [],
			callback: () => self.send('play'),
		},
		pause: {
			name: 'Pause',
			options: [],
			callback: () => self.send('pause'),
		},
		play_pause: {
			name: 'Play / pause toggle',
			options: [],
			callback: () => self.send(self.state.state === 'playing' ? 'pause' : 'play'),
		},
		stop: {
			name: 'Stop',
			options: [],
			callback: () => self.send('stop'),
		},
		goto_end: {
			name: 'Jump to N seconds before the end',
			options: [
				{
					type: 'number',
					id: 'seconds',
					label: 'Seconds before the end',
					default: 10,
					min: 0,
					max: 86400,
				},
			],
			callback: ({ options }) => self.send(`goto ${options.seconds}`),
		},
		pattern: {
			name: 'Test pattern',
			options: [
				{
					type: 'dropdown',
					id: 'pattern',
					label: 'Pattern',
					default: patterns[0],
					choices: patterns.map((p) => ({ id: p, label: p })),
					allowCustom: true,
				},
			],
			callback: ({ options }) => self.send('pattern', options.pattern),
		},
		stop_pattern: {
			name: 'Stop test pattern (show media)',
			options: [],
			callback: () => self.send('pattern', 'off'),
		},
		tone: {
			name: '1 kHz test tone',
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Tone',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: ({ options }) => {
				const on = options.mode === 'toggle' ? !self.state.tone : options.mode === 'on'
				self.send('tone', on)
			},
		},
	}
}
