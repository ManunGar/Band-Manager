import ComponentController from "../controllers/ComponentController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { isInTheSameBand, isMeOrAdmin } from "../middleware/ComponentMiddleware.js"
import * as ComponentValidation from "../validations/ComponentValidation.js"
import { handleValidation } from '../validations/HandleValidation.js'

const loadFileRoutes = function (app) { 
    
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

}

export default loadFileRoutes