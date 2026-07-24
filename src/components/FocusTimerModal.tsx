import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Coffee,
  Flame,
  Wind,
  Maximize,
  BellOff,
  Sparkles,
} from 'lucide-react';
import { FocusSession } from '../types';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (session: FocusSession) => void;
}

type TimerMode = 'Pomodoro' | 'Short Break' | 'Long Break';

type AmbientSoundId = 'none' | 'rain' | 'waves' | 'cafe' | 'campfire' | 'wind';

interface AmbientSoundOption {
  id: AmbientSoundId;
  name: string;
  emoji: string;
  description: string;
}

const modeDurations: Record<TimerMode, number> = {
  Pomodoro: 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60,
};

const AMBIENT_SOUNDS: AmbientSoundOption[] = [
  { id: 'none', name: 'Mute', emoji: '🔇', description: 'Silent focus' },
  { id: 'rain', name: 'Rain Sounds', emoji: '🌧️', description: 'Relaxing pink noise' },
  { id: 'waves', name: 'Ocean Waves', emoji: '🌊', description: 'Rolling shore waves' },
  { id: 'cafe', name: 'Coffee Shop', emoji: '☕', description: 'Soft background chatter hum' },
  { id: 'campfire', name: 'Campfire', emoji: '🪵', description: 'Warm crackling wood' },
  { id: 'wind', name: 'Forest Wind', emoji: '🍃', description: 'Gentle breeze in trees' },
];

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
}) => {
  const [mode, setMode] = useState<TimerMode>('Pomodoro');
  const [timeLeft, setTimeLeft] = useState(modeDurations.Pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [taskLabel, setTaskLabel] = useState('Finish IBM Project');

  // Ambient Sound State
  const [activeSound, setActiveSound] = useState<AmbientSoundId>('rain');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioNodesRef = useRef<{
    audioCtx: AudioContext | null;
    sourceNodes: (AudioNode | number)[];
  }>({
    audioCtx: null,
    sourceNodes: [],
  });

  // Full Screen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Stop current ambient audio
  const stopAmbientAudio = () => {
    if (audioNodesRef.current.audioCtx) {
      try {
        audioNodesRef.current.audioCtx.close();
      } catch (e) {}
      audioNodesRef.current.audioCtx = null;
      audioNodesRef.current.sourceNodes = [];
    }
    setIsAudioPlaying(false);
  };

  // Play ambient sound by sound ID
  const playAmbientSound = (soundId: AmbientSoundId) => {
    stopAmbientAudio();

    if (soundId === 'none') {
      setActiveSound('none');
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      const sources: (AudioNode | number)[] = [];

      if (soundId === 'rain') {
        // Pink noise generator for natural rain
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 2.8;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();

        sources.push(noise, filter, gain);
      } else if (soundId === 'waves') {
        // Ocean waves with sweeping filter LFO
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);

        // LFO for wave oscillation (sweeps lowpass filter between 150Hz and 800Hz)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 1 wave cycle every 10 secs

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(350, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        lfo.start();

        sources.push(noise, filter, lfo, lfoGain, gain);
      } else if (soundId === 'cafe') {
        // Soft ambient coffee shop background hum
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const lpFilter = ctx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(1600, ctx.currentTime);

        const hpFilter = ctx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(250, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.09, ctx.currentTime);

        noise.connect(lpFilter);
        lpFilter.connect(hpFilter);
        hpFilter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        sources.push(noise, lpFilter, hpFilter, gain);
      } else if (soundId === 'campfire') {
        // Campfire with crackle simulation
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.05;

          // Add random sharp pop bursts
          if (Math.random() < 0.001) {
            data[i] += (Math.random() - 0.5) * 0.8;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.14, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        sources.push(noise, filter, gain);
      } else if (soundId === 'wind') {
        // Forest wind with modulated bandpass filter
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(250, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        lfo.start();

        sources.push(noise, filter, lfo, lfoGain, gain);
      }

      audioNodesRef.current = { audioCtx: ctx, sourceNodes: sources };
      setActiveSound(soundId);
      setIsAudioPlaying(true);
    } catch (e) {
      console.error('Ambient audio error:', e);
    }
  };

  // Toggle Full Screen Mode
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Reset timer when switching modes
  const handleSwitchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
    setIsRunning(false);
  };

  // Completion chime
  const playCompletionChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playCompletionChime();

      // Log session
      const newSession: FocusSession = {
        id: Date.now().toString(),
        durationMinutes: Math.round(modeDurations[mode] / 60),
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: mode,
        label: taskLabel || (mode === 'Pomodoro' ? 'Deep Focus Session' : mode),
      };
      onAddSession(newSession);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, taskLabel, onAddSession]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = modeDurations[mode];
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative overflow-hidden flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Focus Mode</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Eliminate distractions & enter deep flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Task Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Current Task:
          </label>
          <input
            type="text"
            placeholder="e.g. Finish IBM Project"
            value={taskLabel}
            onChange={(e) => setTaskLabel(e.target.value)}
            className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
          {(['Pomodoro', 'Short Break', 'Long Break'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleSwitchMode(m)}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === m
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Time Remaining Section */}
        <div className="flex flex-col items-center justify-center py-1 relative">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Time Remaining
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-orange-500 transition-all duration-300"
                strokeWidth="6"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute text-center">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {formattedTime}
              </span>
              <span className="block text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1 uppercase tracking-wider">
                {mode}
              </span>
            </div>
          </div>
        </div>

        {/* Controls: [Start] [Pause] [Reset] */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Start
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" /> Pause
            </button>
          )}

          <button
            onClick={() => {
              setTimeLeft(modeDurations[mode]);
              setIsRunning(false);
            }}
            className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          <button
            onClick={playCompletionChime}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
            title="Test Chime Sound"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Soundscapes Section */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>🎵 Ambient Focus Soundscapes</span>
              {isAudioPlaying && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </div>
            {isAudioPlaying && (
              <button
                onClick={stopAmbientAudio}
                className="text-[11px] text-red-500 hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <VolumeX className="w-3 h-3" /> Stop Sound
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {AMBIENT_SOUNDS.map((snd) => {
              const isActive = activeSound === snd.id && isAudioPlaying;
              return (
                <button
                  key={snd.id}
                  onClick={() => {
                    if (isActive) {
                      stopAmbientAudio();
                    } else {
                      playAmbientSound(snd.id);
                    }
                  }}
                  className={`p-2 rounded-lg text-left transition-all cursor-pointer border flex flex-col justify-between h-16 ${
                    isActive
                      ? 'bg-orange-500 text-white border-orange-500 shadow-2xs font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{snd.emoji}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isActive ? 'Playing' : 'Select'}
                    </span>
                  </div>
                  <div className="truncate font-semibold text-xs mt-0.5">{snd.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🔕 Focus Tips Box */}
        <div className="p-3.5 rounded-xl bg-[#FFF8F5] dark:bg-slate-800/80 border border-orange-200/60 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
            <span className="flex items-center gap-1.5">
              <BellOff className="w-3.5 h-3.5" /> 🔕 Focus Tips:
            </span>
            <button
              onClick={handleToggleFullscreen}
              className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <Maximize className="w-3 h-3" /> {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
          </div>

          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-1">
            <li className="flex items-center gap-1.5">
              <span className="text-orange-500">•</span> Put your phone away.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-orange-500">•</span> Close unnecessary tabs.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-orange-500">•</span> Use full-screen mode.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

