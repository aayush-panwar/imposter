import React, { useState, useEffect, useRef } from 'react';
import { Users, Eye, Play, RotateCcw, UserPlus, X, Trophy, Skull, Utensils, MapPin, Film, Flag, Globe, Briefcase, Smile, Ghost, Home, Award } from 'lucide-react';
import { playReveal, playTick, playVictory, playWarningTick, vibrate } from './sounds';
import { createConfetti } from './confetti';

// --- Game Data (Categories & Words) ---
const CATEGORIES = {
  'Indian Food': ['Biryani', 'Dosa', 'Samosa', 'Pani Puri', 'Vada Pav', 'Butter Chicken', 'Gulab Jamun', 'Idli', 'Chole Bhature', 'Pav Bhaji'],
  'Bollywood': ['Shah Rukh Khan', 'Amitabh Bachchan', 'Deepika Padukone', 'Salman Khan', 'Alia Bhatt', 'Aamir Khan', 'Priyanka Chopra', 'Ranveer Singh', 'Kareena Kapoor', 'Hrithik Roshan'],
  'Indian Cities': ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Jaipur', 'Kolkata', 'Chennai', 'Hyderabad', 'Varanasi', 'Agra'],
  'Indian Culture': ['Cricket', 'Diwali', 'Holi', 'Taj Mahal', 'Yoga', 'Auto Rickshaw', 'Local Train', 'Saree', 'Chai', 'Ganges'],
  'General': ['Bicycle', 'Camera', 'Piano', 'Telescope', 'Mirror', 'Clock', 'Umbrella', 'Wallet', 'Backpack', 'Pillow'],
  'Animals': ['Lion', 'Penguin', 'Giraffe', 'Elephant', 'Kangaroo', 'Dolphin', 'Panda', 'Tiger', 'Zebra', 'Rabbit'],
  'Jobs': ['Doctor', 'Teacher', 'Firefighter', 'Pilot', 'Chef', 'Artist', 'Astronaut', 'Detective', 'Farmer', 'Clown'],
  'Household': ['Jhadu', 'Pocha', 'Bartan', 'Cooker', 'Chimta', 'Belan', 'Chakla', 'Kadhai', 'Tawa', 'Laddle']
};

const CATEGORY_ICONS = {
  'Indian Food': <Utensils size={18} />,
  'Bollywood': <Film size={18} />,
  'Indian Cities': <MapPin size={18} />,
  'Indian Culture': <Flag size={18} />,
  'General': <Globe size={18} />,
  'Animals': <Ghost size={18} />,
  'Jobs': <Briefcase size={18} />,
  'Household': <Home size={18} />
};

