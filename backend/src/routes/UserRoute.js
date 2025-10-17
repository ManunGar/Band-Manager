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
    // Musician login route
    app.route('/login/musician')
        .post(
            UserValidation.login,
            handleValidation,
            UserController.loginMusician
        )
    // Edit user details route
    app.route('/user/edit')
        .put(
            UserValidation.update,
            handleValidation,
            UserController.editUserDetails
        )
}

export default loadFileRoutes