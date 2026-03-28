/* =========================================================
   Download.jsx — Final call-to-action section.
   Serves the APK directly from public/downloads/.
   NOTE: Place the APK file at public/downloads/band-manager.apk
   ========================================================= */

import { FaAndroid } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import styles from './Download.module.css';

function Download() {
  return (
    <section id="download" className={styles.section}>

      {/* Radial yellow glow behind the card */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.card}>

          {/* Section label */}
          <span className={styles.label}>Available Now</span>

          {/* App title */}
          <h2 className={styles.title}>Band Manager</h2>

          {/* One-liner pitch */}
          <p className={styles.subtitle}>
            Free. No subscription. Direct APK download for Android.
          </p>

          {/* Primary download button
              The `download` attribute triggers a file save dialog.
              TODO: replace href with the actual APK path once file is placed in public/downloads/ */}
          <a
            href="/downloads/band-manager.apk"
            download="band-manager.apk"
            className={styles.downloadButton}
            aria-label="Download Band Manager APK for Android"
          >
            <FaAndroid size={22} />
            Download APK
          </a>

          {/* Platform compatibility badge */}
          <div className={styles.badges}>
            <div className={styles.badge}>
              <FaAndroid size={16} />
              <span>Android</span>
            </div>
          </div>

          {/* Sideloading disclaimer */}
          <p className={styles.disclaimer}>
            <FiAlertCircle size={14} />
            Not available on Google Play Store — sideloading required.
          </p>

          {/* Project context */}
          <p className={styles.openSource}>
            Open source · University final project ·{' '}
            <a
              href="https://github.com/ManunGar/Band-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.repoLink}
            >
              View on GitHub
            </a>
          </p>

        </div>
      </div>
    </section>
  );
}

export default Download;
