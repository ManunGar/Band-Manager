import { check } from "express-validator";
import { Band } from "../models/sequelize.js";
import { checkFileIsImage, checkFileMaxSize } from "./FileValidationHelper.js";

const maxFileSize = 2 * 1024 * 1024 // 2MB

const _bandNameUnique = async (value, { req }) => {
    try {
        const existingBand = await Band.findOne({ where: { name: value } });
        if (existingBand) {
            return Promise.reject(new Error('Band name already in use'));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}

const create = [
    check('name')
        .exists().withMessage('Band name is required')
        .isString().withMessage('Band name must be a string')
        .notEmpty().withMessage('Band name cannot be empty')
        .custom(_bandNameUnique),
    check('location')
        .exists().withMessage('Location is required')
        .isString().withMessage('Location must be a string')
        .notEmpty().withMessage('Location cannot be empty'),
    check('phone')
        .exists().withMessage('Phone number is required')
        .isString().withMessage('Phone number must be a string')
        .notEmpty().withMessage('Phone number cannot be empty'),
    check('type')
        .exists().withMessage('Band type is required')
        .isString().withMessage('Band type must be a string')
        .notEmpty().withMessage('Band type cannot be empty'),
    check('profile_picture')
        .optional()
        .custom((value, { req }) => {
            return checkFileIsImage(req, 'profile_picture')
        }).withMessage('Sube una imagen con formato (jpeg, png).'),
    check('profile_picture').optional().custom((value, { req }) => {
        return checkFileMaxSize(req, 'profile_picture', maxFileSize)
    }).withMessage('El tamaño del archivo supera ' + maxFileSize / 1000000 + 'MB')
]

export { create };
