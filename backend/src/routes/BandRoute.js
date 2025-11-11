import BandController from "../controllers/BandController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"

const loadFileRoutes = function (app) {
    // List my bands route
    app.route('/bands/mine')
        .get(
            isLoggedIn,
            BandController.listMyBands
        )
}

export default loadFileRoutes