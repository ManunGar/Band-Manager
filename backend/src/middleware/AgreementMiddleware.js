import { Agreement, Application, Band, Component, Event, Performance } from "../models/sequelize.js";

// Middleware to check if the authenticated musician is an admin of the event associated with the performance
const isEventAdmin = async (req, res, next) => {
    const performanceId = req.body.performanceId;
    const musicianId = req.user.musician.id;
    try {
        const performance = await Performance.findByPk(performanceId, {
            include: {
                model: Event,
                required: true,
                include: {
                    model: Band,
                    as: 'band',
                    required: true,
                    include: {
                        model: Component,
                        as: 'components',
                        required: true,
                        where: {
                            musicianId: musicianId,
                            administrator: true
                        }
                    }
                }
            }
        });
        if (!performance) {
            return res.status(403).send({ error: 'Access denied. You are not an admin of the event.' });
        }
        next();
    } catch (error) {
        console.error('Error checking event admin status:', error);
        res.status(500).send({ error: 'Error checking event admin status' });
    }
};

// Middleware to check if the authenticated musician is the owner of the agreement
const isAgreementOwner = async (req, res, next) => {
    const agreementId = req.params.agreementId;
    const musicianId = req.user.musician.id;
    try {
        const agreement = await Agreement.findByPk(agreementId);
        if (!agreement || agreement.musicianId !== musicianId) {
            return res.status(403).send({ error: 'Access denied. You are not the owner of this agreement.' });
        }
        next();
    } catch (error) {
        console.error('Error checking agreement ownership:', error);
        res.status(500).send({ error: 'Error checking agreement ownership' });
    }
}

// Middleware to check if the authenticated musician has the requirement to see the agreement (is the owner or has the required instrument)
const hasRequirementToSee = async (req, res, next) => {
    const agreementId = req.params.agreementId;
    const musicianId = req.user.musician.id;
    const musicianInstrumentsId = req.user.musician.instruments.map(instr => instr.id);
    try {
        const agreement = await Agreement.findByPk(agreementId, {
            include: {
                model: Performance,
                as: 'performance',
                required: true,
                include: {
                    model: Event,
                    required: true,
                    include: {
                        model: Band,
                        as: 'band',
                        required: true,
                    }
                }
            }
        });
        if (!agreement) {
            return res.status(404).send({ error: 'Agreement not found' });
        }
        const component = await Component.findOne({
            where: {
                musicianId: req.user.musician.id,
                bandId: agreement.performance.Event.band.id
            }
        })
        const hasInstrument = musicianInstrumentsId.includes(agreement.instrumentId);
        if ( agreement.musicianId !== musicianId && !hasInstrument) {
            return res.status(403).send({ error: 'Access denied. You do not have the required instrument for this agreement.' });
        } else if (agreement.musicianId !== musicianId && component) {
            return res.status(403).send({ error: 'Access denied. You are a member of the band associated with this agreement.' });
        }
        next();
    } catch (error) {
        console.error('Error checking required instrument:', error);
        res.status(500).send({ error: 'Error checking required instrument' });
    }
}

// Middleware to check if the authenticated musician has the requirement to apply to the agreement (is not the owner, has the required instrument, not applied before, is not a member of the band and is open or after the event deadline)
const hasRequirementToApply = async (req, res, next) => {
    const agreementId = req.params.agreementId;
    const musicianId = req.user.musician.id;
    const musicianInstrumentsId = req.user.musician.instruments.map(instr => instr.id);
    try {
        const agreement = await Agreement.findByPk(agreementId, {
            include: {
                model: Performance,
                as: 'performance',
                required: true,
                include: {
                    model: Event,
                    required: true,
                    include: {
                        model: Band,
                        as: 'band',
                        required: true,
                    }
                }
            }
        });
        if (!agreement) {
            return res.status(404).send({ error: 'Agreement not found' });
        }
        const component = await Component.findOne({
            where: {
                musicianId: req.user.musician.id,
                bandId: agreement.performance.Event.band.id
            }
        })
        const hasInstrument = musicianInstrumentsId.includes(agreement.instrumentId);
        const isAfterDeadline = new Date() > new Date(agreement.performance.Event.date);
        if ( agreement.musicianId === musicianId) {
            return res.status(403).send({ error: 'Access denied. You are the owner of this agreement.' });
        } else if (!hasInstrument) {
            return res.status(403).send({ error: 'Access denied. You do not have the required instrument for this agreement.' });
        } else if (component) {
            return res.status(403).send({ error: 'Access denied. You are a member of the band associated with this agreement.' });
        } else if (agreement.status !== 'open' || isAfterDeadline) {
            return res.status(403).send({ error: 'Access denied. This agreement is not open for applications.' });
        } else {            
        const existingApplication = await Application.findOne({
                where: {
                    musicianId: musicianId,
                    agreementId: agreementId
                }
            });
            if (existingApplication) {
                return res.status(403).send({ error: 'Access denied. You have already applied to this agreement.' });
            }
        }
        next();
        
    } catch (error) {
        console.error('Error checking requirement to apply:', error);
        res.status(500).send({ error: 'Error checking requirement to apply' });
    }
}

