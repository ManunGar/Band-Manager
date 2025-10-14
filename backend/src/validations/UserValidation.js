import { check } from 'express-validator';

const _isUsernameRegistered = async () => {
    
}

const _isEmailRegistered = async () => {

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
        .isString().withMessage('El nombre de usuario debe ser texto'),
    check('email')
        .exists().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('El correo electrónico no es válido'),
    check('location')
        .exists().withMessage('La ubicación es requerida')
        .trim()
        .isString().withMessage('La ubicación debe ser texto'),
    check('birthday')
        .exists().withMessage('La fecha de nacimiento es requerida')
        .isDate().withMessage('La fecha de nacimiento no es válida'),
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
