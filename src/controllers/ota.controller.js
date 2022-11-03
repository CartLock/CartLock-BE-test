import HttpStatus from 'http-status-codes';
import bcrypt from "bcryptjs";
import {CompanyOta, User, Company, UsersAssignedEkey} from "../util/middleware/connection";

import CommonService from "../util/helpers/common";
import ValidationService from "../util/helpers/validation_schema_admin";
import { Op, Sequelize, QueryTypes } from "sequelize";
import createError from "http-errors"
import { isElement } from 'lodash';
import _map from 'lodash/map';
const server_url = process.env.SERVER_URL
const operatorsAliases = {
  $eq: Op.eq, 
  $or: Op.or,
}
class OtaController {  
  constructor() {
  }

 
  

  /**
  * @api        {POST} /ota/getOtaLatest
  * @apiName     Get Latest ota Details
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */ 
 
  getLatestDetails = async (req, res, next) => {
    const compId = req.body.company_id;
    const BASE_PATH =  process.env.BASE_URL+'public/uploads/';
    try {
      const Ota = await CompanyOta.findOne({
        limit: 1,
        where: { company_id: compId },
        order: [ [ 'id', 'DESC' ]],
      }); 
      const msg = Ota ? 'Ota details' : 'No record found';
      return res.status(200).json({ status: 1, message: msg,base_url:BASE_PATH, payload: Ota });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error) 
    }
  }

  

  //END OF CLASS
}
export default new OtaController();