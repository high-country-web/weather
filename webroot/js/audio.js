// Reuse the same media elements across slides and tracks, including in Safari.
const SILENT_AUDIO =
  'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

class AudioManager {
  constructor() {
    // Some upstream startup routines construct the manager again.
    if (window.weatherAudioPlayer) return window.weatherAudioPlayer;
    window.weatherAudioPlayer = this;
    this.slug = location.pathname.split('/')[1] || 'intellistar-1';
    this.preferences = { music: 80, narration: 100, muted: false, choice: 'ask' };
    this.loadPreferences();
    this.soundEnabled = this.preferences.choice !== 'silent';
    this.vocallocal =
      this.slug === 'weatherstar-xl'
        ? []
        : {
            cc: [],
            lf: ['/vocallocal/DAYPART_DEFAULT1.wav'],
            bl: [],
          };
    this.container = document.createElement('div');
    this.container.id = 'players';
    document.body.append(this.container);
    this.channels = { music: this.createChannel('music'), voice: this.createChannel('voice') };
    this.playlist = [];
    this.buildPlaylist();
    if (this.settings.randomStart) this.shuffleStart();
    if (this.settings.shuffle) {
      for (let i = this.playlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
      }
    }
  }

  get settings() {
    return typeof systemSettings === 'undefined' ? audioSettings : systemSettings.audioSettings;
  }

  loadPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem('weather-audio'));
      if (!saved) return;
      for (const key of ['music', 'narration']) {
        if (Number.isFinite(saved[key]))
          this.preferences[key] = Math.max(0, Math.min(100, saved[key]));
      }
      this.preferences.muted = saved.muted === true;
      if (['enabled', 'silent'].includes(saved.choice)) this.preferences.choice = saved.choice;
    } catch (_) {
      /* Storage is optional. */
    }
  }

  savePreferences() {
    try {
      localStorage.setItem('weather-audio', JSON.stringify(this.preferences));
    } catch (_) {}
    this.applyVolumes();
    if (this.soundEnabled && !this.preferences.muted) {
      for (const channel of Object.values(this.channels)) {
        if (channel.active && channel.audio.paused) this.playChannel(channel);
      }
    }
    window.updateAudioControls?.();
  }

  createChannel(type) {
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    this.container.append(audio);
    const channel = { audio, type, tracks: [], index: 0, active: false, loop: false, failures: 0 };
    audio.addEventListener('playing', () => this.applyVolumes());
    audio.addEventListener('pause', () => this.applyVolumes());
    audio.addEventListener('ended', () => {
      if (!channel.active) return;
      channel.failures = 0;
      this.advance(channel);
    });
    audio.addEventListener('error', () => {
      if (!channel.active) return;
      console.warn(`[Weather audio] ${type} track unavailable; skipping`);
      channel.failures++;
      this.advance(channel);
    });
    audio.addEventListener('loadedmetadata', () => {
      const offset = type === 'music' ? Math.abs(Number(this.settings.offset) || 0) : 0;
      if (channel.active && offset && offset < audio.duration) audio.currentTime = offset;
    });
    return channel;
  }

  initializeAudio() {
    if (this.settings.enableMusic) this.startPlaying(this.playlist, true);
  }

  buildPlaylist() {
    this.playlist = (this.settings.order || []).map((track) => {
      if (typeof track === 'string' && /^(blob:|https?:|\/)/.test(track)) return track;
      if (typeof track === 'number' && this.slug.includes('-v') && track >= 34)
        return `music/v1/Track ${track - 33}.mp3`;
      return `music/${typeof track === 'number' ? `Track ${track}` : track}.mp3`;
    });
  }

  shuffleStart() {
    const index = Math.floor(Math.random() * this.playlist.length);
    this.playlist = [...this.playlist.slice(index), ...this.playlist.slice(0, index)];
  }

  startPlaying(tracks, loop = false) {
    if (!Array.isArray(tracks) || !tracks.length) return;
    if ((loop && !this.settings.enableMusic) || (!loop && !this.settings.narrations)) return;
    const channel = this.channels[loop ? 'music' : 'voice'];
    if (channel.active && ((this.soundEnabled && !this.preferences.muted) || loop)) return;
    channel.tracks = tracks.filter((track) => typeof track === 'string' && track.length);
    if (!channel.tracks.length) return;
    Object.assign(channel, { index: 0, active: true, loop, failures: 0 });
    this.loadTrack(channel);
  }

  loadTrack(channel) {
    // Resolve relative to the player's <base>, not the gallery or shared script.
    channel.audio.src = new URL(channel.tracks[channel.index], document.baseURI).href;
    this.applyVolumes();
    if (this.soundEnabled && !this.preferences.muted) this.playChannel(channel);
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
    if (error.name !== 'NotAllowedError') {
      console.warn('[Weather audio] Playback unavailable');
      return;
    }
    this.soundEnabled = false;
    for (const channel of Object.values(this.channels)) channel.audio.pause();
    if (this.preferences.choice !== 'silent') this.showSoundPrompt();
    window.updateAudioControls?.();
  }

  showSoundPrompt() {
    const prompt = document.getElementById('audio-permission');
    if (prompt) prompt.hidden = false;
  }

  enableSound() {
    this.soundEnabled = true;
    this.preferences.choice = 'enabled';
    this.preferences.muted = false;
    const prompt = document.getElementById('audio-permission');
    if (prompt) prompt.hidden = true;
    if (this.settings.enableMusic && !this.channels.music.active)
      this.startPlaying(this.playlist, true);
    // Play both persistent elements in the tap handler, without awaiting either.
    for (const channel of Object.values(this.channels)) {
      if (channel.active) this.playChannel(channel);
      else {
        channel.audio.src = SILENT_AUDIO;
        this.playChannel(channel).then(() => {
          if (!channel.active) channel.audio.pause();
        });
      }
    }
    this.savePreferences();
  }

  continueSilently() {
    this.soundEnabled = false;
    Object.assign(this.preferences, { choice: 'silent', muted: true });
    for (const channel of Object.values(this.channels)) channel.audio.pause();
    this.channels.voice.active = false;
    const prompt = document.getElementById('audio-permission');
    if (prompt) prompt.hidden = true;
    this.savePreferences();
  }

  applyVolumes() {
    if (!this.channels) return;
    const voice = this.channels.voice;
    const muted = this.preferences.muted || !this.soundEnabled;
    const duck = voice.active && !voice.audio.paused ? 0.375 : 1;
    this.channels.music.audio.volume = muted ? 0 : (this.preferences.music / 100) * duck;
    voice.audio.volume = muted ? 0 : this.preferences.narration / 100;
  }

  advance(channel) {
    channel.index++;
    if (
      channel.failures >= channel.tracks.length ||
      (!channel.loop && channel.index >= channel.tracks.length)
    ) {
      channel.active = false;
      channel.audio.pause();
      this.applyVolumes();
      return;
    }
    channel.index %= channel.tracks.length;
    this.loadTrack(channel);
  }

  stopPlaying() {
    this.channels.music.audio.pause();
  }
  resumePlaying() {
    if (this.soundEnabled) this.playChannel(this.channels.music);
  }
  playMusicLoop() {
    this.startPlaying(this.playlist, true);
  }
  playVoice(files) {
    this.startPlaying(files, false);
  }

  narration(file) {
    this.playVoice([`narrations/${file}`]);
  }
  playCC(vocal) {
    if (this.slug === 'intellistar-1') {
      this.playVoice(
        vocal && this.vocallocal.cc.length ? this.vocallocal.cc : ['/vocallocal/CC_INTRO1.wav'],
      );
    } else if (this.slug === 'weatherstar-xl' && vocal && this.vocallocal.length)
      this.playVoice(this.vocallocal);
    else
      this.narration(
        this.slug.includes('-v')
          ? 'Local-CurrentConditions_Default1.wav'
          : 'Your_current_conditions.mp3',
      );
  }
  playLF() {
    if (this.slug === 'intellistar-1') this.playVoice(this.vocallocal.lf);
    else
      this.narration(
        this.slug.includes('-v')
          ? 'Local-TextForecast_Default1.wav'
          : this.slug === 'weatherstar-xl'
            ? 'The_forecast_for_your_area.mp3'
            : 'Your_local_forecast.mp3',
      );
  }
  playEF() {
    if (this.slug === 'intellistar-1') this.playVoice(['/vocallocal/weekahead/7DAY_DEFAULT1.wav']);
    else if (this.slug === 'weatherstar-xl') this.narration('Your_extended_forecast.mp3');
    else this.playLF();
  }
  playDP() {
    this.narration('Local-DaypartForecast_Default1.wav');
  }
  playTrafficCond() {
    this.narration('Local-TrafficOverview_Default1.wav');
  }
  playTrafficFlow() {
    this.narration('Local-TrafficFlow_Default1.wav');
  }
  playRegionalForecast() {
    this.narration('Local-RegionalForecastConditions_Default1.wav');
  }
  playPollenReport() {
    this.narration('Local-AllergyReport_Default1.wav');
  }
  playAirportConditions() {
    this.narration('Local-LocalAirportConditions_Default1.wav');
  }
  playDopplerRadar() {
    this.narration('Local-LocalDoppler_Default1.wav');
  }
  playRadar() {
    this.playVoice(['/vocallocal/doppler/LRADAR_DEFAULT1.wav']);
  }
  playBulletin() {
    this.playVoice(this.vocallocal.bl);
  }
  playWarningBeep() {
    this.narration(this.slug.includes('-v') ? 'beep.wav' : 'warningbeep.wav');
  }
  playSevere(name) {
    const warning =
      {
        'Flash Flood Warning': 'FFLOOD_DEFAULT.wav',
        'Tornado Warning': 'TORNADO_DEFAULT.wav',
        'Severe Thunderstorm Warning': 'TSTORM_DEFAULT.wav',
      }[name] || 'BULLETIN_DEFAULT.wav';
    this.playVoice(['/vocallocal/beep.wav', `/vocallocal/${warning}`, '/vocallocal/beep.wav']);
  }
}

var audioPlayer = new AudioManager();
