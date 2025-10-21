// Header.tsx - Enhanced with shadcn/ui and cleaner code
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/context/IsMobileContext";
import { useScroll } from "@/context/ScrollContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "../ThemeToggle";
import { useTheme } from "next-themes";
import { User, LogOut, UserCircle, History, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContent } from "@/context/ContentContext";
const Header = () => {
  const { isMobile } = useIsMobile();
  const { content, loading, error } = useContent();
  const { isTop } = useScroll();
  const { logout, user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // State management
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // ===== SCROLL BEHAVIOR =====
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

  // ===== MOBILE MENU MANAGEMENT =====
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

  // ===== DROPDOWN OUTSIDE CLICK =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  // ===== EVENT HANDLERS =====
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
    handleLinkClick();
    window.location.href = '/pages/user/profile';
  };

  const handleHistoryClick = () => {
    setIsUserDropdownOpen(false);
    handleLinkClick();
    window.location.href = '/pages/user/history';
  };

  // ===== USER UTILITIES =====
  const getUserInitial = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email || 'User';
  };

  // ===== NAVIGATION CONFIG =====
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pages/about", label: "About" },
    { href: "/pages/services", label: "Services" },
    { href: "/pages/events", label: "Events" },
    { href: "/pages/prototypes", label: "Prototypes" },
    { href: "/pages/contact", label: "Contact" },
  ];

  const adminLinks = (user?.is_superuser || user?.is_staff) 
    ? [{ href: "/pages/admin", label: "Admin" }] 
    : [];

  const allLinks = [...navLinks, ...adminLinks];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: showNav || isMenuOpen ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
      style={{ height: isMobile ? '70px' : '80px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* Main Header Container */}
        <div className="flex items-center justify-between h-full">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3 group">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              ) : (
                <img src={content.hero.i2edc_logo} alt="logo" className="w-12 h-12 rounded-lg" />
              )}
              <span className="font-bold text-3xl text-foreground">
                I2EDC
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-8">
              {allLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative font-semibold text-lg transition-colors duration-300 text-foreground hover:text-primary after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 after:bg-primary after:transition-all after:duration-300 hover:after:w-full px-3 py-2"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {!isMobile && (
              <>
                {isAuthenticated ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg cursor-pointer border-2 border-primary/50"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitial()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border bg-card text-card-foreground py-3 z-50"
                        >
                          {/* User Info */}
                          <CardHeader className="pb-3">
                            <p className="font-bold text-lg truncate text-foreground">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {user?.email}
                            </p>
                          </CardHeader>

                          <Separator />

                          {/* Dropdown Items */}
                          <CardContent className="p-0">
                            <Button
                              variant="ghost"
                              onClick={handleProfileClick}
                              className="w-full justify-start px-4 py-3 text-lg hover:bg-accent transition-colors duration-200 rounded-none"
                            >
                              <UserCircle className="w-5 h-5 mr-3" />
                              Profile
                            </Button>

                            <Button
                              variant="ghost"
                              onClick={handleHistoryClick}
                              className="w-full justify-start px-4 py-3 text-lg hover:bg-accent transition-colors duration-200 rounded-none"
                            >
                              <History className="w-5 h-5 mr-3" />
                              History
                            </Button>

                            <Separator />

                            <Button
                              variant="ghost"
                              onClick={handleLogout}
                              className="w-full justify-start px-4 py-3 text-lg text-destructive hover:bg-destructive/10 transition-colors duration-200 rounded-none"
                            >
                              <LogOut className="w-5 h-5 mr-3" />
                              Logout
                            </Button>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Button asChild size="lg" className="px-8 py-3 rounded-xl font-bold text-lg">
                    <a href="/auth?action=login">
                      Login
                    </a>
                  </Button>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 rounded-xl"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
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
              className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-background shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">I²</span>
                    </div>
                    <span className="font-bold text-2xl text-foreground">I2EDC</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* User Info if Authenticated */}
                {isAuthenticated && (
                  <Card className="mb-6 bg-accent/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {getUserInitial()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg truncate text-foreground">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Links */}
                <div className="space-y-2 mb-8">
                  {allLinks.map((item) => (
                    <Button
                      key={item.href}
                      variant="outline"
                      asChild
                      className="w-full justify-start px-4 py-4 rounded-xl font-bold text-lg h-auto"
                    >
                      <a href={item.href} onClick={handleLinkClick}>
                        {item.label}
                      </a>
                    </Button>
                  ))}
                </div>

                {/* User Actions */}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" asChild className="w-full py-4 rounded-xl font-bold text-lg">
                        <a href="/pages/user/profile" onClick={handleLinkClick}>
                          <UserCircle className="w-5 h-5 mr-3" />
                          Profile
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="w-full py-4 rounded-xl font-bold text-lg">
                        <a href="/pages/user/history" onClick={handleLinkClick}>
                          <History className="w-5 h-5 mr-3" />
                          History
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="w-full py-4 rounded-xl font-bold text-lg text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="lg" className="w-full py-4 rounded-xl font-bold text-lg">
                      <a href="/auth?action=login" onClick={handleLinkClick}>
                        Login
                      </a>
                    </Button>
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