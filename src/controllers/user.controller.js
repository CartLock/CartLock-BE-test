import HttpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import {
  Customer,
  CompanyOta,
  User,
  UsersAssignedEkey,
  Role,
  Permission,
  Company,
  Device,
  ServiceTicket,
  ActivityLog,
  DeviceGroup,
  EKey,
  DeviceConfiguration,
} from "../util/middleware/connection";
import CommonService from "../util/helpers/common";
import ValidationService from "../util/helpers/validation_schema";
import { Op, Sequelize } from "sequelize";
import createError from "http-errors";
import _map from "lodash/map";
import moment from "moment";
import braintree from "braintree";

const BASE_URL = process.env.BASE_URL;

const server_url = process.env.SERVER_URL;
const operatorsAliases = {
  $eq: Op.eq,
  $or: Op.or,
};
class UserController {
  constructor() {}

  cutomerRegister = async (req, res, next) => {
    console.log("Customer REGISTRATATION")
    try {
      const result =
        await ValidationService.customerRegisterSchema().validateAsync(
          req.body
        );
      let tokenPayload = {
        mobile: result.mobile,
      };
      //check if user alreday Register or not
      const isPhoneExist = await Customer.findOne({
        where: { mobile: result.mobile },
      });
      if (isPhoneExist) {
        const custId = isPhoneExist.id;
        const activityLogExist = await ActivityLog.findOne({
          // limit: 1,
          where: { cust_id: custId },
          order: [["createdAt", "DESC"]],
        });
        if (activityLogExist) {
          console.log("Activity Log Data:::" + activityLogExist);
          console.log("Activity Log Data:::" + activityLogExist.summary);
          console.log(
            "Activity Log Data created Date:::" + activityLogExist.createdAt
          );
          // if (activityLogExist.summary == "PAYMENTRESERVE") {
          //   let jwtToken = CommonService.generateToken(tokenPayload);
          //   return res.status(200).json({
          //     status: 0,
          //     message: activityLogExist.activity_description,
          //     token: jwtToken,
          //     payload: isPhoneExist,
          //   });
          // } 
          if (activityLogExist.summary == "PAYMENT RESERVED") {
            let jwtToken = CommonService.generateToken(tokenPayload);
            return res.status(200).json({
              status: 0,
              message: activityLogExist.activity_description,
              token: jwtToken,
              payload: isPhoneExist,
            });
          }
          
          else {
              let jwtToken = CommonService.generateToken(tokenPayload);
              return res.status(200).json({
                status: 1,
                message:
                  "Customer  already exist with " +
                  result.mobile +
                  " PhoneNumber",
                token: jwtToken,
                payload: isPhoneExist,
              });    
          }
        }
        let jwtToken = CommonService.generateToken(tokenPayload);
        return res.status(200).json({
          status: 1,
          message:
            "Customer  already exist with " + result.mobile + " PhoneNumber",
          token: jwtToken,
          payload: isPhoneExist,
        });
      }

      const CustomerData = {
        mobile: result.mobile,
      };
      let customer = await Customer.create(CustomerData);
      //generating token
      let tokenPayload1 = {
        id: customer.id,
        mobile: customer.mobile,
      };
      let jwtToken = CommonService.generateToken(tokenPayload1);
      console.log("JWT::::" + jwtToken);
      return res.status(200).json({
        status: 1,
        message: "You are successfully Registered",
        token: jwtToken,
        payload: customer,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/login
   * @apiName     Get login with email or mobile
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  userLogin = async (req, res, next) => {
    try {
      // validate request

      const result = await ValidationService.appLoginSchema().validateAsync(
        req.body
      );

      // check company id valid or not
      const isCompanyIdValid = await Company.findOne({
        where: { company_id: result.companyId },
      });
      if (!isCompanyIdValid)
        throw createError.NotFound("Invalid company, username or password");

      // check user email/mobile valid or not
      const isUserExit = await User.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { e_mail: result.userName },
                { phone_number: result.userName },
              ],
            },
            {
              company_id: isCompanyIdValid.id,
            },
          ],
        },
      });
      if (!isUserExit)
        throw createError.NotFound("Invalid company, username or password ");

