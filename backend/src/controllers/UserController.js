import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import { Instrument, Musician, User } from "../models/sequelize.js";

// Function to find a user by token
const findByToken = async (token) => {
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
}

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
                token: _createUserToken()
            }, { transaction });
            // Create a new musician associated with the user
            const newMusician = await Musician.create({
                userId: newUser.id,
            }, { transaction });
            // Reload musician to include associated user data
            const musician = await newMusician.reload({ include: [{ model: User, as: 'user' }], transaction });
            await transaction.commit();
            return res.status(201).send({ message: 'Musician registered successfully', musician });        
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
        console.log("🚀 ~ loginMusician ~ user:", user)
        // Check if user exists and password is correct
        const passwordMatch = user && await bcrypt.compare(password, user.password);
        if (!user || !passwordMatch) {
            return res.status(401).send({ error: 'Invalid username/email or password' });
        }
        // No generate a new token on each login to persist sessions
        return res.status(200).send({ message: 'Login successful', token: user.token });
    } catch (error) {
        console.error('Error in loginMusician:', error);
        return res.status(500).send({ error: 'Error logging in musician' });
    }
};


// This function creates a new player token
const _createUserToken = () => {
    // Logic to create a player token
    return crypto.randomBytes(16).toString('hex');
}


const UserController = {
    findByToken,
    registerMusician,
    loginMusician
};

export default UserController;