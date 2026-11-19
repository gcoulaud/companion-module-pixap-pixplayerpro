/** Fixed variables, plus cue_N ("N.name") and cue_N_remaining per cue. */
export function getVariables(cues = []) {
	return [
		{ variableId: 'state', name: 'State (playing, paused, stopped)' },
		{ variableId: 'title', name: 'Cue on air: name' },
		{ variableId: 'position', name: 'Cue on air: position (hh:mm:ss:ff)' },
		{ variableId: 'remaining', name: 'Cue on air: remaining time' },
		{ variableId: 'duration', name: 'Cue on air: duration' },
		{ variableId: 'playing_number', name: 'Cue on air: number' },
		{ variableId: 'standby_number', name: 'Standby cue: number' },
		{ variableId: 'standby_name', name: 'Standby cue: name' },
		{ variableId: 'cue_count', name: 'Number of cues' },
		{ variableId: 'pattern', name: 'Test pattern' },
		{ variableId: 'tone', name: 'Test tone (on, off)' },
		...cues.flatMap((c) => [
			{ variableId: `cue_${c.number}`, name: `Cue ${c.number}: number and name` },
			{ variableId: `cue_${c.number}_remaining`, name: `Cue ${c.number}: remaining time while on air` },
		]),
	]
}
