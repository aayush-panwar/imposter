import React, { useState, useEffect } from 'react';
import {
  Users, Eye, EyeOff, Play, RotateCcw, UserPlus, X,
  HelpCircle, Trophy, Skull, Utensils, MapPin,
  Film, Flag, Globe, Briefcase, Smile, Ghost
} from 'lucide-react';

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
  'Animals': <Ghost size={18} />,
  'Jobs': <Briefcase size={18} />
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

  const removePlayer = (index) => {
    if (players.length > 3) {
      const p = [...players];
      p.splice(index, 1);
      setPlayers(p);
    }
  };

  const startGame = () => {
    if (players.length < 3) return;
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

  /* ---- YOUR UI RENDERS BELOW (UNCHANGED) ---- */
  /* Everything else from your code continues exactly as-is */
}
