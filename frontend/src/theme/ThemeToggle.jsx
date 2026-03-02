// src/components/ui/ThemeToggle.jsx
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../theme/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-emerald-600 hover:ring-2 ring-emerald-500/20 transition-all cursor-pointer"
    >
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeToggle;