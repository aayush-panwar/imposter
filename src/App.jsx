import React, { useState, useEffect } from 'react';
import { Users, Eye, EyeOff, Play, RotateCcw, UserPlus, X, HelpCircle, Trophy, Skull, Utensils, MapPin, Film, Flag, Globe, Briefcase, Smile, Ghost } from 'lucide-react';

// --- Game Data (Categories & Words) ---
const CATEGORIES = {
  'Indian Food': ['Biryani', 'Dosa', 'Samosa', 'Pani Puri', 'Vada Pav', 'Butter Chicken', 'Gulab Jamun', 'Idli', 'Chole Bhature', 'Pav Bhaji'],
  'Bollywood': ['Shah Rukh Khan', 'Amitabh Bachchan', 'Deepika Padukone', 'Salman Khan', 'Alia Bhatt', 'Aamir Khan', 'Priyanka Chopra', 'Ranveer Singh', 'Kareena Kapoor', 'Hrithik Roshan'],
  'Indian Cities': ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Jaipur', 'Kolkata', 'Chennai', 'Hyderabad', 'Varanasi', 'Agra'],
  'Indian Culture': ['Cricket', 'Diwali', 'Holi', 'Taj Mahal', 'Yoga', 'Auto Rickshaw', 'Local Train', 'Saree', 'Chai', 'Ganges'],
  'General': ['Bicycle', 'Camera', 'Piano', 'Telescope', 'Mirror', 'Clock', 'Umbrella', 'Wallet', 'Backpack', 'Pillow'],
  'Animals': ['Lion', 'Penguin', 'Giraffe', 'Elephant', 'Kangaroo', 'Dolphin', 'Panda', 'Tiger', 'Zebra', 'Rabbit'],
  'Jobs': ['Doctor', 'Teacher', 'Firefighter', 'Pilot', 'Chef', 'Artist', 'Astronaut', 'Detective', 'Farmer', 'Clown']
};

const CATEGORY_ICONS = {
  'Indian Food': <Utensils size={18} />,
  'Bollywood': <Film size={18} />,
  'Indian Cities': <MapPin size={18} />,
  'Indian Culture': <Flag size={18} />,
  'General': <Globe size={18} />,
  'Animals': <Ghost size={18} />, // playful icon for animals
  'Jobs': <Briefcase size={18} />
};

