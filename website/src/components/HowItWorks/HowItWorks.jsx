/* =========================================================
   HowItWorks.jsx — 4-step user onboarding flow.
   Steps are connected by a dashed line on desktop.
   ========================================================= */

import { FiUser, FiUsers, FiCalendar, FiBriefcase } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import styles from './HowItWorks.module.css';

/* Icons are ordered to match the steps array in the translation files */
const STEP_ICONS = [FiUser, FiUsers, FiCalendar, FiBriefcase];

function HowItWorks() {
  const { t } = useTranslation();

  /* Fetch steps array from the current language's translation file */
  const steps = t('howItWorks.steps', { returnObjects: true });

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.inner}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>{t('howItWorks.label')}</span>
          <h2 className={styles.heading}>{t('howItWorks.heading')}</h2>
          <p className={styles.subheading}>{t('howItWorks.subheading')}</p>
        </div>

        {/* Steps grid */}
        <div className={styles.steps}>
          {Array.isArray(steps) && steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div key={step.id} className={styles.step}>
                {/* Dashed connector to the next step (hidden on last item via CSS) */}
                <div className={styles.connector} aria-hidden="true" />

                {/* Large decorative step number */}
                <div className={styles.number}>{step.number}</div>

                {/* Icon circle */}
                <div className={styles.iconWrap}>
                  <Icon size={26} />
                </div>

                {/* Text */}
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p  className={styles.stepDescription}>{step.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
