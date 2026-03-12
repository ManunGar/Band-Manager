import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import { addFilenameToBody, addProfilePictureToBody, deleteFileFromCloudinary } from "../middleware/FileHandlerMiddleware.js";
import { Instrument, Musician, User } from "../models/sequelize.js";

// Function to find a user by token
const findByToken = async (token) => {
    try {
        const user = await User.findOne({
            where: { token },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Musician,
                    as: 'musician',
                    include: [
                        { model: Instrument, as: 'instruments' }
                    ]
                }
            ]
        });
        if (!user) {
            throw new Error('Token not valid');
        }
        return user;
    } catch (error) {
        console.error('Error in findByToken:', error);
        throw new Error('Error finding player by token: ' + error.message);
    }
}

// Function to check if a provider token is valid
const isValidProviderToken = async (req, res) => {
    try {
        const token = req.body.token;
        const user = await User.findOne(
            {
                where: { token },
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Musician,
                        as: 'musician',
                        include: [{ model: Instrument, as: 'instruments' }]
                    }
                ]
            });
        if (!user) {
            return res.status(401).send({ error: 'Invalid provider token' });
        }
        return res.status(200).send({ message: 'Provider token is valid', user });
    } catch (error) {
        console.error('Error in isValidProviderToken:', error);
        return res.status(500).send({ error: 'Error validating provider token' });
    }
};

// Function to handle musician registration
const registerMusician = async (req, res) => {
    const transaction = await User.sequelize.transaction();
    try {
        // Create a new user
        const newUser = await User.create({
            full_name: req.body.full_name,
            username: req.body.username,
            email: req.body.email,
            location: req.body.location,
            birthday: req.body.birthday,
            phone: req.body.phone,
            password: req.body.password,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            token: _createUserToken()
        }, { transaction });
        // Create a new musician associated with the user
        await Musician.create({
            userId: newUser.id,
        }, { transaction });
        // Handle profile picture upload if provided
        if (req.file) {
            await addFilenameToBody(req, res, 'profile_picture', User, 'userId', 'users');
            await newUser.update({ profile_picture: req.body.profile_picture }, { transaction });
        }

        // Reload user to include musician and instruments associations
        await transaction.commit();
        const user = await User.findByPk(newUser.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Musician, as: 'musician', include: [{ model: Instrument, as: 'instruments' }] }]
        });
        return res.status(201).send({ message: 'Musician registered successfully', user });
    } catch (error) {
        await transaction.rollback();
        console.error('Error in registerMusician:', error);
        return res.status(500).send({ error: 'Error registering musician' });
    }
}

// Function to handle musician login
const loginMusician = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Allow login with either username or email
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: username }
                ]
            }
        });
        // Check if user exists and password is correct
        const passwordMatch = user && await bcrypt.compare(password, user.password);
        if (!user || !passwordMatch) {
            return res.status(401).send({ error: 'Invalid username/email or password' });
        }
        // Reload user to include musician and instruments associations
        const validUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Musician, as: 'musician', include: [{ model: Instrument, as: 'instruments' }] }]
        });
        // No generate a new token on each login to persist sessions
        return res.status(200).send({ message: 'Login successful', user: validUser });
    } catch (error) {
        console.error('Error in loginMusician:', error);
        return res.status(500).send({ error: 'Error logging in musician' });
    }
};

// Function to edit user details
const editUserDetails = async (req, res) => {
    const user = req.user;
    const updatedData = req.body;
    try {
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Musician, as: 'musician', include: [{ model: Instrument, as: 'instruments' }] }]
        });

        let updatedProfilePicture = user.profile_picture;

        // Handle profile picture deletion if requested
        if (req.body.delete_profile_picture === true) {
            await deleteFileFromCloudinary(updatedUser.profile_picture, 'users');
            updatedProfilePicture = null;
        }
        // Handle profile picture upload if provided
        else if (req.file) {
            await addProfilePictureToBody(req);
            updatedProfilePicture = req.body.profile_picture;
        }

        await updatedUser.update(req.body);
        await updatedUser.update({ profile_picture: updatedProfilePicture });
        res.status(200).send({ message: 'User details updated successfully', user: updatedUser });

    } catch (error) {
        console.error('Error in editUserDetails:', error);
        res.status(500).send({ error: 'Error editing user details' });
    }
}

// Function to change user password
const changePassword = async (req, res) => {
    const currentUser = req.user;
    const { currentPassword, password } = req.body;
    try {
        const user = await User.findByPk(currentUser.id);
        // Check if current password is correct
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ error: 'Current password is incorrect' });
        }
        // Update password
        await user.update({ password: password });
        res.status(200).send({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).send({ error: 'Error changing password' });
    }
}

// This function creates a new player token
const _createUserToken = () => {
    // Logic to create a player token
    return crypto.randomBytes(16).toString('hex');
}


const UserController = {
    findByToken,
    registerMusician,
    loginMusician,
    editUserDetails,
    isValidProviderToken,
    changePassword
};

export default UserController;