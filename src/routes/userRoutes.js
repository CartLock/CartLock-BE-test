import { Router } from "express";
import userController from "../controllers/user.controller";
import otaController from "../controllers/ota.controller";
import authJwt from '../util/middleware/verifyJwtToken';
import { uploadToDisk, uploadToMemory } from "../util/middleware/multer.middleware";


class UserRoutes {
    constructor() {
        this.router = Router();  
        this.routes();
    }
    routes() {
        //############## APP Routing #####################################
        this.router.post('/customerRegistration', userController.cutomerRegister);
        this.router.post('/login', userController.userLogin);
        this.router.post('/forgetPassword', userController.forgotPassword);
        this.router.get('/resetPassword/:companyId/:userName', userController.getResetpasswordTemplate)//sauraImple
        this.router.post("/resetPassword",userController.resetPasswordMobile);//sauravImple
        this.router.put("/resetPassword", authJwt.verifyToken, userController.resetPassword);
        this.router.delete("/logout", authJwt.verifyToken, userController.logout);
        this.router.get("/getActiveLocks", authJwt.verifyToken, userController.getActiveLocks);
        this.router.get("/getAllStatus", authJwt.verifyToken, userController.getAllStatus);
        this.router.put("/updateLanguage", authJwt.verifyToken, userController.updateLanguage);

        this.router.post("/ota", otaController.getLatestDetails);

        //Offline api Routing
        this.router.get("/getCompanySetting", authJwt.verifyToken, userController.getCompanySetting);
        // log routing
        this.router.post('/createActivityLog', authJwt.verifyToken, userController.createActivityLog);
        this.router.post('/createActivityLogWithoutLogin', userController.createActivityLog);
        
        // device status routing
        this.router.put("/changeDeviceKeyStatus", authJwt.verifyToken, userController.changeDeviceKeyStatus);
        this.router.put("/disableOneTimeUsedEkey", authJwt.verifyToken, userController.disableOneTimeUsedEkey);
        
        //Payment gateway routing
        this.router.get("/initializeBraintree", userController.intializeGateway);
        this.router.get("/confirmBraintree", userController.processingPayment);
            
    
    
    
    }
}

export default new UserRoutes;
