# Pocket Guitar

A self-hosted guitar practice room for learning to solo through chord changes and connect musical phrases across progressions. Designed for short, focused sessions, with G major as the default.

## Start with Docker Compose

Extract the ZIP, open a terminal in the `guitar-practice` folder, then run:

```sh
docker compose up -d --build
```

Open `http://YOUR-SERVER-IP:8088` in your browser. On the same computer, use `http://localhost:8088`.

Change `8088:80` in `compose.yaml` if port 8088 is already occupied. The app has no runtime package installs, external fonts, paid APIs or audio downloads. Docker needs access to pull the Nginx base image the first time.

To update after replacing the source files:

```sh
docker compose up -d --build
```

To stop:

```sh
docker compose down
```

## Portainer: paste a stack

1. Extract the folder onto the **Docker host**, so these files exist:
   - `/opt/guitar-practice/public/index.html`
   - `/opt/guitar-practice/nginx.conf`
2. In Portainer, choose **Stacks → Add stack → Web editor**.
3. Paste the contents of `portainer-stack.yaml`, then deploy.
4. Open `http://YOUR-SERVER-IP:8088`.

If you use another folder, change both host paths in the stack. Uploading the ZIP to your PC alone does not put the files on the Docker host. The Portainer option serves the provided files using the standard Nginx image; it does not require a locally built image. Use Docker Standalone, not a Swarm deployment with files present on only one node.

For example, if you copied the ZIP to the server:

```sh
unzip pocket-guitar-docker.zip -d /opt
```

## First session

1. Leave the key on **G** and style on **Folk**. The starting progression is **G–D–Em–C**.
2. Choose **65 BPM**, **1 bar per chord**, and **Count in**.
3. Press **Play backing**. Playback always begins at the first chord. Click a chord card while stopped to inspect it.
4. Set Focus to **Roots only**, then play G, D, E and C as each chord arrives.
5. Switch to **The third**: target **B, F♯, G and E** instead. Arrive on beat 1 and let the note ring.
6. Add one or two connecting notes, keeping the landing note and the rhythm deliberate.
7. Try **Practice path → Connect the nearest targets** to link the chords in one area of the neck.

The app suggests resting notes; it does not listen to or score your guitar. Tap a fretboard note to hear its pitch. Standard tuning only, high e at the top. The left-handed option reverses the horizontal fret direction.

## What is included

- **Jam room:** all 12 keys; folk, country, major, natural minor and classic 12-bar blues. Generate variations or edit each chord slot, with up to 16 slots.
- **Backing band:** synthesised chords and bass, optional simple percussion and metronome, straight/shuffle feel, strum/arpeggio/sustained patterns, 40–180 BPM, count-in, volume and looping. All backing is 4/4.
- **Chord targets:** current/next chord, roots/thirds/fifths/sevenths, nearby-note connection suggestions, and a tappable fretboard with selectable fret windows.
- **Scale overlays:** major/minor pentatonic, full major/natural minor, minor blues or chord tones only. Chord targets are added even when outside the selected scale.
- **Practice path:** six focused lessons plus a 20-minute guided timer and practice journal.
- **Ear trainer:** distinguish the root, major third and fifth of a major chord. No microphone required.
- **Saved setups:** save the progression, key, tempo and display settings; restore or delete later.

For blues, the default is 12 one-bar slots with dominant seventh chords. Bars per chord is locked to one. You can still edit the chord order. Minor progressions use natural minor, so the v chord is minor; a harmonic-minor major V is not included in this version.

## Controls and behaviour

- **Space** starts/stops the backing when the Jam room is open and focus is not in a form control or button.
- Changing musical settings stops playback so changes take effect cleanly at the next start. Display controls and volume can change during playback.
- The active chord and fretboard update on scheduled audio beats, with a short audio scheduling buffer.
- Playback stops when the tab is hidden, because browsers throttle background timers. Keep the tab visible while practising.
- Audio starts after a click/tap. Check browser audio permissions, output device and system volume if silent.
- The practice timer continues while you move between app tabs; pause it manually when needed. Reloading the page resets the timer.

## Data and access

Settings, up to 50 saved setups and the latest 100 practice notes use this browser's local storage. The most recent 20 notes are displayed. They are not stored in the Docker container or synced between devices. Use the same browser and address to keep your history; clearing site data removes it. Changing between an IP address and a domain creates a separate browser storage area.

The app has no accounts or server-side database. It is intended for a home network. If you expose it externally, put it behind your existing authenticated reverse proxy.

## Sound and scope

The backing uses Web Audio synthesis, not recordings of real guitar or drums. It is a timing and harmony practice aid. Percussion is deliberately simple. There is no microphone analysis, tuner, recording, automatic transcription or custom audio upload.

Useful future additions would be movable triad/inversion drills, call-and-response phrase playback, and recording short takes for comparison. Those are separate from the features delivered here.

## Local development

Serve the `public` directory over HTTP (opening `index.html` directly as a file will not load JavaScript modules reliably):

```sh
python3 -m http.server 8088 --directory public
```

Music theory tests use Node's built-in test runner; no npm install is required:

```sh
node --test tests/*.test.js
```

Files: `public/theory.js` handles pitches and chords; `audio.js` schedules sound; `app.js` connects controls, storage and fretboard; `lessons.js` contains exercises; `style.css` handles layout.


## Updating to 1.1.0

Replace the app files with this download. For the Portainer bind-mount installation, overwrite `/opt/guitar-practice/public` and refresh the page. The stack configuration is unchanged. For the built image, run `docker compose up -d --build` from the extracted folder.

This release removes the Chord flourishes tab and its exercise data, and replaces the routine's flourish stage with connecting chord tones. The strum sound now uses a richer pitched waveform, longer sustain, a clearer register and quieter percussion. Invalid accompaniment settings fall back to strumming. Late audio scheduling resumes at a future beat instead of playing a burst of old notes. Versioned app/audio links refresh the changed code; Ctrl+F5 is available if your browser still shows the old page.

Saved setups and practice notes keep the same browser storage key and remain available when using the same browser and URL. The backing is still synthesised, not a recorded acoustic guitar.
