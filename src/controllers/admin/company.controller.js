import HttpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import {
  User,
  Role,
  Permission,
  Company,
  SettingCompany,
  Device,
  ServiceTicket,
  ActivityLog,
  DeviceGroup,
  EKey,
  DeviceConfiguration,
  UsersAssignedEkey,
  CompanyMailerConfig,
} from "../../util/middleware/connection";
import CommonService from "../../util/helpers/common";
import ValidationService from "../../util/helpers/validation_schema_admin";
import { Op, Sequelize, QueryTypes } from "sequelize";
import createError from "http-errors";
import { isElement } from "lodash";
import _map from "lodash/map";
const server_url = process.env.SERVER_URL;
const BASE_URL = process.env.BASE_URL;

const operatorsAliases = {
  $eq: Op.eq,
  $or: Op.or,
};
class CompanyController {
  constructor() {}

  /**
   * @api        {POST} /company/addCompany
   * @apiName     Add company
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  addCompany = async (req, res, next) => {
    try {
      console.log("Payload::::::::::::" + req.body.currency);
      // validate request
      const result = await ValidationService.addCompanySchema().validateAsync(
        req.body
      );
      console.log("Payload::::::::::::" +result.currency);
      // check company email already exit or not
      const isCompanyEmailExit = await Company.findOne({
        where: {
          [Op.and]: {
            company_e_mail: result.companyEmail,
            company_code: result.companyCode,
          },
        },
      });

      // check company email already exit or not in user table too
      // const isUserEmailExit = await User.findOne({
      //   where: {e_mail: result.POCEmail}
      // });

      if (isCompanyEmailExit)
        throw createError.NotFound("Company Already exist..");
      // company data
      const companyData = {
       
        company_id: result.companyId,
        company_code: result.companyCode,
        location: result.location,
        company_e_mail: result.companyEmail,
        company_e_mail: result.companyEmail,
        registratation_date: result.registratationDate,
        timezone: result.timezone,
        poc_phone_number: result.POCPhoneNumber,
        payment_cost: result.cartFee,
        waiting_hour: result.timing,
        payment_gateway: result.paymentGateway,
        acc_no: result.merchantAccNo,
        is_deactive: result.isDeactive,
        currency:result.currency,
        company_name:result.companyName,
        hour: result.hour,
        min: result.min,
      };

      let company = await Company.create(companyData);
      const uniquekey = CommonService.generateTempPassword(10, "alphaNumber");
    

      if (company.id) {
        const companySettingData = {
          company_id: company.id,
          is_multi_phone_login: "0",
          is_force_firmware_update: "0",
          offline_reconect: "2",
          waiting_hour: result.timing,
          payment_cost: result.cartFee,
          schedule_opens: JSON.stringify([
            {
              scheduleDay: "Monday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
            {
              scheduleDay: "Tuesday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
            {
              scheduleDay: "Wednesday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
            {
              scheduleDay: "Thursday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
            {
              scheduleDay: "Friday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
            {
              scheduleDay: "Saturday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
            {
              scheduleDay: "Sunday",
              openWholeDay: true,
              openTime: "",
              closeTime: "",
            },
          ]),
          schedule_exceptions: JSON.stringify([]),
          default_time_zone: JSON.stringify({
            id: 1,
            time_zone: "EST",
            full_time_zone: "America/New_York",
          }),
          ekey_duration: "2",
          default_country_code: "96",
          fob_programmers: JSON.stringify([]),
        };

        await SettingCompany.create(companySettingData);
      }

      // const mailData = {
      //   to: result.POCEmail,
      //   companyId: result.companyId,
      //   companyName: result.companyName,
      //   userName: result.POCFirstName,
      //   unique_code: uniquekey,
      // };
      // await this.mailToCompanyOnRegisterd(mailData, result.companyId);

      return res.status(200).json({
        status: 1,
        message: "Company created successfully",
        payload: company,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /company/getAllCompany
   * @apiName     Get all company
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getAllCompany = async (req, res, next) => {
    console.log("get all company");
    try {
      var company = "";
      if (req.query.type == "user") {
        console.log("User :::");
        company = await Company.findAll({
          where: {
            is_deactive: "0",
            id: {
              [Op.ne]: 1,
            },
          },
          order: [["company_name", "asc"]],
          attributes: ["id", "company_id", "company_name"],
        });
      } else {
        console.log("Without User")
        company = await Company.findAll({
          where: {
            is_deactive: "0",
            id: {
              [Op.ne]: 1,
            },
          },
          order: [["id", "desc"]],
          attributes: [
            "id",
            "company_id",
            "company_name",
            "poc_first_name",
            "poc_last_name",
            "poc_e_mail",
            "poc_phone_number",
            "is_deactive",
            "company_address",
            "createdAt",
            "company_code",
            "company_e_mail",
            "location",
            [
              Sequelize.fn(
                "concat",
                Sequelize.col("poc_first_name"),
                ", ",
                Sequelize.col("poc_last_name")
              ),
              "full_name",
            ],
          ],
        });

        await Promise.all(
          company.map(async (el) => {
            el.dataValues.totalDevices =
              await UsersAssignedEkey.findAndCountAll({
                order: [["id", "DESC"]],
                attributes: ["id", "user_id"],
                where: {
                  user_id: {
                    [Op.in]: [
                      Sequelize.literal(
                        `(SELECT id FROM users where company_id = '${el.id}')`
                      ),
                    ],
                  },
                },
              }).then((result) => {
                return result.count;
              });

            el.dataValues.totalUsers = await User.findAndCountAll({
              where: { company_id: el.id },
            }).then((result) => {
              return result.count;
            });
          })
        );
      }
      console.log("comapny length" + company.length + ":::::" + company);
      const msg = company.length > 0 ? "Company listing" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: company });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /company/getCompanyDetails
   * @apiName     Get details of company
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getCompanyDetails = async (req, res, next) => {
    try {
      const company = await Company.findOne({
        where: { id: req.query.id },
      });

      if (company) {
        company.dataValues.is_deactive =
          company.is_deactive == "1" ? true : false;
        //get the company setting based on id
        const companySetting = await SettingCompany.findOne({
          where: { id: company.company_id },
        });
        if(companySetting){
          company.dataValues.setting=companySetting;
        }
      }

      const msg = company.length > 0 ? "Company details" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: company });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {PUT} /company/updateCompany
   * @apiName     Update company
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  updateCompany = async (req, res, next) => {
    console.log("backend Hited");
    try {
      // validate request
      const result =
        await ValidationService.updateCompanySchema().validateAsync(req.body);

      // check company email already exit or not
      const isCompanyEmailExit = await Company.findOne({
        where: {
          [Op.and]: {
            company_e_mail: result.companyEmail,
            company_code: result.companyCode,
            id: {
              [Op.ne]: result.id,
            },
          },
        },
        attributes: ["id"],
      });

      if (isCompanyEmailExit)
        throw createError.NotFound(
          "POC email already exist with same company name"
        );

      // comany data
      const companyData = {
        id: result.id,
        company_name: result.companyName,
        company_id: result.companyId,
        company_address: result.companyAddress,
        company_street: result.companyStreet,
        company_country: result.companyCountry,
        company_zip: result.companyZip,
        company_e_mail: result.companyEmail,
        poc_first_name: result.POCFirstName,
        poc_last_name: result.POCLastName,
        poc_e_mail: result.POCEmail,
        poc_phone_number: result.POCPhoneNumber,
        is_deactive: result.isDeactive,

        //added by saurav Satpathy
        id: result.id,
        company_code: result.companyCode,
        location: result.location,
        company_e_mail: result.companyEmail,
        registratation_date: result.registratationDate,
        timezone: result.timezone,
        poc_phone_number: result.POCPhoneNumber,
        payment_cost: result.cartFee,
        waiting_hour: result.timing,
        payment_gateway: result.paymentGateway,
        acc_no: result.merchantAccNo,
        is_deactive: result.isDeactive,
        hour: result.hour,
        min: result.min,
      };

      let company = await Company.update(companyData, {
        where: { id: result.id },
        returning: true,
      });
      return res.status(200).json({
        status: 1,
        message: "Company modified successfully",
        payload: companyData,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /company/getCompanyRelatedDevices
   * @apiName     Get all company
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getCompanyRelatedDevices = async (req, res, next) => {
    try {
      const companyId = req.query.company_id;
      const company = await Company.findOne({
        where: { id: companyId },
        attributes: ["id", "company_id", "company_name"],
      });

      const details = await UsersAssignedEkey.findAll({
        order: [["id", "DESC"]],
        attributes: ["id"],
        where: {
          user_id: {
            [Op.in]: [
              Sequelize.literal(
                `(SELECT id FROM users where company_id =${companyId})`
              ),
            ],
          },
        },
        include: [
          {
            model: DeviceConfiguration,
            as: "ekeyDetails",
            required: false,
            order: [["id", "desc"]],
            attributes: ["id", "serial_number"],
          },
          {
            model: User,
            as: "User",
            required: false,
            attributes: ["id", "dispay_name"],
          },
        ],
      });

      const msg =
        details.length > 0
          ? "Company related device listing"
          : "No record found";
      return res.status(200).json({
        status: 1,
        message: msg,
        payload: { details: details, company: company },
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {DELETE} /users/deleteCompany
   * @apiName     delete company
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  deleteCompany = async (req, res, next) => {
    try {
      const success = await Company.destroy({ where: { id: req.query.id } });
      return res.status(200).json({
        status: 1,
        message: "Company removed successfully",
        payload: {},
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {PUT} /company/modifyCompanyMailerConfig
   * @apiName     Update company's mailer configuration
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  modifyCompanyMailerConfig = async (req, res, next) => {
    try {
      const { id, company_id, host_name, port_name, user_name, user_password } =
        req.body;
      // data
      const data = {
        company_id: company_id,
        host_name: host_name,
        port_name: port_name,
        user_name: user_name,
        user_password: user_password,
      };

      if (id != "") {
        await CompanyMailerConfig.update(data, {
          where: { id: id },
          returning: true,
        });
      } else {
        await CompanyMailerConfig.create(data);
      }

      return res.status(200).json({
        status: 1,
        message: "Company's mailer config updated successfully",
        payload: data,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /company/getCompanyMailerConfig
   * @apiName     Get details of company mailer config
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getCompanyMailerConfig = async (req, res, next) => {
    try {
      const company = await CompanyMailerConfig.findOne({
        where: { company_id: req.query.company_id },
      });

      const msg = company ? "Company's mailer config" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: company });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  // sent mail to new gesiterd user
  mailToCompanyOnRegisterd = async (data, compId) => {
    const mailData = {
      to: data.to,
      subject: "Registered with LOCK_CART",
      html_text: `<!doctype html>
      <html>
      
      <head>
        <meta charset="utf-8">
        <title>LOCK_CART</title>           
         

      </head>                            
      
      <body style="padding: 0; margin: 0; font-family: 'Montserrat', sans-serif; line-height: 24px;">
    <div
      style="width: auto; max-width: auto; padding:0 15px; margin: 40px auto; display: flex; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
      <div
        style="width: 100%;  background: #fff; border: 1px solid #d7e7ee; padding: 30px; border-radius: 10px; -moz-border-radius: 10px; -webkit-border-radius: 10px; -o-border-radius: 10px; -ms-border-radius: 10px; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
        <p style="font-size: 25px; font-weight: 600; color:#09589d;">Welcome to LOCK_CART!</p>
        <p style="font-size: 14px; font-weight: 300; color:#404244;">You have been set up with a LOCK_CART account with <span style="font-weight: 600;">${data.companyName}</span>.</p>
        <p style="font-size: 14px; font-weight: 300; color:#404244;">
          Company ID: <span style="font-weight: 600;">${data.companyId}</span><br />
          Username: <span style="font-weight: 600;"><a style="color:blue; text-decoration:underline;" href="mailto:${data.to}">${data.to}</a></span><br /> 
          </p>
        
        <p style="font-size: 14px; font-weight: 300; color:#404244;">
        <a style="color:blue; text-decoration:underline;" href="${BASE_URL}reset-password/${data.unique_code}">Click Here</a> to set a password for this account.
        </p>

                      
      </div>                                                    
    </div>
  </body>
      
      </html>`,
    };

    await CommonService.sendMail(mailData, compId);
  };

  //END OF CLASS
}
export default new CompanyController();