      // check permissions 1=USER, 2=INSTALLER
      if (isUserExit.role_id != 1 && isUserExit.role_id != 2)
        throw createError.NotFound("Invalid company, username or password ");
      // check user active or inactive
      if (isUserExit.is_inactive == "1")
        throw createError.NotFound("Your account is inactive");
      console.log(
        "Input password:" +
          result.password +
          "  " +
          "DB Password:" +
          isUserExit.password
      );
      // check password is correct
      // const passwordIsValid = bcrypt.compareSyncc
      //   result.password,
      //   isUserExit.password
      // );
      var passwordIsValid =false;
      if(result.password==isUserExit.password){passwordIsValid=true;}
      if (!passwordIsValid)
        throw createError.NotFound(
          "Invalid company, username or passwordsaurav"
        );
      isUserExit.dataValues.userName = result.userName;
      isUserExit.dataValues.company_id = isCompanyIdValid.company_id;
      isUserExit.dataValues.comp_id = isCompanyIdValid.id;

      delete isUserExit.dataValues.password;

      let tokenPayload = {
        id: isUserExit.id,
        email: isUserExit.e_mail,
        role: isUserExit.role_id,
        company_id: isCompanyIdValid.id,
      };

      let jwtToken = CommonService.generateToken(tokenPayload);
      /*if (req.body.fcm_token)
        await User.update({ fcm_token: req.body.fcm_token }, { where: { id: isUserExit.id } });
      */

      // get the ticket status
      const ticketStatus = await ServiceTicket.findOne({
        where: { user_id: isUserExit.id },
        order: [["id", "DESC"]],
        attributes: ["id", "ticket_status", "createdAt"],
      });

