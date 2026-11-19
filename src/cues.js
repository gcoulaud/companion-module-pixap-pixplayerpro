/** "1.name": how a cue is shown (buttons, variables, dropdowns). */
export function cueLabel(cue) {
	return `${cue.number}.${cue.name}`
}

/** Cue picker listing the player's cues; a number can also be typed. */
export function cueOption(self) {
	const cues = self.state.cues
	return {
		type: 'dropdown',
		id: 'cue',
		label: 'Cue',
		default: cues.length ? cues[0].number : 1,
		choices: cues.map((c) => ({ id: c.number, label: cueLabel(c) })),
		allowCustom: true,
		regex: '/^\\d+$/',
	}
}
