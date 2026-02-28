import { useState, useEffect, FormEvent } from "react";
import { Letter } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Check, Trash2, Loader2, Lock, Unlock, Users, FileText, CheckCircle } from "lucide-react";

interface Stats {
  uniqueVisitors: number;
  pendingLetters: number;
  approvedLetters: number;
}

export default function Admin() {
  const [pendingLetters, setPendingLetters] = useState<Letter[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, statsRes] = await Promise.all([
        fetch("/api/admin/pending"),
        fetch("/api/admin/stats")
      ]);
      
      if (!pendingRes.ok || !statsRes.ok) throw new Error("Failed to fetch data");
      
      const [pendingData, statsData] = await Promise.all([
        pendingRes.json(),
        statsRes.json()
      ]);
      
      setPendingLetters(pendingData);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthorized(true);
      setError(null);
    } else {
      setError("Incorrect password.");
    }
  };

  const approveLetter = async (letter: Letter) => {
    try {
      const response = await fetch(`/api/admin/approve/${letter.id}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve");
      
      setPendingLetters(prev => prev.filter(l => l.id !== letter.id));
      // Refresh stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error approving letter:", err);
    }
  };

  const deleteLetter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this letter?")) return;
    try {
      const response = await fetch(`/api/admin/pending/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      
      setPendingLetters(prev => prev.filter(l => l.id !== id));
      // Refresh stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error deleting letter:", err);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h1 className="text-2xl font-serif mb-6 dark:text-slate-100">Moderator Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-6 py-3 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-400 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all text-center dark:text-slate-200"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-slate-800 dark:bg-blue-600 text-white rounded-full font-medium hover:bg-slate-900 dark:hover:bg-blue-700 transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
          <p className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Demo password: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-serif dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of platform activity and moderation.</p>
        </div>
        <button 
          onClick={() => setIsAuthorized(false)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-widest"
        >
          <Unlock className="w-4 h-4" />
          Lock Dashboard
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unique Visitors</p>
              <p className="text-2xl font-serif dark:text-slate-100">{stats.uniqueVisitors}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Letters</p>
              <p className="text-2xl font-serif dark:text-slate-100">{stats.pendingLetters}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Letters</p>
              <p className="text-2xl font-serif dark:text-slate-100">{stats.approvedLetters}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-serif dark:text-slate-100 mb-2">Moderation Queue</h2>
        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : pendingLetters.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 font-serif italic">No pending letters to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {pendingLetters.map((letter) => (
              <motion.div
                key={letter.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
              >
                <div className="flex-1 mb-6">
                  <p className="text-slate-700 dark:text-slate-200 font-serif italic leading-relaxed">
                    "{letter.letterText}"
                  </p>
                  <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                    By: {letter.nickname}
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <button
                    onClick={() => approveLetter(letter)}
                    className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => deleteLetter(letter.id)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
