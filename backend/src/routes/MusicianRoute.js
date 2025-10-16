import MusicianController from "../controllers/MusicianController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { handleValidation } from "../validations/HandleValidation.js"
import * as MusicianValidation from "../validations/MusicianValidation.js"

const loadFileRoutes = function (app) {
    // Add instruments to musician route
    app.route('/musicians/instruments')
        .post(
            isLoggedIn,
            MusicianValidation.addInstruments,
            handleValidation,
            MusicianController.addInstrumentsToMusician
        )
}

export default loadFileRoutes