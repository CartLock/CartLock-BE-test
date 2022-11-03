import { Router } from "express";
import userController from "../../controllers/admin/user.controller";
import companyController from "../../controllers/admin/company.controller";
import deviceGroupController from "../../controllers/admin/deviceGroup.controller";
import supportTicketController from "../../controllers/admin/supportTicket.controller";
import settingCompanyController from "../../controllers/admin/SettingCompany.controller";
import otaController from "../../controllers/admin/ota.controller";
import authJwt from '../../util/middleware/verifyJwtToken';
import { uploadToDisk, uploadToMemory } from "../../util/middleware/multer.middleware";

 
class AdminRoutes {
    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        //############## USERS ROUTS #####################################
        this.router.post('/login', userController.userLogin);
        this.router.post('/forgetPassword', userController.forgotPassword);
        this.router.post("/resetPassword",  userController.resetPassword);
        //reset password from web
        this.router.post("/webResetPassword",userController.resetPasswordMobile);//sauravImple
        this.router.delete("/logout", authJwt.verifyToken, userController.logout);
        this.router.get("/getAllUsers", authJwt.verifyToken, userController.getAllUsers);
        this.router.post("/addUser", authJwt.verifyToken, userController.addUser);
        this.router.get("/getUserDetails", authJwt.verifyToken, userController.getUserDetails);
        this.router.put("/modifyUserDetails", authJwt.verifyToken, userController.modifyUserDetails);
        this.router.delete("/deleteUser", authJwt.verifyToken, userController.deleteUser);
        this.router.post("/assignKeyToUser", authJwt.verifyToken, userController.assignKeyToUser);
        this.router.get("/getAssignedEkeys", authJwt.verifyToken, userController.getAssignedEkeys);
        this.router.delete("/deleteAssignedEkey", authJwt.verifyToken, userController.deleteAssignedEkey);
        this.router.get("/getEkeys", authJwt.verifyToken, userController.getEkeys);
        this.router.get("/getAllTimeZone", authJwt.verifyToken, userController.getAllTimeZone);
        this.router.get("/getDeviceDetails", authJwt.verifyToken, userController.getDeviceDetails);
        this.router.get("/getUserPermissions", authJwt.verifyToken, userController.getUserPermissions);
        this.router.get("/getRoles", authJwt.verifyToken, userController.getRoles);
        this.router.get("/getUsers", authJwt.verifyToken, userController.getUsers);
        this.router.post("/createRole", authJwt.verifyToken, userController.createRole);
        this.router.put("/modifyRole", authJwt.verifyToken, userController.modifyRole);
        this.router.get("/getRoleDetails", authJwt.verifyToken, userController.getRoleDetails);
        this.router.delete("/deleteRole", authJwt.verifyToken, userController.deleteRole);
        this.router.post("/assignRoleToUser", authJwt.verifyToken, userController.assignRoleToUser);
        this.router.delete("/removeRoleFromUser", authJwt.verifyToken, userController.removeRoleFromUser);
        this.router.post("/webForgotPassword", userController.webForgotPassword);
        this.router.post("/webReSetPassword", userController.webReSetPassword);
        this.router.delete("/deleteAssignedGroup", authJwt.verifyToken, userController.deleteAssignedGroup);
        
        
        

        // ---- COMPANY ROUTS ------
        this.router.post("/addCompany", authJwt.verifyToken, companyController.addCompany);
        this.router.get("/getAllCompany", authJwt.verifyToken, companyController.getAllCompany);
        this.router.get("/getCompanyDetails", authJwt.verifyToken, companyController.getCompanyDetails);
        this.router.put("/updateCompany", authJwt.verifyToken, companyController.updateCompany);
        this.router.get("/getCompanyRelatedDevices", authJwt.verifyToken, companyController.getCompanyRelatedDevices);
        this.router.delete("/deleteCompany", authJwt.verifyToken, companyController.deleteCompany);
        this.router.post("/modifyCompanyMailerConfig", authJwt.verifyToken, companyController.modifyCompanyMailerConfig);
        this.router.get("/getCompanyMailerConfig", authJwt.verifyToken, companyController.getCompanyMailerConfig);
        

        // ---- DEVICE GROUP ROUTS ------
        this.router.get("/getDeviceGroupDetails", authJwt.verifyToken, deviceGroupController.getDeviceGroupDetails);
        this.router.get("/getDeviceGroups", authJwt.verifyToken, deviceGroupController.getDeviceGroups);
        this.router.get("/getAvailableDevices", authJwt.verifyToken, deviceGroupController.getAvailableDevices);
        this.router.post("/createDeviceGroup", authJwt.verifyToken, deviceGroupController.createDeviceGroup);
        this.router.delete("/deleteDeviceGroup", authJwt.verifyToken, deviceGroupController.deleteDeviceGroup);
        this.router.put("/modifyDeviceGroup", authJwt.verifyToken, deviceGroupController.modifyDeviceGroup);
        this.router.put("/addDevice", authJwt.verifyToken, deviceGroupController.registerDevice);
        this.router.post("/createDeviceBatch", authJwt.verifyToken, deviceGroupController.createDeviceBatch);
        


        // ---- SUPPORT TICKET ROUTS ------
        this.router.get("/getAllGeneratedTickets", authJwt.verifyToken, supportTicketController.getAllGeneratedTickets);
        this.router.get("/generatedTicketDetails", authJwt.verifyToken, supportTicketController.generatedTicketDetails);
        this.router.post("/createSupportNotes", authJwt.verifyToken, supportTicketController.createSupportNotes);
        this.router.post("/createSupportTicket", authJwt.verifyToken, supportTicketController.createSupportTicket);
        




        // ---- SETTINGS ROUTS ------
        this.router.get("/getCompanySettings", authJwt.verifyToken, settingCompanyController.getCompanySettings);
        this.router.get("/getFobProgrammers", authJwt.verifyToken, settingCompanyController.getFobProgrammers);
        this.router.put("/modifyCompanySettings", authJwt.verifyToken, settingCompanyController.modifyCompanySettings);

        // ---- ACTIVITY LOGS ROUTS ------
        this.router.post("/activityLogs", authJwt.verifyToken, userController.getActivityLogs);
        this.router.post("/createActivityLogNotes", authJwt.verifyToken, userController.createActivityLogNotes);
        this.router.get("/getActivityLogNotes", authJwt.verifyToken, userController.getActivityLogNotes);
       
        // TEST Mail
        this.router.post("/testMail", authJwt.verifyToken, userController.testMail);

  

        // ---- OTA ROUTS ------
        this.router.post("/addota",uploadToDisk.single('zip_file'), (req, res) => { 
            const version = req.body.version;
            const fileName = req.file.filename; 
            req.version = version;
            req.fileName = fileName;
            req.company_id = req.body.company_id;
            req.version_description = req.body.version_description; 

            otaController.addOta(req,res);

         }, (error, req, res, next) => {
             res.status(400).send({ error: error.message })
         });     

        this.router.post("/getallota", otaController.getAllOta);  
        this.router.post("/getotadetails", otaController.getOtaDetails); 
        this.router.post("/deleteota", otaController.deleteOta); 
        this.router.post("/activeota", otaController.activeota); 
        
    }
}

export default new AdminRoutes;
