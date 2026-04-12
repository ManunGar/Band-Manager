/* =========================================================
   Download.jsx — Final call-to-action section.
   Serves the latest APK from public/downloads/ using a generated manifest.
   ========================================================= */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaAndroid } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import styles from './Download.module.css';

function Download() {
  const { t } = useTranslation();
  const [downloadHref, setDownloadHref] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState('band-manager.apk');

  useEffect(() => {
    let isMounted = true;

    const loadLatestDownload = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/downloads/downloads-manifest.json`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Manifest request failed with status ${response.status}`);
        }

        const manifest = await response.json();
        const latestHref = manifest?.latestHref;
        const latestFileName = manifest?.latestFileName;

        if (!isMounted || !latestHref) return;

        setDownloadHref(`${process.env.PUBLIC_URL}${latestHref}`);
        if (latestFileName) {
          setDownloadFileName(latestFileName);
        }
      } catch (error) {
        console.error('Could not load latest APK manifest:', error);
      }
    };

    loadLatestDownload();

    return () => {
      isMounted = false;
    };
  }, []);

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

          {/* Primary download button. It points to the latest APK listed in downloads-manifest.json. */}
          <a
            href={downloadHref || '#'}
            download={isDownloadAvailable ? downloadFileName : undefined}
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
