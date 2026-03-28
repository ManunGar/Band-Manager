/* =========================================================
   Footer.jsx — Site footer with links and project attribution.
   ========================================================= */

import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Top row: brand left | link groups right */}
        <div className={styles.top}>

          {/* Brand block */}
          <div className={styles.brand}>
            {/* Brand name stays in English as a proper name */}
            <span className={styles.logo}>Band Manager</span>
            <p className={styles.tagline}>{t('footer.tagline')}</p>
          </div>

          {/* Navigation link groups */}
          <div className={styles.linkGroups}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>{t('footer.projectGroup')}</h4>
              <a href="#download" className={styles.link}>
                {t('footer.downloadApk')}
              </a>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>{t('footer.aboutGroup')}</h4>
              <a href="#features" className={styles.link}>
                {t('footer.featuresLink')}
              </a>
            </div>
          </div>
        </div>

        {/* Horizontal divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Bottom row: copyright */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Band Manager
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
