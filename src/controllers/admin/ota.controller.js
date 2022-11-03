import HttpStatus from 'http-status-codes';
import bcrypt from "bcryptjs";
import {CompanyOta, User, Company, UsersAssignedEkey} from "../../util/middleware/connection";

import CommonService from "../../util/helpers/common";
import ValidationService from "../../util/helpers/validation_schema_admin";
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
  * @api        {POST} /ota/addOta
  * @apiName     Add ota
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  addOta = async (req, res, next) => { 

    try {
    const fileName = req.fileName;
    const version  = req.version;
    const company_id = null; 
    const version_description = req.version_description;
    const firmwareData = {
      version: version,
      zip_files: fileName,
      company_id: company_id,
      version_description:version_description,
      status: 1
    }

    const isversionExit = await CompanyOta.findOne({where: { version: version }});
    if (isversionExit) return res.status(201).json({ status: '1', message: 'Version is already exist.', payload: user });

    
    let user = await CompanyOta.create(firmwareData);  
    return res.status(200).json({ status: '1', message: 'Firmware Version Added Successfully', payload: user });
  } catch (error) {
    if (error.isJoi === true) error.status = 422 
    console.log(error);
  }
  }
  
 

  /**
  * @api        {POST} /ota/getAllOta
  * @apiName     Add ota
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  getAllOta = async (req, res, next) => {
    try {
      var Ota = "" 
        if(req.body.company_id){
        Ota = await CompanyOta.findAll({where: {company_id: req.body.company_id},order: [['id', 'desc']]
        }); 
      } else {
        Ota = await CompanyOta.findAll({where: {},order: [['id', 'desc']]
        }); 
      }
       
        Ota.forEach(function(datas) {
          console.log(datas)
          return "four";
        })  
 
      const BASE_PATH =  process.env.API_BASE_URL+'uploads/';   
      //const BASE_PATH =  'http://localhost:3000/uploads/';    
      const msg = Ota ? 'OTA listing' : 'No record found';


      var data = [];
      for await (const contents of Ota.map(res =>{ 
        data.push({
          id:res.id,
          company_id:res.company_id,
          version:res.version,
          version_description:res.version_description,
          zip_files:BASE_PATH+res.zip_files, 
          full_url:BASE_PATH+res.zip_files,
          status: res.status
        });

      }))  

      

      return res.status(200).json({ status: 1, message: msg, payload: data });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }



  /**
  * @api        {POST} /ota/getOtaDetails
  * @apiName     Get ota Details
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  getOtaDetails = async (req, res, next) => {
       
    try {
      const Ota = await CompanyOta.findOne({
        where: { id: req.body.id }
      });

      console.log(Ota)
    
      const msg = Ota ? 'Ota details' : 'No record found';
      return res.status(200).json({ status: 1, message: msg, payload: Ota });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error) 
    }
  }

 
  
 /**
  * @api        {POST} /ota/deleteOta
  * @apiName     Delete ota
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

   deleteOta = async (req, res, next) => {
    try {
      const Ota = await CompanyOta.findOne({where: { id: req.body.id }});
      const compId = Ota.company_id;
      const success = await CompanyOta.destroy({ where: { id: req.body.id } });
     // const OtaData = await CompanyOta.findAll({where: { company_id: compId }});
      const OtaData = await CompanyOta.findAll({where: {},order: [['id', 'desc']]});

      return res.status(200).json({ status: 1, message: "Firmware Version Removed Successfully", payload: OtaData });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }

  activeota = async (req, res, next) => {
    try {
      const Ota = await CompanyOta.findOne({where: { id: req.body.id }});
      const compId = Ota.company_id;
      
      const statusObj = {
        status:0
      }
      await CompanyOta.update(statusObj, { where: { company_id: compId}, returning: true });
      const statusObj1 = {
        status:1
      }
      await CompanyOta.update(statusObj1, { where: { id: req.body.id}, returning: true });
      const OtaData = await CompanyOta.findAll({where: {company_id: compId}, order: [['id', 'desc']]});
      
      return res.status(200).json({ status: 1, message: "Company OTA status changed successfully", payload:OtaData });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }
  


  //END OF CLASS
}
export default new OtaController();