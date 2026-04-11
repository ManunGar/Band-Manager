import { Op, Sequelize } from "sequelize";
import { Agreement, Application, Band, Component, Event, Instrument, Musician, Performance, User } from "../models/sequelize.js";

// Function to list future performances where the authenticated musician is a band admin
const listAdminPerformances = async (req, res) => {
    const musicianId = req.user.musician.id;

    try {
        const upcomingFilter = Sequelize.literal(
            "TIMESTAMP(DATE(COALESCE(`Event`.`endDate`, `Event`.`date`)), COALESCE(`Event`.`endTime`, `Event`.`initialTime`)) >= NOW()"
        );

        const performances = await Performance.findAll({
            include: [{
                model: Event,
                required: true,
                where: { [Op.and]: [upcomingFilter] },
                include: {
                    model: Band,
                    as: 'band',
                    required: true,
                    attributes: ['id', 'name', 'profile_picture'],
                    include: {
                        model: Component,
                        as: 'components',
                        required: true,
                        attributes: [],
                        where: { musicianId, administrator: true }
                    }
                }
            }],
            order: [[Sequelize.literal('`Event`.`date`'), 'ASC']]
        });

        return res.status(200).json(performances);
    } catch (error) {
        console.error('Error listing admin performances:', error);
        res.status(500).json({ error: 'An error occurred while listing admin performances' });
    }
}

// Function to invite a musician to an agreement (band_invite application)
const inviteMusician = async (req, res) => {
    const agreementId = req.params.agreementId;
    const musicianId = parseInt(req.body.musicianId, 10);

    try {
        await Application.create({
            musicianId,
            agreementId,
            type: 'band_invite'
        });
        return res.status(201).json({ message: 'Musician invited successfully' });
    } catch (error) {
        console.error('Error inviting musician:', error);
        res.status(500).json({ error: 'An error occurred while inviting the musician' });
    }
}

// Function for a musician to accept or reject a band_invite application
const respondToInvite = async (req, res) => {
    const transaction = await Application.sequelize.transaction();
    try {
        const applicationId = req.params.applicationId;
        const musicianId = req.user.musician.id;
        const nextStatus = req.body.status;

        const application = await Application.findOne({
            where: { id: applicationId, musicianId, type: 'band_invite', status: 'pending' },
            include: {
                model: Agreement,
                as: 'agreement',
                required: true,
                include: {
                    model: Performance,
                    as: 'performance',
                    required: true,
                    include: { model: Event, required: true }
                }
            },
            transaction
        });

        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Invitation not found or cannot be updated' });
        }

        const event = application.agreement.performance.Event;
        const eventStart = new Date(event.date);
        const [hours, minutes, seconds] = (event.initialTime || '00:00:00').split(':').map(Number);
        eventStart.setHours(hours || 0, minutes || 0, seconds || 0, 0);
        if (eventStart <= new Date()) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Cannot respond to invitation after event has started' });
        }

        await application.update({ status: nextStatus }, { transaction });

        if (nextStatus === 'accepted') {
            const agreement = await Agreement.findByPk(application.agreementId, {
                include: { model: Application, as: 'applications', attributes: ['id', 'status'] },
                transaction
            });

            if (!agreement) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Agreement not found' });
            }

            const acceptedCount = agreement.applications.filter(a => a.status === 'accepted').length;
            const agreementStatus = acceptedCount >= agreement.amount ? 'closed' : 'open';

            if (agreementStatus === 'closed') {
                await Application.update(
                    { status: 'rejected' },
                    { where: { agreementId: application.agreementId, status: 'pending' }, transaction }
                );
            }

            await agreement.update({ status: agreementStatus }, { transaction });
        }

        await transaction.commit();
        return res.status(200).json({ message: 'Invitation responded successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error responding to invitation:', error);
        res.status(500).json({ error: 'An error occurred while responding to the invitation' });
    }
}

