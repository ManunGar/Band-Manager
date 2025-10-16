import { check } from 'express-validator';
import { User } from '../models/sequelize.js';

const _isUsernameRegistered = async (value, { req }) => {
    try {
        const user = await User.findOne({ where: { username: value } });
        if (user) {
            return Promise.reject(new Error('El nombre de usuario ya está registrado'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const _isEmailRegistered = async (value, { req }) => {
    try {
        const user = await User.findOne({ where: { email: value } });
        if (user) {
            return Promise.reject(new Error('El correo electrónico ya está registrado'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const _isBirthdayInThePast = (value, { req }) => {
    try {
        const birthday = new Date(value);
        const today = new Date();
        if (birthday >= today) {
            return Promise.reject(new Error('La fecha de nacimiento debe ser en el pasado'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const login = [
    check('username')
        .exists().withMessage('El nombre de usuario es requerido')
        .trim()
        .isLength({ min: 1 }).withMessage('El nombre de usuario no puede estar vacío')
        .isString().withMessage('El nombre de usuario debe ser texto'),
    check('password')
        .exists().withMessage('La contraseña es requerida')
        .trim()
        .isLength({ min: 1 }).withMessage('La contraseña no puede estar vacía')
        .isString().withMessage('La contraseña debe ser texto')
];

const register = [
    check('full_name')
        .exists().withMessage('El nombre completo es requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre completo debe tener al menos 2 caracteres')
        .isString().withMessage('El nombre completo debe ser texto'),
    check('username')
        .exists().withMessage('El nombre de usuario es requerido')
        .trim()
        .isLength({ min: 6 }).withMessage('El nombre de usuario debe tener al menos 6 caracteres')
        .isString().withMessage('El nombre de usuario debe ser texto')
        .custom(_isUsernameRegistered),
    check('email')
        .exists().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('El correo electrónico no es válido')
        .custom(_isEmailRegistered),
    check('location')
        .exists().withMessage('La ubicación es requerida')
        .trim()
        .isString().withMessage('La ubicación debe ser texto'),
    check('birthday')
        .exists().withMessage('La fecha de nacimiento es requerida')
        .isDate().withMessage('La fecha de nacimiento no es válida')
        .custom(_isBirthdayInThePast),
    check('phone')
        .exists().withMessage('El número de teléfono es requerido')
        .isMobilePhone('any').withMessage('El número de teléfono no es válido'),
    check('password')
        .exists().withMessage('La contraseña es requerida')
        .trim()
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .isString().withMessage('La contraseña debe ser texto'),
    check('repeatPassword')
        .exists().withMessage('Debe repetir la contraseña')
        .trim()
        .isLength({ min: 8 }).withMessage('La confirmación de contraseña debe tener al menos 8 caracteres')
        .isString().withMessage('La confirmación de contraseña debe ser texto')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
];

export { login, register };
