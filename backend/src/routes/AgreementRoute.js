import AgreementController from "../controllers/AgreementController.js";
import { canInviteMusician, canRateApplication, canUpdateApplicationStatus, hasNoApprovedApplication, hasRequirementToApply, hasRequirementToSee, isAgreementOwner, isEventAdmin, isInvitedMusician } from "../middleware/AgreementMiddleware.js";
import { isLoggedIn } from "../middleware/AuthMiddleware.js";
import * as AgreementValidation from "../validations/AgreementValidation.js";
import { handleValidation } from '../validations/HandleValidation.js';


const loadFileRoutes = function (app) {

    // Create and list agreements route
    app.route('/agreements')
        .post(
            isLoggedIn,
            isEventAdmin,
            AgreementValidation.create,
            handleValidation,
            AgreementController.createAgreement
        )
        .get(
            isLoggedIn,
            AgreementController.listAgreements
        )

    // List me agreements route
    app.get('/agreements/me',
        isLoggedIn,
        AgreementController.listMyAgreements
    );

    // List me applications route
    app.get('/applications/me',
        isLoggedIn,
        AgreementController.listMyApplications
    )

    // Get, update and delete agreement by ID route
    app.route('/agreements/:agreementId')
        .get(
            isLoggedIn,
            hasRequirementToSee,
            AgreementController.getAgreement
        )
        .put(
            isLoggedIn,
            isAgreementOwner,
            hasNoApprovedApplication,
            AgreementValidation.update,
            handleValidation,
            AgreementController.updateAgreement
        )
        .delete(
            isLoggedIn,
            isAgreementOwner,
            hasNoApprovedApplication,
            AgreementController.deleteAgreement
        )

    // Apply to an agreement route
    app.post('/agreements/:agreementId/apply',
        isLoggedIn,
        hasRequirementToApply,
        AgreementController.applyToAgreement
    );

    // Approve or reject an application route
    app.put('/agreements/:agreementId/applications/:applicationId',
        isLoggedIn,
        isAgreementOwner,
        canUpdateApplicationStatus,
        AgreementValidation.updateApplicationStatus,
        handleValidation,
        AgreementController.updateApplicationStatus
    );

    // Rate an accepted application when the related event has already ended
    app.put('/agreements/:agreementId/applications/:applicationId/rate',
        isLoggedIn,
        isAgreementOwner,
        canRateApplication,
        AgreementValidation.rateApplication,
        handleValidation,
        AgreementController.rateApplication
    );

    // Invite a musician to an agreement (creates a band_invite application)
    app.post('/agreements/:agreementId/invite',
        isLoggedIn,
        isAgreementOwner,
        canInviteMusician,
        AgreementValidation.inviteMusician,
        handleValidation,
        AgreementController.inviteMusician
    );

    // Musician responds to a band_invite (accept or reject)
    app.put('/applications/:applicationId/respond',
        isLoggedIn,
        isInvitedMusician,
        AgreementValidation.respondToInvite,
        handleValidation,
        AgreementController.respondToInvite
    );

    // List future performances where the authenticated musician is a band admin (no agreements yet)
    app.get('/performances/admin',
        isLoggedIn,
        AgreementController.listAdminPerformances
    );

}

export default loadFileRoutes;
