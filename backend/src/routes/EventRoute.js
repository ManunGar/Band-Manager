import EventController from "../controllers/EventController.js"
import { isLoggedIn } from "../middleware/AuthMiddleware.js"
import { isEventAdmin, isEventParticipant } from "../middleware/EventMiddleware.js"
import { handleFilesUpload, parseBooleanFields, parseFloatFields, parseJSONFields } from "../middleware/FileHandlerMiddleware.js"
import * as EventValidation from "../validations/EventValidation.js"
import { handleValidation } from "../validations/HandleValidation.js"

const loadFileRoutes = function (app) {
    // List events route
    app.route('/events')
        .get(
            isLoggedIn,
            EventController.listEvents
        )
    
    // Events CRUD routes
    app.route('/events/:eventId')
        .get(
            isLoggedIn,
            EventController.getEvent
        )
        .put(
            isLoggedIn,
            isEventAdmin, // Ensure the user is an admin of the event
            handleFilesUpload('picture', process.env.PERFORMANCE_PICTURE_FOLDER),
            parseBooleanFields('delete_picture'),
            parseFloatFields('latitude', 'longitude'),
            parseJSONFields('instruments'),
            EventValidation.update,
            handleValidation,
            EventController.editEvent
        )
        .delete(
            isLoggedIn,
            isEventAdmin,
            EventController.deleteEvent
        )

    // Components attendance route
    app.route('/events/:eventId/component-attendance')
        .put(
            isLoggedIn,
            isEventParticipant,
            EventValidation.componentAttendance,
            handleValidation,
            EventController.updateComponentAttendance
        )

    // Attendace GET and PUT route
    app.route('/events/:eventId/attendance')
        .get(
            isLoggedIn,
            isEventAdmin,
            EventController.getEventAttendance
        )
        .put(
            isLoggedIn,
            isEventAdmin,
            EventValidation.attendance,
            handleValidation,
            EventController.updateEventAttendance
        )
}

export default loadFileRoutes