// Function to list 
const listAgreements = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50); // Default to 10, max 50
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0); // Default to 0
        const instrumentId = req.query.instrumentId ? parseInt(req.query.instrumentId, 10) : null;
        const search = req.query.search ? req.query.search.trim() : null;
        const startDate = _normalizeDateQuery(req.query.startDate);
        const endDate = _normalizeDateQuery(req.query.endDate);
        const musician = await Musician.findByPk(req.user.musician.id, {
            include: {
                model: Component,
                as: 'components',
            }
        });

        // Get the IDs of the instruments that the authenticated musician can play, optionally filtering by the instrumentId query parameter
        const musicianInstrumentIds = (req.user?.musician?.instruments || [])
            .map((instrument) => instrument.id)
            .filter((id) => instrumentId ? id === instrumentId : Number.isInteger(id));

        // If the authenticated musician has no instruments, there are no matching agreements to return.
        if (musicianInstrumentIds.length === 0) {
            return res.status(200).json({
                data: [],
                total: 0,
                limit,
                offset,
                loaded: 0,
                hasMore: false,
                nextOffset: null
            });
        }

        const eventDateWhere = {};

        if (startDate && endDate) {
            eventDateWhere[Op.between] = [startDate, `${endDate} 23:59:59`];
        } else if (startDate) {
            eventDateWhere[Op.gte] = startDate;
        } else if (endDate) {
            eventDateWhere[Op.lte] = `${endDate} 23:59:59`;
        }

        const upcomingEventFilter = Sequelize.literal("TIMESTAMP(DATE(COALESCE(`performance->Event`.`endDate`, `performance->Event`.`date`)), COALESCE(`performance->Event`.`endTime`, `performance->Event`.`initialTime`)) >= NOW()");

        const result = await Agreement.findAndCountAll({
            distinct: true,
            col: 'id',
            where: {
                instrumentId: {
                    [Op.in]: musicianInstrumentIds
                },
                status: 'open'
            },
            limit,
            offset,
            include: [{
                model: Performance,
                as: 'performance',
                required: true, // Only include agreements that have a performance
                include: {
                    model: Event,
                    required: true, // Only include performances that have an event
                    order: [['date', 'ASC']],
                    where: {
                        ...(Object.keys(eventDateWhere).length > 0 ? { date: eventDateWhere } : {}),
                        ...(Object.keys(eventDateWhere).length === 0 ? { [Op.and]: [upcomingEventFilter] } : {}),
                        ...(search ? {
                            [Op.or]: [
                                { name: { [Op.like]: `%${search.toLowerCase()}%` } },
                                { location: { [Op.like]: `%${search.toLowerCase()}%` } }
                            ]
                        } : {}),
                        bandId: {
                            [Op.notIn]: musician.components.map(component => component.bandId)
                        }
                    },
                    include: {
                        model: Band,
                        as: 'band',
                        attributes: ['id', 'name', 'profile_picture'],
                    }
                }
            }, {
                model: Application,
                as: 'applications',
                attributes: ['id', 'musicianId', 'agreementId', 'type', 'status'],
                required: false, // Include agreements even if they have no applications
            }, {
                model: Instrument,
                as: 'instrument',
                attributes: ['id', 'name'],
                required: true, // Only include agreements that have an instrument
            }]
        })

        return res.status(200).json({
            data: result.rows,
            total: result.count,
            limit,
            offset,
            loaded: offset + result.rows.length,
            hasMore: offset + result.rows.length < result.count,
            nextOffset: offset + result.rows.length < result.count
                ? offset + limit
                : null
        });
    } catch (error) {
        console.error('Error listing agreements:', error);
        res.status(500).json({ error: 'An error occurred while listing agreements' });
    }
}

