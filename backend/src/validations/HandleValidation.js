import { validationResult } from "express-validator";
import fs from 'fs';

const handleValidation = async (req, res, next) => {
    const err = validationResult(req)
    if (err.errors.length > 0) {
        if (req.file && fs.existsSync(req.file.path)) await fs.unlinkSync(req.file.path) // Delete local file after upload
        res.status(422).send(err)
    } else {
        next()
    }
}

export { handleValidation };

