/* =========================================================
   FeatureGrid.jsx — 8-card grid of specific app capabilities.
   Uses a light background for visual contrast between sections.
   ========================================================= */

import {
  MdMusicNote,
  MdGroups,
  MdCalendarToday,
  MdHowToReg,
  MdHandshake,
  MdAssignment,
  MdAdminPanelSettings,
  MdImage,
} from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './FeatureGrid.module.css';

/* Icons are ordered to match the items array in the translation files */
const FEATURE_ICONS = [
  MdMusicNote,
  MdGroups,
  MdCalendarToday,
  MdHowToReg,
  MdHandshake,
  MdAssignment,
  MdAdminPanelSettings,
  MdImage,
];

function FeatureGrid() {
  const { t } = useTranslation();

  /* Fetch items array from the current language's translation file */
  const items = t('featureGrid.items', { returnObjects: true });

  return (
    <section id="feature-grid" className={styles.section}>
      <div className={styles.inner}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>{t('featureGrid.label')}</span>
          <h2 className={styles.heading}>{t('featureGrid.heading')}</h2>
          <p className={styles.subheading}>{t('featureGrid.subheading')}</p>
        </div>

        {/* Feature card grid */}
        <div className={styles.grid}>
          {Array.isArray(items) && items.map((feature, index) => {
            const Icon = FEATURE_ICONS[index];
            return (
              <div key={feature.id} className={styles.card}>
                <div className={styles.iconWrap}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p  className={styles.cardDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default FeatureGrid;
