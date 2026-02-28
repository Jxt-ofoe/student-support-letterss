import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { Letter } from "../types";

interface LetterCardProps {
  letter: Letter;
}

export default function LetterCard({ letter }: LetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-soft-blue via-soft-lavender to-soft-blue dark:from-blue-900 dark:via-purple-900 dark:to-blue-900 opacity-50" />
      
      <Quote className="w-10 h-10 text-soft-blue dark:text-blue-900 mb-6 opacity-50" />
      
      <div className="space-y-6">
        <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-200 font-serif italic">
          "{letter.letterText}"
        </p>
        
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
            From: {letter.nickname || "Someone who understands"}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600 font-bold">
            Supportive Letter
          </span>
        </div>
      </div>
    </motion.div>
  );
}