// Function to list the agreements of the authenticated musician
const listMyAgreements = async (req, res) => {
    const musicianId = req.user.musician.id;
    const instrumentId = req.query.instrumentId ? parseInt(req.query.instrumentId, 10) : null;
    const search = req.query.search ? req.query.search.trim() : null;
    const startDate = _normalizeDateQuery(req.query.startDate);
    const endDate = _normalizeDateQuery(req.query.endDate);

    try {
        const agreementWhere = {
            musicianId,
            ...(Number.isInteger(instrumentId) ? { instrumentId } : {})
        };

        const eventWhere = {};

        if (search) {
            eventWhere[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        if (startDate && endDate) {
            eventWhere.date = { [Op.between]: [startDate, `${endDate} 23:59:59`] };
        } else if (startDate) {
            eventWhere.date = { [Op.gte]: startDate };
        } else if (endDate) {
            eventWhere.date = { [Op.lte]: `${endDate} 23:59:59` };
        }

        const agreements = await Agreement.findAll({
            where: agreementWhere,
            include: [{
                model: Performance,
                as: 'performance',
                required: true,
                include: {
                    model: Event,
                    required: true,
                    where: eventWhere,
                    include: {
                        model: Band,
                        as: 'band',
                        attributes: ['id', 'name', 'profile_picture'],
                        required: true,
                    }
                }
            }, {
                model: Application,
                as: 'applications',
                attributes: ['id', 'musicianId'],
                required: false,
            }, {
                model: Instrument,
                as: 'instrument',
                attributes: ['id', 'name', 'image'],
                required: true,
            }],
            order: [
                [Sequelize.literal('`performance->Event`.`date`'), 'DESC'],
                [Sequelize.literal('`performance->Event`.`initialTime`'), 'DESC']
            ]
        });

        return res.status(200).json(agreements);
    } catch (error) {
        console.error('Error listing my agreements:', error);
        res.status(500).json({ error: 'An error occurred while listing your agreements' });
    }
}

// Function to list the applications of the authenticated musician
const listMyApplications = async (req, res) => {
    const musicianId = req.user.musician.id;
    const instrumentId = req.query.instrumentId ? parseInt(req.query.instrumentId, 10) : null;
    const search = req.query.search ? req.query.search.trim() : null;
    const startDate = _normalizeDateQuery(req.query.startDate);
    const endDate = _normalizeDateQuery(req.query.endDate);

    try {
        const agreementWhere = {
            ...(Number.isInteger(instrumentId) ? { instrumentId } : {})
        };

        const eventWhere = {};

        if (search) {
            eventWhere[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        if (startDate && endDate) {
            eventWhere.date = { [Op.between]: [startDate, `${endDate} 23:59:59`] };
        } else if (startDate) {
            eventWhere.date = { [Op.gte]: startDate };
        } else if (endDate) {
            eventWhere.date = { [Op.lte]: `${endDate} 23:59:59` };
        }

        const applications = await Application.findAll({
            where: { musicianId },
            include: {
                model: Agreement,
                as: 'agreement',
                required: true,
                where: agreementWhere,
                include: [{
                    model: Performance,
                    as: 'performance',
                    required: true,
                    include: {
                        model: Event,
                        required: true,
                        where: eventWhere,
                        include: {
                            model: Band,
                            as: 'band',
                            attributes: ['id', 'name', 'profile_picture'],
                            required: true,
                        }
                    }
                }, {
                    model: Instrument,
                    as: 'instrument',
                    attributes: ['id', 'name', 'image'],
                    required: false,
                }]
            },
            order: [
                [Sequelize.literal('`agreement->performance->Event`.`date`'), 'DESC'],
                [Sequelize.literal('`agreement->performance->Event`.`initialTime`'), 'DESC']
            ]
        });
        return res.status(200).json(applications);
    } catch (error) {
        console.error('Error listing my applications:', error);
        res.status(500).json({ error: 'An error occurred while listing your applications' });
    }
}

// Function to get an agreement by ID
const getAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByPk(req.params.agreementId, {
            include: [{
                model: Performance,
                as: 'performance',
                required: true,
                include: {
                    model: Event,
                    required: true,
                    include: {
                        model: Band,
                        as: 'band',
                        attributes: ['id', 'name', 'profile_picture'],
                        required: true,
                    }
                }
            }, {
                model: Application,
                as: 'applications',
                required: false,
            }, {
                model: Instrument,
                as: 'instrument',
                attributes: ['id', 'name'],
                required: false,
            }, {
                model: Musician,
                as: 'musician',
                required: true,
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['phone', 'full_name'],
                    required: true,
                }
            }]
        });
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const isOwner = agreement.musicianId === req.user?.musician?.id;
        if (isOwner) {
            const agreementJson = agreement.toJSON();
            agreementJson.applications = await _getAgreementOwnerApplications(agreement.id, agreement.instrumentId);
            return res.status(200).json(agreementJson);
        }

        const agreementJson = agreement.toJSON();
        const myApplication = agreementJson.applications?.find(app => app.musicianId === req.user?.musician?.id);
        const isAccepted = myApplication?.status === 'accepted';

        agreementJson.applications = (agreementJson.applications || []).map((application) => {
            const isMyApp = application.musicianId === req.user?.musician?.id;
            return {
                id: application.id,
                musicianId: application.musicianId,
                agreementId: application.agreementId,
                type: application.type,
                ...(isMyApp ? { status: application.status } : {})
            };
        });

        // Only expose owner contact info when the requesting musician has been accepted
        if (!isAccepted) {
            delete agreementJson.musician;
        }

        return res.status(200).json(agreementJson);
    } catch (error) {
        console.error('Error retrieving agreement:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the agreement' });
    }
}

