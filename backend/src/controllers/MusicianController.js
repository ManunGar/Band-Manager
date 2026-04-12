import { Op, Sequelize } from "sequelize";
import { Agreement, Application, Band, Component, Event, Instrument, Musician, Performance, User } from "../models/sequelize.js";

const _getProfileBaseData = async (musicianId) => {
    return Musician.findByPk(musicianId, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'location', 'latitude', 'longitude', 'phone', 'email', 'profile_picture']
            },
            {
                model: Instrument,
                as: 'instruments',
                through: { attributes: ['level'] }
            },
            {
                model: Component,
                as: 'components',
                include: [{
                    model: Band,
                    as: 'band',
                    attributes: ['id', 'name', 'profile_picture']
                }]
            }
        ]
    });
}

// Function to get a musician profile when it is public or belongs to the authenticated musician
const getMusicianProfile = async (req, res) => {
    const authenticatedMusicianId = req.user.musician.id;
    const musicianId = parseInt(req.params.musicianId, 10);

    try {
        const musician = await _getProfileBaseData(musicianId);
        if (!musician) {
            return res.status(404).send({ error: 'Musician not found' });
        }

        if (!_canViewMusicianProfile(authenticatedMusicianId, musician)) {
            return res.status(403).send({ error: 'Access denied. This profile is private.' });
        }

        const profile = musician.toJSON();
        profile.averageRate = await _getMusicianAverageRate(musician.id);
        profile.isOwner = authenticatedMusicianId === musician.id;

        return res.status(200).send(profile);
    } catch (error) {
        console.error('Error in getMusicianProfile:', error);
        return res.status(500).send({ error: 'Error fetching musician profile' });
    }
};

// Function to list visible musicians with their average rating
const listMusicians = async (req, res) => {
    const loggedMusicianId = req.user.musician.id;
    const search = req.query.search ? req.query.search.trim() : null;
    const instrumentId = req.query.instrument ? parseInt(req.query.instrument, 10) : null;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    try {
        const userWhere = {};
        if (search) {
            userWhere[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        const musicianWhere = {
            isProfilePrivate: false,
            id: {
                [Op.ne]: loggedMusicianId
            }
        };

        if (Number.isInteger(instrumentId)) {
            musicianWhere[Op.and] = [
                Sequelize.literal(`EXISTS (
                    SELECT 1
                    FROM MusicianLevels AS ml
                    WHERE ml.musicianId = Musician.id
                        AND ml.instrumentId = ${instrumentId}
                )`)
            ];
        }

        const musicians = await Musician.findAndCountAll({
            where: musicianWhere,
            distinct: true,
            col: 'id',
            limit,
            offset,
            attributes: {
                include: [[
                    Sequelize.literal(`(
                        SELECT ROUND(AVG(a.rate), 2)
                        FROM Applications AS a
                        WHERE a.musicianId = Musician.id
                            AND a.status = 'accepted'
                            AND a.type = 'musician_apply'
                            AND a.rate IS NOT NULL
                    )`),
                    'averageRate'
                ]]
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'location', 'profile_picture'],
                    where: userWhere,
                    required: true
                },
                {
                    model: Instrument,
                    as: 'instruments'
                }
            ],
            order: [[Sequelize.literal('averageRate IS NULL'), 'ASC'], [Sequelize.literal('averageRate'), 'DESC']]
        });

        return res.status(200).send({
            data: musicians.rows,
            total: musicians.count,
            limit,
            offset,
            loaded: offset + musicians.rows.length,
            hasMore: offset + musicians.rows.length < musicians.count,
            nextOffset: offset + musicians.rows.length < musicians.count
                ? offset + limit
                : null
        });
    } catch (error) {
        console.error('Error in listMusicians:', error);
        return res.status(500).send({ error: 'Error listing musicians' });
    }
}

