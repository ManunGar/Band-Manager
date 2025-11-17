import BandController from "../controllers/BandController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import * as BandValidation from "../validations/BandValidation.js"
import { handleValidation } from '../validations/HandleValidation.js'

const loadFileRoutes = function (app) {
    // List my bands route
    app.route('/bands/mine')
        .get(
            isLoggedIn,
            BandController.listMyBands
        )
    // Create band route
    app.route('/bands')
        .post(
            isLoggedIn,
            BandValidation.create,
            handleValidation,
            BandController.createBand
        )
}

export default loadFileRoutes