// Function to create an agreement
const createAgreement = async (req, res) => {
    const performanceId = req.body.performanceId;
    try {
        const performance = await Performance.findByPk(performanceId, {
            include: { model: Event, required: true }
        });
        if (!performance || !performance.Event) {
            return res.status(404).json({ error: 'Performance not found' });
        }
        const eventEndDate = new Date(performance.Event.endDate || performance.Event.date)
            .toISOString()
            .slice(0, 10);
        const eventEndTime = (performance.Event.endTime || performance.Event.initialTime || '00:00:00').slice(0, 8);
        const eventEndDateTime = new Date(`${eventEndDate}T${eventEndTime}`);

        if (eventEndDateTime < new Date()) {
            return res.status(400).json({ error: 'Cannot create agreement for past events' });
        }
        const agreement = await Agreement.create({
            instrumentId: req.body.instrumentId,
            musicianId: req.user.musician.id,
            performanceId: req.body.performanceId,
            amount: req.body.amount,
            payment: req.body.payment,
            description: req.body.description
        });
        return res.status(201).json({ message: 'Agreement created successfully', agreementId: agreement.id });
    } catch (error) {
        console.error('Error creating agreement:', error);
        res.status(500).json({ error: 'An error occurred while creating the agreement' });
    }
}

// Function to update an agreement
const updateAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByPk(req.params.agreementId);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }
        const { amount, payment, description } = req.body;
        await agreement.update({ amount, payment, description });
        return res.status(200).json({ message: 'Agreement updated successfully', agreement });

    } catch (error) {
        console.error('Error updating agreement:', error);
        res.status(500).json({ error: 'An error occurred while updating the agreement' });
    }
}

// Function to delete an agreement
const deleteAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByPk(req.params.agreementId);
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }
        await agreement.destroy();
        return res.status(200).json({ message: 'Agreement deleted successfully' });
    } catch (error) {
        console.error('Error deleting agreement:', error);
        res.status(500).json({ error: 'An error occurred while deleting the agreement' });
    }
}

// Function to apply to an agreement
const applyToAgreement = async (req, res) => {
    const agreementId = req.params.agreementId;
    try {
        await Application.create({
            musicianId: req.user.musician.id,
            agreementId: agreementId,
            type: 'musician_apply'
        });
        return res.status(201).json({ message: 'Applied to agreement successfully' });
    } catch (error) {
        console.error('Error applying to agreement:', error);
        res.status(500).json({ error: 'An error occurred while applying to the agreement' });
    }
}

// Function to update the status of an application (accepted or rejected)
const updateApplicationStatus = async (req, res) => {
    const transaction = await Application.sequelize.transaction();
    try {
        const nextStatus = req.body.status;

        // Find the application to update, ensuring it belongs to the specified agreement and is of type 'musician_apply'
        const application = await Application.findOne({
            where: {
                id: req.params.applicationId,
                agreementId: req.params.agreementId,
                type: 'musician_apply',
                status: {
                    [Op.in]: ['pending', 'accepted']
                }
            },
            transaction
        });
        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Application not found or cannot be updated' });
        }

        const previousStatus = application.status;

        if (previousStatus === nextStatus) {
            await transaction.commit();
            return res.status(200).json({ message: 'Application status updated successfully', application });
        }

        const isAllowedTransition =
            (previousStatus === 'pending' && (nextStatus === 'accepted' || nextStatus === 'rejected')) ||
            (previousStatus === 'accepted' && nextStatus === 'rejected');

        if (!isAllowedTransition) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid status transition' });
        }

        await application.update({ status: nextStatus }, { transaction });

        const agreement = await Agreement.findByPk(application.agreementId, {
            include: {
                model: Application,
                as: 'applications',
                attributes: ['id', 'status']
            },
            transaction
        });

        if (!agreement) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const acceptedApplicationsCount = agreement.applications.filter(a => a.status === 'accepted').length;
        let agreementStatus = acceptedApplicationsCount >= agreement.amount ? 'closed' : 'open';

        if (agreementStatus === 'closed') {
            await Application.update(
                { status: 'rejected' },
                {
                    where: {
                        agreementId: application.agreementId,
                        status: 'pending'
                    },
                    transaction
                }
            );
        }

        await agreement.update({ status: agreementStatus }, { transaction });

        await transaction.commit();

        return res.status(200).json({
            message: 'Application status updated successfully',
            application,
            agreementStatus,
            reopened: previousStatus === 'accepted' && nextStatus === 'rejected' && agreementStatus === 'open'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'An error occurred while updating the application status' });
    }
}

