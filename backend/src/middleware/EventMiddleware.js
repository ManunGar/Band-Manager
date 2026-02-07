import { Band, Component, Event } from "../models/sequelize.js";


const isEventAdmin = async (req, res, next) => {
    const eventId = req.params.eventId;
    const musicianId = req.user.musician.id;
    try {
        const event = await Event.findByPk(eventId, {
            include: {
                model: Band,
                as: 'band',
                include: {
                    model: Component,
                    as: 'components',
                    where: {
                        musicianId: musicianId,
                        administrator: true
                    }
                }
            }
        });
        if (!event) {
            return res.status(403).send({ error: 'Access denied. You are not an admin of this event.' });
        }
        next();
    } catch (error) {
        console.error('Error checking event admin status:', error);
        res.status(500).send({ error: 'Error checking event admin status' });
    }
}

export { isEventAdmin };
