import UserController from '../controllers/UserController.js'
import { handleValidation } from '../validations/HandleValidation.js'
import * as UserValidation from '../validations/UserValidation.js'

const loadFileRoutes = function (app) {
    // Musician registration route
    app.route('/register/musician')
        .post(
            UserValidation.register,
            handleValidation,
            UserController.registerMusician
        )
}

export default loadFileRoutes