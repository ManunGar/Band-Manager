/* =========================================================
   Hero.jsx — Full-viewport opening section.
   Left: headline text + CTA buttons.
   Right: decorative card with the app logo.
   ========================================================= */

import { useTranslation } from 'react-i18next';
import { FaAndroid } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import logoImg from '../../assets/logo.png';
import styles from './Hero.module.css';

function Hero() {
  const { t } = useTranslation();

  return (
    <section id="hero" className={styles.hero}>

      {/* Background radial gradient blob — decorative */}
      <div className={styles.blob} aria-hidden="true" />

      {/* Floating ring accents — decorative */}
      <div className={styles.ringOuter} aria-hidden="true" />
      <div className={styles.ringInner} aria-hidden="true" />

      <div className={styles.content}>

        {/* Left — text block */}
        <div className={styles.textBlock}>
          <p className={styles.tagline}>{t('hero.tagline')}</p>

          {/* Brand name stays in English as it is a proper name */}
          <h1 className={styles.title}>Band<br />Manager</h1>

          <p className={styles.description}>{t('hero.description')}</p>

          <div className={styles.actions}>
            {/* Primary: APK download */}
            <a
              href="#download"
              className={styles.primaryButton}
              aria-label={t('download.downloadAriaLabel')}
            >
              <FaAndroid size={20} />
              {t('hero.downloadButton')}
            </a>
          </div>
        </div>

        {/* Right — decorative card showing the app logo */}
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.visualCard}>
            {/* Subtle yellow glow behind the logo */}
            <div className={styles.logoGlow} />
            {/* App logo — CSS filter converts dark-blue to white for dark bg */}
            <img
              src={logoImg}
              alt="Band Manager logo"
              className={styles.logoImage}
            />
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <FiChevronDown size={24} />
      </div>
    </section>
  );
}

export default Hero;
