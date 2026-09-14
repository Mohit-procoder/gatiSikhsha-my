import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, LayoutDashboard, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoleSelectorModal from '../auth/RoleSelectorModal';
import ihfcLogo from '../../assets/logos/ihfc-logo.svg';
import samagraLogo from '../../assets/logos/samagra-shiksha-assam.svg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Journey', path: '/journey' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'Prizes & Awards', path: '/prizes' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Innovations', path: '/innovations' },
  ];

  const getDashboardPath = () => {
    switch (role) {
      case 'admin':       return '/admin/dashboard';
      case 'school':      return '/school/dashboard';
      case 'mentor':      return '/mentor/dashboard';
      case 'evaluator':   return '/evaluator/dashboard';
      case 'district':    return '/district/dashboard';
      case 'jury':        return '/jury/dashboard';
      case 'state_jury':  return '/state-jury/dashboard';
      case 'student':     return '/student/dashboard';
      default:            return '/';
    }
  };


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-2.5 shadow-md shadow-emerald-950/5'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Dual Organization Logos */}
          <Link to="/" className="flex items-center gap-3 sm:gap-6 group">
            <img
              src={ihfcLogo}
              alt="Innovation hub for cobotics (IHFC)"
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="h-6 sm:h-8 w-px bg-slate-300/80" />
            <img
              src={samagraLogo}
              alt="ASOM, Assam"
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50/80 font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action (Login / Dashboard) */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-200">
                    {role}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRoleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200/90 border border-emerald-300/60 shadow-xs transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4 text-emerald-700" />
                <span>Portal Login</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="p-2 text-emerald-800 bg-emerald-50 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-nav border-t border-slate-200/80 px-4 pt-3 pb-6 shadow-xl"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                        isActive
                          ? 'text-emerald-800 bg-emerald-50 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                })}

                <div className="pt-3 mt-2 border-t border-slate-200">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate(getDashboardPath());
                        }}
                        className="flex-1 mr-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Go to Dashboard ({role})</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setRoleModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-semibold shadow-md"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Portal</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Role Selection Modal */}
      <RoleSelectorModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
