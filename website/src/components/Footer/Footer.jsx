/* =========================================================
   Footer.jsx — Site footer with links and project attribution.
   ========================================================= */

import { FiGithub } from 'react-icons/fi';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Top row: brand left | link groups right */}
        <div className={styles.top}>

          {/* Brand block */}
          <div className={styles.brand}>
            <span className={styles.logo}>Band Manager</span>
            <p className={styles.tagline}>For musicians, by musicians.</p>
          </div>

          {/* Navigation link groups */}
          <div className={styles.linkGroups}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Project</h4>
              <a
                href="https://github.com/ManunGar/Band-Manager"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                GitHub
              </a>
              <a href="#download" className={styles.link}>
                Download APK
              </a>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>About</h4>
              <a href="#features" className={styles.link}>
                Features
              </a>
              <a
                href="https://github.com/ManunGar/Band-Manager/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                License
              </a>
            </div>
          </div>
        </div>

        {/* Horizontal divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Bottom row: copyright | GitHub icon */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Band Manager — University Final Project
          </p>
          <a
            href="https://github.com/ManunGar/Band-Manager"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="View source on GitHub"
          >
            <FiGithub size={20} />
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
