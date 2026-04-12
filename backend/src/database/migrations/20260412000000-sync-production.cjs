'use strict';

/**
 * Production sync migration — safe to run even if some changes already exist.
 * Adds the following to the production database:
 *   - Agreements table
 *   - Applications table
 *   - Musicians.isProfilePrivate column
 *   - Events.endDate column (backfilled from Events.date)
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    // ── 1. Agreements ──────────────────────────────────────────────────────────
    if (!tables.includes('Agreements')) {
      await queryInterface.createTable('Agreements', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        performanceId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'Performances', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        musicianId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'Musicians', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        instrumentId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'Instruments', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        status: {
          type: Sequelize.ENUM('open', 'closed'),
          defaultValue: 'open',
          allowNull: false,
        },
        amount: {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        payment: {
          allowNull: false,
          type: Sequelize.DOUBLE,
        },
        description: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    // ── 2. Applications ────────────────────────────────────────────────────────
    if (!tables.includes('Applications')) {
      await queryInterface.createTable('Applications', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        musicianId: {
          type: Sequelize.INTEGER,
          references: { model: 'Musicians', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        agreementId: {
          type: Sequelize.INTEGER,
          references: { model: 'Agreements', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        status: {
          type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
          defaultValue: 'pending',
          allowNull: false,
        },
        rate: {
          allowNull: true,
          type: Sequelize.DOUBLE,
        },
        type: {
          type: Sequelize.ENUM('musician_apply', 'band_invite'),
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    // ── 3. Musicians.isProfilePrivate ──────────────────────────────────────────
    const musiciansColumns = await queryInterface.describeTable('Musicians');
    if (!musiciansColumns.isProfilePrivate) {
      await queryInterface.addColumn('Musicians', 'isProfilePrivate', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    // ── 4. Events.endDate ──────────────────────────────────────────────────────
    const eventsColumns = await queryInterface.describeTable('Events');
    if (!eventsColumns.endDate) {
      // Add nullable first so existing rows don't violate the constraint
      await queryInterface.addColumn('Events', 'endDate', {
        type: Sequelize.DATE,
        allowNull: true,
      });

      // Backfill with the existing date value
      await queryInterface.sequelize.query(
        'UPDATE `Events` SET `endDate` = `date` WHERE `endDate` IS NULL'
      );

      // Now enforce NOT NULL
      await queryInterface.changeColumn('Events', 'endDate', {
        type: Sequelize.DATE,
        allowNull: false,
      });
    }
  },

  async down(queryInterface) {
    // ── 4. Remove Events.endDate ───────────────────────────────────────────────
    const eventsColumns = await queryInterface.describeTable('Events');
    if (eventsColumns.endDate) {
      try {
        await queryInterface.removeColumn('Events', 'endDate');
      } catch (error) {
        // MariaDB + Sequelize workaround: removeColumn may throw a spurious error
        // after the ALTER TABLE already executed successfully.
        if (!String(error?.message || '').includes("Cannot delete property 'meta'")) {
          throw error;
        }
        const refreshed = await queryInterface.describeTable('Events');
        if (refreshed.endDate) {
          await queryInterface.sequelize.query(
            'ALTER TABLE `Events` DROP COLUMN `endDate`',
            { raw: true }
          );
        }
      }
    }

    // ── 3. Remove Musicians.isProfilePrivate ───────────────────────────────────
    const musiciansColumns = await queryInterface.describeTable('Musicians');
    if (musiciansColumns.isProfilePrivate) {
      await queryInterface.removeColumn('Musicians', 'isProfilePrivate');
    }

    // ── 2. Drop Applications ───────────────────────────────────────────────────
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Applications')) {
      await queryInterface.dropTable('Applications');
    }

    // ── 1. Drop Agreements ─────────────────────────────────────────────────────
    if (tables.includes('Agreements')) {
      await queryInterface.dropTable('Agreements');
    }
  },
};
