import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Write() {
  const [letterText, setLetterText] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!letterText.trim()) {
      setError("Please write something supportive.");
      return;
    }
    
    if (!agreed) {
      setError("Please acknowledge that this is not a replacement for professional help.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/letters/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterText: letterText.trim(),
          nickname: nickname.trim() || "Anonymous",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to submit");
      }
      
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting letter:", err);
      setError(`Something went wrong: ${(err as Error).message}. Please try again later.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        
        <h2 className="text-3xl font-serif mb-4 dark:text-slate-100">Thank you for your kindness.</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Your letter has been submitted for review. Once approved, it will be shared with someone who needs it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/read" className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
            Read other letters
          </Link>
          <button 
            onClick={() => {
              setSubmitted(false);
              setLetterText("");
              setNickname("");
              setAgreed(false);
            }}
            className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-full font-medium hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-4 dark:text-slate-100">Write a Letter of Hope</h1>
        <p className="text-slate-500 dark:text-slate-400">Your words could be exactly what someone needs to hear today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="letter" className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
            Your supportive message
          </label>
          <textarea
            id="letter"
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="Dear friend, I know things are hard right now, but..."
            className="w-full min-h-[250px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-400 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all resize-none text-lg leading-relaxed font-serif italic dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
              Nickname (Optional)
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. A fellow student"
              className="w-full px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-400 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all dark:text-slate-200"
            />
          </div>
          
          <div className="flex items-start gap-3 pt-8">
            <div className="relative flex items-center">
              <input
                id="agreed"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <label htmlFor="agreed" className="text-xs text-slate-500 dark:text-slate-400 leading-tight cursor-pointer">
              I understand this site does not replace professional help.
            </label>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Send className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit for Review
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-16 p-6 rounded-3xl bg-soft-blue/30 dark:bg-blue-900/20 border border-soft-blue/50 dark:border-blue-900/30 flex gap-4 items-start">
        <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Safety First</h4>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            All letters are manually reviewed before being published. Please avoid sharing personal contact information or medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
