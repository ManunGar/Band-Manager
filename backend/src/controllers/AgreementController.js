import { Op, Sequelize } from "sequelize";
import { Agreement, Application, Band, Component, Event, Musician, Performance } from "../models/sequelize.js";

// Function to list 
const listAgreements = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50); // Default to 10, max 50
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0); // Default to 0
        const instrumentId = req.query.instrumentId ? parseInt(req.query.instrumentId, 10) : null;
        const search = req.query.search ? req.query.search.trim() : null;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const startDate = dateRegex.test(req.query.startDate) ? req.query.startDate : null;
        const endDate = dateRegex.test(req.query.endDate) ? req.query.endDate : null;
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
                    }
                }
            }, {
                model: Application,
                as: 'applications',
                attributes: ['id', 'musicianId', 'agreementId', 'type'],
                required: false, // Include agreements even if they have no applications
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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const startDate = dateRegex.test(req.query.startDate) ? req.query.startDate : null;
    const endDate = dateRegex.test(req.query.endDate) ? req.query.endDate : null;

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
                attributes: ['id'],
                required: false,
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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const startDate = dateRegex.test(req.query.startDate) ? req.query.startDate : null;
    const endDate = dateRegex.test(req.query.endDate) ? req.query.endDate : null;

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
                include: {
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
                }
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
            }]
        });
        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const isOwner = agreement.musicianId === req.user?.musician?.id;
        if (isOwner) {
            return res.status(200).json(agreement);
        }

        const agreementJson = agreement.toJSON();
        agreementJson.applications = (agreementJson.applications || []).map((application) => ({
            id: application.id,
            musicianId: application.musicianId,
            agreementId: application.agreementId,
            type: application.type
        }));

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
        await Agreement.create({
            instrumentId: req.body.instrumentId,
            musicianId: req.user.musician.id,
            performanceId: req.body.performanceId,
            amount: req.body.amount,
            payment: req.body.payment,
            description: req.body.description
        });
        return res.status(201).json({ message: 'Agreement created successfully' });
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
        // Find the application to update, ensuring it belongs to the specified agreement and is of type 'musician_apply'
        const application = await Application.findOne({
            where: {
                id: req.params.applicationId,
                agreementId: req.params.agreementId,
                type: 'musician_apply',
                status: 'pending' // Only allow updating applications that are currently pending
            },
            transaction
        });
        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Application not found' });
        }
        await application.update({ status: req.body.status }, { transaction });
        // Check if the last application was accepted, if so, reject all the other applications for the same agreement and close the agreement
        if (req.body.status === 'accepted') {
            const agreement = await Agreement.findByPk(application.agreementId, {
                include: {
                    model: Application,
                    as: 'applications'
                },
                transaction
            });
            if (agreement.applications.filter(a => a.status === 'accepted').length >= agreement.amount) {
                await Application.update(
                    { status: 'rejected' },
                    {
                        where: {
                            agreementId: application.agreementId,
                            id: { [Op.ne]: application.id },
                            status: 'pending'
                        },
                        transaction
                    }
                );
                await Agreement.update(
                    { status: 'closed' },
                    {
                        where: { id: application.agreementId },
                        transaction
                    }
                );
            }
        }
        await transaction.commit();
        return res.status(200).json({ message: 'Application status updated successfully', application });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'An error occurred while updating the application status' });
    }
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
    updateApplicationStatus
}

export default AgreementController;