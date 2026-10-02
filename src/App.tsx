import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { couplePhoto } from './assets/photoData';

const heartEmojis = ['💖', '💕', '💗', '💓', '✨', '🌸', '🐾'];

const bearQuotes = [
  "Milk & Mocha send 1,000,000 hugs! 🐾",
  "Happy Birthday to the prettiest girl! 💖",
  "Mocha says you deserve all the treats! 🍰",
  "Milk is blushing because you're so cute! 🌸",
  "Cuddle mode activated! 🐻🤍"
];

const nopePhrases = [
  "Nope 😜",
  "Too slow! 💨",
  "Can't catch me! 🏃",
  "Nice try! 😉",
  "Still Nope? 😝",
  "Almost! 😜",
  "Not a chance! 🙈",
  "Never! 🏃💨"
];

const hbdNotes: Record<string, number> = {
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
  'G5': 783.99, 'A5': 880.00, 'B5': 987.77, 'C6': 1046.50
};

interface ScoreItem {
  m: string;
  b: string | null;
  d: number;
  p: number;
}

const hbdScore: ScoreItem[] = [
  { m: 'G4', b: 'G3', d: 0.35, p: 0.08 },
  { m: 'G4', b: null, d: 0.22, p: 0.05 },
  { m: 'A4', b: 'C4', d: 0.52, p: 0.08 },
  { m: 'G4', b: null, d: 0.52, p: 0.08 },
  { m: 'C5', b: 'E4', d: 0.55, p: 0.08 },
  { m: 'B4', b: 'G3', d: 0.95, p: 0.2 },

  { m: 'G4', b: 'G3', d: 0.35, p: 0.08 },
  { m: 'G4', b: null, d: 0.22, p: 0.05 },
  { m: 'A4', b: 'D4', d: 0.52, p: 0.08 },
  { m: 'G4', b: null, d: 0.52, p: 0.08 },
  { m: 'D5', b: 'F4', d: 0.55, p: 0.08 },
  { m: 'C5', b: 'C4', d: 0.95, p: 0.2 },

  { m: 'G4', b: 'G3', d: 0.35, p: 0.08 },
  { m: 'G4', b: null, d: 0.22, p: 0.05 },
  { m: 'G5', b: 'C4', d: 0.55, p: 0.08 },
  { m: 'E5', b: 'G4', d: 0.55, p: 0.08 },
  { m: 'C5', b: 'E4', d: 0.55, p: 0.08 },
  { m: 'B4', b: 'D4', d: 0.55, p: 0.08 },
  { m: 'A4', b: 'F4', d: 0.85, p: 0.2 },

  { m: 'F5', b: 'F4', d: 0.35, p: 0.08 },
  { m: 'F5', b: null, d: 0.22, p: 0.05 },
  { m: 'E5', b: 'C4', d: 0.55, p: 0.08 },
  { m: 'C5', b: 'G4', d: 0.55, p: 0.08 },
  { m: 'D5', b: 'G3', d: 0.55, p: 0.08 },
  { m: 'C5', b: 'C4', d: 1.25, p: 0.5 }
];

