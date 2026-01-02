import React, { useState, useEffect } from 'react';
import {
  Users, Eye, Play, RotateCcw, UserPlus, X,
  Trophy, Skull, Utensils, MapPin,
  Film, Flag, Globe, Briefcase, Smile, Ghost
} from 'lucide-react';

// --- Game Data ---
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
  'Indian Food': <Utensils size={16} />,
  'Bollywood': <Film size={16} />,
  'Indian Cities': <MapPin size={16} />,
  'Indian Culture': <Flag size={16} />,
  'General': <Globe size={16} />,
  'Animals': <Ghost size={16} />,
  'Jobs': <Briefcase size={16} />
};

export default function App() {
  const [phase, setPhase] = useState('setup');
  const [players, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3']);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [assignIndex, setAssignIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timer, setTimer] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Random');

  const addPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const startGame = () => {
    const cats = Object.keys(CATEGORIES);
    const category = selectedCategory === 'Random'
      ? cats[Math.floor(Math.random() * cats.length)]
      : selectedCategory;

    const word = CATEGORIES[category][Math.floor(Math.random() * CATEGORIES[category].length)];
    const imposterIndex = Math.floor(Math.random() * players.length);
    const firstPlayerIndex = Math.floor(Math.random() * players.length);

    setGameData({ category, word, imposterIndex, firstPlayerIndex });
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
      setTimer(players.length * 60);
      setTimerActive(true);
    }
  };

  const resetGame = () => {
    setPhase('setup');
    setGameData(null);
    setTimerActive(false);
  };

  useEffect(() => {
    if (!timerActive || timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timer]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ---------------- SETUP ---------------- */
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
        <h1 className="text-3xl font-black text-center mb-6">IMPOSTER</h1>

        <ul className="space-y-2 mb-4">
          {players.map((p, i) => (
            <li key={i} className="bg-slate-800 p-3 rounded flex justify-between">
              {p}
            </li>
          ))}
        </ul>

        <form onSubmit={addPlayer} className="flex gap-2 mb-4">
          <input
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            className="flex-1 p-2 rounded bg-slate-700"
            placeholder="Add player"
          />
          <button className="bg-indigo-600 px-4 rounded">
            <UserPlus size={16} />
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setSelectedCategory('Random')} className="bg-slate-700 px-3 py-1 rounded flex items-center gap-1">
            <Smile size={14} /> Random
          </button>
          {Object.keys(CATEGORIES).map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-slate-800 px-3 py-1 rounded flex items-center gap-1">
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        <button
          onClick={startGame}
          className="w-full bg-white text-black font-bold py-3 rounded"
        >
          Start Game
        </button>
      </div>
    );
  }

  /* ---------------- ASSIGN ---------------- */
  if (phase === 'assign') {
    const isImposter = assignIndex === gameData.imposterIndex;

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        {!isRevealed ? (
          <button onClick={() => setIsRevealed(true)}>
            <Eye size={64} />
          </button>
        ) : (
          <div className="text-center">
            {isImposter ? (
              <h1 className="text-red-500 text-4xl font-black">IMPOSTER</h1>
            ) : (
              <h1 className="text-green-400 text-4xl font-black">{gameData.word}</h1>
            )}
            <button onClick={nextAssignment} className="mt-6 bg-white text-black px-6 py-2 rounded">
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- PLAYING ---------------- */
  if (phase === 'playing') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-6xl font-black mb-6">{formatTime(timer)}</div>
        <button onClick={() => setPhase('result')} className="bg-red-600 px-6 py-3 rounded">
          Vote & Reveal
        </button>
      </div>
    );
  }

  /* ---------------- RESULT ---------------- */
  if (phase === 'result') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black mb-4">
          Imposter: {players[gameData.imposterIndex]}
        </h1>
        <p className="mb-6 text-xl">
          Word: {gameData.word}
        </p>
        <button onClick={resetGame} className="bg-white text-black px-6 py-3 rounded flex items-center gap-2">
          <RotateCcw size={16} /> Play Again
        </button>
      </div>
    );
  }
}
