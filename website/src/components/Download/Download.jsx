/* =========================================================
   Download.jsx — Final call-to-action section.
   Serves the APK from a public GitHub release URL.
   ========================================================= */

import { useTranslation } from 'react-i18next';
import { FaAndroid } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import styles from './Download.module.css';

const GITHUB_RELEASE_APK_URL = 'https://github.com/ManunGar/Band-Manager-APK/releases/download/v0.2.0/band-manager-v0.2.0.apk';

function Download() {
  const { t } = useTranslation();
  const downloadHref = GITHUB_RELEASE_APK_URL;

  const isDownloadAvailable = Boolean(downloadHref);

  const handleDownloadClick = (event) => {
    if (!isDownloadAvailable) {
      event.preventDefault();
    }
  };

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

          {/* Primary download button. It points to the APK hosted in GitHub Releases. */}
          <a
            href={downloadHref || '#'}
            onClick={handleDownloadClick}
            className={`${styles.downloadButton} ${!isDownloadAvailable ? styles.downloadButtonDisabled : ''}`.trim()}
            aria-label={t('download.downloadAriaLabel')}
            aria-disabled={!isDownloadAvailable}
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
