import InstrumentController from "../controllers/InstrumentController.js"


const loadFileRoutes = function (app) {
    // List instruments route
    app.route('/instruments')
        .get(
            // No authentication required to list instruments
            InstrumentController.listInstruments
        )
}

export default loadFileRoutes