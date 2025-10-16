import crypto from "crypto";
import { Musician, User } from "../models/sequelize.js";

// Function to find a user by token
const findByToken = async (token) => {
    const user = await User.findOne({ where: { token } });
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


// This function creates a new player token
const _createUserToken = () => {
    // Logic to create a player token
    return crypto.randomBytes(16).toString('hex');
}


const UserController = {
    findByToken,
    registerMusician,
};

export default UserController;