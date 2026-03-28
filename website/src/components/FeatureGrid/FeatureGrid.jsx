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
import styles from './FeatureGrid.module.css';

/* Static feature data */
const FEATURES = [
  {
    id: 'musician-profiles',
    Icon: MdMusicNote,
    title: 'Musician Profiles',
    description:
      'Instruments, proficiency levels, and personal info all in one place.',
  },
  {
    id: 'band-creation',
    Icon: MdGroups,
    title: 'Band Creation',
    description:
      'Create bands, generate unique join codes, and manage members easily.',
  },
  {
    id: 'event-scheduling',
    Icon: MdCalendarToday,
    title: 'Event Scheduling',
    description:
      'Plan rehearsals and performances with dates, times, and locations.',
  },
  {
    id: 'attendance-tracking',
    Icon: MdHowToReg,
    title: 'Attendance Tracking',
    description:
      'Know who confirmed, who declined, and who has not responded yet.',
  },
  {
    id: 'hire-musicians',
    Icon: MdHandshake,
    title: 'Hire Musicians',
    description:
      'Post open positions and accept applications from external musicians.',
  },
  {
    id: 'agreements',
    Icon: MdAssignment,
    title: 'Agreements',
    description:
      'Formalize contracts with payment details, role, and performance info.',
  },
  {
    id: 'role-management',
    Icon: MdAdminPanelSettings,
    title: 'Role Management',
    description:
      'Admin and member roles with fine-grained access control per band.',
  },
  {
    id: 'media-uploads',
    Icon: MdImage,
    title: 'Media Uploads',
    description:
      'Profile pictures and event images stored securely via Cloudinary.',
  },
];

function FeatureGrid() {
  return (
    <section id="feature-grid" className={styles.section}>
      <div className={styles.inner}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>Features</span>
          <h2 className={styles.heading}>Everything In One Place</h2>
          <p className={styles.subheading}>
            From profiles to payments, Band Manager covers the full lifecycle
            of band management and musician hiring.
          </p>
        </div>

        {/* Feature card grid */}
        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <div key={feature.id} className={styles.card}>
              <div className={styles.iconWrap}>
                <feature.Icon size={24} />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p  className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeatureGrid;
