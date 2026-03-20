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
        const component = await Component.findOne({
            where: {
                musicianId: req.user.musician.id,
                bandId: agreement.performance.Event.band.id
            }
        })
        if (!agreement) {
            return res.status(404).send({ error: 'Agreement not found' });
        }
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
        const component = await Component.findOne({
            where: {
                musicianId: req.user.musician.id,
                bandId: agreement.performance.Event.band.id
            }
        })
        if (!agreement) {
            return res.status(404).send({ error: 'Agreement not found' });
        }
        const hasInstrument = musicianInstrumentsId.includes(agreement.instrumentId);
        const isAfterDeadline = new Date() > new Date(agreement.performance.Event.date);
        if ( agreement.musicianId === musicianId) {
            return res.status(403).send({ error: 'Access denied. You are the owner of this agreement.' });
        } else if (!hasInstrument) {
            return res.status(403).send({ error: 'Access denied. You do not have the required instrument for this agreement.' });
        } else if (component) {
            return res.status(403).send({ error: 'Access denied. You are a member of the band associated with this agreement.' });
        } else if (agreement.status !== 'open' && !isAfterDeadline) {
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

export { hasNoApprovedApplication, hasRequirementToApply, hasRequirementToSee, isAgreementOwner, isEventAdmin };

