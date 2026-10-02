import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { couplePhoto } from './assets/photoData';
import birthdaySong from './assets/birthday.mp3';
import {
  connectGoogleGmail,
  sendWishViaGmailApi,
  disconnectGmail,
  initAuth
} from './services/gmail';
import { User } from 'firebase/auth';

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

const loveReasons = [
  "How your laughter can instantly turn my most stressful day into complete peace.",
  "The adorable way you scrunch your nose when you're laughing hard or being playful.",
  "How your hand feels so warm and natural in mine, like they were custom-made to fit.",
  "The cute, sleepy voice you have when you answer my morning calls.",
  "How you always offer me the best first bite of your favorite food.",
  "Your pure, empathetic heart that cares so tenderly about everyone around you.",
  "The secret inside jokes only the two of us understand.",
  "The way your eyes sparkle like fireworks whenever you see cute puppies or sweet treats.",
  "How safe, understood, and truly at home I feel whenever I am with you.",
  "How you steal my oversized hoodies and somehow look ten times cuter in them than I ever could.",
  "The happy little wiggle you do when delicious dessert arrives at our table.",
  "Your sweet patience and warmth, even when I'm being an absolute dork.",
  "The way you listen to me with your whole heart, making me feel heard like no one else does.",
  "How breathtaking you look in messy buns, pajamas, or dressed up—always gorgeous to me.",
  "The sweet random texts you send me throughout the day that make me smile at my phone like an idiot.",
  "How fiercely you believe in me and support my dreams, even when I doubt myself.",
  "The gentle forehead kisses and quiet cuddles on rainy afternoons.",
  "The quiet pride in my chest every time I get to tell someone, 'That's my girl.'",
  "The comforting, cozy scent of your perfume that lingers on my jacket.",
  "How we can spend hours doing absolutely nothing together and it still feels like the best date ever.",
  "The way you remember the tiniest, subtle things I mention in passing.",
  "Your cute stubbornness when you're playfully trying to win a silly debate.",
  "How you turn ordinary grocery store trips into the sweetest little adventures.",
  "The way you hold onto my arm tightly when we're walking together in the cold.",
  "How you inspire me to be a kinder, stronger, and more loving man every single day.",
  "Because out of eight billion people in this universe, my heart chose you—and it's the easiest choice I'll ever make.",
  "The soft, gentle whisper of 'I love you' right before you drift off to sleep.",
  "The cute, guilty face you make when I catch you staring at me.",
  "How you always know the exact right moment to wrap me in a tight bear hug.",
  "The way we can communicate an entire sentence just through a single look across the room.",
  "How you bring vibrant color, laughter, and sunshine into every corner of my life.",
  "Because every single second spent with you becomes my new favorite memory.",
  "The way you curl up next to me like a little kitten when watching our favorite shows.",
  "How excited you get over small, thoughtful surprises.",
  "Because loving you is the most effortless, natural, and beautiful thing in my world."
];

