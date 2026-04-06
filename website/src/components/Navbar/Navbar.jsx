/* =========================================================
   Navbar.jsx — Sticky navigation bar.
   Transparent at top; glassmorphism when scrolled.
   Collapses to a hamburger menu on mobile.
   Includes a language toggle button (ES / EN).
   ========================================================= */

import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  /* Add glassmorphism background once the user scrolls past 20px */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  /* Toggle between Spanish and English, persisted in localStorage */
  const toggleLanguage = () => {
    const next = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(next);
  };

  /* Label shown on the toggle button — displays the OTHER available language */
  const langLabel = i18n.language.startsWith('es') ? 'EN' : 'ES';

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo / wordmark — brand name stays in English */}
        <a href="#hero" className={styles.logo} aria-label="Band Manager home">
          Band Manager
        </a>

        {/* Desktop navigation links */}
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#features"     className={styles.link}>{t('nav.features')}</a>
          <a href="#how-it-works" className={styles.link}>{t('nav.howItWorks')}</a>
          <a href="#download"     className={styles.link}>{t('nav.download')}</a>
        </nav>

        {/* Desktop right-side controls: language toggle + CTA */}
        <div className={styles.controls}>
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            aria-label={`Switch to ${langLabel}`}
          >
            {langLabel}
          </button>

          <a href="#download" className={styles.ctaButton}>
            {t('nav.downloadApk')}
          </a>
        </div>

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
          <a href="#features"     className={styles.mobileLink} onClick={closeMenu}>{t('nav.features')}</a>
          <a href="#how-it-works" className={styles.mobileLink} onClick={closeMenu}>{t('nav.howItWorks')}</a>
          <a href="#download"     className={styles.mobileLink} onClick={closeMenu}>{t('nav.download')}</a>
          <div className={styles.mobileBottom}>
            <button
              className={styles.mobileLangToggle}
              onClick={toggleLanguage}
              aria-label={`Switch to ${langLabel}`}
            >
              {langLabel}
            </button>
            <a href="#download" className={styles.mobileCta} onClick={closeMenu}>
              {t('nav.downloadApk')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
