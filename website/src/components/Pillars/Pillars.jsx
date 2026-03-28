/* =========================================================
   Pillars.jsx — Two main value propositions side-by-side.
   Pillar 1: Band Management | Pillar 2: Musician Hiring
   ========================================================= */

import { MdGroups, MdHandshake } from 'react-icons/md';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import styles from './Pillars.module.css';

/* Icons are code-only; text comes from translations */
const PILLAR_CONFIGS = [
  { id: 'band-management',  Icon: MdGroups,    tKey: 'pillars.bandManagement' },
  { id: 'musician-hiring',  Icon: MdHandshake, tKey: 'pillars.musicianHiring' },
];

function Pillars() {
  const { t } = useTranslation();

  return (
    <section id="features" className={styles.pillars}>
      <div className={styles.inner}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>{t('pillars.label')}</span>
          <h2 className={styles.heading}>{t('pillars.heading')}</h2>
          <p className={styles.subheading}>{t('pillars.subheading')}</p>
        </div>

        {/* Pillar cards */}
        <div className={styles.grid}>
          {PILLAR_CONFIGS.map((pillar) => {
            /* returnObjects: true fetches the array from the JSON */
            const bullets = t(`${pillar.tKey}.bullets`, { returnObjects: true });

            return (
              <div key={pillar.id} className={styles.card}>
                {/* Left yellow accent bar */}
                <div className={styles.accentBar} />

                {/* Icon */}
                <div className={styles.iconWrap}>
                  <pillar.Icon size={34} />
                </div>

                {/* Title + subtitle */}
                <h3 className={styles.cardTitle}>{t(`${pillar.tKey}.title`)}</h3>
                <p  className={styles.cardSubtitle}>{t(`${pillar.tKey}.subtitle`)}</p>

                {/* Description */}
                <p className={styles.cardDescription}>{t(`${pillar.tKey}.description`)}</p>

                {/* Feature bullet list */}
                <ul className={styles.bullets}>
                  {Array.isArray(bullets) && bullets.map((b) => (
                    <li key={b} className={styles.bullet}>
                      <FiCheck size={14} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Pillars;
