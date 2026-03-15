import BandController from "../controllers/BandController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { isBandAdmin, isBandMember, isNotBandMember } from "../middleware/BandMiddleware.js"
import { handleFilesUpload, parseBooleanFields, parseFloatFields, parseJSONFields } from "../middleware/FileHandlerMiddleware.js"
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
            handleFilesUpload('profile_picture', process.env.BAND_PROFILE_PICTURE_FOLDER),
            parseJSONFields('instruments'),
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
        .put(
            isLoggedIn,
            isBandAdmin, // Ensure the user is an admin of the band
            handleFilesUpload('profile_picture', process.env.BAND_PROFILE_PICTURE_FOLDER),
            parseBooleanFields('delete_profile_picture'),
            BandValidation.update,
            handleValidation,
            BandController.updateBand
        )
        .delete(
            isLoggedIn,
            isBandAdmin, // Ensure the user is an admin of the band
            BandController.deleteBand
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

    // Event's bands route
    app.route('/bands/:bandId/events')
        .post(
            isLoggedIn,
            isBandAdmin, // Ensure the user is an admin of the band
            handleFilesUpload('picture', process.env.PERFORMANCE_PICTURE_FOLDER),
            parseFloatFields('latitude', 'longitude'),
            parseJSONFields('instruments'),
            BandValidation.addEvent,
            handleValidation,
            BandController.addEventToBand
        )
}

export default loadFileRoutes