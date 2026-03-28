/* =========================================================
   Navbar.jsx — Sticky navigation bar.
   Transparent at top; glassmorphism when scrolled.
   Collapses to a hamburger menu on mobile.
   ========================================================= */

import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import styles from './Navbar.module.css';

function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  /* Add glassmorphism background once the user scrolls past 20px */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo / wordmark */}
        <a href="#hero" className={styles.logo} aria-label="Band Manager home">
          Band Manager
        </a>

        {/* Desktop navigation links */}
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#features"     className={styles.link}>Features</a>
          <a href="#how-it-works" className={styles.link}>How It Works</a>
          <a href="#download"     className={styles.link}>Download</a>
        </nav>

        {/* Desktop CTA button */}
        <a href="#download" className={styles.ctaButton}>
          Download APK
        </a>

        {/* Mobile hamburger toggle */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#features"     className={styles.mobileLink} onClick={closeMenu}>Features</a>
          <a href="#how-it-works" className={styles.mobileLink} onClick={closeMenu}>How It Works</a>
          <a href="#download"     className={styles.mobileLink} onClick={closeMenu}>Download</a>
          <a href="#download"     className={styles.mobileCta}  onClick={closeMenu}>Download APK</a>
        </div>
      )}
    </header>
  );
}

export default Navbar;
