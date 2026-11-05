const SILENT_AUDIO =
  'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

class AudioManager {
  constructor() {
    this.playlist = [];
    this.$players = $('<div id="players">');
    // Honor the browser's actual playback decision, including existing permission.
    this.blocked = false;
    this.channels = {
      music: this.createChannel('music'),
      voice: this.createChannel('voice'),
    };
    this.soundButton = document.createElement('button');
    this.soundButton.id = 'enable-sound';
    this.soundButton.type = 'button';
    this.soundButton.textContent = 'Enable sound';
    this.soundButton.hidden = true;
    this.soundButton.addEventListener('click', () => this.enableSound());
    document.body.append(this.soundButton);
    this.vocallocal = {
      cc: [],
      lf: [`/vocallocal/DAYPART_DEFAULT1.wav`],
      bl: [],
    };

    $('body').append(this.$players);

    if (audioSettings.enableMusic) {
      this.buildPlaylist();
      if (audioSettings.randomStart) {
        this.shuffleStart();
      }
      if (audioSettings.shuffle) {
        shuffle(this.playlist);
      }
      //this.startPlaying(this.playlist, true);
    }
  }

  shuffleStart() {
    var firstHalf = this.playlist;
    var secondHalf = firstHalf.splice(Math.floor(Math.random() * firstHalf.length));
    this.playlist = [...secondHalf, ...firstHalf];
  }

  playCC(vl) {
    if (vl) {
      this.startPlaying(this.vocallocal.cc, false);
    } else {
      this.startPlaying(['narrations/Your_current_conditions.mp3'], false);
    }
  }

  playRadar() {
    this.startPlaying(
      [`/vocallocal/doppler/LRADAR_DEFAULT${Math.floor(Math.random()) + 1}.wav`],
      false,
    );
  }

  playBulletin() {
    this.startPlaying(this.vocallocal.bl, false);
  }

  playLF() {
    this.startPlaying(this.vocallocal.lf, false);
  }

  playEF() {
    this.startPlaying(
      [`/vocallocal/weekahead/7DAY_DEFAULT${Math.floor(Math.random() * 3) + 1}.wav`],
      false,
    );
  }

  playSevere(name) {
    if (name == 'Flash Flood Warning') {
      this.startPlaying(
        ['/vocallocal/beep.wav', '/vocallocal/FFLOOD_DEFAULT.wav', '/vocallocal/beep.wav'],
        false,
      );
    } else if (name == 'Tornado Warning') {
      this.startPlaying(
        ['/vocallocal/beep.wav', '/vocallocal/TORNADO_DEFAULT.wav', '/vocallocal/beep.wav'],
        false,
      );
    } else if (name == 'Severe Thunderstorm Warning') {
      this.startPlaying(
        ['/vocallocal/beep.wav', '/vocallocal/TSTORM_DEFAULT.wav', '/vocallocal/beep.wav'],
        false,
      );
    } else {
      this.startPlaying(
        [
          '/vocallocal/beep.wav',
          '/vocallocal/beep.wav',
          '/vocallocal/beep.wav',
          '/vocallocal/beep.wav',
        ],
        false,
      );
    }
  }

  buildPlaylist() {
    this.playlist = [];
    var musicPath = 'music/';
    for (var i = 0; i < audioSettings.order.length; i++) {
      this.playlist.push(`${musicPath}${audioSettings.order[i]}.mp3`);
    }
  }

  createChannel(type) {
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    this.$players.append(audio);
    const channel = { audio, type, tracks: [], index: 0, active: false, loop: false, failures: 0 };
    audio.addEventListener('ended', () => {
      if (!channel.active) return;
      channel.failures = 0;
      this.advance(channel);
    });
    audio.addEventListener('error', () => {
      if (!channel.active) return;
      console.warn(`[Boone audio] ${type} track unavailable`);
      channel.failures++;
      this.advance(channel);
    });
    audio.addEventListener('loadedmetadata', () => {
      if (!channel.active || type !== 'music') return;
      const offset = Math.abs(Number(audioSettings.offset) || 0);
      if (Number.isFinite(audio.duration) && offset < audio.duration) audio.currentTime = offset;
    });
    return channel;
  }

  startPlaying(tracks, loop) {
    const type = loop ? 'music' : 'voice';
    if ((loop && !audioSettings.enableMusic) || (!loop && !audioSettings.narrations)) return;
    const channel = this.channels[type];
    if (!Array.isArray(tracks) || !tracks.length) return;
    if (channel.active && (!this.blocked || type === 'music')) return;
    channel.tracks = [...tracks];
    channel.index = 0;
    channel.loop = loop;
    channel.failures = 0;
    channel.active = true;
    this.loadTrack(channel);
  }

  loadTrack(channel) {
    channel.audio.src = channel.tracks[channel.index];
    channel.audio.volume = channel.type === 'music' && !this.channels.voice.active ? 0.8 : 0.3;
    if (channel.type === 'voice') {
      channel.audio.volume = 1;
      this.channels.music.audio.volume = 0.3;
    }
    if (this.blocked) {
      this.soundButton.hidden = false;
      return;
    }
    this.playChannel(channel);
  }

  playChannel(channel) {
    try {
      return Promise.resolve(channel.audio.play()).catch((error) => this.handlePlayError(error));
    } catch (error) {
      this.handlePlayError(error);
      return Promise.resolve();
    }
  }

  handlePlayError(error) {
    if (error.name === 'AbortError') return;
    if (error.name === 'NotAllowedError') {
      if (!this.blocked) console.info('[Boone audio] Waiting for a tap to enable sound');
      this.blocked = true;
      this.soundButton.hidden = false;
      // Subsequent slides queue normally, without retrying blocked playback.
      for (const channel of Object.values(this.channels)) channel.audio.pause();
    } else {
      console.warn('[Boone audio] Playback unavailable');
    }
  }

  enableSound() {
    this.blocked = false;
    this.soundButton.hidden = true;
    // Both persistent elements must be played directly inside the tap handler.
    for (const channel of Object.values(this.channels)) {
      if (channel.active) {
        this.playChannel(channel);
      } else {
        channel.audio.src = SILENT_AUDIO;
        this.playChannel(channel).then(() => {
          if (!channel.active) channel.audio.pause();
        });
      }
    }
  }

  advance(channel) {
    channel.index++;
    if (
      channel.failures >= channel.tracks.length ||
      (!channel.loop && channel.index >= channel.tracks.length)
    ) {
      channel.active = false;
      channel.audio.pause();
      if (channel.type === 'voice') this.channels.music.audio.volume = 0.8;
      return;
    }
    channel.index %= channel.tracks.length;
    this.loadTrack(channel);
  }

  stopPlaying() {
    const channel = this.channels.music;
    channel.audio.pause();
    channel.active = false;
  }
}

var audioPlayer = new AudioManager();
