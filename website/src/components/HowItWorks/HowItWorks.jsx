/* =========================================================
   HowItWorks.jsx — 4-step user onboarding flow.
   Steps are connected by a dashed line on desktop.
   ========================================================= */

import { FiUser, FiUsers, FiCalendar, FiBriefcase } from 'react-icons/fi';
import styles from './HowItWorks.module.css';

/* Step data — static */
const STEPS = [
  {
    id: 'step-1',
    number: '01',
    Icon: FiUser,
    title: 'Create Your Profile',
    description:
      'Sign up and build your musician profile with your instruments and proficiency levels.',
  },
  {
    id: 'step-2',
    number: '02',
    Icon: FiUsers,
    title: 'Join or Create a Band',
    description:
      'Start a new band and invite members with a unique code, or join an existing one.',
  },
  {
    id: 'step-3',
    number: '03',
    Icon: FiCalendar,
    title: 'Schedule & Attend Events',
    description:
      'Add rehearsals and performances, confirm attendance, and track who shows up.',
  },
  {
    id: 'step-4',
    number: '04',
    Icon: FiBriefcase,
    title: 'Hire or Get Hired',
    description:
      'Post open agreements for external musicians, or apply as a musician for performances.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.inner}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>How It Works</span>
          <h2 className={styles.heading}>Up And Running In Minutes</h2>
          <p className={styles.subheading}>
            Four simple steps to go from signup to a fully managed band.
          </p>
        </div>

        {/* Steps grid */}
        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <div key={step.id} className={styles.step}>
              {/* Dashed connector to the next step (hidden on last item via CSS) */}
              <div className={styles.connector} aria-hidden="true" />

              {/* Large decorative step number */}
              <div className={styles.number}>{step.number}</div>

              {/* Icon circle */}
              <div className={styles.iconWrap}>
                <step.Icon size={26} />
              </div>

              {/* Text */}
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p  className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