      return res.status(200).json({
        status: 1,
        message: "You are successfully logged in",
        token: jwtToken,
        payload: isUserExit,
        ticketStatus: ticketStatus,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/forgotPassword
   * @apiName     Forgot password with email or mobile
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  forgotPassword = async (req, res, next) => {
    try {
      // validate request
      const result =
        await ValidationService.forgotPasswordSchema().validateAsync(req.body);
      const isCompanyIdValid = await Company.findOne({
        where: { company_id: result.companyId },
      });
      if (!isCompanyIdValid) throw createError.NotFound("Company ID not found");
      // check user email/mobile valid or not

      var compId = isCompanyIdValid.id;

      const isUserExit = await User.findOne({
        where: {
          [Op.and]: [{ e_mail: result.userName }, { company_id: compId }],
        },
      });

      if (!isUserExit)
        throw createError.NotFound("Invalid Email id or Company Id ");

      if (isUserExit) {
        const uniquekey = CommonService.generateTempPassword(10, "alphaNumber");
        await User.update(
          { unique_code: uniquekey },
          { where: { e_mail: result.userName } }
        );

        const mailData = {
          to: result.userName,
          //companyId: compId,
          companyId: result.companyId, //added by saurav
          companyName: isCompanyIdValid.company_name,
          unique_code: uniquekey,
        };
        await this.mailToUserOnForgotPassword(mailData, compId);
      }
      console.log("mail sent successfully");
      return res.status(200).json({
        status: 1,
        message: "Reset password link has been sent to " + isUserExit.e_mail,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  //saurav
  getResetpasswordTemplate = async (req, res, next) => {
    const { companyId, userName } = req.params;
    res.render("reset-password", { companyId: companyId, userName: userName });
  };

  resetPasswordMobile = async (req, res, next) => {
    try {
      console.log("inside  resetPasswordMobile");
      //Validating the Request

      const result = req.body;
      const isCompanyIdValid = await Company.findOne({
        where: { company_id: result.compId },
      });
      if (!isCompanyIdValid) throw createError.NotFound("Company ID not found");
      // check user email/mobile valid or not
      var compId = isCompanyIdValid.id;
      console.log("Req Password::::::::::" + result.confirmpassword);
      console.log("Company Id for User::::::::::::::::" + compId);
      const isUserExit = await User.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { e_mail: result.mailer },
                { phone_number: result.mailer },
              ],
            },
            {
              company_id: compId,
            },
          ],
        },
      });
      if (!isUserExit)
        throw createError.NotFound("Invalid company, username or password ");
      console.log("user Details::::" + isUserExit);
      var userId = isUserExit.id;
      let update = await User.update(
        { password: bcrypt.hashSync(result.confirmpassword, 8) },
        { where: { id: userId } }
      );
      if (!update) throw createError.NotFound("Error while Updating");

      // return res
      //   .status(200)
      //   .json({ status: 1, message: "Your password successfully changed" });
      res.render("reset-msg");
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {PUT} /users/restPassword
   * @apiName     Reset password
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */
  resetPassword = async (req, res, next) => {
    try {
      // validate request
      const result = await ValidationService.restPasswordSchema().validateAsync(
        req.body
      );
      let userId = req.user.id;

      // check user password
      const isUserExit = await User.findOne({ where: { id: userId } });

      const passwordIsValid = bcrypt.compareSync(
        result.currentPassword,
        isUserExit.password
      );
      if (!passwordIsValid)
        throw createError.NotFound("Invalid current password");

      let update = await User.update(
        { password: bcrypt.hashSync(result.newPassword, 8) },
        { where: { id: userId } }
      );
      if (!update) throw createError.NotFound("Error while Updating");

      return res
        .status(200)
        .json({ status: 1, message: "Your password successfully changed" });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {DELETE} /users/logout
   * @apiName     Get logout
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  logout = async (req, res, next) => {
    try {
      // let accessToken = req.header('Authorization');
      return res.status(200).json({
        status: 1,
        message: "You are successfully logged out",
        token: "",
        payload: {},
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getActiveLocks
   * @apiName     Get all active locak to user
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getActiveLocks = async (req, res, next) => {
    try {
      console.log("============= Request ================");
      console.log(req);
      const userId = req.user.id;
      const companyId = req.user.company_id;

      const ekeys = await UsersAssignedEkey.findAll({
        where: {
          user_id: userId,
          status: {
            [Op.or]: [1, 2, 4],
          },
        },
        order: [["id", "DESC"]],
        attributes: [
          ["ekey_id", "id"],
          "one_time_use",
          "start_date_time",
          "end_date_time",
          "schedule_days",
          "time_zone",
          "fob_device_id",
        ],
        include: [
          {
            model: DeviceConfiguration,
            as: "ekeyDetails",
            required: false,
            attributes: [
              "serial_number",
              "full_name",
              "display_name",
              "hardware_id",
              "uuid",
            ],
          },
        ],
      });

      var locks = [];

      ekeys.forEach((el) => {
        if (el.ekeyDetails) {
          if (el.one_time_use == "0") {
            var scheduleDay = JSON.parse(el.schedule_days);
            var zone = JSON.parse(el.time_zone);
            const timezone = zone.full_time_zone;
            const currentTime = CommonService.dateFormat(timezone);
            var startDate = CommonService.dateFormat(
              timezone,
              el.start_date_time
            );
            var endDate = CommonService.dateFormat(timezone, el.end_date_time);
            const week = CommonService.dateFormat(timezone, "", "ddd");
            const permissionDay = scheduleDay[week];

            if (
              Date.parse(currentTime) >= Date.parse(startDate) &&
              Date.parse(currentTime) <= Date.parse(endDate) &&
              permissionDay &&
              el.status != "5"
            ) {
              locks.push({
                id: el.id,
                one_time_use: el.one_time_use,
                start_date_time: startDate ? startDate : "",
                end_date_time: endDate ? endDate : "",
                schedule_days: scheduleDay ? scheduleDay : "",
                serial_number: el.ekeyDetails.serial_number,
                full_name: el.ekeyDetails.full_name,
                display_name: el.ekeyDetails.display_name,
                hardware_id: el.ekeyDetails.hardware_id,
                uuid: el.ekeyDetails.uuid,
              });
            }
          } else {
            if (el.status != "4" && el.status != "5") {
              locks.push({
                id: el.id,
                one_time_use: el.one_time_use,
                start_date_time: el.start_date_time ? el.start_date_time : "",
                end_date_time: el.end_date_time ? el.end_date_time : "",
                schedule_days: {},
                serial_number: el.ekeyDetails.serial_number,
                full_name: el.ekeyDetails.full_name,
                display_name: el.ekeyDetails.display_name,
                hardware_id: el.ekeyDetails.hardware_id,
                uuid: el.ekeyDetails.uuid,
              });
            }
          }
        }
      });

      return res
        .status(200)
        .json({ status: 1, message: "Active locks list", payload: locks });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/updateLanguage
   * @apiName     Forgot password with email or mobile and Company Code
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */
  updateLanguage = async (req, res, next) => {
    try {
      const userId = req.user.id;

      let update = await User.update(
        { language: req.body.language },
        { where: { id: userId } }
      );
      if (!update) throw createError.NotFound("Error while Updating");

      return res.status(200).json({
        status: 1,
        message: "Language updated successfully",
        payload: req.body,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/getAllStatus
   * @apiName     Get all status
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at  {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getAllStatus = async (req, res, next) => {
    try {
      const userId = req.user.id;

      // get the ticket status
      const ticketStatus = await ServiceTicket.findOne({
        where: { user_id: userId },
        order: [["id", "DESC"]],
        attributes: [
          "id",
          "ticket_status",
          ["ticket_number", "ticket"],
          "phone",
          "createdAt",
        ],
      });

      const payload = {
        ticketStatus: ticketStatus,
      };

      return res
        .status(200)
        .json({ status: 1, message: "Status list", payload: payload });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/getCompanySetting
   * @apiName     Get company setting details
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getCompanySetting = async (req, res, next) => {
    try {
      const BASE_PATH = process.env.API_BASE_URL + "uploads/";
      const companyId = req.user.company_id;
      const compSetting = await CommonService.companySettings(companyId); // common function
      compSetting.dataValues.default_time_zone = compSetting.default_time_zone
        ? compSetting.default_time_zone.full_time_zone
        : "";
      delete compSetting.dataValues.company_id;

      // Firmware dat
      const company = await Company.findOne({ where: { id: companyId } });
      const Ota = await CompanyOta.findOne({
        where: { status: 1 },
        order: [["id", "DESC"]],
      });

      //console.log(compSetting);

      if (Ota) {
        var obj = {
          zipurl: BASE_PATH + Ota.dataValues.zip_files,
          version: Ota.version,
          description: Ota.dataValues.version_description,
          is_force_firmware_update: compSetting.is_force_firmware_update
            ? compSetting.is_force_firmware_update
            : "",
          allowed_firmware: compSetting.allowed_firmware
            ? compSetting.allowed_firmware
            : "",
        };
      } else {
        var obj = {};
      }

      return res.status(200).json({
        status: 1,
        message: "Company setting details",
        payload: compSetting,
        ota: obj,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /device/createActivityLog
   * @apiName     create activity logs
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  createActivityLog = async (req, res, next) => {
    try {
      const actData = req.body;

      console.log("actData=========", actData);

      const type = Array.isArray(actData);

      if (type) {
        const userId = req.user.id;
        var logData = [];
        actData.forEach((el) => {
          if (actData.activity_description) {
            const old_data = {
              old_data: actData.old_data,
            };
            Object.assign(actData.activity_description, old_data);
          }

          let activityData = {
            operation_type: el.operation_type,
            device_id: el.device_id != "" ? el.device_id : null,
            device_group_id:
              el.device_group_id != "" ? el.device_group_id : null,
            user_id: el.operation_type == "Sensor" ? null : userId,
            summary: el.summary,
            gps_location: el.gps_location
              ? JSON.stringify(el.gps_location)
              : null,
            activity_description: el.activity_description
              ? JSON.stringify(el.activity_description)
              : null,
          };
          logData.push(activityData);
        });
        console.log("logdata:::" + logData);
        await ActivityLog.bulkCreate(logData);
      } else {
        if (actData.activity_description) {
          const old_data = {
            old_data: actData.old_data,
          };
          Object.assign(actData.activity_description, old_data);
        }

        let activityData = {
          operation_type: actData.operation_type,
          device_id: actData.device_id != "" ? actData.device_id : null,
          device_group_id:
            actData.device_group_id != "" ? actData.device_group_id : null,
          user_id: actData.user_id != "" ? actData.user_id : null,
          summary: actData.summary,
          gps_location: actData.gps_location
            ? actData.userType == "ios"
              ? actData.gps_location
              : JSON.stringify(actData.gps_location)
            : null,
          activity_description: actData.activity_description
            ? actData.userType == "ios"
              ? actData.activity_description
              : JSON.stringify(actData.activity_description)
            : null,
          cust_id: actData.cust_id != "" ? actData.cust_id : null,
        };

        console.log("activityData =", activityData);
        await ActivityLog.create(activityData);
      }

      return res.status(200).json({
        status: 1,
        message: "Activity created successfully",
        payload: {},
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /device/changeDeviceKeyStatus
   * @apiName     change device key status
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  changeDeviceKeyStatus = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const deviceId = req.body.device_id;
      const status = req.body.status;

      await UsersAssignedEkey.update(
        { status: status },
        { where: { user_id: userId, ekey_id: deviceId } }
      );

      return res.status(200).json({
        status: 1,
        message: "Device status changed successfully",
        payload: {},
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /device/disableOneTimeUsedEkey
   * @apiName     Disable one time e key once it is used
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  disableOneTimeUsedEkey = async (req, res, next) => {
    try {
      const userId = req.user.id;
      //const userId = 51;
      const deviceId = req.body.device_id;

      const eKeyData = await UsersAssignedEkey.findOne({
        where: { user_id: userId, ekey_id: deviceId },
      });
      console.log(eKeyData);
      if (eKeyData.one_time_use == 1) {
        await UsersAssignedEkey.update(
          { status: 3 },
          { where: { user_id: userId, ekey_id: deviceId } }
        );
        return res.status(200).json({
          status: 1,
          message: "Device disabled successfully",
          payload: {},
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "The E-Key is not one time",
          payload: {},
        });
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  intializeGateway = async (req, res, next) => {
    try {
      var gateway = new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId: "tcgv2bsz3b72j3d7",
        publicKey: "z4697b2y5sw7jh2w",
        privateKey: "41975c2c81c219b5224aabf9cb95a0f3",
      });
      let token = (await gateway.clientToken.generate({})).clientToken;
      res.send({ data: token });
    } catch (error) {
      next(error);
    }
  };
  processingPayment = async (req, res, next) => {
    try {
      const data = req.body;
      var gateway = new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId: "tcgv2bsz3b72j3d7",
        publicKey: "z4697b2y5sw7jh2w",
        privateKey: "41975c2c81c219b5224aabf9cb95a0f3",
      });
      let transactionResponse = await gateway.transaction.sale({
        amount: data.amount,
        paymentMethodNonce: data.nonce,
        options: {
          submitForSettlement: true,
        },
      });
      console.log(transactionResponse);
      res.send({ data: transactionResponse });
    } catch (error) {
      next(error);
    }
  };

  // sent mail on forgot password
  mailToUserOnForgotPassword = async (data, compId) => {
   // const link="http://182.77.62.52:3000/"
    const link="https://main.d3n5kg237nhmbg.amplifyapp.com/"
    console.log(process.env.BASE_URL + "   local base url");
    const mailData = {
      to: data.to,
      subject: "Forgot Password with LOCK-CART ",
      html_text: `<!doctype html>
      <html>            
      
      <head>
        <meta charset="utf-8">
        <title>LOCK-CART</title>
      </head>
      
      <body style="padding: 0; margin: 0; font-family:Arial; line-height: 24px;">
        <div
          style="width: 100%; max-width: 700px; padding:0 15px; margin: 20px auto 20px auto; display: table; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
          <div
            style="width: 100%;  background: #fff; border: 1px solid #d7e7ee; padding: 15px; border-radius: 10px; -moz-border-radius: 10px; -webkit-border-radius: 10px; -o-border-radius: 10px; -ms-border-radius: 10px; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
            <p style="font-size: 16px;">You have requested to change your password</p>
            
        
        <p style="font-size: 14px;"><span style="font-weight: 600;"><a style="color:blue; text-decoration:underline;" href="${link}resetPassword/${data.companyId}/${data.to}">Click Here </a>to change your password.</span></p>
   
            <p style="font-size: 14px;">Not you? Contact your system administrator to report this incident</p>
            
                                                           
          </div>
        </div>
      </body>                                       
      
      </html>`,
    };

    await CommonService.sendMail(mailData, compId);
  };

  //END OF CLASS
}
export default new UserController();
