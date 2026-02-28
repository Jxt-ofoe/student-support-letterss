import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-4 mt-auto border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            Founded by a student of the University of Ghana. Independent student initiative.
          </p>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Student Support Letters. All rights reserved.
          </p>
        </div>
        
        <div className="flex gap-6 text-xs font-medium text-slate-500">
          <Link to="/about" className="hover:text-slate-800 transition-colors">About</Link>
          <Link to="/support" className="hover:text-slate-800 transition-colors">Support Resources</Link>
          <Link to="/admin" className="opacity-0 hover:opacity-100 transition-opacity">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