// Middleware to check if the agremeent has some aproved application
const hasNoApprovedApplication = async (req, res, next) => {
    const agreementId = req.params.agreementId;
    try {
        const agreement = await Agreement.findByPk(agreementId, {
            include: {
                model: Application,
                as: 'applications',
                required: false,
                where: {
                    status: 'accepted'
                }
            }
        });
        if (!agreement) {
            return res.status(404).send({ error: 'Agreement not found' });
        }
        if (agreement.applications.length > 0) {
            return res.status(403).send({ error: 'Access denied. This agreement has approved applications.' });
        }
        next();
    } catch (error) {
        console.error('Error checking approved applications:', error);
        res.status(500).send({ error: 'Error checking approved applications' });
    }
}

// Middleware to ensure an application can be rated
// Rules: must belong to agreement, be musician_apply, be accepted and belong to a finished event
const canRateApplication = async (req, res, next) => {
    const agreementId = req.params.agreementId;
    const applicationId = req.params.applicationId;

    try {
        const application = await Application.findOne({
            where: {
                id: applicationId,
                agreementId
            },
            include: {
                model: Agreement,
                as: 'agreement',
                required: true,
                include: {
                    model: Performance,
                    as: 'performance',
                    required: true,
                    include: {
                        model: Event,
                        required: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).send({ error: 'Application not found' });
        }

        if (application.type !== 'musician_apply') {
            return res.status(403).send({ error: 'Only musician applications can be rated' });
        }

        if (application.status !== 'accepted') {
            return res.status(403).send({ error: 'Only accepted applications can be rated' });
        }

        const event = application.agreement.performance.Event;
        const eventEndDate = new Date(event.endDate || event.date)
            .toISOString()
            .slice(0, 10);
        const eventEndTime = (event.endTime || event.initialTime || '00:00:00').slice(0, 8);
        const eventEndDateTime = new Date(`${eventEndDate}T${eventEndTime}`);

        if (eventEndDateTime > new Date()) {
            return res.status(403).send({ error: 'Application can only be rated after the event has ended' });
        }

        req.applicationToRate = application;
        next();
    } catch (error) {
        console.error('Error checking if application can be rated:', error);
        res.status(500).send({ error: 'Error checking if application can be rated' });
    }
}

// Middleware to ensure application status can only be updated before event starts
const canUpdateApplicationStatus = async (req, res, next) => {
    const agreementId = req.params.agreementId;
    const applicationId = req.params.applicationId;

    try {
        const application = await Application.findOne({
            where: {
                id: applicationId,
                agreementId
            },
            include: {
                model: Agreement,
                as: 'agreement',
                required: true,
                include: {
                    model: Performance,
                    as: 'performance',
                    required: true,
                    include: {
                        model: Event,
                        required: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).send({ error: 'Application not found' });
        }

        const event = application.agreement.performance.Event;
        const startDate = new Date(event.date);
        const [hours, minutes, seconds] = (event.initialTime || '00:00:00').split(':').map(Number);
        startDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);

        if (startDate <= new Date()) {
            return res.status(403).send({ error: 'Application status can only be updated before the event starts' });
        }

        next();
    } catch (error) {
        console.error('Error checking if application status can be updated:', error);
        res.status(500).send({ error: 'Error checking if application status can be updated' });
    }
}

export { canRateApplication, canUpdateApplicationStatus, hasNoApprovedApplication, hasRequirementToApply, hasRequirementToSee, isAgreementOwner, isEventAdmin };

