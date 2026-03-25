import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Gift } from 'lucide-react';

const FlyingShuttlecock = ({ id, onComplete }: { id: number, onComplete: (id: number) => void }) => {
  const randomX1 = useMemo(() => (Math.random() - 0.5) * 500, []);
  const randomX2 = useMemo(() => randomX1 + (Math.random() - 0.5) * 300, [randomX1]);
  const randomRot = useMemo(() => (Math.random() - 0.5) * 360, []);
  
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ y: 0, x: 0, scale: 0.2, opacity: 1 }}
        animate={{ 
          y: [0, -400, 800], 
          x: [0, randomX1, randomX2],
          rotate: [0, randomRot, randomRot + 720],
          scale: [0.2, 2, 1],
          opacity: [1, 1, 0]
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        onAnimationComplete={() => onComplete(id)}
        className="text-4xl"
      >
        🏸
      </motion.div>
    </div>
  );
};

const TypingEffect = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const words = text.split(" ");
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: delay }
        }
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 5 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
          }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function App() {
  const [phase, setPhase] = useState<'envelope' | 'cake' | 'gift' | 'card'>('envelope');
  const [cuts, setCuts] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [shuttlecocks, setShuttlecocks] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGiftClick = () => {
    setShuttlecocks(prev => [...prev, Date.now() + Math.random()]);
  };

  const removeShuttlecock = (id: number) => {
    setShuttlecocks(prev => prev.filter(sId => sId !== id));
  };

  useEffect(() => {
    // Initialize the subtle celebratory background music
    audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3');
    audioRef.current.volume = 0.3; // Subtle volume
    audioRef.current.loop = true;
  }, []);

  const handleCut = () => {
    if (cuts >= 3) return;
    const newCuts = cuts + 1;
    setCuts(newCuts);
    
    if (newCuts === 3) {
      setTimeout(() => {
        setPhase('gift');
      }, 1500);
    }
  };

  const handleOpenGift = () => {
    if (isOpening) return;
    setIsOpening(true);
    triggerConfetti();
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setTimeout(() => {
      setPhase('card');
    }, 1000);
  };

  const triggerConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;
    const colors = ['#D4AF37', '#F4E4E4', '#FFFFFF', '#E5E5E5'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center overflow-hidden font-sans text-stone-800 selection:bg-stone-200">
      <AnimatePresence mode="wait">
        
        {/* ENVELOPE PHASE */}
        {phase === 'envelope' && (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <p className="mb-12 text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">You have a message</p>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase('cake')}
              className="relative w-80 h-52 cursor-pointer group"
            >
              {/* Envelope SVG */}
              <svg width="320" height="208" viewBox="0 0 320 208" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl transition-all duration-500 group-hover:drop-shadow-[0_30px_40px_rgba(0,0,0,0.1)]">
                <rect x="0" y="0" width="320" height="208" rx="4" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="1"/>
                <path d="M0 0L160 104L320 0" fill="#F5F5F4" stroke="#E7E5E4" strokeWidth="1"/>
                <path d="M0 208L160 104L320 208" stroke="#E7E5E4" strokeWidth="1"/>
              </svg>
              
              {/* Wax Seal */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#881337] rounded-full shadow-md flex items-center justify-center border-2 border-[#9F1239]">
                <Heart className="w-5 h-5 text-rose-100 fill-rose-100" />
              </div>
            </motion.div>
            <p className="mt-12 text-sm text-stone-400 italic font-serif">Tap to open</p>
          </motion.div>
        )}

        {/* CAKE PHASE */}
        {phase === 'cake' && (
          <motion.div
            key="cake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
            <div className="mb-16 text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif text-stone-800">Make a wish, Virti.</h2>
              <div className="text-stone-500 flex items-center justify-center gap-2 text-sm h-6">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cuts}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {cuts === 0 ? "Tap the cake to cut it" : cuts === 1 ? "Keep cutting..." : cuts === 2 ? "One more cut!" : "Perfect!"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Top-Down Cake */}
            <div 
              className="relative w-64 h-64 cursor-pointer group"
              onClick={handleCut}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                {/* Plate */}
                <circle cx="100" cy="100" r="95" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="2" />
                <circle cx="100" cy="100" r="85" fill="#ffffff" />
                
                <AnimatePresence>
                  {cuts === 0 && (
                    <motion.g key="vanilla" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.4 }}>
                      {/* Cake Base */}
                      <circle cx="100" cy="100" r="75" fill="#fafaf9" stroke="#f5f5f4" strokeWidth="2" />
                      {/* Frosting Details */}
                      {[...Array(12)].map((_, i) => (
                        <circle key={i} cx={100 + 65 * Math.cos(i * Math.PI / 6)} cy={100 + 65 * Math.sin(i * Math.PI / 6)} r="8" fill="#ffffff" stroke="#f5f5f4" strokeWidth="1" />
                      ))}
                      {/* Sprinkles */}
                      {[...Array(24)].map((_, i) => (
                        <circle key={'s'+i} cx={100 + 45 * Math.cos(i * Math.PI / 12)} cy={100 + 45 * Math.sin(i * Math.PI / 12)} r="2" fill={i % 2 === 0 ? "#fbbf24" : "#f472b6"} />
                      ))}
                    </motion.g>
                  )}

                  {cuts === 1 && (
                    <motion.g key="chocolate" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.4 }}>
                      {/* Cake Base */}
                      <circle cx="100" cy="100" r="75" fill="#451a03" stroke="#381c15" strokeWidth="2" />
                      <circle cx="100" cy="100" r="55" fill="#78350f" />
                      {/* Frosting Details */}
                      {[...Array(8)].map((_, i) => (
                        <circle key={i} cx={100 + 60 * Math.cos(i * Math.PI / 4)} cy={100 + 60 * Math.sin(i * Math.PI / 4)} r="10" fill="#271002" />
                      ))}
                      {/* Chocolate Shavings */}
                      {[...Array(16)].map((_, i) => (
                        <line key={'sh'+i} x1={100 + 30 * Math.cos(i * Math.PI / 8)} y1={100 + 30 * Math.sin(i * Math.PI / 8)} x2={100 + 35 * Math.cos(i * Math.PI / 8 + 0.2)} y2={100 + 35 * Math.sin(i * Math.PI / 8 + 0.2)} stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
                      ))}
                    </motion.g>
                  )}

                  {cuts >= 2 && (
                    <motion.g key="berry" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.4 }}>
                      {/* Cake Base */}
                      <circle cx="100" cy="100" r="75" fill="#fdf2f8" stroke="#fce7f3" strokeWidth="2" />
                      {/* Berry Glaze */}
                      <path d="M 100 40 C 115 40, 125 50, 140 55 C 150 60, 160 75, 160 100 C 160 120, 145 140, 130 150 C 115 160, 85 160, 70 150 C 55 140, 40 120, 40 100 C 40 75, 50 60, 60 55 C 75 50, 85 40, 100 40 Z" fill="#be123c" />
                      {/* Strawberries */}
                      {[...Array(6)].map((_, i) => {
                        const angle = i * Math.PI / 3;
                        const cx = 100 + 55 * Math.cos(angle);
                        const cy = 100 + 55 * Math.sin(angle);
                        return (
                          <g key={'st'+i} transform={`translate(${cx}, ${cy}) rotate(${angle * 180 / Math.PI + 90})`}>
                            <path d="M -8 0 A 8 8 0 0 1 8 0 Z" fill="#f43f5e" />
                            <circle cx="-3" cy="-2" r="1" fill="#ffffff" />
                            <circle cx="3" cy="-2" r="1" fill="#ffffff" />
                            <circle cx="0" cy="-5" r="1" fill="#ffffff" />
                          </g>
                        )
                      })}
                      {/* Blueberries */}
                      {[...Array(6)].map((_, i) => {
                        const angle = (i * Math.PI / 3) + (Math.PI / 6);
                        const cx = 100 + 55 * Math.cos(angle);
                        const cy = 100 + 55 * Math.sin(angle);
                        return <circle key={'bb'+i} cx={cx} cy={cy} r="5" fill="#1e3a8a" />
                      })}
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* Cut Lines */}
                {cuts >= 1 && (
                  <motion.line x1="100" y1="25" x2="100" y2="175" stroke="rgba(0,0,0,0.15)" strokeWidth="4" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }} />
                )}
                {cuts >= 2 && (
                  <motion.line x1="35" y1="62.5" x2="165" y2="137.5" stroke="rgba(0,0,0,0.15)" strokeWidth="4" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }} />
                )}
                {cuts >= 3 && (
                  <motion.line x1="35" y1="137.5" x2="165" y2="62.5" stroke="rgba(0,0,0,0.15)" strokeWidth="4" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }} />
                )}
              </svg>

              {/* Center Candle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-stone-800 rounded-full"></div>
                </div>
                {/* Flame */}
                <AnimatePresence>
                  {cuts < 3 && (
                    <motion.div 
                      exit={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="absolute -top-3 -right-3 w-5 h-5 bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-full blur-[2px]"
                      style={{ borderRadius: '50% 50% 0 50%', transform: 'rotate(45deg)' }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <button 
              onClick={handleCut} 
              disabled={cuts >= 3}
              className={`mt-16 px-6 py-2 text-xs tracking-widest uppercase transition-colors ${cuts >= 3 ? 'text-stone-300' : 'text-stone-400 hover:text-stone-600 cursor-pointer'}`}
            >
              {cuts >= 3 ? 'Slicing...' : 'Cut the Cake'}
            </button>
          </motion.div>
        )}

        {/* GIFT PHASE */}
        {phase === 'gift' && (
          <motion.div
            key="gift"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="mb-16 text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif text-stone-800">A special gift for you</h2>
              <div className="text-stone-500 text-sm">Tap to unwrap</div>
            </div>
            
            <motion.div 
              className="relative cursor-pointer group w-64 h-64 flex items-center justify-center"
              whileHover={!isOpening ? { scale: 1.05 } : {}}
              onClick={handleOpenGift}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                {/* Box Body */}
                <rect x="40" y="90" width="120" height="90" rx="6" fill="#292524" />
                {/* Vertical Ribbon */}
                <rect x="90" y="90" width="20" height="90" fill="#D4AF37" />
                {/* Horizontal Ribbon */}
                <rect x="40" y="125" width="120" height="20" fill="#D4AF37" />
                
                {/* Lid Group */}
                <motion.g 
                  animate={isOpening ? { y: -60, x: 10, rotate: 15, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Lid */}
                  <rect x="35" y="70" width="130" height="25" rx="4" fill="#1c1917" />
                  {/* Lid Vertical Ribbon */}
                  <rect x="90" y="70" width="20" height="25" fill="#D4AF37" />
                  {/* Bow */}
                  <path d="M 100 70 C 60 20, 30 50, 95 75 Z" fill="#D4AF37" />
                  <path d="M 100 70 C 140 20, 170 50, 105 75 Z" fill="#D4AF37" />
                  <circle cx="100" cy="72" r="8" fill="#b4942d" />
                </motion.g>
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* CARD PHASE */}
        {phase === 'card' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-12 md:p-20 max-w-2xl w-full mx-4 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden"
          >
            {/* Decorative corner elements */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }} className="absolute top-0 left-0 w-16 h-16 border-t border-l border-stone-200 m-6"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }} className="absolute top-0 right-0 w-16 h-16 border-t border-r border-stone-200 m-6"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }} className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-stone-200 m-6"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }} className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-stone-200 m-6"></motion.div>

            <div className="text-center space-y-8 relative z-10">
              <div className="flex justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100"
                >
                  <span className="text-2xl">🏸</span>
                </motion.div>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs font-medium tracking-[0.3em] text-stone-400 uppercase">A Special Wish For</p>
                <h1 className="text-5xl md:text-6xl font-serif text-stone-800">Virti</h1>
              </div>
              
              <div className="w-12 h-[1px] bg-stone-200 mx-auto"></div>
              
              <div className="space-y-6 text-lg text-stone-500 font-light leading-relaxed max-w-lg mx-auto">
                <p>
                  <TypingEffect text="Happy 18th Birthday to the most elegant and fierce badminton player." delay={1.2} />
                </p>
                <p>
                  <TypingEffect text="May your year ahead be filled with perfect smashes, incredible saves, and endless victories both on and off the court. Keep shining with every step you take." delay={2.5} />
                </p>
              </div>

              <div className="pt-8 flex flex-col items-center">
                <div className="relative cursor-pointer" onClick={handleGiftClick}>
                  <motion.div
                    animate={{ 
                      y: [0, -6, 0],
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{
                        color: ["#d6d3d1", "#D4AF37", "#d6d3d1"],
                        filter: [
                          "drop-shadow(0px 0px 0px rgba(212, 175, 55, 0))",
                          "drop-shadow(0px 4px 12px rgba(212, 175, 55, 0.5))",
                          "drop-shadow(0px 0px 0px rgba(212, 175, 55, 0))"
                        ]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Gift className="w-6 h-6 mb-4 hover:scale-110 transition-transform" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                  <AnimatePresence>
                    {shuttlecocks.map(id => (
                      <FlyingShuttlecock key={id} id={id} onComplete={removeShuttlecock} />
                    ))}
                  </AnimatePresence>
                </div>
                <p className="text-sm text-stone-400 italic font-serif mb-2">With warmest wishes,</p>
                <p className="text-xl font-serif text-stone-800">Flexy</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
