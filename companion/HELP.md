## piXplayer Pro (piXap)

Controls the cue list of piXplayer Pro through its WebSocket remote.

### Setup

piXplayer Pro listens for Companion on port **8766**, always on (nothing to switch on). Enter the IP of the piXplayer computer (shown in its menu bar) and port 8766.

### Actions

GO (standby cue), GO cue N, standby cue N, play, pause, stop, jump to N seconds before the end, test pattern, 1 kHz test tone.

### Feedbacks

Playing / paused / stopped, cue N on air (heartbeat, or steady red), cue N on air (dark, under the heartbeat), cue N in standby, test pattern, test tone, connected.

### Variables

`state`, `title` (cue on air), `position`, `remaining`, `duration`, `standby_number`, `standby_name`, `playing_number`, `cue_count`, `pattern`, `tone`.
