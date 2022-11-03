import { Router } from "express";
import userController from "../controllers/admin/user.controller";
import companyController from "../controllers/admin/company.controller";
import deviceGroupController from "../controllers/admin/deviceGroup.controller";
import supportTicketController from "../controllers/admin/supportTicket.controller";
import SettingCompanyController from "../controllers/admin/SettingCompany.controller";
import otaController from "../controllers/admin/ota.controller";
import authJwt from "../util/middleware/verifyJwtToken";
import {
  uploadToDisk,
  uploadToMemory,
} from "../util/middleware/multer.middleware";

class ApiRoutes{
    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        this.router.post("/createSupportTicket", authJwt.verifyToken, supportTicketController.createSupportTicket);
    }
}
export default new ApiRoutes;