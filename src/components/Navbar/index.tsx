// Header.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/context/IsMobileContext";
import { useScroll } from "@/context/ScrollContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "../ThemeToggle";
import { useTheme } from "next-themes";
import { User, LogOut, UserCircle, History, Menu, X } from 'lucide-react';

const Header = () => {
  const { isMobile } = useIsMobile();
  const { isTop } = useScroll();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { logout, user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Theme-based styling
  const isDark = theme === "dark";

  // Colors based on theme
  const headerBgColor = isDark
    ? "rgba(15, 23, 42, 0.95)"
    : "rgba(255, 255, 255, 0.98)";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const hoverColor = isDark ? "hover:text-cyan-400" : "hover:text-blue-600";
  const borderColor = isDark ? "border-white/20" : "border-gray-200";
  const mobileMenuBg = isDark ? "bg-slate-900" : "bg-white";
  const buttonBg = isDark
    ? "bg-gradient-to-r from-cyan-500 to-blue-600"
    : "bg-gradient-to-r from-blue-500 to-purple-600";
  const buttonText = "text-white";
  const underlineColor = isDark ? "after:bg-cyan-400" : "after:bg-blue-600";
  const dropdownBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const dropdownItemHover = isDark ? "hover:bg-slate-700" : "hover:bg-gray-100";

  useEffect(() => {
    const handleScrollDirection = () => {
      const currentScroll = window.scrollY;

      if (!isMenuOpen) {
        if (currentScroll > lastScrollY && currentScroll > 100) {
          setShowNav(false);
        } else {
          setShowNav(true);
        }
      }
      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScrollDirection);
    return () => window.removeEventListener("scroll", handleScrollDirection);
  }, [lastScrollY, isMenuOpen]);

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleProfileClick = () => {
    setIsUserDropdownOpen(false);
    if (isMobile) {
      setIsMenuOpen(false);
    }
    window.location.href = '/pages/user/profile';
  };

  const handleHistoryClick = () => {
    setIsUserDropdownOpen(false);
    if (isMobile) {
      setIsMenuOpen(false);
    }
    window.location.href = '/pages/user/history';
  };

  // Get user's first letter or fallback
  const getUserInitial = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{
        y: showNav || isMenuOpen ? 0 : -100,
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 w-full z-50 ${
        isDark ? 'bg-slate-900/95' : 'bg-white/95'
      } backdrop-blur-lg border-b ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      } shadow-lg`}
      style={{
        height: isMobile ? '70px' : '80px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* Main Header Container */}
        <div className="flex items-center justify-between h-full">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl ${
                  isDark
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-600"
                } flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">I²</span>
              </div>
              <span className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} ${textColor}`}>
                I2EDC
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-8">
              <a
                href="/"
                className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
              >
                Home
              </a>
              <a
                href="/pages/about"
                className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
              >
                About
              </a>
              <a
                href="/pages/services"
                className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
              >
                Services
              </a>
              <a
                href="/pages/events"
                className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
              >
                Events
              </a>
              <a
                href="/pages/prototypes"
                className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
              >
                Prototypes
              </a>
              <a
                href="/pages/contact"
                className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
              >
                Contact
              </a>

              {(user?.is_superuser || user?.is_staff) && (
                <a
                  href="/pages/admin"
                  className={`relative font-semibold text-lg transition-colors duration-300 ${textColor} ${hoverColor} after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full px-3 py-2`}
                >
                  Admin
                </a>
              )}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* <ThemeToggle /> */}

            {!isMobile && (
              <>
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${
                        isDark
                          ? "bg-cyan-500 hover:bg-cyan-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white font-bold text-lg transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${
                        isDark ? "border-cyan-400" : "border-blue-400"
                      }`}
                    >
                      {getUserInitial()}
                    </button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border-2 ${dropdownBg} py-3 z-50`}
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-slate-600/20">
                            <p className="font-bold text-lg truncate">
                              {user?.first_name && user?.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user?.email || 'User'
                              }
                            </p>
                            <p className="text-sm text-slate-400 truncate">
                              {user?.email}
                            </p>
                          </div>

                          {/* Dropdown Items */}
                          <button
                            onClick={handleProfileClick}
                            className={`w-full flex items-center px-4 py-3 text-lg ${dropdownItemHover} transition-colors duration-200 border-b border-slate-600/10`}
                          >
                            <UserCircle className="w-5 h-5 mr-3" />
                            Profile
                          </button>

                          <button
                            onClick={handleHistoryClick}
                            className={`w-full flex items-center px-4 py-3 text-lg ${dropdownItemHover} transition-colors duration-200 border-b border-slate-600/10`}
                          >
                            <History className="w-5 h-5 mr-3" />
                            History
                          </button>

                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center px-4 py-3 text-lg ${
                              isDark ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-50"
                            } transition-colors duration-200`}
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    href="/auth?action=login"
                    className={`px-8 py-3 rounded-xl ${buttonBg} ${buttonText} font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${
                      isDark ? "border-cyan-400" : "border-blue-400"
                    }`}
                  >
                    Login
                  </a>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl ${
                  isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-gray-100 hover:bg-gray-200"
                } transition-colors duration-300 border ${
                  isDark ? "border-slate-600" : "border-gray-300"
                }`}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 w-4/5 max-w-sm h-full ${mobileMenuBg} shadow-2xl z-50 overflow-y-auto`}
            >
              <div className="p-6">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${
                        isDark
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                          : "bg-gradient-to-r from-blue-500 to-purple-600"
                      } flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-sm">I²</span>
                    </div>
                    <span className={`font-bold text-2xl ${textColor}`}>I2EDC</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-2 rounded-lg ${
                      isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* User Info if Authenticated */}
                {isAuthenticated && (
                  <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-full ${
                          isDark ? "bg-cyan-500" : "bg-blue-500"
                        } text-white font-bold text-xl`}
                      >
                        {getUserInitial()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate">
                          {user?.first_name && user?.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user?.email || 'User'
                          }
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-2 mb-8">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/pages/about", label: "About" },
                    { href: "/pages/services", label: "Services" },
                    { href: "/pages/events", label: "Events" },
                    { href: "/pages/prototypes", label: "Prototypes" },
                    { href: "/pages/contact", label: "Contact" },
                    ...((user?.is_superuser || user?.is_staff) ? [{ href: "/pages/admin", label: "Admin" }] : [])
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`block w-full text-left px-4 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        isDark 
                          ? "text-white hover:bg-slate-700 hover:text-cyan-400" 
                          : "text-gray-900 hover:bg-gray-100 hover:text-blue-600"
                      } border ${
                        isDark ? "border-slate-700" : "border-gray-200"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                {/* User Actions */}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <>
                      <a
                        href="/pages/user/profile"
                        onClick={handleLinkClick}
                        className={`flex items-center justify-center w-full px-4 py-4 rounded-xl font-bold text-lg border-2 ${
                          isDark
                            ? "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
                            : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        } transition-colors duration-300`}
                      >
                        <UserCircle className="w-5 h-5 mr-3" />
                        Profile
                      </a>
                      <a
                        href="/pages/user/history"
                        onClick={handleLinkClick}
                        className={`flex items-center justify-center w-full px-4 py-4 rounded-xl font-bold text-lg border-2 ${
                          isDark
                            ? "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
                            : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        } transition-colors duration-300`}
                      >
                        <History className="w-5 h-5 mr-3" />
                        History
                      </a>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center justify-center w-full px-4 py-4 rounded-xl font-bold text-lg border-2 ${
                          isDark
                            ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                            : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        } transition-colors duration-300`}
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <a
                      href="/auth?action=login"
                      onClick={handleLinkClick}
                      className={`block w-full text-center px-4 py-4 rounded-xl ${buttonBg} ${buttonText} font-bold text-lg transition-all duration-300 hover:shadow-lg border-2 ${
                        isDark ? "border-cyan-400" : "border-blue-400"
                      }`}
                    >
                      Login
                    </a>
                  )}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;