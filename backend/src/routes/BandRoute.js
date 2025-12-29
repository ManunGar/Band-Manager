import BandController from "../controllers/BandController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { isBandMember, isNotBandMember } from "../middleware/BandMiddleware.js"
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
    // Get, update, delete band routes
    app.route('/bands/:bandId')
        .get(
            isLoggedIn,
            isBandMember, // Ensure the user is a member of the band
            BandController.findBandById
        )
    // Get by code route
    app.route('/bands/code/:bandCode')
        .get(
            isLoggedIn,
            BandController.findBandByCode
        )
    
    // Join band route
    app.route('/bands/join/:bandId')
        .post(
            isLoggedIn,
            isNotBandMember, // Ensure the user is not already a member of the band
            BandValidation.join,
            handleValidation,
            BandController.joinBand
        )
}

export default loadFileRoutes