import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 text-center pt-32 pb-20">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="text-3xl font-black text-rose-900">403 Forbidden</div>
          <h1 className="text-xl font-bold text-slate-900 mt-2">Access Restricted</h1>
          <p className="text-sm text-slate-500 mt-2">
            You do not possess the required security authorization to view this resource. Please sign in with appropriate role credentials.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Homepage</span>
            </Link>
            <Link
              to="/login/school"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow hover:bg-emerald-900 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Sign In</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forbidden;
