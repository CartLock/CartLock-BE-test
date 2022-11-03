import { Router } from "express";
import deviceConfigureController from "../controllers/device_configure.controller";
import deviceController from "../controllers/device.controller";
import authJwt from '../util/middleware/verifyJwtToken';
import { uploadToDisk, uploadToMemory } from "../util/middleware/multer.middleware";


class DeviceRoutes {
    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        //############## APP Routing #####################################
        // device configuration
        this.router.post('/getDeviceDetails', authJwt.verifyToken, deviceConfigureController.getDeviceDetails);
        this.router.post('/createDeviceConfigure', authJwt.verifyToken, deviceConfigureController.createDeviceConfigure);
        this.router.get('/getDeviceConfigure', authJwt.verifyToken, deviceConfigureController.getDeviceConfigure);
        this.router.get('/getDetailsOfDeviceConfigure', authJwt.verifyToken, deviceConfigureController.getDetailsOfDeviceConfigure);
        this.router.put('/modifyDeviceConfigure', authJwt.verifyToken, deviceConfigureController.updateDeviceConfigure);
        this.router.delete('/removeDeviceConfigure', authJwt.verifyToken, deviceConfigureController.removeDeviceConfigure);
        this.router.get('/getLockTypeInfo', authJwt.verifyToken, deviceConfigureController.getLockTypeInfo);
        this.router.get('/getDeviceConfigureFullDetails', authJwt.verifyToken, deviceConfigureController.getDeviceConfigureFullDetails);
        




        //Offline api Routing
        this.router.post("/syncOfflineCreatedDeviceConfigure", authJwt.verifyToken, deviceConfigureController.syncOfflineCreatedDeviceConfigure);
        this.router.post("/syncOfflineModifiedDeviceConfigure", authJwt.verifyToken, deviceConfigureController.syncOfflineModifiedDeviceConfigure);
        this.router.post("/syncOfflineRemovedDeviceConfigure", authJwt.verifyToken, deviceConfigureController.syncOfflineRemovedDeviceConfigure);
        
        // Support ticket routing
        this.router.post('/generateDeviceSupport', authJwt.verifyToken, deviceController.generateDeviceSupport);
        this.router.put('/supportTicketResolved', authJwt.verifyToken, deviceController.supportTicketResolved);
        
    }
}

export default new DeviceRoutes;
