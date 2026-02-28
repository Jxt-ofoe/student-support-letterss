import { Link } from "react-router-dom";
import { Heart, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full py-6 px-4 md:px-8 flex justify-between items-center max-w-5xl mx-auto">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-soft-blue dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
        </div>
        <span className="font-serif italic text-xl font-medium dark:text-slate-100">Supportive Letters</span>
      </Link>
      
      <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Link to="/read" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Read</Link>
        <Link to="/write" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Write</Link>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <Link to="/support" className="hidden md:block px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm">
          Need Help?
        </Link>
      </div>
    </nav>
  );
}
