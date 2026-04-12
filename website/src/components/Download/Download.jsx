/* =========================================================
   Download.jsx — Final call-to-action section.
   Serves the APK directly from public/downloads/.
   NOTE: Place the APK file at public/downloads/band-manager.apk
   ========================================================= */

import { useTranslation } from 'react-i18next';
import { FaAndroid } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import styles from './Download.module.css';

function Download() {
  const { t } = useTranslation();

  return (
    <section id="download" className={styles.section}>

      {/* Radial yellow glow behind the card */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.card}>

          {/* Section label */}
          <span className={styles.label}>{t('download.label')}</span>

          {/* App title — brand name stays in English */}
          <h2 className={styles.title}>Band Manager</h2>

          {/* One-liner pitch */}
          <p className={styles.subtitle}>{t('download.subtitle')}</p>

          {/* Primary download button
              The `download` attribute triggers a file save dialog.
              TODO: verify APK is placed at public/downloads/band-manager.apk */}
          <a
            href="https://n8n-production-a7f5.up.railway.app/form/f021fa06-5daa-4dbd-9265-608286a144b9"
            className={styles.downloadButton}
            aria-label={t('download.downloadAriaLabel')}
          >
            <FaAndroid size={22} />
            {t('download.downloadButton')}
          </a>

          {/* Platform compatibility badge */}
          <div className={styles.badges}>
            <div className={styles.badge}>
              <FaAndroid size={16} />
              <span>{t('download.androidBadge')}</span>
            </div>
          </div>

          {/* Sideloading disclaimer */}
          <p className={styles.disclaimer}>
            <FiAlertCircle size={14} />
            {t('download.disclaimer')}
          </p>

        </div>
      </div>
    </section>
  );
}

export default Download;