export default function ImposterGame() {
  // --- State ---
  const [phase, setPhase] = useState('setup'); // setup, assign, playing, vote, result
  const [players, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3']);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameData, setGameData] = useState(null); // { imposterIndex, category, word, firstPlayerIndex }
  const [assignIndex, setAssignIndex] = useState(0); // Who is currently looking at the phone?
  const [isRevealed, setIsRevealed] = useState(false); // Is the current player's role visible?
  const [timer, setTimer] = useState(300); // 5 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Random');

  // --- Helpers ---
  const addPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      setPlayers([...players, newPlayerName.trim()]);
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

    // Pick Category & Word
    let catKeys = Object.keys(CATEGORIES);
    let chosenCat = selectedCategory;

    if (selectedCategory === 'Random') {
      chosenCat = catKeys[Math.floor(Math.random() * catKeys.length)];
    }

    const words = CATEGORIES[chosenCat];
    const chosenWord = words[Math.floor(Math.random() * words.length)];

    // Pick Imposter
    const impIdx = Math.floor(Math.random() * players.length);

    // Pick Starting Player (First to speak)
    const startIdx = Math.floor(Math.random() * players.length);

    setGameData({
      imposterIndex: impIdx,
      category: chosenCat,
      word: chosenWord,
      firstPlayerIndex: startIdx
    });

    setAssignIndex(0);
    setIsRevealed(false);
    setPhase('assign');
  };

  const nextAssignment = () => {
    setIsRevealed(false);
    if (assignIndex < players.length - 1) {
      setAssignIndex(assignIndex + 1);
    } else {
      setPhase('playing');
      setTimer(players.length * 60); // 1 min per player typically
      setTimerActive(true);
    }
  };

  const resetGame = () => {
    setPhase('setup');
    setGameData(null);
    setTimerActive(false);
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Renders ---

  // 1. SETUP SCREEN
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans p-6 flex flex-col max-w-md mx-auto relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <header className="mb-6 mt-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Skull className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">IMPOSTER</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Find the spy</p>
            </div>
          </div>
        </header>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto mb-6 relative z-10 pr-1">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Players ({players.length})
              </h2>
            </div>

            <ul className="space-y-2 mb-4">
              {players.map((player, idx) => (
                <li key={idx} className="group flex items-center justify-between bg-slate-700/40 p-3 rounded-xl border border-white/5 transition-all hover:bg-slate-700/60 hover:border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold border border-indigo-500/30">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-slate-200">{player}</span>
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
                className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                maxLength={12}
              />
              <button
                type="submit"
                disabled={!newPlayerName.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <UserPlus size={20} />
              </button>
            </form>
          </div>

          {/* Settings */}
          <div className="mt-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block px-1">Game Mode</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('Random')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${selectedCategory === 'Random'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 border-transparent text-white shadow-lg shadow-orange-900/20 ring-2 ring-orange-500/30 ring-offset-2 ring-offset-slate-900'
                    : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
              >
                <Smile size={16} /> Random
              </button>
              {Object.keys(CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${selectedCategory === cat
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
          className="w-full relative overflow-hidden group bg-white text-slate-900 text-lg font-bold py-4 rounded-2xl shadow-xl shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed z-10"
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
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center max-w-md mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10 text-center relative overflow-hidden min-h-[500px] flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${((assignIndex + 1) / players.length) * 100}%` }}></div>
          </div>

          <div className="mt-4 mb-8">
            <h2 className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold mb-2">Confidential File #{assignIndex + 1}</h2>
            <div className="inline-block px-4 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium">
              Target: {currentPlayer}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {isRevealed ? (
              <div className="animate-in fade-in zoom-in duration-300 w-full">
                {isImposter ? (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                      <Skull size={48} className="text-red-500" />
                    </div>
                    <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 mb-4 tracking-tight">IMPOSTER</h3>
                    <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl w-full">
                      <p className="text-red-200 text-sm font-medium">Your Mission</p>
                      <p className="text-slate-400 text-xs mt-1">Blend in. The category is <strong className="text-slate-200">{gameData.category}</strong>.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                      <Trophy size={48} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">Secret Word</h3>
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 px-8 py-6 rounded-2xl w-full shadow-lg shadow-emerald-900/20">
                      <span className="text-4xl font-black text-emerald-400 tracking-wide break-words">{gameData.word}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-6">Don't reveal this to the Imposter.</p>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsRevealed(true)}
                className="group w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-slate-800/30 transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800 group-hover:bg-indigo-600 group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-xl">
                  <Eye size={32} className="text-slate-400 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-slate-300 font-bold text-lg group-hover:text-white transition-colors">Tap to Reveal Identity</span>
                  <span className="text-slate-500 text-xs">Ensure no one else is looking</span>
                </div>
              </button>
            )}
          </div>

          <div className="mt-8 h-14">
            {isRevealed && (
              <button
                onClick={nextAssignment}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 active:scale-95"
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
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col max-w-md mx-auto relative overflow-hidden">
        {/* Background pulses */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${timerActive ? 'opacity-100 animate-pulse' : 'opacity-20'}`}></div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Timer */}
          <div className="flex flex-col items-center justify-center mt-8 mb-12">
            <div
              onClick={() => setTimerActive(!timerActive)}
              className={`relative group cursor-pointer transition-all duration-300 ${timerActive ? 'scale-105' : 'scale-100 opacity-80'}`}
            >
              <div className={`text-7xl font-black tracking-tighter tabular-nums ${timer < 30 && timerActive ? 'text-red-500' : 'text-white'}`}>
                {formatTime(timer)}
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {timerActive ? 'Tap to Pause' : 'Tap to Start'}
              </div>
            </div>
          </div>

          {/* First Player Indicator */}
          <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/30 p-6 rounded-2xl mb-8 text-center shadow-xl shadow-indigo-900/10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-3">
              <UserPlus size={12} className="text-indigo-400" />
              <span className="text-indigo-300 text-[10px] uppercase tracking-bold font-bold">First Turn</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{players[gameData.firstPlayerIndex]}</p>
            <p className="text-slate-400 text-sm">Starts the discussion</p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-slate-500 text-xs uppercase tracking-widest">Category</p>
              <p className="text-indigo-300 font-medium">{gameData.category}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto gap-4 flex flex-col">
            <div className="grid grid-cols-2 gap-3 mb-2">
              {players.map((p, i) => (
                <div key={i} className="bg-slate-800/50 border border-white/5 rounded-lg p-2 text-center text-sm text-slate-400">
                  {p}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase('result')}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Eye size={20} />
              Vote & Reveal
            </button>

            <button
              onClick={resetGame}
              className="w-full bg-transparent hover:bg-slate-800 text-slate-500 hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
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
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none"></div>
        </div>

        <div className="relative z-10 w-full animate-in zoom-in duration-500">
          <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-bold mb-6">Mission Report</p>

          <div className="relative mb-12">
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl relative">
              <p className="text-slate-400 text-sm mb-2">The Imposter was</p>
              <p className="text-4xl font-black text-white tracking-tight">{players[gameData.imposterIndex]}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur p-6 rounded-2xl w-full border border-white/5 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy size={16} className="text-emerald-500" />
              <p className="text-emerald-500 text-xs uppercase tracking-widest font-bold">Real Identity</p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{gameData.word}</p>
            <p className="text-slate-500 text-sm">{gameData.category}</p>
          </div>
        </div>

        <div className="w-full mt-auto relative z-10">
          <button
            onClick={resetGame}
            className="w-full bg-white text-slate-900 text-lg font-bold py-4 rounded-xl shadow-xl shadow-white/10 hover:bg-slate-100 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
        </div>
      </div>
    );
  }
}