// Function to rate an accepted musician application after the event has ended
const rateApplication = async (req, res) => {
    try {
        const application = req.applicationToRate;
        const rate = Number(req.body.rate);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        await application.update({ rate });

        return res.status(200).json({
            message: 'Application rated successfully',
            application: {
                id: application.id,
                musicianId: application.musicianId,
                agreementId: application.agreementId,
                status: application.status,
                type: application.type,
                rate: application.rate
            }
        });
    } catch (error) {
        console.error('Error rating application:', error);
        res.status(500).json({ error: 'An error occurred while rating the application' });
    }
}

// ==================== Auxiliary Functions ====================

// Normalize date query parameters to ensure consistent date format (YYYY-MM-DD) and handle various input formats gracefully
const _normalizeDateQuery = (value) => {
    if (!value) return null;

    const raw = Array.isArray(value) ? value[0] : value;
    const dateString = String(raw).trim();
    if (!dateString) return null;

    // Preserve selected day for ISO-like inputs such as 2026-04-06T00:00:00.000Z.
    const isoPrefix = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoPrefix) return isoPrefix[1];

    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return null;

    return parsedDate.toISOString().slice(0, 10);
};

// Get the average rate for each musician based on their accepted applications with non-null rates, returning an object mapping musician IDs to their average rates
const _getAverageRateByMusician = async (musicianIds = []) => {
    if (musicianIds.length === 0) return {};

    const averages = await Application.findAll({
        where: {
            musicianId: { [Op.in]: musicianIds },
            status: 'accepted',
            type: 'musician_apply',
            rate: { [Op.not]: null }
        },
        attributes: [
            'musicianId',
            [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('rate')), 2), 'averageRate']
        ],
        group: ['musicianId'],
        raw: true
    });

    return averages.reduce((acc, row) => {
        acc[row.musicianId] = row.averageRate !== null ? Number(row.averageRate) : null;
        return acc;
    }, {});
}

// Get the applications for the owner of the agreement, including musician info, instrument level, and average rate, optionally filtering by instrument ID if provided
const _getAgreementOwnerApplications = async (agreementId, instrumentId) => {
    const applications = await Application.findAll({
        where: { agreementId },
        include: [{
            model: Musician,
            as: 'musician',
            required: true,
            attributes: ['id'],
            include: [{
                model: User,
                as: 'user',
                required: true,
                attributes: ['id', 'full_name', 'location', 'profile_picture']
            }, {
                model: Instrument,
                as: 'instruments',
                required: false,
                attributes: ['id', 'name'],
                through: { attributes: ['level'] },
                ...(Number.isInteger(instrumentId) ? { where: { id: instrumentId } } : {})
            }]
        }],
        order: [['createdAt', 'ASC']]
    });

    const musicianIds = [...new Set(applications.map((application) => application.musicianId).filter(Boolean))];
    const averageRateByMusician = await _getAverageRateByMusician(musicianIds);

    return applications.map((application) => {
        const applicationJson = application.toJSON();
        const musician = applicationJson.musician || {};
        const instrument = musician.instruments?.[0];

        return {
            id: applicationJson.id,
            musicianId: applicationJson.musicianId,
            agreementId: applicationJson.agreementId,
            type: applicationJson.type,
            status: applicationJson.status,
            rate: applicationJson.rate,
            musician: {
                id: musician.id,
                averageRate: averageRateByMusician[applicationJson.musicianId] ?? null,
                instrumentLevel: instrument?.MusicianLevel?.level ?? null,
                user: musician.user || null,
            }
        }
    });
}

const AgreementController = {
    listAgreements,
    listMyAgreements,
    listMyApplications,
    getAgreement,
    createAgreement,
    updateAgreement,
    deleteAgreement,
    applyToAgreement,
    updateApplicationStatus,
    rateApplication,
    listAdminPerformances,
    inviteMusician,
    respondToInvite
}

export default AgreementController;