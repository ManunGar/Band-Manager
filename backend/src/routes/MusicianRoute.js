import MusicianController from "../controllers/MusicianController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { handleValidation } from "../validations/HandleValidation.js"
import * as MusicianValidation from "../validations/MusicianValidation.js"

const loadFileRoutes = function (app) {
    // List visible musicians route
    app.route('/musicians')
        .get(
            isLoggedIn,
            MusicianValidation.listMusicians,
            handleValidation,
            MusicianController.listMusicians
        )

    // Add instruments to musician route
    app.route('/musicians/instruments')
        .post(
            isLoggedIn,
            MusicianValidation.addInstruments,
            handleValidation,
            MusicianController.addInstrumentsToMusician
        )

    // Get musician profile route
    app.route('/musicians/:musicianId/profile')
        .get(
            isLoggedIn,
            MusicianValidation.getProfile,
            handleValidation,
            MusicianController.getMusicianProfile
        )

    // List musician contracts route
    app.route('/musicians/:musicianId/contracts')
        .get(
            isLoggedIn,
            MusicianValidation.listContracts,
            handleValidation,
            MusicianController.listMusicianContracts
        )
    
    // Update musician account visibility route
    app.route('/musicians/account/visibility')
        .put(
            isLoggedIn,
            MusicianValidation.updateVisibility,
            handleValidation,
            MusicianController.updateVisibility
        )
}

export default loadFileRoutes