// Avatar colors based on name hash
const AVATAR_COLORS = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-red-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-blue-500'
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function ImposterGame() {
  // --- State ---
  const [phase, setPhase] = useState('setup');
  const [players, setPlayers] = useState(['Panwar', 'Dakshita', 'Radhe']);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [assignIndex, setAssignIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timer, setTimer] = useState(1200); // 20 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Random');
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('imposterScores');
    return saved ? JSON.parse(saved) : {};
  });
  const [transitioning, setTransitioning] = useState(false);

  const resultRef = useRef(null);

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem('imposterScores', JSON.stringify(scores));
  }, [scores]);

  // --- Helpers ---
  const addPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      const name = newPlayerName.trim();
      setPlayers([...players, name]);
      if (!scores[name]) {
        setScores(prev => ({ ...prev, [name]: { crew: 0, imposter: 0 } }));
      }
      setNewPlayerName('');
    }
  };

  const removePlayer = (index) => {
    if (players.length > 3) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
    }
  };

  const startGame = () => {
    if (players.length < 3) return;

    // Initialize scores for new players
    players.forEach(p => {
      if (!scores[p]) {
        setScores(prev => ({ ...prev, [p]: { crew: 0, imposter: 0 } }));
      }
    });

    let catKeys = Object.keys(CATEGORIES);
    let chosenCat = selectedCategory;

    if (selectedCategory === 'Random') {
      chosenCat = catKeys[Math.floor(Math.random() * catKeys.length)];
    }

    const words = CATEGORIES[chosenCat];
    const chosenWord = words[Math.floor(Math.random() * words.length)];
    const impIdx = Math.floor(Math.random() * players.length);
    const startIdx = Math.floor(Math.random() * players.length);

    setGameData({
      imposterIndex: impIdx,
      category: chosenCat,
      word: chosenWord,
      firstPlayerIndex: startIdx
    });

    setAssignIndex(0);
    setIsRevealed(false);
    setTransitioning(true);
    setTimeout(() => {
      setPhase('assign');
      setTransitioning(false);
    }, 300);
  };

  const handleReveal = () => {
    setIsRevealed(true);
    playReveal();
    vibrate(100);
  };

  const nextAssignment = () => {
    setIsRevealed(false);
    vibrate(50);
    if (assignIndex < players.length - 1) {
      setAssignIndex(assignIndex + 1);
    } else {
      setTransitioning(true);
      setTimeout(() => {
        setPhase('playing');
        setTimer(1200); // 20 minutes
        setTimerActive(true);
        setTransitioning(false);
      }, 300);
    }
  };

  const showResult = (crewWon = true) => {
    vibrate([100, 50, 100]);
    setTimerActive(false);

    // Update scores
    const imposterName = players[gameData.imposterIndex];
    const newScores = { ...scores };

    players.forEach((p, i) => {
      if (!newScores[p]) newScores[p] = { crew: 0, imposter: 0 };
      if (i === gameData.imposterIndex) {
        if (!crewWon) newScores[p].imposter += 1;
      } else {
        if (crewWon) newScores[p].crew += 1;
      }
    });

    setScores(newScores);
    setTransitioning(true);

    setTimeout(() => {
      setPhase('result');
      setTransitioning(false);
      if (crewWon) {
        playVictory();
      }
      setTimeout(() => {
        if (resultRef.current) {
          createConfetti(resultRef.current);
        }
      }, 100);
    }, 300);
  };

  const resetGame = () => {
    setTransitioning(true);
    setTimeout(() => {
      setPhase('setup');
      setGameData(null);
      setTimerActive(false);
      setTransitioning(false);
    }, 300);
  };

  const clearScores = () => {
    setScores({});
    localStorage.removeItem('imposterScores');
  };

  // --- Timer Logic with Sound ---
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 11 && t > 1) {
            playWarningTick();
            vibrate(30);
          }
          return t - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Get total score for a player
  const getTotalScore = (name) => {
    return scores[name] ? scores[name].crew + scores[name].imposter : 0;
  };

  // --- Renders ---

  // 1. SETUP SCREEN
  if (phase === 'setup') {
    return (
      <div className={`h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans p-4 flex flex-col max-w-md mx-auto relative overflow-hidden transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Background decorative blobs */}
        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <header className="mb-3 mt-2 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
              <Skull className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">IMPOSTER</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Find the spy</p>
            </div>
          </div>
        </header>

        {/* Player List with Scores */}
        <div className="flex-1 overflow-hidden mb-3 relative z-10 pr-1 min-h-0">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Players ({players.length})
              </h2>
              {Object.keys(scores).length > 0 && (
                <button onClick={clearScores} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                  Reset Scores
                </button>
              )}
            </div>

            <ul className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
              {players.map((player, idx) => (
                <li key={idx} className="group flex items-center justify-between bg-slate-700/40 p-2 rounded-xl border border-white/5 transition-all hover:bg-slate-700/60 hover:border-white/20 hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(player)} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                      {player.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-200 text-sm">{player}</span>
                    {scores[player] && getTotalScore(player) > 0 && (
                      <div className="flex items-center gap-1 bg-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Award size={10} className="text-amber-400" />
                        <span className="text-[10px] text-amber-300 font-bold">{getTotalScore(player)}</span>
                      </div>
                    )}
                  </div>
                  {players.length > 3 && (
                    <button
                      onClick={() => removePlayer(idx)}
                      className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <form onSubmit={addPlayer} className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Add new player..."
                className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                maxLength={12}
              />
              <button
                type="submit"
                disabled={!newPlayerName.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <UserPlus size={20} />
              </button>
            </form>
          </div>

          {/* Settings */}
          <div className="mt-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Game Mode</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('Random')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 hover:scale-105 ${selectedCategory === 'Random'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 border-transparent text-white shadow-lg shadow-orange-900/20 ring-2 ring-orange-500/30 ring-offset-2 ring-offset-slate-900'
                  : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
              >
                <Smile size={14} /> Random
              </button>
              {Object.keys(CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 hover:scale-105 ${selectedCategory === cat
                    ? 'bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-900/20 ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-slate-900'
                    : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={players.length < 3}
          className="w-full relative overflow-hidden group bg-white text-slate-900 text-base font-bold py-3 rounded-2xl shadow-xl shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed z-10 flex-shrink-0 hover:shadow-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative flex items-center justify-center gap-2">
            Start Mission <Play size={20} fill="currentColor" />
          </span>
        </button>
        {players.length < 3 && (
          <p className="text-center text-red-400 text-xs mt-3 opacity-60">Need at least 3 agents to start.</p>
        )}
      </div>
    );
  }

  // 2. ASSIGNMENT SCREEN (Pass and Play)
  if (phase === 'assign') {
    const currentPlayer = players[assignIndex];
    const isImposter = assignIndex === gameData.imposterIndex;

    return (
      <div className={`h-screen bg-slate-950 text-slate-100 p-4 flex flex-col justify-center max-w-md mx-auto overflow-hidden transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/10 text-center relative overflow-hidden flex-1 flex flex-col max-h-[90vh]">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${((assignIndex + 1) / players.length) * 100}%` }}></div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-4 mb-2">
            {players.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i < assignIndex ? 'bg-indigo-500' :
                  i === assignIndex ? 'bg-white scale-150' :
                    'bg-slate-700'
                  }`}
              />
            ))}
          </div>

          <div className="mt-2 mb-4">
            <h2 className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold mb-1">Confidential File #{assignIndex + 1}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(currentPlayer)} flex items-center justify-center text-[10px] font-bold text-white`}>
                {currentPlayer.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 text-sm font-medium">{currentPlayer}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {isRevealed ? (
              <div className="animate-in fade-in zoom-in duration-300 w-full">
                {isImposter ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 animate-pulse">
                      <Skull size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 mb-3 tracking-tight animate-pulse">IMPOSTER</h3>
                    <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl w-full">
                      <p className="text-red-200 text-sm font-medium">Your Mission</p>
                      <p className="text-slate-400 text-xs mt-1">Blend in. The category is <strong className="text-slate-200">{gameData.category}</strong>.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <Trophy size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Secret Word</h3>
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 px-6 py-4 rounded-xl w-full shadow-lg shadow-emerald-900/20">
                      <span className="text-3xl font-black text-emerald-400 tracking-wide break-words">{gameData.word}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-4">Don't reveal this to the Imposter.</p>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleReveal}
                className="group w-full h-48 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-slate-800/30 transition-all cursor-pointer active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-indigo-600 group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-xl">
                  <Eye size={28} className="text-slate-400 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-slate-300 font-bold text-lg group-hover:text-white transition-colors">Tap to Reveal Identity</span>
                  <span className="text-slate-500 text-xs">Ensure no one else is looking</span>
                </div>
              </button>
            )}
          </div>

          <div className="mt-4 h-12 flex-shrink-0">
            {isRevealed && (
              <button
                onClick={nextAssignment}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all shadow-lg shadow-white/5 active:scale-95"
              >
                {assignIndex < players.length - 1 ? 'Hide & Pass Device' : 'Start Mission Clock'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. PLAYING SCREEN
  if (phase === 'playing') {
    const isWarning = timer <= 30;

    return (
      <div className={`h-screen bg-slate-950 text-slate-100 p-4 flex flex-col max-w-md mx-auto relative overflow-hidden transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Background pulses */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${isWarning ? 'bg-red-600/20 animate-pulse' : timerActive ? 'bg-indigo-600/10 opacity-100 animate-pulse' : 'bg-indigo-600/10 opacity-20'
          }`}></div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Timer */}
          <div className="flex flex-col items-center justify-center mt-4 mb-6">
            <div
              onClick={() => setTimerActive(!timerActive)}
              className={`relative group cursor-pointer transition-all duration-300 ${timerActive ? 'scale-105' : 'scale-100 opacity-80'}`}
            >
              <div className={`text-6xl font-black tracking-tighter tabular-nums transition-colors ${isWarning && timerActive ? 'text-red-500 animate-pulse' : 'text-white'
                }`}>
                {formatTime(timer)}
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {timerActive ? 'Tap to Pause' : 'Tap to Start'}
              </div>
            </div>
          </div>

          {/* First Player Indicator */}
          <div className={`bg-slate-900/80 backdrop-blur border p-4 rounded-2xl mb-4 text-center shadow-xl transition-colors ${isWarning ? 'border-red-500/30 shadow-red-900/10' : 'border-indigo-500/30 shadow-indigo-900/10'
            }`}>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-3">
              <UserPlus size={12} className="text-indigo-400" />
              <span className="text-indigo-300 text-[10px] uppercase tracking-bold font-bold">First Turn</span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{players[gameData.firstPlayerIndex]}</p>
            <p className="text-slate-400 text-xs">Starts the discussion</p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-slate-500 text-xs uppercase tracking-widest">Category</p>
              <p className="text-indigo-300 font-medium">{gameData.category}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto gap-3 flex flex-col">
            <div className="grid grid-cols-2 gap-2 mb-2 max-h-24 overflow-y-auto">
              {players.map((p, i) => (
                <div key={i} className={`bg-slate-800/50 border border-white/5 rounded-lg p-1.5 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 hover:bg-slate-700/50 transition-colors`}>
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getAvatarColor(p)} flex items-center justify-center text-[8px] font-bold text-white`}>
                    {p.charAt(0).toUpperCase()}
                  </div>
                  {p}
                </div>
              ))}
            </div>

            <button
              onClick={() => showResult(true)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-base font-bold py-3 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Eye size={20} />
              Vote & Reveal
            </button>

            <button
              onClick={resetGame}
              className="w-full bg-transparent hover:bg-slate-800 text-slate-500 hover:text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <X size={18} />
              Abort Mission
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. RESULT SCREEN
  if (phase === 'result') {
    return (
      <div ref={resultRef} className={`h-screen bg-slate-950 text-slate-100 p-4 flex flex-col items-center justify-center max-w-md mx-auto text-center relative overflow-hidden transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none"></div>
        </div>

        <div className="relative z-10 w-full animate-in zoom-in duration-500">
          <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-bold mb-6">Mission Report</p>

          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 p-6 rounded-2xl shadow-2xl relative">
              <p className="text-slate-400 text-sm mb-2">The Imposter was</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(players[gameData.imposterIndex])} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                  {players[gameData.imposterIndex].charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">{players[gameData.imposterIndex]}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur p-4 rounded-2xl w-full border border-white/5 mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy size={14} className="text-emerald-500" />
              <p className="text-emerald-500 text-xs uppercase tracking-widest font-bold">Real Identity</p>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{gameData.word}</p>
            <p className="text-slate-500 text-xs">{gameData.category}</p>
          </div>

          {/* Scoreboard */}
          <div className="bg-slate-900/50 backdrop-blur p-3 rounded-xl w-full border border-white/5 mb-4">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2">Leaderboard</p>
            <div className="grid grid-cols-3 gap-1">
              {players
                .sort((a, b) => getTotalScore(b) - getTotalScore(a))
                .slice(0, 3)
                .map((p, i) => (
                  <div key={p} className={`flex flex-col items-center p-2 rounded-lg ${i === 0 ? 'bg-amber-500/10' : 'bg-slate-800/30'}`}>
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(p)} flex items-center justify-center text-[10px] font-bold text-white mb-1`}>
                      {p.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">{p}</span>
                    <span className={`text-xs font-bold ${i === 0 ? 'text-amber-400' : 'text-slate-300'}`}>{getTotalScore(p)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="w-full mt-auto relative z-10">
          <button
            onClick={resetGame}
            className="w-full bg-white text-slate-900 text-base font-bold py-3 rounded-xl shadow-xl shadow-white/10 hover:bg-slate-100 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
        </div>
      </div>
    );
  }
}
