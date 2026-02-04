import EventController from "../controllers/EventController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"

const loadFileRoutes = function (app) {
    // List events route
    app.route('/events')
        .get(
            isLoggedIn,
            EventController.listEvents
        )
}

export default loadFileRoutes