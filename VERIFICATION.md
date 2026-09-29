# Verification — 1.3.0

Completed:
- 25 automated tests: music theory, all built-in accompaniment/key combinations, timing and looping, next-chord selectors, shared tones, expressive lick transposition, adapted final targets, shuffle timing, articulation scheduling and automatic text contrast.
- Headless Chromium integration checks: upcoming all/root/third options, current/shared/next-only markers, colour and checkbox persistence, live option changes without stopping playback, chord changes and wraparound, absence of separate Connect tab, expressive tab notation, single-play stopping, Adapt mode and shuffle playback, all six phrases in all 12 keys, no page JavaScript errors.
- Real OfflineAudioContext rendered bend/release, hammer-on and slide/vibrato examples. All produced non-silent audio. Unit tests additionally check target frequencies, continuous pitch changes and single-attack legato behaviour.
- Desktop Jam room and Lick Lab screenshots inspected. Mobile layout checked at 390px without page-level horizontal overflow; wide tab and fretboard panels scroll internally.
- A playback highlight error discovered in the first integration run was corrected; the repeated browser run passed.

Limits:
- Docker is unavailable here; the unchanged container configuration has not been executed in this environment.
- Tests verify audio generation and pitch/timing behaviour, not perceived realism on your speakers. The lead remains a synthesised practice guide.
- No microphone capture or automatic assessment of your guitar playing.

Quick checks after updating:
1. Confirm version 1.3 in the header and four tabs: Jam room, Lick Lab, Practice path, Ear trainer.
2. In G Country, enable upcoming targets. Over G, C/E should use the upcoming colour while shared G keeps its current fill and gains a ring.
3. Try Third only: E should be the target for the upcoming C chord. Let playback advance and check that the targets follow the next chord.
4. In Lick Lab, try Pedal-steel country answer, then Minor blues bend & reply at 60–65 BPM. Watch the technique markings and listen for pitch movement.
5. Use Adapt mode: the final target changes while the opening techniques stay intact.
