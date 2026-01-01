import ComponentController from "../controllers/ComponentController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { isInTheSameBand } from "../middleware/ComponentMiddleware.js"

const loadFileRoutes = function (app) { 
    
    app.route('/components/:componentId')
        .get(
            isLoggedIn,
            isInTheSameBand,
            ComponentController.findComponentById
    )

}

export default loadFileRoutes