import UserController from '../controllers/UserController.js'
import { isLoggedIn } from '../middleware/AuthMiddleware.js'
import { handleFilesUpload } from '../middleware/FileHandlerMiddleware.js'
import { handleValidation } from '../validations/HandleValidation.js'
import * as UserValidation from '../validations/UserValidation.js'

const loadFileRoutes = function (app) {
    app.route('/validate/provider-token')
        .post(
            UserValidation.validateProviderToken,
            handleValidation,
            UserController.isValidProviderToken
        );
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
            isLoggedIn,
            UserValidation.update,
            handleValidation,
            UserController.editUserDetails
        )
    // Edit profile picture route
    app.route('/user/edit/profile-picture')
        .put(
            isLoggedIn,
            handleFilesUpload('profile_picture', process.env.PROFILE_PICTURE_FOLDER, null, null),
            UserValidation.updateProfilePicture,
            handleValidation,
            UserController.editProfilePicture
        )
    // Delete profile picture route
    app.route('/user/delete/profile-picture')
        .put(
            isLoggedIn,
            UserController.deleteProfilePicture
        )
}

export default loadFileRoutes