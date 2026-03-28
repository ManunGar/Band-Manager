/* =========================================================
   Pillars.jsx — Two main value propositions side-by-side.
   Pillar 1: Band Management | Pillar 2: Musician Hiring
   ========================================================= */

import { MdGroups, MdHandshake } from 'react-icons/md';
import { FiCheck } from 'react-icons/fi';
import styles from './Pillars.module.css';

/* Static data — keeps the JSX clean */
const PILLARS = [
  {
    id: 'band-management',
    Icon: MdGroups,
    title: 'Band Management',
    subtitle: 'Full control. Zero friction.',
    description:
      'Create and manage your band, schedule rehearsals and performances, track member attendance, and handle everything from a single place.',
    bullets: [
      'Event scheduling & calendar',
      'Attendance tracking per event',
      'Member roles & permissions',
      'Unique band join codes',
    ],
  },
  {
    id: 'musician-hiring',
    Icon: MdHandshake,
    title: 'Musician Hiring',
    subtitle: 'Find the right player. Every time.',
    description:
      'Post open agreements for external musicians, manage applications, and formalize collaborations with built-in contract and payment details.',
    bullets: [
      'Open hiring agreements',
      'Application & review flow',
      'Payment & fee tracking',
      'Instrument-based filtering',
    ],
  },
];

function Pillars() {
  return (
    <section id="features" className={styles.pillars}>
      <div className={styles.inner}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>Two Pillars</span>
          <h2 className={styles.heading}>Everything Your Band Needs</h2>
          <p className={styles.subheading}>
            From day-to-day band operations to one-off event hires — one app covers it all.
          </p>
        </div>

        {/* Pillar cards */}
        <div className={styles.grid}>
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className={styles.card}>
              {/* Left yellow accent bar */}
              <div className={styles.accentBar} />

              {/* Icon */}
              <div className={styles.iconWrap}>
                <pillar.Icon size={34} />
              </div>

              {/* Title + subtitle */}
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p  className={styles.cardSubtitle}>{pillar.subtitle}</p>

              {/* Description */}
              <p className={styles.cardDescription}>{pillar.description}</p>

              {/* Feature bullet list */}
              <ul className={styles.bullets}>
                {pillar.bullets.map((b) => (
                  <li key={b} className={styles.bullet}>
                    <FiCheck size={14} className={styles.checkIcon} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Pillars;
