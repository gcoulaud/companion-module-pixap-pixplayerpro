import { combineRgb, EmptyUpgradeScript } from '@companion-module/base'

export const upgradeScripts = [
	// Slot of a removed script (Companion keeps counting it).
	EmptyUpgradeScript,
	// "Cue N on air" went advanced → boolean: old buttons get the bright red.
	function (_context, props) {
		const updatedFeedbacks = []
		for (const fb of props.feedbacks) {
			if (fb.feedbackId !== 'cue_playing') continue
			fb.style = { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) }
			delete fb.options.heartbeat
			updatedFeedbacks.push(fb)
		}
		return { updatedConfig: null, updatedActions: [], updatedFeedbacks }
	},
]