// Function to list contracts where a musician has participated (accepted application)
const listMusicianContracts = async (req, res) => {
    const authenticatedMusicianId = req.user.musician.id;
    const musicianId = parseInt(req.params.musicianId, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const instrumentId = req.query.instrument ? parseInt(req.query.instrument, 10) : null;

    try {
        const musician = await Musician.findByPk(musicianId, {
            attributes: ['id', 'isProfilePrivate']
        });

        if (!musician) {
            return res.status(404).send({ error: 'Musician not found' });
        }

        if (!_canViewMusicianProfile(authenticatedMusicianId, musician)) {
            return res.status(403).send({ error: 'Access denied. This profile is private.' });
        }

        const agreementWhere = {};
        if (Number.isInteger(instrumentId)) {
            agreementWhere.instrumentId = instrumentId;
        }

        const contracts = await Application.findAndCountAll({
            where: {
                musicianId,
                status: 'accepted',
            },
            limit,
            offset,
            include: [{
                model: Agreement,
                as: 'agreement',
                required: true,
                where: agreementWhere,
                include: [{
                    model: Instrument,
                    as: 'instrument',
                    attributes: ['id', 'name', 'image'],
                    required: true
                }, {
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
                            required: true
                        }
                    }
                }]
            }],
            order: [
                [Sequelize.literal('`agreement->performance->Event`.`date`'), 'DESC'],
                [Sequelize.literal('`agreement->performance->Event`.`initialTime`'), 'DESC']
            ]
        });

        return res.status(200).send({
            data: contracts.rows,
            total: contracts.count,
            limit,
            offset,
            loaded: offset + contracts.rows.length,
            hasMore: offset + contracts.rows.length < contracts.count,
            nextOffset: offset + contracts.rows.length < contracts.count
                ? offset + limit
                : null
        });
    } catch (error) {
        console.error('Error in listMusicianContracts:', error);
        return res.status(500).send({ error: 'Error listing musician contracts' });
    }
}

// Function to update profile visibility of the authenticated musician
const updateVisibility = async (req, res) => {
    const musicianId = req.user.musician.id;
    const isProfilePrivate = req.body.isProfilePrivate;

    try {
        const musician = await Musician.findByPk(musicianId);
        if (!musician) {
            return res.status(404).send({ error: 'Musician not found' });
        }

        await musician.update({ isProfilePrivate });

        return res.status(200).send({
            message: 'Musician profile visibility updated successfully',
            musician: {
                id: musician.id,
                isProfilePrivate: musician.isProfilePrivate
            }
        });
    } catch (error) {
        console.error('Error in updateVisibility:', error);
        return res.status(500).send({ error: 'Error updating musician profile visibility' });
    }
}

// Function to add instruments to a musician
const addInstrumentsToMusician = async (req, res) => {
    const instruments = req.body.instruments; // Array of instrument IDs with levels
    const musicianId = req.user.musician.id; // Get musician ID from authenticated user
    const transaction = await Musician.sequelize.transaction();
    try {
        const musician = await Musician.findByPk(musicianId, { transaction });
        await musician.setInstruments([], { transaction }); // Clear existing instruments
        for (const [instrumentId, level] of Object.entries(instruments)) {
            const instrumentIdNum = parseInt(instrumentId, 10);
            await musician.addInstrument(instrumentIdNum, { through: { level }, transaction });
        }
        await transaction.commit();
        res.status(200).send({ message: 'Instruments added successfully' }, instruments);
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding instruments to musician:', error);
        res.status(500).send({ error: 'Error adding instruments to musician' });
    }
}

// ==================== Auxiliary Functions ====================

// Get the average rate for a musician based on their accepted applications with non-null rates, returning the average rate rounded to 2 decimal places or null if no ratings are available
const _getMusicianAverageRate = async (musicianId) => {
    const result = await Application.findOne({
        where: {
            musicianId,
            status: 'accepted',
            type: 'musician_apply',
            rate: { [Op.not]: null }
        },
        attributes: [[Sequelize.fn('AVG', Sequelize.col('rate')), 'averageRate']],
        raw: true
    });

    if (!result || result.averageRate === null) {
        return null;
    }

    return Number(Number(result.averageRate).toFixed(2));
}

// Check if the authenticated musician can view the profile of another musician based on whether they are the same musician or if the profile is public
const _canViewMusicianProfile = (authenticatedMusicianId, musician) => {
    return authenticatedMusicianId === musician.id || musician.isProfilePrivate === false;
}


const MusicianController = {
    addInstrumentsToMusician,
    getMusicianProfile,
    listMusicians,
    listMusicianContracts,
    updateVisibility
};

export default MusicianController;