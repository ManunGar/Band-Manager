import ComponentController from "../controllers/ComponentController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { isAdminInSameBand, isInTheSameBand, isMeOrAdmin } from "../middleware/ComponentMiddleware.js"
import * as ComponentValidation from "../validations/ComponentValidation.js"
import { handleValidation } from '../validations/HandleValidation.js'

const loadFileRoutes = function (app) { 
    // Routes for component operations
    app.route('/components/:componentId')
        .get(
            isLoggedIn,
            isInTheSameBand,
            ComponentController.findComponentById
        )
        .put(
            isLoggedIn,
            isInTheSameBand,
            isMeOrAdmin,
            ComponentValidation.update,
            handleValidation,
            ComponentController.updateComponentInstruments
        )
    // Route to promote a component to administrator
    app.route('/components/:componentId/promote')
        .put(
            isLoggedIn,
            isAdminInSameBand,
            ComponentController.promoteToAdministrator
        )
    // Route for a component to leave the band
    app.route('/components/:componentId/leave')
        .delete(
            isLoggedIn,
            isMeOrAdmin,
            ComponentController.leaveBand
        )
        

}

export default loadFileRoutes