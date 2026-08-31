import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/30">
        <GraduationCap className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404 — Page Not Found</h1>
      <p className="text-slate-400 max-w-md mb-6 text-sm">
        The requested page does not exist or has been moved within the EduPulse platform.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