export default function App() {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimeoutRef = useRef<number | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

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

  // Little Jar of 365 Reasons state
  const [openedReason, setOpenedReason] = useState<{ num: number; text: string } | null>(null);
  const [openedCount, setOpenedCount] = useState(0);
  const [isJarShaking, setIsJarShaking] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Birthday Countdown State & Midnight Lock
  const getDefaultTargetDate = () => {
    const saved = localStorage.getItem('birthday_countdown_target');
    if (saved) return saved;
    // Default to tomorrow 12:00 AM (midnight)
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${midnight.getFullYear()}-${pad(midnight.getMonth() + 1)}-${pad(midnight.getDate())}T00:00`;
  };

  const [targetDateStr, setTargetDateStr] = useState<string>(getDefaultTargetDate);
  const [isEditingCountdownDate, setIsEditingCountdownDate] = useState(false);
  const [tempCountdownDate, setTempCountdownDate] = useState(targetDateStr);
  const [forceUnlocked, setForceUnlocked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [countdownTime, setCountdownTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: false
  });

  // Write a Wish State
  const [wishInput, setWishInput] = useState('');
  const [lastSentWish, setLastSentWish] = useState<string | null>(null);
  const [wishSentNotification, setWishSentNotification] = useState<string | null>(null);
  const [wishActivationNotice, setWishActivationNotice] = useState(false);
  const [serverWishes, setServerWishes] = useState<Array<{ id: string; wish: string; date: string }>>([]);
  const [showVaultModal, setShowVaultModal] = useState(false);

  // Gmail OAuth Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGmailConnecting, setIsGmailConnecting] = useState(false);
  const [isSendingWish, setIsSendingWish] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Load server-side wishes & local cache
  const loadWishes = async () => {
    try {
      const stored = localStorage.getItem('birthday_wishes_inbox');
      if (stored) {
        setServerWishes(JSON.parse(stored));
      }
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setServerWishes(data);
          localStorage.setItem('birthday_wishes_inbox', JSON.stringify(data));
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadWishes();
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnectGmail = async () => {
    setIsGmailConnecting(true);
    setEmailStatus(null);
    try {
      const res = await connectGoogleGmail();
      setGoogleUser(res.user);
      setEmailStatus('✅ Gmail connected! Wishes will be sent to ' + (res.user.email || 'your Gmail inbox') + ' 💌');
      confetti({ particleCount: 45, spread: 60 });
    } catch (err: any) {
      console.error(err);
      setEmailStatus('⚠️ Connection cancelled or failed. You can retry anytime.');
    } finally {
      setIsGmailConnecting(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await disconnectGmail();
    setGoogleUser(null);
    setEmailStatus('Disconnected from Gmail.');
  };

  const handleSendWishToGmail = async (wishText: string) => {
    if (!wishText) return;
    try {
      setEmailStatus('⏳ Sending to shubhamecom1999@gmail.com...');
      await sendWishViaGmailApi(wishText, 'shubhamecom1999@gmail.com');
      setEmailStatus('💌 Wish successfully delivered to shubhamecom1999@gmail.com!');
      confetti({ particleCount: 50, spread: 75, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error(err);
      setEmailStatus('⚠️ Could not send directly. Please connect Gmail or use the mailto button.');
    }
  };

  // Scratch card canvas ref & custom context
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchSurprise] = useState<string>(() => {
    const saved = localStorage.getItem('birthday_scratch_surprise');
    if (!saved || saved === 'Your Favorite Dinner + A Secret Gift Tonight!') {
      return 'Whatever you want as a gift 💕';
    }
    return saved;
  });
  const [scratchTitle] = useState<string>(() => {
    return localStorage.getItem('birthday_scratch_title') || 'REDEEMABLE FOR:';
  });

  // Typewriter Love Letter
  const defaultLetter = "My Dearest Cutie,\n\nAnother year around the sun, and you only become more radiant, compassionate, and inspiring with each passing day.\n\nThank you for filling my world with so much warmth, silly laughs, and infinite comfort. Being by your side is my greatest adventure, and I promise to love, protect, and cherish you through every single chapter of life.\n\nI hope today brings you as much joy, peace, and sweet treats as you bring into my life every single second.\n\nHappy Birthday, my love! 🎂💖";

  const [fullLetter] = useState<string>(() => {
    return localStorage.getItem('birthday_love_letter') || defaultLetter;
  });
  const [letterText, setLetterText] = useState<string>(() => {
    return localStorage.getItem('birthday_love_letter') || defaultLetter;
  });
  const letterPaperRef = useRef<HTMLDivElement | null>(null);
  const letterStartedRef = useRef(false);

  // Ambient floating background canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Falling hearts particle system triggered on click and scroll
  interface FallingHeartParticle {
    x: number;
    y: number;
    speedY: number;
    speedX: number;
    swayFreq: number;
    swayAmp: number;
    swayPhase: number;
    size: number;
    char: string;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
  }

  const fallingHeartsRef = useRef<FallingHeartParticle[]>([]);
  const lastFallingTriggerRef = useRef(0);

  const triggerFallingHearts = (count = 14) => {
    const width = window.innerWidth;
    const newHearts: FallingHeartParticle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: -(Math.random() * 80 + 20),
      speedY: Math.random() * 1.5 + 1.2,
      speedX: (Math.random() - 0.5) * 0.6,
      swayFreq: Math.random() * 0.003 + 0.002,
      swayAmp: Math.random() * 18 + 10,
      swayPhase: Math.random() * Math.PI * 2,
      size: Math.random() * 14 + 14,
      char: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      opacity: Math.random() * 0.35 + 0.55,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
    }));
    fallingHeartsRef.current.push(...newHearts);
    if (fallingHeartsRef.current.length > 55) {
      fallingHeartsRef.current = fallingHeartsRef.current.slice(-55);
    }
  };

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
        target?.closest('#scratch-canvas') ||
        target?.closest('input')
      ) {
        return;
      }
      spawnHeartAt(e.clientX, e.clientY);

      // Occasionally trigger a falling hearts shower across the screen on click/tap
      const now = performance.now();
      if (now - lastFallingTriggerRef.current > 1400) {
        lastFallingTriggerRef.current = now;
        triggerFallingHearts(Math.random() < 0.4 ? 16 : 10);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  // Falling hearts trigger on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const scrollDiff = Math.abs(currentY - lastScrollY);

      if (scrollDiff > 60 && now - lastFallingTriggerRef.current > 2200) {
        lastFallingTriggerRef.current = now;
        lastScrollY = currentY;
        triggerFallingHearts(12);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ambient Floating Birthday Balloons & Sparkles Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const balloonThemes = [
      { main: '#ff5e7e', highlight: '#ffa8b8', dark: '#d93b5d' }, // Rose Pink
      { main: '#ff9a3c', highlight: '#ffd29d', dark: '#d96c14' }, // Sunset Coral
      { main: '#ffc83b', highlight: '#ffea9f', dark: '#d49b11' }, // Golden Champagne
      { main: '#a855f7', highlight: '#d8b4fe', dark: '#7e22ce' }, // Pastel Lavender
      { main: '#ec4899', highlight: '#fbcfe8', dark: '#be185d' }, // Fuchsia
      { main: '#38bdf8', highlight: '#bae6fd', dark: '#0284c7' }, // Sky Blue
      { main: '#34d399', highlight: '#a7f3d0', dark: '#059669' }, // Mint Teal
      { main: '#fb7185', highlight: '#fecdd3', dark: '#e11d48' }, // Strawberry Red
    ];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setupCanvasSize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();
    window.addEventListener('resize', setupCanvasSize);

    // Generate floating balloons spread vertically
    const balloonCount = width < 480 ? 12 : 18;
    const balloons = Array.from({ length: balloonCount }, (_, idx) => {
      const radiusX = Math.random() * 8 + 16;
      const radiusY = radiusX * (Math.random() * 0.25 + 1.25);
      return {
        baseX: Math.random() * width,
        x: Math.random() * width,
        y: (height / balloonCount) * idx + (Math.random() * 60 - 30),
        radiusX,
        radiusY,
        speedY: Math.random() * 0.55 + 0.65,
        swayFreq: Math.random() * 0.0015 + 0.0015,
        swayAmp: Math.random() * 14 + 10,
        swayPhase: Math.random() * Math.PI * 2,
        stringLength: Math.random() * 15 + 32,
        theme: balloonThemes[Math.floor(Math.random() * balloonThemes.length)],
        opacity: Math.random() * 0.25 + 0.45,
        isHeart: Math.random() < 0.35,
      };
    });

    // Gentle sparkles/mini hearts
    const sparkles = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 8,
      speedY: Math.random() * 0.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      char: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      opacity: Math.random() * 0.2 + 0.25,
    }));

    let startTime = performance.now();

    const drawHeart = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      const topY = -size * 0.35;
      c.moveTo(0, topY + size * 0.35);
      c.bezierCurveTo(-size * 0.5, topY, -size * 0.85, topY + size * 0.45, 0, topY + size * 1.05);
      c.bezierCurveTo(size * 0.85, topY + size * 0.45, size * 0.5, topY, 0, topY + size * 0.35);
      c.closePath();
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw floating birthday balloons
      balloons.forEach((b) => {
        // Update vertical position (drifting upwards from bottom to top)
        b.y -= b.speedY;
        const sway = Math.sin(elapsed * b.swayFreq + b.swayPhase);
        b.x = b.baseX + sway * b.swayAmp;
        const tilt = Math.cos(elapsed * b.swayFreq + b.swayPhase) * 0.12;

        // Reset to bottom once it drifts off screen
        const maxOffset = b.radiusY + b.stringLength + 30;
        if (b.y < -maxOffset) {
          b.y = height + maxOffset + Math.random() * 50;
          b.baseX = Math.random() * width;
          b.theme = balloonThemes[Math.floor(Math.random() * balloonThemes.length)];
        }

        ctx.save();
        ctx.globalAlpha = b.opacity;
        ctx.translate(b.x, b.y);
        ctx.rotate(tilt);

        if (b.isHeart) {
          // Heart-shaped balloon
          const heartSize = b.radiusY * 1.1;
          const grad = ctx.createRadialGradient(
            -heartSize * 0.2,
            -heartSize * 0.2,
            heartSize * 0.1,
            0,
            0,
            heartSize * 1.1
          );
          grad.addColorStop(0, b.theme.highlight);
          grad.addColorStop(0.5, b.theme.main);
          grad.addColorStop(1, b.theme.dark);

          ctx.fillStyle = grad;
          drawHeart(ctx, heartSize);
          ctx.fill();

          // Knot
          const knotY = heartSize * 0.72;
          ctx.beginPath();
          ctx.moveTo(-3, knotY + 4);
          ctx.lineTo(3, knotY + 4);
          ctx.lineTo(1.5, knotY);
          ctx.lineTo(-1.5, knotY);
          ctx.closePath();
          ctx.fillStyle = b.theme.dark;
          ctx.fill();

          // String
          ctx.beginPath();
          ctx.moveTo(0, knotY + 4);
          const sW1 = Math.sin(elapsed * 0.003 + b.swayPhase) * 5;
          const sW2 = Math.cos(elapsed * 0.0025 + b.swayPhase) * 7;
          ctx.bezierCurveTo(sW1, knotY + b.stringLength * 0.35, sW2, knotY + b.stringLength * 0.7, sW1 * 0.4, knotY + b.stringLength);
          ctx.strokeStyle = 'rgba(255, 175, 190, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // Classic oval party balloon
          const grad = ctx.createRadialGradient(
            -b.radiusX * 0.3,
            -b.radiusY * 0.35,
            b.radiusX * 0.1,
            0,
            0,
            b.radiusY * 1.1
          );
          grad.addColorStop(0, b.theme.highlight);
          grad.addColorStop(0.5, b.theme.main);
          grad.addColorStop(1, b.theme.dark);

          ctx.beginPath();
          ctx.ellipse(0, 0, b.radiusX, b.radiusY, 0, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Specular shine (glossy 3D reflection)
          ctx.beginPath();
          ctx.ellipse(
            -b.radiusX * 0.38,
            -b.radiusY * 0.36,
            b.radiusX * 0.22,
            b.radiusY * 0.34,
            -Math.PI / 4,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fill();

          // Balloon knot
          const knotY = b.radiusY + 1;
          ctx.beginPath();
          ctx.moveTo(-3.5, knotY + 4);
          ctx.lineTo(3.5, knotY + 4);
          ctx.lineTo(1.5, knotY);
          ctx.lineTo(-1.5, knotY);
          ctx.closePath();
          ctx.fillStyle = b.theme.dark;
          ctx.fill();

          // Sinuous balloon string
          ctx.beginPath();
          ctx.moveTo(0, knotY + 4);
          const sW1 = Math.sin(elapsed * 0.003 + b.swayPhase) * 6;
          const sW2 = Math.cos(elapsed * 0.0025 + b.swayPhase) * 8;
          ctx.bezierCurveTo(sW1, knotY + b.stringLength * 0.35, sW2, knotY + b.stringLength * 0.7, sW1 * 0.4, knotY + b.stringLength);
          ctx.strokeStyle = 'rgba(255, 175, 190, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 2. Draw ambient gentle sparkles/hearts
      sparkles.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.font = `${s.size}px serif`;
        ctx.fillText(s.char, s.x, s.y);
        s.y -= s.speedY;
        s.x += s.speedX;
        if (s.y < -20) {
          s.y = height + 20;
          s.x = Math.random() * width;
        }
        ctx.restore();
      });

      // 3. Draw falling hearts shower (triggered by clicks and scrolling)
      const falling = fallingHeartsRef.current;
      for (let i = falling.length - 1; i >= 0; i--) {
        const fh = falling[i];
        fh.y += fh.speedY;
        fh.x += fh.speedX;
        const sway = Math.sin(elapsed * fh.swayFreq + fh.swayPhase) * fh.swayAmp;
        const currentX = fh.x + sway;
        fh.rotation += fh.rotationSpeed;

        ctx.save();
        ctx.globalAlpha = fh.opacity;
        ctx.translate(currentX, fh.y);
        ctx.rotate(Math.sin(fh.rotation) * 0.3);
        ctx.font = `${fh.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fh.char, 0, 0);
        ctx.restore();

        // Remove if past bottom of viewport
        if (fh.y > height + 40) {
          falling.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', setupCanvasSize);
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
    isPlayingRef.current = true;
    setIsPlaying(true);

    // 1. Initialize & resume Web Audio context
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch {}

    // 2. Play HTML5 audio element
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.volume = 1.0;
      const promise = bgAudio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            // HTML5 audio playing successfully
          })
          .catch(() => {
            // If HTML5 element is still blocked or fails, use Web Audio API music box
            playMusicBoxTune();
          });
      }
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
    // 1. Attempt immediate autoplay on initial render
    const bgAudio = bgAudioRef.current;
    if (bgAudio) {
      bgAudio.volume = 1.0;
      const promise = bgAudio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            // Autoplay succeeded immediately! (e.g. desktop or permitted policy)
            isPlayingRef.current = true;
            setIsPlaying(true);
            setHasEntered(true);
          })
          .catch(() => {
            // Waiting for user tap
          });
      }
    }

    // 2. Mobile browsers require a gesture before allowing audio playback.
    // Register one-time passive window listeners so her very first touch or scroll starts the music and unlocks the screen!
    const unlockAudio = () => {
      startMusic();
      setHasEntered(true);
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
    triggerFallingHearts(22);
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    if (!isPlaying) {
      toggleMusic();
    }
  };

  // Runaway "Nope" button with guaranteed instant jump
  const moveNoButton = (e?: React.SyntheticEvent | MouseEvent | TouchEvent, force = false) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    const now = Date.now();
    // Only throttle rapid background mousemove triggers; direct hover/touch always jumps instantly!
    if (!force && now - lastMoveTimeRef.current < 45) return;
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

    // Evaluate 24 candidate coordinates across the area and pick the one furthest from the cursor
    for (let i = 0; i < 24; i++) {
      const candLeft = Math.floor(Math.random() * maxX) + 6;
      const candTop = Math.floor(Math.random() * maxY) + 4;
      const candCenterX = candLeft + btnWidth / 2;
      const candCenterY = candTop + btnHeight / 2;

      const distFromMouse = Math.hypot(candCenterX - mouseX, candCenterY - mouseY);
      const distFromPrev = Math.hypot(candLeft - currentX, candTop - currentY);

      // Avoid fully overlapping the center-left area where YES is
      const distFromYes = Math.hypot(candCenterX - (area.width / 2 - 60), candCenterY - (area.height / 2));
      const penalty = distFromYes < 55 ? 60 : 0;

      const score = distFromMouse * 2.0 + distFromPrev - penalty;
      if (score > bestScore) {
        bestScore = score;
        targetLeft = candLeft;
        targetTop = candTop;
      }
    }

    setNoPos({ left: targetLeft, top: targetTop });
    setNoEscapeCount((prev) => prev + 1);
  };

  // Proximity detection: if cursor approaches within 100px, flee before it even touches!
  const handleAreaMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (agreed || !noBtnRef.current || !twistAreaRef.current) return;
    const btn = noBtnRef.current.getBoundingClientRect();
    const btnCenterX = btn.left + btn.width / 2;
    const btnCenterY = btn.top + btn.height / 2;
    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    if (dist < 100) {
      moveNoButton(e, true);
    }
  };

  const handleYes = () => {
    setAgreed(true);
    triggerFallingHearts(20);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
  };

  // 365 Reasons Jar Interaction
  const handleOpenReason = () => {
    setIsJarShaking(true);
    triggerFallingHearts(16);
    setTimeout(() => setIsJarShaking(false), 500);

    const randomIdx = Math.floor(Math.random() * loveReasons.length);
    const reasonNum = Math.floor(Math.random() * 365) + 1;
    setOpenedReason({ num: reasonNum, text: loveReasons[randomIdx] });
    setOpenedCount((prev) => prev + 1);

    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.65 }
    });
  };

  const toggleFavorite = (num: number) => {
    setFavorites((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  // Birthday Countdown Timer Effect
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(targetDateStr).getTime();
      const now = Date.now();
      const diff = target - now;

      // If midnight target is reached or passed (diff <= 0)
      if (diff <= 0) {
        setCountdownTime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isToday: true
        });
        if (!isUnlocked) {
          setIsUnlocked(true);
          triggerFallingHearts(28);
          confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
        }
        return;
      }

      // Still counting down before 12:00 AM
      setIsUnlocked(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdownTime({
        days,
        hours,
        minutes,
        seconds,
        isToday: false
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, isUnlocked]);

  const handleSaveCountdownDate = () => {
    if (!tempCountdownDate) return;
    setTargetDateStr(tempCountdownDate);
    localStorage.setItem('birthday_countdown_target', tempCountdownDate);
    setIsEditingCountdownDate(false);
    triggerFallingHearts(14);
  };

  // Starlight Particle Animation & Cast Wish
  const spawnStarlightFx = (originX: number, originY: number) => {
    const starChars = ['⭐', '✨', '🌟', '💫', '💖'];
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'starlight-particle';
        star.textContent = starChars[Math.floor(Math.random() * starChars.length)];
        star.style.left = `${originX + (Math.random() * 40 - 20)}px`;
        star.style.top = `${originY + (Math.random() * 20 - 10)}px`;
        const tx = (Math.random() - 0.5) * 240;
        const ty = -(Math.random() * 280 + 160);
        star.style.setProperty('--tx', `${tx}px`);
        star.style.setProperty('--ty', `${ty}px`);
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 1900);
      }, i * 60);
    }
  };

  const handleCastWish = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!wishInput.trim() || isSendingWish) return;
    const wish = wishInput.trim();
    setIsSendingWish(true);
    setLastSentWish(wish);
    setWishInput(''); // Clears and refreshes the message box every time!

    const newEntry = {
      id: Date.now().toString(),
      wish,
      date: new Date().toLocaleString()
    };

    // 1. Immediately store in state and localStorage
    setServerWishes((prev) => [newEntry, ...prev]);
    try {
      const stored = localStorage.getItem('birthday_wishes_inbox');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEntry);
      localStorage.setItem('birthday_wishes_inbox', JSON.stringify(list));
    } catch {}

    // 2. Save to server backend
    fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    })
      .then(() => loadWishes())
      .catch(() => {});

    // 3. Dispatch to FormSubmit with activation detection
    try {
      const res = await fetch('https://formsubmit.co/ajax/shubhamecom1999@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🎂 Birthday Girl's Wish: "${wish.slice(0, 35)}..." 💖`,
          birthdayWish: wish,
          date: new Date().toLocaleString(),
          recipient: 'shubhamecom1999@gmail.com',
          source: 'Birthday Website'
        })
      });

      const data = await res.json().catch(() => null);
      if (data && data.success === 'false' && data.message?.includes('Activation')) {
        setWishActivationNotice(true);
        setWishSentNotification(`💌 Wish "${wish.length > 30 ? wish.slice(0, 30) + '...' : wish}" recorded! FormSubmit sent a 1-time activation email to shubhamecom1999@gmail.com. Please click "Activate Form" in that email once to enable automatic forwarding.`);
      } else {
        setWishActivationNotice(false);
        setWishSentNotification(`💌 Wish "${wish.length > 30 ? wish.slice(0, 30) + '...' : wish}" was delivered straight to Shubham's Gmail (shubhamecom1999@gmail.com)!`);
      }
    } catch {
      setWishSentNotification(`💌 Wish "${wish.length > 30 ? wish.slice(0, 30) + '...' : wish}" saved securely in Shubham's Wish Inbox!`);
    }

    // 4. Also dispatch via Gmail API if user connected
    if (googleUser) {
      sendWishViaGmailApi(wish, 'shubhamecom1999@gmail.com').catch(() => {});
    }

    // Starlight effect
    const rect = e.currentTarget.getBoundingClientRect();
    spawnStarlightFx(rect.left + rect.width / 2, rect.top);
    triggerFallingHearts(22);
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.65 }
    });

    setTimeout(() => {
      setIsSendingWish(false);
    }, 800);
  };

  // Touch Scratch-off Card setup & reseal
  const initScratchCanvas = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Measure exact rendered dimensions so scale is 1:1 on any mobile device
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width) || 280;
    const height = Math.round(rect.height) || 160;
    canvas.width = width;
    canvas.height = height;

    ctx.globalCompositeOperation = 'source-over';

    // Soft metallic pink gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fba7b8');
    grad.addColorStop(0.3, '#f4728f');
    grad.addColorStop(0.7, '#ff8fa3');
    grad.addColorStop(1, '#fba7b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(6, 6, width - 12, height - 12);
    ctx.setLineDash([]);

    // Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 4;
    ctx.fillText('✨ Scratch with finger ✨', width / 2, height / 2 - 8);
    ctx.shadowBlur = 0;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText('Rub to reveal surprise! 🎁', width / 2, height / 2 + 16);
  };

  useEffect(() => {
    if (hasEntered) {
      initScratchCanvas();
      const timer = setTimeout(() => {
        initScratchCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasEntered]);

  // Robust native touch & pointer listeners for 100% mobile compatibility
  useEffect(() => {
    if (!hasEntered) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const getPos = (touchOrMouse: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);
      return {
        x: (touchOrMouse.clientX - rect.left) * scaleX,
        y: (touchOrMouse.clientY - rect.top) * scaleY
      };
    };

    const erase = (x1: number, y1: number, x2: number, y2: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x2, y2, 22, 0, Math.PI * 2);
      ctx.fill();
    };

    // 1. Touch Events (Mobile Safari & Chrome with non-passive preventDefault)
    const onTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (!e.touches || e.touches.length === 0) return;
      isDrawing = true;
      const pos = getPos(e.touches[0]);
      lastX = pos.x;
      lastY = pos.y;
      erase(pos.x, pos.y, pos.x, pos.y);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (!isDrawing || !e.touches || e.touches.length === 0) return;
      const pos = getPos(e.touches[0]);
      erase(lastX, lastY, pos.x, pos.y);
      lastX = pos.x;
      lastY = pos.y;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      isDrawing = false;
    };

    // 2. Pointer Events (Modern devices & mice)
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isDrawing = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      erase(pos.x, pos.y, pos.x, pos.y);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      erase(lastX, lastY, pos.x, pos.y);
      lastX = pos.x;
      lastY = pos.y;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDrawing = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);

      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [hasEntered]);

  // Typewriter Letter Observer
  useEffect(() => {
    if (!hasEntered) return;
    const element = letterPaperRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !letterStartedRef.current) {
          letterStartedRef.current = true;
          setLetterText("");
          let idx = 0;
          const interval = setInterval(() => {
            idx++;
            setLetterText(fullLetter.slice(0, idx));
            if (idx >= fullLetter.length) {
              clearInterval(interval);
            }
          }, 22);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasEntered, fullLetter]);

  return (
    <>
      {/* Background Floating Hearts Canvas */}
      <canvas id="hearts-canvas" ref={canvasRef} />

      {/* Audio Element with Local Bundled Audio */}
      <audio ref={bgAudioRef} loop preload="auto" playsInline src={birthdaySong}>
        <source src={birthdaySong} type="audio/mpeg" />
        <source src="birthday.mp3" type="audio/mpeg" />
      </audio>

      {/* Shubham's Wish Inbox Modal */}
      {showVaultModal && (
        <div className="vault-modal-overlay" onClick={() => setShowVaultModal(false)}>
          <div className="vault-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '32px', marginBottom: '6px' }}>🐻💌🔐</div>
            <h3 style={{ fontSize: '18px', color: 'var(--primary-dark)', fontWeight: 700, margin: '0 0 6px' }}>
              Shubham&apos;s Secret Wish Inbox
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Wishes submitted on this website to <strong>shubhamecom1999@gmail.com</strong>:
            </p>

            {/* Gmail Connection Card */}
            <div style={{ background: '#fdf2f4', border: '1.5px solid #ffccd5', borderRadius: '16px', padding: '12px', marginBottom: '14px' }}>
              {googleUser ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px', color: '#10b981', fontWeight: 700 }}>
                    <span>✅ Connected as</span>
                    <span>{googleUser.email || 'shubhamecom1999@gmail.com'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Incoming wishes are dispatched directly to your inbox.
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectGmail}
                    style={{ background: 'none', border: 'none', color: '#e63956', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', marginTop: '6px' }}
                  >
                    Disconnect Gmail
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '12px', color: '#594a4e', marginBottom: '8px' }}>
                    Connect your Gmail to receive wishes directly:
                  </div>
                  <button
                    type="button"
                    className="gsi-material-button"
                    onClick={handleConnectGmail}
                    disabled={isGmailConnecting}
                  >
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isGmailConnecting ? 'Connecting...' : 'Connect with Google'}
                    </span>
                  </button>
                </div>
              )}

              {emailStatus && (
                <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                  {emailStatus}
                </div>
              )}
            </div>

            {/* List of Wishes */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {serverWishes.length > 0 ? (
                serverWishes.map((w, idx) => (
                  <div key={w.id || idx} style={{ background: '#fff0f3', border: '1px solid #ffd5dc', borderRadius: '12px', padding: '10px' }}>
                    <div style={{ fontSize: '13.5px', color: '#33272a', fontWeight: 600, fontStyle: 'italic' }}>
                      &ldquo;{w.wish}&rdquo;
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--primary-dark)' }}>
                        🕒 {w.date}
                      </span>
                      {googleUser && (
                        <button
                          type="button"
                          onClick={() => handleSendWishToGmail(w.wish)}
                          style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '10px', padding: '3px 8px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Send to Gmail
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : lastSentWish ? (
                <div style={{ background: '#fff0f3', border: '1px solid #ffd5dc', borderRadius: '12px', padding: '10px' }}>
                  <div style={{ fontSize: '13.5px', color: '#33272a', fontWeight: 600, fontStyle: 'italic' }}>
                    &ldquo;{lastSentWish}&rdquo;
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--primary-dark)' }}>
                      🕒 Latest Wish
                    </span>
                    {googleUser && (
                      <button
                        type="button"
                        onClick={() => handleSendWishToGmail(lastSentWish)}
                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '10px', padding: '3px 8px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Send to Gmail
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)', padding: '12px' }}>
                  No wishes submitted yet! As soon as she writes one, it will appear here. ✨
                </div>
              )}
            </div>

            <button
              type="button"
              className="welcome-open-btn"
              style={{ marginTop: '16px', minHeight: '40px', padding: '10px 16px', fontSize: '13px' }}
              onClick={() => setShowVaultModal(false)}
            >
              Close Inbox 💕
            </button>
          </div>
        </div>
      )}

      {/* Opening Surprise Curtain for 100% Guaranteed Audio Playback on Mobile & Desktop */}
      {!hasEntered && (
        <div
          className="welcome-overlay"
          onClick={() => {
            startMusic();
            setHasEntered(true);
            triggerFallingHearts(20);
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
          }}
        >
          <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
            <div className="welcome-tag">Special Delivery for Birthday Girl 💌</div>
            <div className="welcome-gift-icon">🎁</div>
            <h1 className="welcome-title">Happy Birthday, Cutie! 💖</h1>
            <p className="welcome-subtitle">
              A sweet birthday celebration made with all my love, just for you.
            </p>
            <button
              type="button"
              className="welcome-open-btn"
              onClick={() => {
                startMusic();
                setHasEntered(true);
                triggerFallingHearts(24);
                confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
              }}
            >
              <span>Tap to Open Your Card 🎶✨</span>
            </button>
            <div className="welcome-note">🎵 Birthday song starts automatically!</div>
          </div>
        </div>
      )}

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

      {/* Countdown First Page (Shown before 12:00 AM Midnight) */}
      {!isUnlocked && !forceUnlocked ? (
        <div className="countdown-lock-screen">
          <div className="countdown-lock-card">
            <div className="countdown-midnight-badge">
              <span>⏳</span>
              <span>Reveals at 12:00 AM Midnight</span>
              <span>✨</span>
            </div>

            <div className="countdown-lock-icon">🎁</div>

            <h1 className="countdown-lock-title">
              Almost Your Birthday, Cutie! 💖
            </h1>

            <p className="countdown-lock-desc">
              Shubham, Milk &amp; Mocha have prepared a magical birthday surprise for you! This website is locked with love and will automatically open at <strong>12:00 AM</strong>.
            </p>

            {/* Countdown Clock Grid */}
            <div className="countdown-grid">
              {/* Days */}
              <div className="countdown-box">
                <span className="countdown-heart-accent">💖</span>
                <div className="countdown-num">{String(countdownTime.days).padStart(2, '0')}</div>
                <div className="countdown-label">Days</div>
              </div>

              {/* Hours */}
              <div className="countdown-box">
                <span className="countdown-heart-accent">💕</span>
                <div className="countdown-num">{String(countdownTime.hours).padStart(2, '0')}</div>
                <div className="countdown-label">Hours</div>
              </div>

              {/* Minutes */}
              <div className="countdown-box">
                <span className="countdown-heart-accent">💓</span>
                <div className="countdown-num">{String(countdownTime.minutes).padStart(2, '0')}</div>
                <div className="countdown-label">Minutes</div>
              </div>

              {/* Seconds */}
              <div className="countdown-box">
                <span className="countdown-heart-accent">✨</span>
                <div className="countdown-num">{String(countdownTime.seconds).padStart(2, '0')}</div>
                <div className="countdown-label">Seconds</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--primary-dark)', fontStyle: 'italic', margin: '8px 0 12px' }}>
              &ldquo;Counting down every single heartbeat until I get to celebrate you...&rdquo; 🐾
            </div>

            {/* Milk and Mocha Bear Sleeping / Peeking Graphic */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '4px 0 8px' }}>
              <svg width="150" height="90" viewBox="0 0 200 120" fill="none">
                <g className="mocha-bear">
                  <path d="M130 50 C130 30, 160 30, 160 50 C168 62, 168 100, 148 108 C134 112, 126 100, 130 50 Z" fill="#ad7954" />
                  <circle cx="138" cy="34" r="8" fill="#ad7954" />
                  <circle cx="138" cy="34" r="4" fill="#875535" />
                  <circle cx="160" cy="40" r="7" fill="#ad7954" />
                  <path d="M142 54 Q146 58 150 54" stroke="#2b1810" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
                <g className="milk-bear">
                  <circle cx="70" cy="35" r="11" fill="#ffffff" stroke="#e0d5d5" strokeWidth="1.5" />
                  <circle cx="70" cy="35" r="5" fill="#ffd1dc" />
                  <circle cx="115" cy="35" r="11" fill="#ffffff" stroke="#e0d5d5" strokeWidth="1.5" />
                  <circle cx="115" cy="35" r="5" fill="#ffd1dc" />
                  <ellipse cx="92" cy="65" rx="34" ry="30" fill="#ffffff" stroke="#e0d5d5" strokeWidth="1.5" />
                  <ellipse cx="72" cy="72" rx="7" ry="5" fill="#ffb3c1" opacity="0.8" />
                  <ellipse cx="112" cy="72" rx="7" ry="5" fill="#ffb3c1" opacity="0.8" />
                  <path d="M78 63 Q83 68 88 63" stroke="#33272a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M96 63 Q101 68 106 63" stroke="#33272a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="92" cy="68" rx="3.5" ry="2.5" fill="#33272a" />
                </g>
                <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#ff758f" fontWeight="bold">Shh... bears are setting up the party! 🎈</text>
              </svg>
            </div>

            {/* Preview Controls for testing & Date Setup */}
            <div className="countdown-preview-toggle-bar">
              <button
                type="button"
                className="btn-preview-unlock"
                onClick={() => {
                  setForceUnlocked(true);
                  startMusic();
                  triggerFallingHearts(24);
                  confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                }}
              >
                <span>🔓</span>
                <span>Preview Website Now</span>
              </button>

              <div className="countdown-date-edit-wrapper">
                {!isEditingCountdownDate ? (
                  <button
                    type="button"
                    className="btn-date-toggle"
                    onClick={() => {
                      setTempCountdownDate(targetDateStr);
                      setIsEditingCountdownDate(true);
                    }}
                  >
                    🗓️ Set Midnight Date &amp; Time ({new Date(targetDateStr).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                  </button>
                ) : (
                  <div className="date-picker-inline">
                    <input
                      type="datetime-local"
                      className="date-picker-input"
                      value={tempCountdownDate}
                      onChange={(e) => setTempCountdownDate(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-save-date"
                      onClick={handleSaveCountdownDate}
                    >
                      Save Date ❤️
                    </button>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                      onClick={() => setIsEditingCountdownDate(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Celebration Website Unlocked! */
        <>
          {forceUnlocked && (
            <button
              type="button"
              className="top-unlocked-preview-pill"
              onClick={() => setForceUnlocked(false)}
              title="Return to Countdown Screen"
            >
              <span>🔒</span>
              <span>Back to Countdown</span>
            </button>
          )}

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
            title="Tap us to change messages!"
          >
            <div className="bear-bubble" key={bearQuoteIdx}>
              <span>{bearQuotes[bearQuoteIdx]}</span>
              <span className="bear-bubble-counter">{bearQuoteIdx + 1}/{bearQuotes.length}</span>
            </div>

            {/* Interactive Tap Badge */}
            <div className="bear-tap-badge">
              <span className="tap-hand">👆</span>
              <span>Tap us to change message! 🐾</span>
            </div>

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

        {/* 2.5. Write a Birthday Wish Section */}
        <section className="card" id="writeWishSection">
          <div className="hero-badge" style={{ marginBottom: '8px' }}>
            <span>⭐</span>
            <span>Make a Secret Wish</span>
            <span>✨</span>
          </div>

          <h2 style={{ fontSize: '22px', color: 'var(--primary-dark)', fontWeight: 700, margin: '2px 0 6px' }}>
            Write a Birthday Wish 🌟💌
          </h2>

          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5, maxWidth: '340px', margin: '0 auto 12px' }}>
            What is your heart wishing for this year? Type it out below and release it into the stars—Shubham will keep it safe forever!
          </p>

          <div className="wish-card-container">
            {wishSentNotification && (
              <div className="wish-sent-success-banner">
                <div style={{ fontWeight: 700, marginBottom: '2px', color: '#047857' }}>
                  🎉 Wish Successfully Sent to Shubham!
                </div>
                <div>{wishSentNotification}</div>
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>
                  The box is refreshed below — write as many wishes as you want! 💖
                </div>
              </div>
            )}

            {wishActivationNotice && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: '#92400e', textAlign: 'left', lineHeight: 1.45, marginBottom: '10px' }}>
                <strong>📩 Important Note for Shubham:</strong> FormSubmit sent a <strong>one-time activation email</strong> to <code>shubhamecom1999@gmail.com</code> (check Spam/Updates too). Please open that email and click <strong>&quot;Activate Form&quot;</strong> so all incoming wishes arrive automatically in your inbox!
              </div>
            )}

            <div className="wish-input-wrapper">
              <textarea
                className="wish-textarea"
                value={wishInput}
                onChange={(e) => setWishInput(e.target.value)}
                placeholder="Type your birthday wish here for Shubham... (e.g., A romantic trip together, infinite cuddles, your favorite dessert...)"
                rows={3}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-cast-wish"
                  onClick={handleCastWish}
                  disabled={!wishInput.trim() || isSendingWish}
                  style={{ opacity: wishInput.trim() && !isSendingWish ? 1 : 0.65 }}
                >
                  <span>{isSendingWish ? '⏳' : '💌'}</span>
                  <span>{isSendingWish ? 'Sending Wish to Shubham...' : 'Send Wish to Shubham'}</span>
                  <span>{isSendingWish ? '✨' : '💖'}</span>
                </button>
              </div>
            </div>

            {lastSentWish && (
              <div className="last-sent-wish-card">
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '3px' }}>
                  ✨ Latest Wish Received:
                </div>
                <div style={{ fontStyle: 'italic', color: '#33272a', fontWeight: 600, marginBottom: '8px' }}>
                  &ldquo;{lastSentWish}&rdquo;
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <a
                    href={`mailto:shubhamecom1999@gmail.com?subject=${encodeURIComponent("🎂 Birthday Girl's Wish for Shubham 💕")}&body=${encodeURIComponent(`Hi Shubham,\n\nHere is my birthday wish:\n\n"${lastSentWish}"\n\nSent with all my love! 💖`)}`}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #ffccd5',
                      color: 'var(--primary-dark)',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(255, 94, 126, 0.12)'
                    }}
                  >
                    <span>✉️</span>
                    <span>Open in Gmail App</span>
                  </a>
                </div>
              </div>
            )}

            {/* Shubham Wish Vault Inspector */}
            <button
              type="button"
              className="btn-shubham-vault-toggle"
              onClick={() => {
                loadWishes();
                setShowVaultModal(true);
              }}
            >
              <span>🐻🔐</span>
              <span>Shubham&apos;s Wish Inbox ({serverWishes.length > 0 ? serverWishes.length : (lastSentWish ? 1 : 0)})</span>
            </button>
          </div>
        </section>

        {/* 3. The Playful Twist (Runaway "No" Button) */}
        <section
          className="card twist-box"
          onMouseMove={handleAreaMouseMove}
        >
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
                onMouseEnter={(e) => moveNoButton(e, true)}
                onMouseOver={(e) => moveNoButton(e, true)}
                onMouseMove={(e) => moveNoButton(e, true)}
                onPointerEnter={(e) => moveNoButton(e, true)}
                onPointerOver={(e) => moveNoButton(e, true)}
                onPointerMove={(e) => moveNoButton(e, true)}
                onTouchStart={(e) => moveNoButton(e, true)}
                onTouchMove={(e) => moveNoButton(e, true)}
                onClick={(e) => moveNoButton(e, true)}
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
                      alt="Our Precious Moment"
                      className="polaroid-photo"
                      loading="eager"
                    />
                  </div>
                  <div className="polaroid-caption">Our Precious Moment 💕</div>
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

        {/* 5. The Little Jar of 365 Reasons */}
        <section className="card" id="loveJarSection">
          <div className="hero-badge" style={{ marginBottom: '8px' }}>✨ Daily Love Capsule ✨</div>
          <h2 style={{ fontSize: '22px', color: 'var(--primary-dark)', fontWeight: 700, margin: '2px 0 6px' }}>
            Little Jar of 365 Reasons 🫙💖
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5, maxWidth: '340px', margin: '0 auto 14px' }}>
            A folded love note for every single day of the year. Tap the jar to pull out a secret reason why I fell in love with you!
          </p>

          <div className="love-jar-container">
            <div
              className={`jar-wrapper ${isJarShaking ? 'shaking' : ''}`}
              onClick={handleOpenReason}
              title="Tap to pull out a love note!"
            >
              <div className="jar-glow" />
              <svg className="jar-svg" width="140" height="175" viewBox="0 0 140 175" fill="none">
                {/* Jar Lid / Cork */}
                <rect x="42" y="10" width="56" height="14" rx="4" fill="#d4a373" stroke="#b07d56" strokeWidth="2" />
                <rect x="48" y="24" width="44" height="8" rx="2" fill="#e9c49a" stroke="#b07d56" strokeWidth="1.5" />
                
                {/* Pink Ribbon & Bow */}
                <path d="M44 28 C55 31, 85 31, 96 28" stroke="#ff5e7e" strokeWidth="4" strokeLinecap="round" />
                <circle cx="70" cy="30" r="4" fill="#ff5e7e" />
                <path d="M70 30 C64 26, 56 34, 70 30 Z" fill="#ff758f" />
                <path d="M70 30 C76 26, 84 34, 70 30 Z" fill="#ff758f" />
                
                {/* Hanging Tag */}
                <path d="M70 32 L88 50 L84 62 L74 60 Z" fill="#fff5f5" stroke="#ffb3c1" strokeWidth="1" />
                <circle cx="73" cy="36" r="1.5" fill="#ff5e7e" />
                <text x="76" y="56" fontSize="7" fill="#e11d48" fontWeight="bold">365 💌</text>

                {/* Glass Jar Body */}
                <rect x="25" y="32" width="90" height="135" rx="24" fill="rgba(255, 255, 255, 0.45)" stroke="#ffccd5" strokeWidth="2.5" />
                
                {/* Glass Reflections */}
                <path d="M34 46 C32 70, 32 135, 34 150" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M40 48 C38 65, 38 80, 40 92" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Folded Origami Hearts / Stars inside jar */}
                <circle cx="50" cy="148" r="8" fill="#ff758f" />
                <circle cx="50" cy="148" r="4" fill="#ffccd5" opacity="0.6" />
                <circle cx="70" cy="150" r="9" fill="#ffd166" />
                <circle cx="70" cy="150" r="5" fill="#fff1c2" opacity="0.6" />
                <circle cx="90" cy="146" r="8.5" fill="#c084fc" />
                <circle cx="90" cy="146" r="4.5" fill="#f3e8ff" opacity="0.6" />
                <circle cx="42" cy="132" r="7.5" fill="#6ee7b7" />
                <circle cx="62" cy="134" r="8.5" fill="#ff8fa3" />
                <circle cx="82" cy="130" r="8" fill="#38bdf8" />
                <circle cx="98" cy="134" r="7" fill="#f472b6" />
                <circle cx="52" cy="116" r="8" fill="#fb923c" />
                <circle cx="72" cy="118" r="7.5" fill="#a78bfa" />
                <circle cx="88" cy="114" r="8.5" fill="#fb7185" />
                <circle cx="60" cy="100" r="7.5" fill="#fcd34d" />
                <circle cx="78" cy="102" r="8" fill="#f43f5e" />
                <circle cx="68" cy="86" r="7" fill="#ec4899" />
                
                {/* Subtle Star/Heart icons on origami beads */}
                <text x="47" y="151" fontSize="8" fill="#fff">★</text>
                <text x="67" y="153" fontSize="8" fill="#fff">♥</text>
                <text x="87" y="149" fontSize="8" fill="#fff">★</text>
                <text x="59" y="137" fontSize="8" fill="#fff">♥</text>
                <text x="79" y="133" fontSize="8" fill="#fff">★</text>
                <text x="69" y="121" fontSize="8" fill="#fff">♥</text>
                <text x="75" y="105" fontSize="8" fill="#fff">★</text>
              </svg>
            </div>

            {!openedReason ? (
              <button
                type="button"
                className="btn-jar-pick"
                onClick={handleOpenReason}
                style={{ marginTop: '14px' }}
              >
                <span>🫙</span>
                <span>Open a Love Note ✨</span>
              </button>
            ) : (
              <div className="jar-opened-note" key={`${openedReason.num}-${openedCount}`}>
                <div className="note-washi-tape" />
                <div className="note-number-pill">
                  <span>💌</span>
                  <span>Reason #{openedReason.num} of 365</span>
                </div>
                <div className="note-text">
                  &ldquo;{openedReason.text}&rdquo;
                </div>
                <div className="note-signoff">
                  — Forever Yours, Shubham 🐻❤️
                </div>
                <div className="note-actions">
                  <button
                    type="button"
                    className="btn-jar-pick"
                    onClick={handleOpenReason}
                  >
                    <span>✨</span>
                    <span>Pick Another Reason</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-jar-fav ${favorites.includes(openedReason.num) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(openedReason.num)}
                  >
                    <span>{favorites.includes(openedReason.num) ? '❤️' : '🤍'}</span>
                    <span>{favorites.includes(openedReason.num) ? 'Saved in Favorites' : 'Save to Favorites'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="jar-stats-bar">
              <span>🫙 <strong>{openedCount}</strong> {openedCount === 1 ? 'note' : 'notes'} unfolded</span>
              <span>•</span>
              <span>💖 <strong>{favorites.length}</strong> saved</span>
            </div>

            {/* Quick favorites list if she saved any */}
            {favorites.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                Favorites saved: {favorites.map(num => `#${num}`).join(', ')} 💕
              </div>
            )}
          </div>
        </section>

        {/* 6. Digital Scratch-Off Card */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: 700, margin: 0 }}>
              Birthday Pass 🎟️
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Use your finger to scratch and reveal your surprise:
          </p>

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
              ref={(el) => {
                scratchCanvasRef.current = el;
                if (el) {
                  requestAnimationFrame(() => initScratchCanvas());
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-reseal-scratch"
              onClick={() => {
                initScratchCanvas();
                triggerFallingHearts(14);
              }}
            >
              <span>✨</span>
              <span>Re-seal Card (Scratch Again)</span>
            </button>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>
              Valid anytime • Non-transferable • Infinite cuddles included
            </p>
          </div>
        </section>

        {/* 7. Love Letter Signed by Shubham */}
        <section className="card" id="loveLetterSection">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: 700, margin: 0 }}>
              A Little Note for You 💌
            </h2>
          </div>

          <div className="letter-paper" ref={letterPaperRef}>
            <div style={{ minHeight: '100px', lineHeight: 1.7 }}>
              {letterText || fullLetter}
            </div>
            <div className="letter-sign">
              Forever Yours,<br />
              Shubham ❤️
            </div>
            <div className="letter-bear-sticker">🐻</div>
          </div>
        </section>

        <footer>Made with endless love &amp; bear hugs by Shubham, just for you 💖</footer>

        {/* Wish Inbox Modal */}
        {showVaultModal && (
          <div
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setShowVaultModal(false)}
          >
            <div
              className="modal-content"
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '24px 20px',
                maxWidth: '420px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                textAlign: 'center',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowVaultModal(false)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>

              <div style={{ fontSize: '32px', marginBottom: '6px' }}>🐻💌🔐</div>
              <h3 style={{ fontSize: '18px', color: 'var(--primary-dark)', margin: '0 0 6px', fontWeight: 800 }}>
                Shubham&apos;s Wish Inbox
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                All birthday wishes submitted on this site are stored here safely!
              </p>

              {serverWishes.length === 0 ? (
                <div style={{ padding: '24px 12px', background: '#fff5f7', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No wishes written yet. Type a wish above to send it! ✨
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                  {serverWishes.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        background: '#fffafb',
                        border: '1.5px solid #ffccd5',
                        borderRadius: '14px',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                        📅 {item.date}
                      </div>
                      <div style={{ fontSize: '14px', color: '#33272a', fontWeight: 600, fontStyle: 'italic', marginBottom: '8px' }}>
                        &ldquo;{item.wish}&rdquo;
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`mailto:shubhamecom1999@gmail.com?subject=${encodeURIComponent("🎂 Birthday Girl's Wish for Shubham 💕")}&body=${encodeURIComponent(`Hi Shubham,\n\nHere is my birthday wish:\n\n"${item.wish}"\n\nSent with all my love! 💖`)}`}
                          style={{
                            fontSize: '11px',
                            background: '#ffffff',
                            border: '1px solid #ffccd5',
                            color: 'var(--primary-dark)',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ✉️ Open in Gmail
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '16px', background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', fontSize: '11.5px', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }}>
                💡 <strong>Gmail Auto-Delivery Note:</strong> FormSubmit requires one-time activation. Check <code>shubhamecom1999@gmail.com</code> (including Spam/Promotions) for an email from FormSubmit and click <strong>&quot;Activate Form&quot;</strong> to receive instant email notifications for new wishes!
              </div>

              <button
                type="button"
                onClick={() => setShowVaultModal(false)}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Inbox
              </button>
            </div>
          </div>
        )}
      </main>
      </>
      )}
    </>
  );
}
