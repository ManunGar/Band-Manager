/* =========================================================
   Hero.jsx — Full-viewport opening section.
   Left: headline text + CTA buttons.
   Right: abstract decorative element (CSS-only, no images).
   ========================================================= */

import { FaAndroid } from 'react-icons/fa';
import { FiArrowRight, FiChevronDown, FiGithub } from 'react-icons/fi';
import styles from './Hero.module.css';

function Hero() {
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
          <p className={styles.tagline}>Your Band. Your Musicians. Your Stage.</p>

          <h1 className={styles.title}>Band<br />Manager</h1>

          <p className={styles.description}>
            The all-in-one platform for managing your band, scheduling rehearsals
            and performances, and hiring the right musicians for every event.
          </p>

          <div className={styles.actions}>
            {/* Primary: APK download */}
            <a
              href="#download"
              className={styles.primaryButton}
              aria-label="Download Band Manager for Android"
            >
              <FaAndroid size={20} />
              Download for Android
            </a>

            {/* Secondary: GitHub repo */}
            <a
              href="https://github.com/ManunGar/Band-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryLink}
            >
              <FiGithub size={16} />
              View on GitHub
              <FiArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Right — abstract decorative card (CSS-only mock UI) */}
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.visualCard}>
            {/* Mock app header */}
            <div className={styles.mockHeader}>
              <div className={styles.mockDotRed}   />
              <div className={styles.mockDotYellow}/>
              <div className={styles.mockDotGreen} />
            </div>

            {/* Mock title bar */}
            <div className={styles.mockTitle} />

            {/* Mock content bars — simulating a list */}
            <div className={styles.mockRow}>
              <div className={styles.mockAvatar} />
              <div className={styles.mockLines}>
                <div className={styles.mockBarFull}  />
                <div className={styles.mockBarShort} />
              </div>
            </div>
            <div className={styles.mockRow}>
              <div className={styles.mockAvatar} />
              <div className={styles.mockLines}>
                <div className={styles.mockBarFull}  />
                <div className={styles.mockBarMid}   />
              </div>
            </div>
            <div className={styles.mockRow}>
              <div className={styles.mockAvatar} />
              <div className={styles.mockLines}>
                <div className={styles.mockBarFull}  />
                <div className={styles.mockBarShort} />
              </div>
            </div>

            {/* Mock CTA strip */}
            <div className={styles.mockCta} />
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