export default function App() {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimeoutRef = useRef<number | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Bear interaction state
  const [bearQuoteIdx, setBearQuoteIdx] = useState(0);
  const [bearScale, setBearScale] = useState(false);

  // Birthday cake state
  const [blownOut, setBlownOut] = useState(false);

  // Playful Question state
  const [agreed, setAgreed] = useState(false);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);
  const [noEscapeCount, setNoEscapeCount] = useState(0);
  const twistAreaRef = useRef<HTMLDivElement | null>(null);
  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastMoveTimeRef = useRef(0);

  // Polaroid state
  const [isFlipped, setIsFlipped] = useState(false);

  // Scratch card canvas ref & custom context
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchSurprise, setScratchSurprise] = useState<string>(() => {
    const saved = localStorage.getItem('birthday_scratch_surprise');
    if (!saved || saved === 'Your Favorite Dinner + A Secret Gift Tonight!') {
      return 'Whatever you want as a gift 💕';
    }
    return saved;
  });
  const [scratchTitle, setScratchTitle] = useState<string>(() => {
    return localStorage.getItem('birthday_scratch_title') || 'REDEEMABLE FOR:';
  });
  const [isEditingScratch, setIsEditingScratch] = useState(false);
  const [tempSurprise, setTempSurprise] = useState(scratchSurprise);
  const [tempTitle, setTempTitle] = useState(scratchTitle);

  // Typewriter Love Letter
  const fullLetter = "Another year around the sun, and you only become more radiant, compassionate, and inspiring with each passing day. Thank you for filling my world with so much warmth and happiness. I hope today brings you as much joy as you bring into my life every single second. Happy Birthday, my love!";
  const [letterText, setLetterText] = useState("");
  const letterPaperRef = useRef<HTMLDivElement | null>(null);
  const letterStartedRef = useRef(false);

  // Ambient floating background canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Spawn tap hearts
  const spawnHeartAt = (x: number, y: number) => {
    const heart = document.createElement('div');
    heart.className = 'tap-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  };

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('#scratch-canvas') ||
        target?.closest('input') ||
        target?.closest('.photo-upload-btn')
      ) {
        return;
      }
      spawnHeartAt(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  // Ambient Canvas Hearts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 14 + 10,
      speedY: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      char: heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.35;
      particles.forEach((p) => {
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.char, p.x, p.y);
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Audio Synthesizer Engine
  const playLoudNote = (freqMelody: number, freqBass: number | null, duration: number, timeOffset: number) => {
    setTimeout(() => {
      const audioCtx = audioCtxRef.current;
      if (!audioCtx || audioCtx.state === 'closed') return;
      const now = audioCtx.currentTime;

      // Lead Melody
      const oscLead = audioCtx.createOscillator();
      const gainLead = audioCtx.createGain();
      oscLead.type = 'triangle';
      oscLead.frequency.setValueAtTime(freqMelody, now);
      gainLead.gain.setValueAtTime(0.65, now);
      gainLead.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscLead.connect(gainLead);
      gainLead.connect(audioCtx.destination);
      oscLead.start(now);
      oscLead.stop(now + duration);

      // Harmonic
      const oscHarmonic = audioCtx.createOscillator();
      const gainHarmonic = audioCtx.createGain();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freqMelody * 2, now);
      gainHarmonic.gain.setValueAtTime(0.25, now);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
      oscHarmonic.connect(gainHarmonic);
      gainHarmonic.connect(audioCtx.destination);
      oscHarmonic.start(now);
      oscHarmonic.stop(now + duration);

      // Bass accompaniment
      if (freqBass) {
        const oscBass = audioCtx.createOscillator();
        const gainBass = audioCtx.createGain();
        oscBass.type = 'sine';
        oscBass.frequency.setValueAtTime(freqBass, now);
        gainBass.gain.setValueAtTime(0.45, now);
        gainBass.gain.exponentialRampToValueAtTime(0.001, now + duration);
        oscBass.connect(gainBass);
        gainBass.connect(audioCtx.destination);
        oscBass.start(now);
        oscBass.stop(now + duration);
      }
    }, timeOffset * 1000);
  };

  const playMusicBoxTune = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    let delay = 0;
    hbdScore.forEach((item) => {
      playLoudNote(hbdNotes[item.m], item.b ? hbdNotes[item.b] : null, item.d, delay);
      delay += item.d + item.p;
    });

    synthTimeoutRef.current = window.setTimeout(() => {
      playMusicBoxTune();
    }, (delay + 0.8) * 1000);
  };

  const stopMusicBoxTune = () => {
    if (synthTimeoutRef.current) {
      clearTimeout(synthTimeoutRef.current);
      synthTimeoutRef.current = null;
    }
  };

  const startMusic = () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setIsPlaying(true);

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.volume = 1.0;
      bgAudio
        .play()
        .then(() => {})
        .catch(() => {
          playMusicBoxTune();
        });
    } else {
      playMusicBoxTune();
    }
  };

  const stopMusic = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
    stopMusicBoxTune();
  };

  const toggleMusic = () => {
    if (!isPlayingRef.current) {
      startMusic();
    } else {
      stopMusic();
    }
  };

  // Autoplay on load & mobile first-touch/scroll unlock
  useEffect(() => {
    // 1. Attempt immediate autoplay
    startMusic();

    // 2. Mobile browsers require a gesture before allowing audio playback.
    // Register one-time passive window listeners so her very first touch or scroll starts the music!
    const unlockAudio = () => {
      startMusic();
      removeUnlock();
    };

    const removeUnlock = () => {
      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('touchend', unlockAudio, true);
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('click', unlockAudio, true);
      window.removeEventListener('scroll', unlockAudio, true);
    };

    window.addEventListener('touchstart', unlockAudio, { capture: true, once: true, passive: true });
    window.addEventListener('touchend', unlockAudio, { capture: true, once: true, passive: true });
    window.addEventListener('pointerdown', unlockAudio, { capture: true, once: true, passive: true });
    window.addEventListener('click', unlockAudio, { capture: true, once: true, passive: true });
    window.addEventListener('scroll', unlockAudio, { capture: true, once: true, passive: true });

    return () => {
      removeUnlock();
    };
  }, []);

  // Bear Tap Interaction
  const handlePetBears = (e: React.MouseEvent<HTMLDivElement>) => {
    setBearScale(true);
    setTimeout(() => setBearScale(false), 300);

    setBearQuoteIdx((prev) => (prev + 1) % bearQuotes.length);

    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        spawnHeartAt(rect.left + rect.width / 2 + (Math.random() * 60 - 30), rect.top + 30);
      }, i * 100);
    }
  };

  // Blow out candles
  const handleBlowCandles = () => {
    if (blownOut) return;
    setBlownOut(true);
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    if (!isPlaying) {
      toggleMusic();
    }
  };

  // Runaway "Nope" button with guaranteed distance jump
  const moveNoButton = (e?: React.SyntheticEvent | MouseEvent | TouchEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 90) return;
    lastMoveTimeRef.current = now;

    if (!twistAreaRef.current) return;
    const area = twistAreaRef.current.getBoundingClientRect();
    const btnWidth = noBtnRef.current?.offsetWidth || 105;
    const btnHeight = noBtnRef.current?.offsetHeight || 48;

    const maxX = Math.max(10, area.width - btnWidth - 14);
    const maxY = Math.max(10, area.height - btnHeight - 8);

    // Find cursor / touch coordinates relative to twistArea
    let mouseX = area.width / 2;
    let mouseY = area.height / 2;

    if (e && 'clientX' in e && typeof (e as MouseEvent).clientX === 'number') {
      mouseX = (e as MouseEvent).clientX - area.left;
      mouseY = (e as MouseEvent).clientY - area.top;
    } else if (e && 'touches' in e && (e as unknown as TouchEvent).touches?.length > 0) {
      mouseX = (e as unknown as TouchEvent).touches[0].clientX - area.left;
      mouseY = (e as unknown as TouchEvent).touches[0].clientY - area.top;
    }

    // Current button coordinates
    const currentBtn = noBtnRef.current?.getBoundingClientRect();
    const currentX = currentBtn ? currentBtn.left - area.left : mouseX;
    const currentY = currentBtn ? currentBtn.top - area.top : mouseY;

    let targetLeft = 0;
    let targetTop = 0;
    let bestScore = -1;

    // Evaluate 18 candidate coordinates across the area and pick the one furthest from the cursor
    for (let i = 0; i < 18; i++) {
      const candLeft = Math.floor(Math.random() * maxX) + 6;
      const candTop = Math.floor(Math.random() * maxY) + 4;
      const candCenterX = candLeft + btnWidth / 2;
      const candCenterY = candTop + btnHeight / 2;

      const distFromMouse = Math.hypot(candCenterX - mouseX, candCenterY - mouseY);
      const distFromPrev = Math.hypot(candLeft - currentX, candTop - currentY);

      // Avoid fully overlapping the center-left area where YES is
      const distFromYes = Math.hypot(candCenterX - (area.width / 2 - 60), candCenterY - (area.height / 2));
      const penalty = distFromYes < 50 ? 50 : 0;

      const score = distFromMouse * 1.6 + distFromPrev - penalty;
      if (score > bestScore) {
        bestScore = score;
        targetLeft = candLeft;
        targetTop = candTop;
      }
    }

    setNoPos({ left: targetLeft, top: targetTop });
    setNoEscapeCount((prev) => prev + 1);
  };

  // Proximity detection on the button container: if mouse comes close (< 80px), flee!
  const handleAreaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (agreed || !noBtnRef.current || !twistAreaRef.current) return;
    const btn = noBtnRef.current.getBoundingClientRect();
    const btnCenterX = btn.left + btn.width / 2;
    const btnCenterY = btn.top + btn.height / 2;
    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    if (dist < 80) {
      moveNoButton(e);
    }
  };

  const handleYes = () => {
    setAgreed(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
  };

  // Touch Scratch-off Card setup & reseal
  const initScratchCanvas = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    canvas.width = 280;
    canvas.height = 160;

    // Soft metallic pink gradient
    const grad = ctx.createLinearGradient(0, 0, 280, 160);
    grad.addColorStop(0, '#fba7b8');
    grad.addColorStop(0.3, '#f4728f');
    grad.addColorStop(0.7, '#ff8fa3');
    grad.addColorStop(1, '#fba7b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 280, 160);

    // Decorative inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(6, 6, 268, 148);
    ctx.setLineDash([]);

    // Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.fillText('✨ Scratch with finger ✨', 140, 72);
    ctx.shadowBlur = 0;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText('Tap & drag to reveal surprise', 140, 96);
  };

  useEffect(() => {
    initScratchCanvas();
  }, []);

  const handleSaveScratchContext = () => {
    setScratchSurprise(tempSurprise);
    setScratchTitle(tempTitle);
    try {
      localStorage.setItem('birthday_scratch_surprise', tempSurprise);
      localStorage.setItem('birthday_scratch_title', tempTitle);
    } catch {}
    setIsEditingScratch(false);
    setTimeout(() => {
      initScratchCanvas();
    }, 60);
  };

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleScratchStart = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    if ('touches' in e && e.touches.length > 0) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY);
    } else if ('clientX' in e) {
      scratchAt(e.clientX, e.clientY);
    }
  };

  const handleScratchMove = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    if ('touches' in e && e.touches.length > 0) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY);
    } else if ('clientX' in e) {
      scratchAt(e.clientX, e.clientY);
    }
  };

  const handleScratchEnd = () => {
    setIsScratching(false);
  };

  // Typewriter Letter Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !letterStartedRef.current) {
          letterStartedRef.current = true;
          let idx = 0;
          const interval = setInterval(() => {
            idx++;
            setLetterText(fullLetter.slice(0, idx));
            if (idx >= fullLetter.length) {
              clearInterval(interval);
            }
          }, 32);
        }
      },
      { threshold: 0.25 }
    );

    if (letterPaperRef.current) {
      observer.observe(letterPaperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Background Floating Hearts Canvas */}
      <canvas id="hearts-canvas" ref={canvasRef} />

      {/* Audio Element */}
      <audio ref={bgAudioRef} loop preload="auto" playsInline>
        <source src="https://assets.mixkit.co/music/preview/mixkit-happy-birthday-to-you-443.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating Music Pill */}
      <button
        type="button"
        className={`music-pill ${!isPlaying ? 'waiting' : ''}`}
        onClick={toggleMusic}
        aria-label="Toggle Happy Birthday Music"
      >
        <span className={`music-icon ${isPlaying ? 'playing' : ''}`}>🎂</span>
        <span>{isPlaying ? 'Playing 🎶' : 'Birthday Song 🎵'}</span>
      </button>

      <main className="app-container">
        {/* 1. Hero & Milk + Mocha Feature */}
        <header className="card">
          <div className="hero-badge">✨ Today is All About You ✨</div>
          <h1 className="hero-title">Happy Birthday, Cutie! 🎂💖</h1>

          {/* Interactive Bear Frame */}
          <div
            className="bear-frame"
            style={{
              transform: bearScale ? 'scale(1.08) rotate(2deg)' : 'scale(1) rotate(0deg)'
            }}
            onClick={handlePetBears}
            title="Tap us for hugs!"
          >
            <div className="bear-bubble">{bearQuotes[bearQuoteIdx]}</div>

            {/* Milk and Mocha Bear Graphic */}
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="210" height="160" viewBox="0 0 200 160" fill="none">
                {/* Mocha (Brown Bear) */}
                <g className="mocha-bear">
                  <path d="M142 68 C142 42, 178 42, 178 68 C188 84, 188 132, 162 142 C146 146, 136 130, 142 68 Z" fill="#ad7954" />
                  <circle cx="152" cy="46" r="10" fill="#ad7954" />
                  <circle cx="152" cy="46" r="5" fill="#875535" />
                  <circle cx="178" cy="54" r="9" fill="#ad7954" />
                  <circle cx="164" cy="70" r="3.5" fill="#2b1810" />
                  <ellipse cx="154" cy="78" rx="6" ry="5" fill="#d9ad8b" />
                  <polygon points="152,75 156,75 154,78" fill="#2b1810" />
                  <path d="M154 78 L154 81 M152 81 C153 82, 155 82, 156 81" stroke="#2b1810" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* Milk (White Bear) */}
                <g className="milk-bear">
                  <circle cx="55" cy="44" r="14" fill="#ffffff" stroke="#e0d5d5" strokeWidth="2" />
                  <circle cx="55" cy="44" r="7" fill="#ffd1dc" />
                  <circle cx="115" cy="44" r="14" fill="#ffffff" stroke="#e0d5d5" strokeWidth="2" />
                  <circle cx="115" cy="44" r="7" fill="#ffd1dc" />
                  <ellipse cx="85" cy="80" rx="42" ry="38" fill="#ffffff" stroke="#e0d5d5" strokeWidth="2" />
                  <ellipse cx="58" cy="90" rx="9" ry="6" fill="#ffb3c1" opacity="0.8" />
                  <ellipse cx="112" cy="90" rx="9" ry="6" fill="#ffb3c1" opacity="0.8" />
                  <path d="M68 78 Q74 84 80 78" stroke="#33272a" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M90 78 Q96 84 102 78" stroke="#33272a" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <ellipse cx="85" cy="84" rx="4" ry="3" fill="#33272a" />
                  <path d="M82 89 Q85 94 88 89" stroke="#33272a" strokeWidth="2" strokeLinecap="round" fill="#ffccd5" />
                  <ellipse cx="64" cy="104" rx="9" ry="11" fill="#ffffff" stroke="#e0d5d5" strokeWidth="2" transform="rotate(-15 64 104)" />
                  <ellipse cx="106" cy="104" rx="9" ry="11" fill="#ffffff" stroke="#e0d5d5" strokeWidth="2" transform="rotate(15 106 104)" />
                  <circle cx="50" cy="28" r="5" stroke="#ff8fa3" strokeWidth="1.5" fill="#fff" opacity="0.7" />
                  <circle cx="60" cy="16" r="7" stroke="#ff8fa3" strokeWidth="1.5" fill="#fff" opacity="0.8" />
                  <circle cx="120" cy="20" r="6" stroke="#ff8fa3" strokeWidth="1.5" fill="#fff" opacity="0.8" />
                </g>
              </svg>
            </div>
          </div>

          <p className="hero-subtitle">
            Milk, Mocha, and Shubham built this little corner of the internet just to celebrate the most precious girl in the universe!
          </p>
        </header>

        {/* 2. Birthday Cake with Blow Candles */}
        <section className="card" id="cakeSection">
          <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', marginBottom: '4px', fontWeight: 700 }}>
            Make a Wish! 🕯️
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Tap the cake or candles to blow them out:
          </p>

          <div
            className="cake-container"
            onClick={handleBlowCandles}
            style={{ cursor: 'pointer' }}
          >
            <svg className="cake-svg" viewBox="0 0 200 200" fill="none">
              <rect x="35" y="110" width="130" height="55" rx="12" fill="#ffccd5" />
              <rect x="45" y="75" width="110" height="40" rx="10" fill="#ffb3c1" />
              <rect x="70" y="45" width="6" height="30" rx="3" fill="#ff758f" />
              <path
                className={`flame ${blownOut ? 'extinguished' : ''}`}
                d="M73 30 C76 36, 77 40, 73 44 C69 40, 70 36, 73 30 Z"
                fill="#ffd166"
              />
              <rect x="97" y="40" width="6" height="35" rx="3" fill="#ff758f" />
              <path
                className={`flame ${blownOut ? 'extinguished' : ''}`}
                d="M100 25 C103 31, 104 35, 100 39 C96 35, 97 31, 100 25 Z"
                fill="#ffd166"
              />
              <rect x="124" y="45" width="6" height="30" rx="3" fill="#ff758f" />
              <path
                className={`flame ${blownOut ? 'extinguished' : ''}`}
                d="M127 30 C130 36, 131 40, 127 44 C123 40, 124 36, 127 30 Z"
                fill="#ffd166"
              />
            </svg>
          </div>

          <button
            type="button"
            className="btn-blow"
            onClick={handleBlowCandles}
          >
            <span>💨</span>
            <span>{blownOut ? 'Wishes Made! 🎉' : 'Blow Out Candles'}</span>
          </button>

          {blownOut && (
            <p style={{ fontSize: '14px', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '10px' }}>
              ✨ Your wish is officially locked in with the stars! ✨
            </p>
          )}
        </section>

        {/* 3. The Playful Twist (Runaway "No" Button) */}
        <section className="card twist-box">
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>🐻🤍🐻</div>
          <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: 700 }}>
            Quick Question... 🤔
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Will you let me treat you like a queen all day today?
          </p>

          <div
            className="twist-buttons"
            ref={twistAreaRef}
            onMouseMove={handleAreaMouseMove}
          >
            <button
              type="button"
              className="btn-yes"
              onClick={handleYes}
            >
              YES! 🥰
            </button>

            {!agreed && (
              <button
                ref={noBtnRef}
                type="button"
                className="btn-no"
                style={{
                  position: noPos ? 'absolute' : 'relative',
                  left: noPos ? `${noPos.left}px` : undefined,
                  top: noPos ? `${noPos.top}px` : undefined,
                  margin: 0
                }}
                onMouseEnter={moveNoButton}
                onMouseOver={moveNoButton}
                onMouseMove={moveNoButton}
                onPointerEnter={moveNoButton}
                onPointerOver={moveNoButton}
                onPointerMove={moveNoButton}
                onTouchStart={moveNoButton}
                onTouchMove={moveNoButton}
                onClick={moveNoButton}
              >
                {nopePhrases[noEscapeCount % nopePhrases.length]}
              </button>
            )}
          </div>

          {agreed && (
            <p style={{ fontSize: '14px', color: '#10b981', fontWeight: 700, marginTop: '10px' }}>
              Yay! Best decision ever! (You never had a choice anyway 😘)
            </p>
          )}
        </section>

        {/* 4. Polaroid Memories (Featuring Shubham & His Girlfriend) */}
        <section className="card">
          <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: 700 }}>
            Favorite Memories 📸
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            (Tap our photo to flip it over!)
          </p>

          <div className="polaroid-grid">
            <div
              className={`polaroid-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="polaroid-inner">
                {/* Front with Permanent Photo */}
                <div className="polaroid-front">
                  <div className="polaroid-tape" />
                  <div className="polaroid-img-wrapper">
                    <img
                      src={couplePhoto}
                      alt="Where it all began"
                      className="polaroid-photo"
                      loading="eager"
                    />
                  </div>
                  <div className="polaroid-caption">Where it all began 💕</div>
                </div>

                {/* Back with Sweet Note */}
                <div className="polaroid-back">
                  <span className="date">Forever My Favorite Person</span>
                  <p style={{ fontSize: '15px', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;Looking at this photo reminds me why I&apos;m the luckiest guy in the world. Being by your side makes every ordinary day feel like magic.&rdquo;
                  </p>
                  <div style={{ fontSize: '22px' }}>🐻❤️🐻</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Reasons Why I Love You */}
        <section className="card">
          <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: 700 }}>
            Why You&apos;re My Favorite Person 🐾
          </h2>
          <div className="reasons-list">
            <div className="reason-item">
              <span className="reason-icon">💖</span>
              <div>
                <strong>Your contagious laugh:</strong> Just like Milk&apos;s cute giggles, it brightens up my whole universe.
              </div>
            </div>
            <div className="reason-item">
              <span className="reason-icon">☕</span>
              <div>
                <strong>Our quiet cuddles:</strong> Just being together, warm and cozy like two little bears.
              </div>
            </div>
            <div className="reason-item">
              <span className="reason-icon">✨</span>
              <div>
                <strong>Your kindest heart:</strong> How deeply and tenderly you care for everyone around you.
              </div>
            </div>
          </div>
        </section>

        {/* 6. Digital Scratch-Off Card */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: 700 }}>
              Birthday Pass 🎟️
            </h2>
            <button
              type="button"
              onClick={() => {
                setTempSurprise(scratchSurprise);
                setTempTitle(scratchTitle);
                setIsEditingScratch(!isEditingScratch);
              }}
              style={{
                position: 'absolute',
                right: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Edit the surprise context"
            >
              ✏️ {isEditingScratch ? 'Cancel' : 'Edit Surprise'}
            </button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Use your finger to scratch and reveal your surprise:
          </p>

          {/* Edit Context Panel */}
          {isEditingScratch && (
            <div
              style={{
                marginTop: '12px',
                padding: '14px',
                background: '#fff9fa',
                border: '1px solid #ffccd5',
                borderRadius: '16px',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                Badge Title:
              </div>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #ffccd5',
                  fontSize: '13px',
                  marginBottom: '10px'
                }}
                placeholder="e.g. REDEEMABLE FOR:"
              />

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                Hidden Surprise Context:
              </div>
              <textarea
                value={tempSurprise}
                onChange={(e) => setTempSurprise(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #ffccd5',
                  fontSize: '13px',
                  resize: 'none'
                }}
                placeholder="Enter what this coupon gives her..."
              />

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '6px' }}>
                Quick Romantic Ideas:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {[
                  { t: "REDEEMABLE FOR:", s: "Whatever you want as a gift 💕" },
                  { t: "SPECIAL COUPON:", s: "All-Day Shopping Spree & Infinite Cuddles 🛍️💖" },
                  { t: "ROMANTIC PASS:", s: "Candlelight Dinner & Long Drive Under The Stars 🚗✨" },
                  { t: "WEEKEND PASS:", s: "A Surprise Weekend Getaway Just For Us 🏖️✈️" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTempTitle(preset.t);
                      setTempSurprise(preset.s);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #ffccd5',
                      borderRadius: '999px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      color: 'var(--primary-dark)',
                      cursor: 'pointer'
                    }}
                  >
                    {preset.s.slice(0, 24)}...
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSaveScratchContext}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save &amp; Re-seal Card ✨
                </button>
              </div>
            </div>
          )}

          <div className="scratch-wrapper">
            <div className="scratch-secret">
              <span style={{ fontSize: '26px', marginBottom: '4px' }}>🎁</span>
              <span style={{ fontSize: '11px', letterSpacing: '1px', fontWeight: 800, color: '#e63956' }}>
                {scratchTitle}
              </span>
              <span style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 700, marginTop: '4px', lineHeight: 1.35, padding: '0 8px' }}>
                {scratchSurprise}
              </span>
            </div>
            <canvas
              id="scratch-canvas"
              ref={scratchCanvasRef}
              onTouchStart={handleScratchStart}
              onTouchMove={handleScratchMove}
              onTouchEnd={handleScratchEnd}
              onMouseDown={handleScratchStart}
              onMouseMove={handleScratchMove}
              onMouseUp={handleScratchEnd}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Valid anytime • Non-transferable • Infinite cuddles included
            </p>
            <button
              type="button"
              onClick={initScratchCanvas}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                color: 'var(--primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
              title="Cover it back up to scratch again"
            >
              Re-cover
            </button>
          </div>
        </section>

        {/* 7. Love Letter Signed by Shubham */}
        <section className="card">
          <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', marginBottom: '12px', fontWeight: 700 }}>
            A Little Note for You 💌
          </h2>
          <div className="letter-paper" ref={letterPaperRef}>
            <p>{letterText}</p>
            <div className="letter-sign">
              Forever Yours,<br />
              Shubham ❤️
            </div>
            <div className="letter-bear-sticker">🐻</div>
          </div>
        </section>

        <footer>Made with endless love &amp; bear hugs by Shubham, just for you 💖</footer>
      </main>
    </>
  );
}
