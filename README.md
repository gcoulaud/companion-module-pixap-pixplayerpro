# companion-module-pixap-pixplayerpro

[Bitfocus Companion](https://bitfocus.io/companion) module for **piXplayer Pro** by piXap, a cue-list media server for live events and installations on macOS and Windows.

The module controls the player over its WebSocket JSON remote.

## Setup

1. In piXplayer Pro, the remote is always on, on port **8766**.
2. In Companion, add a **piXplayer Pro** (pixap-pixplayerpro) connection.
3. Enter the IP address of the piXplayer computer (shown in its menu bar) and port 8766.

The connection reconnects by itself if the player is restarted.

## Actions

- GO (standby cue), GO cue N, standby cue N
- Play (resume), pause, play / pause toggle, stop
- Jump to N seconds before the end
- Test pattern, stop test pattern, 1 kHz test tone

## Feedbacks

- Player state: playing, paused or stopped
- Cue N on air (heartbeat): bright red on the beats; tick *No heartbeat* for a steady red
- Cue N on air (dark): dark red while on air, under the heartbeat
- Cue N in standby
- Test pattern shown, test tone on
- Connected to piXplayer

## Variables

| Variable | Content |
| --- | --- |
| `state` | playing, paused, stopped |
| `title` | Cue on air |
| `position` | Elapsed time |
| `remaining` | Remaining time |
| `duration` | Duration of the cue on air |
| `playing_number` | Number of the cue on air |
| `standby_number`, `standby_name` | Standby cue |
| `cue_count` | Number of cues |
| `cue_N` | Number and name of cue N |
| `pattern`, `tone` | Test pattern, test tone (on, off) |

Times are shown as hh:mm:ss:ff. The hours are left out for media under an hour, and the minutes for media under a minute. The countdown shows frames only in its last minute.

## Presets

- **Transport**: GO (with the standby cue number), play / pause, stop, GOTO -30 s, -20 s, -10 s
- **Display**: remaining time, elapsed time, cue on air
- **Cues**: one button per cue (standby on press, orange in standby, heartbeat red on air)
- **Test patterns** and **1 kHz tone**

## Development

```sh
npm install
```

Point Companion's *Developer modules path* at the folder that contains this repository. Companion reloads the module when a file changes.

## License

MIT
