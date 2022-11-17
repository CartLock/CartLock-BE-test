import HttpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import {
  User,
  Role,
  Permission,
  Company,
  ActivityLog,
  ActivityLogNotes,
  DeviceGroup,
  DeviceGroupKey,
  DeviceConfiguration,
  UsersAssignedEkey,
  SettingTimeZone,
  DeviceConfigurationSchedule,
  DeviceConfigurationException,
  DeviceBatch,
} from "../../util/middleware/connection";
import CommonService from "../../util/helpers/common";
import ValidationService from "../../util/helpers/validation_schema_admin";
import { Op, Sequelize } from "sequelize";
import createError from "http-errors";
import { forEach, isElement } from "lodash";
import _map from "lodash/map";
import moment from "moment";
import timeZone from "moment-timezone";
import { array, number } from "@hapi/joi";
import activity_logModel from "../../models/activity_log.model";

const BASE_URL = process.env.BASE_URL;

const server_url = process.env.SERVER_URL;
const operatorsAliases = {
  $eq: Op.eq,
  $or: Op.or,
};
class UserController {
  constructor() {}

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
      const result = await ValidationService.appLoginSchema().validateAsync(
        req.body
      );
      
    console.log("companyId:::"+result.companyId)
      //Checking super admin access
      if (result.companyId == '0000') {
        console.log("admin login")
        try {
          const isUserExit = await User.findOne({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    { e_mail: result.userName },
                    { phone_number: result.userName },
                  ],
                },
                // {
                //   company_id: isCompanyIdValid.id,
                // },
              ],
            },
          });
          if (!isUserExit)
            throw createError.NotFound("Invalid company, username or password");

          var passwordIsValid;
          console.log(
            "database password:::" +
              isUserExit.password +
              "enter password:::" +
              result.password
          );
           if (isUserExit.password == result.password) {
            passwordIsValid = true;
            if (!passwordIsValid)
              throw createError.NotFound(
                "Invalid company, username or password"
              );
            isUserExit.dataValues.userName = result.userName;
           
            delete isUserExit.dataValues.password;
            //getting role name
            const roleExist = await Role.findOne({
              where: { id: isUserExit.role_id },
            });
            isUserExit.dataValues.roleName = roleExist.role_title;
            let tokenPayload = {
              id: isUserExit.id,
              email: isUserExit.e_mail,
              role: isUserExit.role_id,
            };
            let jwtToken = CommonService.generateToken(tokenPayload);
            return res
              .status(200)
              .json({
                status: 1,
                message: "You are successfully logged in",
                token: jwtToken,
                payload: isUserExit,
              });
          }
        } catch (error) {
          if (error.isJoi === true) error.status = 422;
          next(error);
        }
      }









      // check company id valid or not
      const isCompanyIdValid = await Company.findOne({
        where: {company_id: result.companyId},
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
        throw createError.NotFound("Invalid company, username or password");

      // // check permissions 3=COMPANY ADMINISTRATION, 4-PACLOCK ADMINISTRATION
      // if (isUserExit.is_sentinel != '1' && (isUserExit.role_id != 3 && isUserExit.role_id != 4)) throw createError.NotFound("Invalid company, username or password6");

      // check password is correct
      var passwordIsValid;
      console.log(
        "database password:::" +
          isUserExit.password +
          "enter password:::" +
          result.password
      );
      //const passwordIsValid = bcrypt.compareSync(result.password, isUserExit.password);
      if (isUserExit.password == result.password) {
        passwordIsValid = true;
      }
      if (!passwordIsValid)
        throw createError.NotFound("Invalid company, username or password");
      isUserExit.dataValues.userName = result.userName;
      isUserExit.dataValues.company_id = isCompanyIdValid.company_id;
      isUserExit.dataValues.comp_id = isCompanyIdValid.id;
      isUserExit.dataValues.companyName = isCompanyIdValid.company_name;

      delete isUserExit.dataValues.password;
      //getting role name
      const roleExist = await Role.findOne({
        where: { id: isUserExit.role_id },
      });
      console.log(roleExist.role_title);
      isUserExit.dataValues.roleName = roleExist.role_title;

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

      return res
        .status(200)
        .json({
          status: 1,
          message: "You are successfully logged in",
          token: jwtToken,
          payload: isUserExit,
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

      // check user email/mobile valid or not
      const isUserExit = await User.findOne({
        where: {
          [Op.or]: [
            { e_mail: result.userName },
            { phone_number: result.userName },
          ],
        },
      });
      if (!isUserExit)
        throw createError.NotFound("Invalid Email id or Phone number");

      return res
        .status(200)
        .json({
          status: 1,
          message: "Reset password link has been sent to " + isUserExit.e_mail,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/restPassword
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
      const result =
        await ValidationService.webResetPasswordSchema().validateAsync(
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
        {
          password: bcrypt.hashSync(result.newPassword, 8),
          password_show: result.newPassword,
        },
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

  resetPasswordMobile = async (req, res, next) => {
    try {
      console.log("inside  resetPasswordMobile");
      //Validating the Request
      const result = req.body;
      const isCompanyIdValid = await Company.findOne({
        where: { company_id: result.companyId },
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

      var userId = isUserExit.id;
      console.log("user Details::::" + userId);
      let update = await User.update(
        //{ password: bcrypt.hashSync(result.confirmpassword, 8) },
        { password: result.confirmpassword },
        { where: { id: userId } }
      );
      if (!update) throw createError.NotFound("Error while Updating");

      // res.render("reset-msg");
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
      return res
        .status(200)
        .json({
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
   * @api        {GET} /users/getAllUsers
   * @apiName     Get all users
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getAllUsers = async (req, res, next) => {
    try {
      let userId = req.user.id;

      // check user email/mobile valid or not
      const users = await User.findAll({
        where: {
          [Op.and]: [
            {
              // id: {
              //   [Op.ne]: userId
              // },
              role_id: {
                [Op.notIn]: [3, 4],
              },
            },
          ],
        },
        attributes: [
          "id",
          "first_name",
          "last_name",
          "dispay_name",
          "e_mail",
          "phone_number",
          "is_sentinel",
          "is_installer",
          "is_inactive",
          "is_fob",
          "createdAt",
          [
            Sequelize.literal(
              `(SELECT createdAt FROM activity_log where user_id=Users.id order by id desc limit 1)`
            ),
            "lastActivity",
          ],
          [
            Sequelize.literal(`(IF(Users.is_sentinel = '0', false, true))`),
            "is_sentinel",
          ],
          [
            Sequelize.literal(`(IF(Users.is_installer = '0', false, true))`),
            "is_installer",
          ],
          [
            Sequelize.literal(`(IF(Users.is_inactive = '0', false, true))`),
            "is_inactive",
          ],
          [
            Sequelize.literal(`(IF(Users.is_fob = '0', false, true))`),
            "is_fob",
          ],
        ],
        order: [["id", "desc"]],
      });

      const msg = users.length > 0 ? "User listing" : "No record found";
      return res.status(200).json({ status: 1, message: msg, payload: users });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/addUser
   * @apiName     add user
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  addUser = async (req, res, next) => {
    try {
      // validate request
      const result = await ValidationService.addUserSchema().validateAsync(
        req.body
      );
console.log("companyId::::::"+result.companyId)
      // check email exist or not
      const isEmailExist = await User.findOne({
        where: { e_mail: result.emailId },
      });
      if (isEmailExist) throw createError.NotFound("Email id already exist");

      // check phone number exist or not
      const isPhoneExist = await User.findOne({
        where: { phone_number: result.phoneNumer },
      });
      if (isPhoneExist)
        throw createError.NotFound("Phone number already exist");
      if (result.isSupervisor == "1" && result.isHouseKeeping == "1")
        throw createError.NotFound("Please chose any one role");
      // create user
      const password = CommonService.generateTempPassword(6, "alphaNumber");
      const uniquekey = CommonService.generateTempPassword(10, "alphaNumber");
      const companyId = result.companyId;
      console.log(" display name::" + result.displayName);

      const userData = {
        // role_id: result.isInstaller == "0" ? 1 : 2,
        role_id: 2,
        company_id: companyId,
        first_name: result.firstName,
        last_name: result.lastName,
        dispay_name: result.firstName + " " + result.lastName,
        e_mail: result.emailId,
        phone_number: result.phoneNumer.split("-").join(""),
        password: bcrypt.hashSync(password, 8),
        user_notes: result.userNotes,
        is_sentinel: result.isSentinel,
        is_installer: result.isInstaller,
        is_fob: result.isFob,
        is_inactive: result.isInactive,
        unique_code: uniquekey,
        is_supervisor: result.isSupervisor,
        is_housekeeping: result.isHouseKeeping,
      };
      console.log(userData.is_supervisor + ">>>" + userData.is_housekeeping);
      let user = await User.create(userData);

      const company = await Company.findOne({
        attributes: ["company_id", "company_name"],
        where: { id: companyId },
      });
      const mailData = {
        to: result.emailId,
        companyId: company.company_id,
        companyName: company.company_name,
        userName: result.displayName,
        password: password,
        unique_code: uniquekey,
        email: result.emailId,
      };
      await this.mailToUserOnRegisterd(mailData, companyId);

      return res
        .status(200)
        .json({
          status: 1,
          message: "User created successfully",
          payload: user,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/assignKeyToUser
   * @apiName     assign keys to user
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  assignKeyToUser = async (req, res, next) => {
    try {
      // validate request
      const result =
        await ValidationService.assignKeyToUserSchema().validateAsync(req.body);

      var formattedStartAt = null;
      var formattedEndAt = null;
      var formattedStartTime = result.startTime;
      var formattedEndTime = result.endTime;
      var formattedStartDate = result.startDate;
      var formattedEndDate = result.endDate;

      if (
        result.startDate &&
        result.startTime &&
        result.endDate &&
        result.endTime &&
        result.zone
      ) {
        const startAt = result.startDate + " " + result.startTime;
        const endAt = result.endDate + " " + result.endTime;
        const timeZone = result.zone.full_time_zone;

        formattedStartAt = CommonService.UTCDateTimeFormat(startAt, timeZone);
        formattedEndAt = CommonService.UTCDateTimeFormat(endAt, timeZone);

        formattedStartTime = formattedStartAt.format("HH:mm:ss");
        formattedEndTime = formattedEndAt.format("HH:mm:ss");

        formattedStartDate = formattedStartAt.format("YYYY-MM-DD");
        formattedEndDate = formattedEndAt.format("YYYY-MM-DD");
      }

      // create key data
      var assignedKeys;
      var msg = "eKeys/Groups Assigned successfully";
      if (result.type == "group") {
        const grpId = result.eKey;

        let deviceGrp = await DeviceGroupKey.findAll({
          where: { group_details_id: grpId },
          attributes: ["device_id"],
        });

        await UsersAssignedEkey.destroy({ where: { group_id: grpId } });

        if (deviceGrp.length > 0) {
          let keyDataArray = [];
          deviceGrp.forEach((el) => {
            const keyData = {
              user_id: result.userId,
              ekey_id: el.device_id,
              one_time_use: result.oneTimeUse,
              status: result.status,
              start_date_time: formattedStartAt,
              end_date_time: formattedEndAt,
              schedule_days: result.scheduleDays ? result.scheduleDays : null,
              time_zone: result.zone ? JSON.stringify(result.zone) : null,
              fob_device_id: result.FOBDeviceId ? result.FOBDeviceId : null,
              is_group: 1,
              group_id: grpId,
            };
            keyDataArray.push(keyData);
          });

          await UsersAssignedEkey.bulkCreate(keyDataArray);

          // update status to active
          await DeviceGroup.update({ status: "2" }, { where: { id: grpId } });
        }
      } else {
        const keyData = {
          user_id: result.userId,
          ekey_id: result.eKey,
          one_time_use: result.oneTimeUse,
          status: result.status,
          start_date_time: formattedStartAt,
          end_date_time: formattedEndAt,
          schedule_days: result.scheduleDays ? result.scheduleDays : null,
          time_zone: result.zone ? JSON.stringify(result.zone) : null,
          fob_device_id: result.FOBDeviceId ? result.FOBDeviceId : null,
        };

        if (result.assignedKeyId == "") {
          await UsersAssignedEkey.create(keyData);
        } else {
          await UsersAssignedEkey.update(keyData, {
            where: { id: result.assignedKeyId },
          });
          msg = "eKeys Modified successfully";
        }
      }

      return res.status(200).json({ status: 1, message: msg, payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getUserDetails
   * @apiName     Get user details
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getUserDetails = async (req, res, next) => {
    try {
      console.log("uSER deTAILS");
      const userDetails = await this.userDetails(req.query.id);
      userDetails.dataValues.company = await Company.findOne({
        where: { id: userDetails.company_id },
        attributes: ["id", "company_id", "company_name"],
      });

      const msg = userDetails ? "User details" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: userDetails });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  // get user details
  userDetails = async (userId) => {
    const userDetails = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ["role_id", "password"],
      },
    });

    userDetails.dataValues.lastName = userDetails.last_name;
    userDetails.dataValues.firstName = userDetails.first_name;
    userDetails.dataValues.displayName = userDetails.dispay_name;
    userDetails.dataValues.email = userDetails.e_mail;
    userDetails.dataValues.cell = userDetails.phone_number;
    userDetails.dataValues.note = userDetails.user_notes;
    userDetails.dataValues.isSentinel =
      userDetails.is_sentinel === "0" ? false : true;
    userDetails.dataValues.isInstaller =
      userDetails.is_installer === "0" ? false : true;
    userDetails.dataValues.isInactive =
      userDetails.is_inactive === "0" ? false : true;
    userDetails.dataValues.isFob = userDetails.is_fob === "0" ? false : true;
    userDetails.dataValues.isSupervisor =
      userDetails.is_supervisor === "0" ? false : true;
    userDetails.dataValues.isHousekeeping =
      userDetails.is_housekeeping === "0" ? false : true;
    return userDetails;
  };

  /**
   * @api        {POST} /users/modifyUserDetails
   * @apiName     update user details
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  modifyUserDetails = async (req, res, next) => {
    // const mob = req.body.phoneNumer
    try {
      // validate request
      const result = await ValidationService.addUserSchema().validateAsync(
        req.body
      );
      console.log("SuperVisor Data::::" + result.isSupervisor);
      console.log("housekeeper Data::::" + result.isSupervisor);
      console.log("SuperVisorWithoutEvent Data::::" + result.isSupervisorWithoutEvent);
      console.log("housekeeperwithoutEvent Data::::" + result.isHouseKeepingWithoutEvent);
      console.log("checkBoxFlag" + result.checkboxValue);
      // check email exist or not
      const isEmailExist = await User.findOne({
        where: {
          e_mail: result.emailId,
          id: {
            [Op.ne]: result.userId,
          },
        },
      });
      if (isEmailExist) throw createError.NotFound("Email id already exist");

      // check phone number exist or not
      // const isPhoneExist = await User.findOne({
      //   where: {
      //     phone_number: result.phoneNumer,
      //     id: {
      //       [Op.ne]: result.userId
      //     }
      //   }
      // });
      // if (isPhoneExist) throw createError.NotFound("Phone number already exist");

      // user data
      var isHouseKeeping;
      var isSupervisor;
      if (result.checkboxValue == "true") {
        isHouseKeeping = result.isHouseKeeping;
        isSupervisor = result.isSupervisor;
      } else {
        isHouseKeeping = result.isHouseKeepingWithoutEvent;
        isSupervisor = result.isSupervisorWithoutEvent;
      }

      const userData = {
        role_id: result.isInstaller == "0" ? 1 : 2,
        first_name: result.firstName,
        last_name: result.lastName,
        dispay_name: result.displayName,
        e_mail: result.emailId,
        phone_number: result.phoneNumer.split("-").join(""),
        user_notes: result.userNotes,
        is_sentinel: result.isSentinel,
        is_installer: result.isInstaller,
        is_fob: result.isFob,
        is_inactive: result.isInactive,
        is_housekeeping: isHouseKeeping,
        is_supervisor: isSupervisor,
      };

      let user = await User.update(userData, { where: { id: result.userId } });

      return res
        .status(200)
        .json({
          status: 1,
          message: "User modified successfully",
          payload: user,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/deleteUser
   * @apiName     Delete user
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  deleteUser = async (req, res, next) => {
    try {
      const success = await User.destroy({ where: { id: req.query.id } });
      return res
        .status(200)
        .json({ status: 1, message: "User removed successfully", payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getAssignedEkeys
   * @apiName     Get assigned ekeys of users
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getAssignedEkeys = async (req, res, next) => {
    try {
      let userId = req.query.userId;

      const ekeys = await UsersAssignedEkey.findAll({
        where: { user_id: userId, is_group: 0 },
        attributes: [
          "id",
          "ekey_id",
          "is_group",
          "status",
          "one_time_use",
          "schedule_days",
          "start_date_time",
          "end_date_time",
          "time_zone",
        ],
        include: [
          {
            model: DeviceConfiguration,
            as: "ekeyDetails",
            required: false,
            attributes: ["id", "serial_number", "full_name", "display_name"],
          },
        ],
        order: [
          [
            { model: DeviceConfiguration, as: "ekeyDetails" },
            "full_name",
            "ASC",
          ],
        ],
      });

      _map(ekeys, (el) => {
        if (el.is_group) {
          el.dataValues.ekeyStatus = {
            title: "Group Key",
            img: "lock-group.png",
          };
        } else if (el.one_time_use == "1" && el.status == "2") {
          el.dataValues.ekeyStatus = {
            title: "One Time Use Key",
            img: "lock-green.png",
          };
        } else if (el.one_time_use == "0") {
          var zone = JSON.parse(el.time_zone);
          const timezone = zone.full_time_zone;
          const currentTime = CommonService.dateFormat(timezone);
          var endDate = CommonService.dateFormat(timezone, el.end_date_time);
          if (Date.parse(currentTime) <= Date.parse(endDate)) {
            el.dataValues.ekeyStatus = {
              title: "Single Lock Key",
              img: "lock.png",
            };
          } else {
            el.dataValues.ekeyStatus = {
              title: "No Longer Valid",
              img: "lock-black.png",
            };
          }
        } else {
          el.dataValues.ekeyStatus = {
            title: "No Longer Valid",
            img: "lock-black.png",
          };
        }

        var zone = JSON.parse(el.time_zone);
        const timezone = zone ? zone.full_time_zone : null;
        el.dataValues.time_zone = zone ? zone : null;
        el.dataValues.start_date =
          el.start_date_time && timezone
            ? CommonService.dateFormat(
                timezone,
                el.start_date_time,
                "YYYY-MM-DD"
              )
            : null;
        el.dataValues.start_time =
          el.start_date_time && timezone
            ? CommonService.dateFormat(timezone, el.start_date_time, "HH:mm")
            : null;
        el.dataValues.end_date =
          el.end_date_time && timezone
            ? CommonService.dateFormat(timezone, el.end_date_time, "YYYY-MM-DD")
            : null;
        el.dataValues.end_time =
          el.end_date_time && timezone
            ? CommonService.dateFormat(timezone, el.end_date_time, "HH:mm")
            : null;
        el.dataValues.schedule_days =
          el.schedule_days && el.one_time_use == "0"
            ? JSON.parse(el.schedule_days)
            : null;
      });

      // Getting
      const eGroupKeys = await UsersAssignedEkey.findAll({
        where: { user_id: userId, is_group: 1 },
        order: [["id", "desc"]],
        group: ["group_id"],
        attributes: [
          "id",
          "ekey_id",
          "is_group",
          "group_id",
          "status",
          "one_time_use",
          "schedule_days",
          "start_date_time",
          "end_date_time",
          "time_zone",
        ],
        include: [
          {
            model: DeviceGroup,
            as: "deviceGroup",
            required: false,
            attributes: ["id", "full_name", "display_name"],
          },
          {
            model: DeviceConfiguration,
            as: "ekeyDetails",
            required: false,
            attributes: ["id", "serial_number", "full_name", "display_name"],
          },
        ],
      });

      _map(eGroupKeys, (el) => {
        if (el.is_group) {
          el.dataValues.ekeyStatus = {
            title: "Group Key",
            img: "lock-group.png",
          };
        } else if (el.one_time_use == "1" && el.status == "2") {
          el.dataValues.ekeyStatus = {
            title: "One Time Use Key",
            img: "lock-green.png",
          };
        } else if (el.one_time_use == "0") {
          var zone = JSON.parse(el.time_zone);
          const timezone = zone.full_time_zone;
          const currentTime = CommonService.dateFormat(timezone);
          var endDate = CommonService.dateFormat(timezone, el.end_date_time);
          if (Date.parse(currentTime) <= Date.parse(endDate)) {
            el.dataValues.ekeyStatus = {
              title: "Single Lock Key",
              img: "lock.png",
            };
          } else {
            el.dataValues.ekeyStatus = {
              title: "No Longer Valid",
              img: "lock-black.png",
            };
          }
        } else {
          el.dataValues.ekeyStatus = {
            title: "No Longer Valid",
            img: "lock-black.png",
          };
        }

        var zone = JSON.parse(el.time_zone);
        const timezone = zone ? zone.full_time_zone : null;
        el.dataValues.time_zone = zone ? zone : null;
        el.dataValues.start_date =
          el.start_date_time && timezone
            ? CommonService.dateFormat(
                timezone,
                el.start_date_time,
                "YYYY-MM-DD"
              )
            : null;
        el.dataValues.start_time =
          el.start_date_time && timezone
            ? CommonService.dateFormat(timezone, el.start_date_time, "HH:mm")
            : null;
        el.dataValues.end_date =
          el.end_date_time && timezone
            ? CommonService.dateFormat(timezone, el.end_date_time, "YYYY-MM-DD")
            : null;
        el.dataValues.end_time =
          el.end_date_time && timezone
            ? CommonService.dateFormat(timezone, el.end_date_time, "HH:mm")
            : null;
        el.dataValues.schedule_days =
          el.schedule_days && el.one_time_use == "0"
            ? JSON.parse(el.schedule_days)
            : null;
      });

      const msg = ekeys.length > 0 ? "Assigned ekeys" : "No record found";
      return res
        .status(200)
        .json({
          status: 1,
          message: msg,
          payload: ekeys,
          groupKeys: eGroupKeys,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/deleteAssignedEkey
   * @apiName     Delete assigned ekeys of users
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  deleteAssignedEkey = async (req, res, next) => {
    try {
      const success = await UsersAssignedEkey.destroy({
        where: { id: req.query.id },
      });
      return res
        .status(200)
        .json({ status: 1, message: "ekey removed successfully", payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/deleteAssignedGroup
   * @apiName     Delete assigned Group of users
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  deleteAssignedGroup = async (req, res, next) => {
    try {
      const success = await UsersAssignedEkey.destroy({
        where: { group_id: req.query.group_id },
      });
      return res
        .status(200)
        .json({ status: 1, message: "ekey removed successfully", payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getEkeys
   * @apiName     Get all users
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getEkeys = async (req, res, next) => {
    try {
      var deviceConf;
      if (req.query.type == "group" && req.query.userId) {
        var dGroup = await DeviceGroup.findAll({
          order: [["full_name", "asc"]],
          attributes: [
            "id",
            "full_name",
            "sch_monday",
            "sch_tuesday",
            "sch_wednesday",
            "sch_thursday",
            "sch_friday",
            "sch_saturday",
            "sch_sunday",
            "time_zone",
            [Sequelize.literal(`'group'`), "type"],
            [
              Sequelize.fn("date_format", Sequelize.col("start_at"), "%H:%i"),
              "start_at",
            ],
            [
              Sequelize.fn("date_format", Sequelize.col("end_at"), "%H:%i"),
              "end_at",
            ],
          ],
          where: {
            [Op.and]: [
              {
                status: {
                  [Op.ne]: "3",
                },
              },
              {
                id: {
                  [Op.in]: [
                    Sequelize.literal(
                      `(SELECT group_details_id FROM device_group_key)`
                    ),
                  ],
                },
              },
              {
                id: {
                  [Op.notIn]: [
                    Sequelize.literal(
                      `(SELECT group_id FROM users_assigned_ekey where group_id != '' && user_id=${req.query.userId})`
                    ),
                  ],
                },
              },
            ],
          },
        });

        var dConfig = await DeviceConfiguration.findAll({
          order: [["id", "DESC"]],
          attributes: [
            "id",
            "serial_number",
            "full_name",
            "display_name",
            "createdAt",
            // [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%m/%d/%Y %H:%i'), 'createdAt'],
            [Sequelize.literal(`'ekey'`), "type"],
          ],
          where: {
            id: {
              [Op.notIn]: [
                Sequelize.literal(
                  `(SELECT ekey_id FROM users_assigned_ekey where user_id=${req.query.userId})`
                ),
              ],
            },
          },
        });

        deviceConf = dConfig.concat(dGroup);
      }

      // else {
      //   deviceConf = await DeviceConfiguration.findAll({
      //     order: [["id", "DESC"]],
      //     attributes: ['id', 'serial_number', 'full_name', 'display_name', 'hardware_id', 'createdAt',
      //       // [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%m/%d/%Y %H:%i'), 'createdAt'],
      //       [Sequelize.literal(`'ekey'`), 'type'],
      //       [Sequelize.literal(`(SELECT createdAt FROM activity_log where device_id=Device_configuration.id order by id desc limit 1)`), 'lastActivity'],
      //     ]
      //   });
      // }
      else {
        deviceConf = await DeviceBatch.findAll({
          order: [["id", "DESC"]],
          attributes: [
            "id",
            "batch_name",
            "batch_number",
            "activation_date",
            "battery_replacement_date",
            "createdAt",
            // [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%m/%d/%Y %H:%i'), 'createdAt'],
          ],
        });
      }

      const msg = deviceConf.length > 0 ? "Ekeys listing" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: deviceConf });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getAllTimeZone
   * @apiName     Get all time zone
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getAllTimeZone = async (req, res, next) => {
    try {
      const timeZones = await SettingTimeZone.findAll({
        where: { is_inactive: "0" },
        attributes: ["id", "time_zone", "full_time_zone"],
      });

      const msg = timeZones.length > 0 ? "Timezone listing" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: timeZones });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getDeviceDetails
   * @apiName     Get device details
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getDeviceDetails = async (req, res, next) => {
    try {
      console.log("backend Hited");
      const deviceBatchId = req.query.deviceId;
      console.log("device info id::" + deviceBatchId);
      // check user password
      const isBatchExist = await DeviceBatch.findOne({
        where: { id: deviceBatchId },
      });

      if (isBatchExist) {
        console.log("batch found");
      }

      const deviceDetails = await DeviceConfiguration.findAll({
        where: { devicebatch_id: deviceBatchId },
        attributes: ["hardware_id"],
      });
      var deviceConfigurationList = [];
      deviceDetails.forEach((el) => {
        deviceConfigurationList.push({ hardwareId: el.hardware_id });
      });

      // schedule
      // const scheduleData = await DeviceConfigurationSchedule.findAll({
      //   where: { device_configure_id: deviceId },
      //   order: [['id', 'asc']],
      //   attributes: ['schedule_day', 'close_whole_day', 'open_time', 'close_time',
      //     [Sequelize.fn('date_format', Sequelize.col('open_time'), '%H:%i'), 'open_time'],
      //     [Sequelize.fn('date_format', Sequelize.col('close_time'), '%H:%i'), 'close_time']]
      // });
      // var schedule = {}
      // scheduleData.forEach(el => {
      //   schedule[el.schedule_day] = (el.close_whole_day == '0' ? 'Closed All Day' : (el.open_time + '-' + el.close_time))
      // });

      // exceptions
      // const exceptionsData = await DeviceConfigurationException.findAll({
      //   where: { device_configure_id: deviceId },
      //   order: [['schedule_full_date', 'asc'], ['open_time', 'asc']],
      //   attributes: ['close_whole_day', 'open_time', 'close_time',
      //     [Sequelize.fn('date_format', Sequelize.col('open_time'), '%H:%i'), 'open_time'],
      //     [Sequelize.fn('date_format', Sequelize.col('close_time'), '%H:%i'), 'close_time'],
      //     [Sequelize.fn('date_format', Sequelize.col('schedule_full_date'), '%M %d'), 'schedule_full_date']]
      // });
      // var exceptions = []
      // exceptionsData.forEach(el => {
      //   var exp = el.schedule_full_date + ' - ' + (el.close_whole_day == '0' ? 'Closed All Day' : (el.open_time + '-' + el.close_time))
      //   exceptions.push({ exceptionsDays: exp });
      // });

      // users
      // const usersData = await UsersAssignedEkey.findAll({
      //   where: { ekey_id: deviceId },
      //   attributes: ['id'],
      //   include: [
      //     {
      //       model: User,
      //       required: false,
      //       order: [["dispay_name", "ASC"]],
      //       attributes: ['id', 'dispay_name']
      //     }
      //   ]
      // });
      // var users = []
      // usersData.forEach(el => {
      //   if (el.User) {
      //     users.push({ user_id: el.User.id, display_name: el.User.dispay_name });
      //   }
      // });

      // const deviceGroupData = await DeviceGroup.findAll({
      //   order: [["full_name", "asc"]],
      //   attributes: ['id', 'full_name'],
      //   where: {
      //     id: {
      //       [Op.in]: [Sequelize.literal(`(SELECT group_details_id FROM device_group_key where device_id=${deviceId})`)]
      //     }
      //   }
      // });

      // deviceDetails.dataValues.schedule = schedule
      // deviceDetails.dataValues.exceptions = exceptions
      // deviceDetails.dataValues.users = users
      // deviceDetails.dataValues.deviceGroup = deviceGroupData
      isBatchExist.dataValues.deviceConfiguration = deviceConfigurationList;
      // deviceDetails.dataValues.deviceInfo = isBatchExist

      const msg = isBatchExist ? "Device batch details" : "No record found";
      console.log(deviceDetails);
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: isBatchExist });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getUserPermissions
   * @apiName     Get user's permissions
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getUserPermissions = async (req, res, next) => {
    try {
      const roleId = req.query.roleId;
      const permissionDetails = await Permission.findOne({
        where: { role_id: roleId },
        attributes: {
          exclude: [
            "id",
            "role_id",
            "permission_title",
            "permission_description",
          ],
        },
      });
      permissionDetails.permission_module = JSON.parse(
        permissionDetails.permission_module
      );
      const msg = permissionDetails ? "User permissions" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: permissionDetails });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getRoles
   * @apiName     Get roles
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getRoles = async (req, res, next) => {
    try {
      const roles = await Role.findAll({
        order: [["id", "desc"]],
        attributes: ["id", "role_title", "role_description"],
        include: [
          {
            model: Permission,
            as: "Permission",
            required: false,
            attributes: { exclude: ["id", "role_id"] },
          },
        ],
      });

      _map(roles, (el) => {
        let permissions = el.Permission ? el.Permission : null;
        el.dataValues.permission_add = permissions
          ? permissions.permission_add
          : false;
        el.dataValues.permission_modifly = permissions
          ? permissions.permission_modifly
          : false;
        el.dataValues.permission_delete = permissions
          ? permissions.permission_delete
          : false;
        el.dataValues.permission_view = permissions
          ? permissions.permission_view
          : false;
        el.dataValues.permission_all = permissions
          ? permissions.permission_all
          : false;
        el.dataValues.permission_title = permissions
          ? permissions.permission_title
          : "";
        el.dataValues.permission_description = permissions
          ? permissions.permission_description
          : "";
        el.dataValues.permission_module = permissions
          ? JSON.parse(permissions.permission_module)
          : "";

        delete el.dataValues.Permission;
      });

      const msg = roles ? "Role listing" : "No record found";
      return res.status(200).json({ status: 1, message: msg, payload: roles });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /users/getUsers
   * @apiName     Get user list for role
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getUsers = async (req, res, next) => {
    try {
      var users;
      if (req.query.type == "assigned") {
        users = await User.findAll({
          where: {
            [Op.and]: [
              {
                role_id: { [Op.ne]: 1 },
              },
              {
                role_id: { [Op.ne]: 2 },
              },
              {
                is_inactive: "0",
              },
            ],
          },
          order: [["dispay_name", "asc"]],
          attributes: ["id", "dispay_name"],
          include: [
            {
              model: Role,
              as: "Role",
              required: false,
              attributes: ["id", "role_title"],
            },
          ],
        });
      } else {
        users = await User.findAll({
          where: {
            [Op.and]: [
              {
                [Op.or]: [{ role_id: 1 }, { role_id: 2 }, { role_id: null }],
              },
              {
                is_inactive: "0",
              },
            ],
          },
          order: [["dispay_name", "asc"]],
          attributes: ["id", "dispay_name"],
        });
      }

      const msg = users ? "User listing" : "No record found";
      return res.status(200).json({ status: 1, message: msg, payload: users });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/createRole
   * @apiName     create role
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  createRole = async (req, res, next) => {
    try {
      const result = req.body;

      // create key data
      const roleData = {
        role_title: result.role_title,
        role_description: result.role_description,
      };

      let role = await Role.create(roleData);

      const permissionData = {
        role_id: role.id,
        permission_add: result.permission_add,
        permission_modifly: result.permission_modifly,
        permission_view: result.permission_view,
        permission_delete: result.permission_delete,
        permission_all: result.permission_all,
        permission_title: result.permission_title,
        permission_description: result.permission_description,
        permission_module: JSON.stringify(result.permission_module),
      };

      let permission = await Permission.create(permissionData);

      return res
        .status(200)
        .json({ status: 1, message: "Role created successfully", payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/modifyRole
   * @apiName     modify role
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  modifyRole = async (req, res, next) => {
    try {
      const result = req.body;

      // create key data
      const roleData = {
        role_title: result.role_title,
        role_description: result.role_description,
      };

      await Role.update(roleData, { where: { id: result.id } });

      const permissionData = {
        permission_add: result.permission_add,
        permission_modifly: result.permission_modifly,
        permission_view: result.permission_view,
        permission_delete: result.permission_delete,
        permission_all: result.permission_all,
        permission_title: result.permission_title,
        permission_description: result.permission_description,
        permission_module: JSON.stringify(result.permission_module),
      };

      await Permission.update(permissionData, {
        where: { role_id: result.id },
      });

      return res
        .status(200)
        .json({
          status: 1,
          message: "Role modified successfully",
          payload: result,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/getRoleDetails
   * @apiName     get role details
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getRoleDetails = async (req, res, next) => {
    try {
      const roleId = req.query.id;
      const roles = await Role.findOne({
        where: { id: roleId },
        attributes: ["id", "role_title", "role_description"],
        include: [
          {
            model: Permission,
            as: "Permission",
            required: false,
            attributes: { exclude: ["id", "role_id"] },
          },
        ],
      });

      let permissions = roles.Permission ? roles.Permission : null;
      roles.dataValues.permission_add = permissions
        ? permissions.permission_add
        : false;
      roles.dataValues.permission_modifly = permissions
        ? permissions.permission_modifly
        : false;
      roles.dataValues.permission_delete = permissions
        ? permissions.permission_delete
        : false;
      roles.dataValues.permission_view = permissions
        ? permissions.permission_view
        : false;
      roles.dataValues.permission_all = permissions
        ? permissions.permission_all
        : false;
      roles.dataValues.permission_title = permissions
        ? permissions.permission_title
        : "";
      roles.dataValues.permission_description = permissions
        ? permissions.permission_description
        : "";
      roles.dataValues.permission_module = permissions
        ? JSON.parse(permissions.permission_module)
        : "";

      delete roles.dataValues.Permission;

      const msg = roles ? "Role details" : "No record found";
      return res.status(200).json({ status: 1, message: msg, payload: roles });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {DELETE} /users/deleteRole
   * @apiName     delete role
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  deleteRole = async (req, res, next) => {
    try {
      const success = await Role.destroy({ where: { id: req.query.id } });
      return res
        .status(200)
        .json({ status: 1, message: "Role removed successfully", payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/assignRoleToUser
   * @apiName     assign role to user
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  assignRoleToUser = async (req, res, next) => {
    try {
      const result = req.body;

      // create key data
      const roleId = result.role_id;
      const userId = result.user_id;

      await User.update({ role_id: roleId }, { where: { id: userId } });

      return res
        .status(200)
        .json({
          status: 1,
          message: "Role assigned successfully",
          payload: {},
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/removeRoleFromUser
   * @apiName     remove Role From User
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  removeRoleFromUser = async (req, res, next) => {
    try {
      const userId = req.query.id;
      await User.update({ role_id: null }, { where: { id: userId } });

      return res
        .status(200)
        .json({ status: 1, message: "Role removed successfully", payload: {} });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/getActivityLogs
   * @apiName     Get all activity logs with filters
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  /*getActivityLogs = async (req, res, next) => {
    try {
      const result = req.body;
      const filterFromDate = result.filterFromDate
      const filterToDate = result.filterToDate
      const filterOperationType = result.filterOperationType
      const id = result.id
      const type = result.type                                     
      const page = result.page
      const limit = result.limit
      const sort = result.sort

      var conditions = []

      // filters
      // user/device filter by id and type
      if (id != "" && (type == "user" || type == "device" || type == "deviceGroup")) {
        let cond = (type == "user" ? { user_id: id } : (type == "device" ? { device_id: id } : { device_group_id: id }))
        conditions.push(cond)
      }

      if (filterFromDate != "" && filterFromDate != undefined && filterToDate != "" && filterToDate != undefined) {
        const fromDate = moment(filterFromDate).format('YYYY-MM-DD 00:00:00')
        const toDate = moment(filterToDate).format('YYYY-MM-DD 23:59:59')
        conditions.push({ createdAt: { [Op.between]: [fromDate, toDate] } })
      }

      if (filterOperationType != "" && filterOperationType != undefined && filterOperationType != "All") {
        conditions.push({ operation_type: filterOperationType })
      }

      // SORTING
      var sortData = sort ? [sort.table, sort.column, sort.type] : ['id', 'desc']

      const logs = await ActivityLog.findAndCountAll({
        where: {
          [Op.and]: conditions
        },
        // order:[['id', 'desc']],
        attributes: { exclude: ['updatedAt'] },
        include: [{
          model: DeviceConfiguration,
          as: 'Device',
          required: false,
          attributes: ['id', 'serial_number', 'display_name']
        },
        {
          model: User,
          as: 'User',
          required: false,
          attributes: ['id', 'dispay_name']
        }, {
          model: DeviceGroup,
          as: 'DeviceGroup',
          required: false,
          attributes: ['id', ['full_name', 'display_name']]
        }],
        order: [sortData],                                                                                
        offset: ((page) * limit),
        limit: limit,
      });

      const msg = logs.rows.length > 0 ? 'Activity log listing' : 'No record found';
      return res.status(200).json({ status: 1, message: msg, payload: logs });

    } catch (error) {
      if (error.isJoi === true) error.status = 422                             
      next(error)
    }
  }*/
  getActivityLogs = async (req, res, next) => {
    try {
      const result = req.body;
      const filterFromDate = result.filterFromDate;
      const filterToDate = result.filterToDate;
      const filterOperationType = result.filterOperationType;
      const id = result.id;
      const type = result.type;

      var conditions = [];

      // filters
      // user/device filter by id and type
      if (
        id != "" &&
        (type == "user" || type == "device" || type == "deviceGroup")
      ) {
        let cond =
          type == "user"
            ? { user_id: id }
            : type == "device"
            ? { device_id: id }
            : { device_group_id: id };
        conditions.push(cond);
      }

      if (
        filterFromDate != "" &&
        filterFromDate != undefined &&
        filterToDate != "" &&
        filterToDate != undefined
      ) {
        const fDate = moment(filterFromDate).format("YYYY-MM-DD");
        const tDate = moment(filterToDate).format("YYYY-MM-DD");
        //const fDateTime = CommonService.UTCDateTimeFormat(fDate+' 00:00:00', 'Asia/Calcutta')
        //const tDateTime = CommonService.UTCDateTimeFormat(tDate+' 23:59:59', 'Asia/Calcutta')
        var doo = new Date(filterFromDate);
        var fDateTime = new Date(
          doo.getTime() - doo.getTimezoneOffset() * -60000
        );

        //const tDateTime = CommonService.UTCDateTimeFormat(tDate+' 23:59:59', 'Asia/Calcutta')
        var doo1 = new Date(filterToDate);
        var tDateTime = new Date(
          doo1.getTime() - doo1.getTimezoneOffset() * -60000
        );

        const fDate1 = moment(fDateTime).format("YYYY-MM-DD");
        const tDate1 = moment(filterToDate).format("YYYY-MM-DD");

        var fDateTime1 = fDate1 + " 00:00:00";
        var tDateTime1 = tDate1 + " 23:59:59";

        fDateTime1 = new Date(new Date(fDateTime1) + 24 * 60 * 60 * 1000);
        tDateTime1 = new Date(new Date(tDateTime1) + 24 * 60 * 60 * 1000);

        conditions.push({
          createdAt: {
            [Op.and]: [{ [Op.gte]: fDateTime1 }, { [Op.lte]: tDateTime1 }],
          },
        });
      }

      if (
        filterOperationType != "" &&
        filterOperationType != undefined &&
        filterOperationType != "All"
      ) {
        conditions.push({ operation_type: filterOperationType });
      }

      const logs = await ActivityLog.findAndCountAll({
        where: {
          [Op.and]: conditions,
        },
        order: [["id", "desc"]],
        attributes: { exclude: ["updatedAt"] },
        // include: [{
        //   model: DeviceConfiguration,
        //   as: 'Device',
        //   required: false,
        //   attributes: ['id', 'serial_number', 'display_name']
        // },
        // {
        //   model: User,
        //   as: 'User',
        //   required: false,
        //   attributes: ['id', 'dispay_name', 'e_mail', 'phone_number']
        // }, {
        //   model: DeviceGroup,
        //   as: 'DeviceGroup',
        //   required: false,
        //   attributes: ['id', ['full_name', 'display_name']]
        // }]
      });

      const msg =
        logs.rows.length > 0 ? "Activity log listing" : "No record found";
      return res.status(200).json({ status: 1, message: msg, payload: logs });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /user/createActivityLogNotes
   * @apiName     Create activity log notes
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  createActivityLogNotes = async (req, res, next) => {
    try {
      var result = req.body;
      const Data = {
        activity_log_id: result.activityLogId,
        note_description: result.notes,
      };

      let success = await ActivityLogNotes.create(Data);

      return res
        .status(200)
        .json({
          status: 1,
          message: "Notes created successfully",
          payload: success,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /user/getActivityLogNotes
   * @apiName     Get activity log notes
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getActivityLogNotes = async (req, res, next) => {
    try {
      var activityLogId = req.query.id;

      const activityLogNotes = await ActivityLogNotes.findAll({
        order: [["id", "desc"]],
        where: {
          activity_log_id: activityLogId,
        },
      });

      return res
        .status(200)
        .json({
          status: 1,
          message: "List successfully",
          payload: activityLogNotes,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/webForgotPassword
   * @apiName     Forgot password with email or mobile
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  webForgotPassword = async (req, res, next) => {
    try {
      req.body.company_id = req.body.companyId;
      const result =
        await ValidationService.webForgotPasswordSchema().validateAsync(
          req.body
        );

      let userName = result.userName;
      let companyId = result.companyId;
      const company = await Company.findOne({
        where: { company_id: companyId },
      });
      if (!company) throw createError.NotFound("Invalid Email or Company ID");

      const compId = company.id;

      const isUserExit = await User.findOne({
        where: {
          [Op.and]: [{ e_mail: userName }, { company_id: compId }],
        },
      });
      if (!isUserExit)
        throw createError.NotFound("Invalid Email or Company ID");

      if (isUserExit) {
        const uniquekey = CommonService.generateTempPassword(10, "alphaNumber");
        await User.update(
          { unique_code: uniquekey },
          { where: { e_mail: userName } }
        );
        const mailData = {
          to: userName,
          companyId: company.id,
          companyName: company.company_name,
          unique_code: uniquekey,
        };
        await this.mailToUserOnForgotPassword(mailData, company.id);
      }
      next();
      return res
        .status(200)
        .json({
          status: 1,
          message: "Reset password link has been sent to " + userName,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /users/webReSetPassword
   * @apiName     Reset password
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at  {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */
  webReSetPassword = async (req, res, next) => {
    try {
      // validate request
      const result =
        await ValidationService.webResetPasswordSchema().validateAsync(
          req.body
        );
      let password = result.password;
      let uid = result.uid;

      let update = await User.update(
        { password: bcrypt.hashSync(password, 8) },
        { where: { unique_code: uid } }
      );
      if (!update) throw createError.NotFound("Error while Updating Password");

      return res
        .status(200)
        .json({ status: 1, message: "Your password successfully changed" });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  // sent mail on forgot password
  mailToUserOnForgotPassword = async (data, compId) => {
    const mailData = {
      to: data.to,
      subject: "Forgot Password with LOCK-CART",
      html_text: `<!doctype html>
      <html>
      
      <head>
        <meta charset="utf-8">
        <title>LOCK_CART</title>
      </head>
      
      <body style="padding: 0; margin: 0; font-family:Arial; line-height: 24px;">
        <div
          style="width: 100%; max-width: 700px; padding:0 15px; margin: 20px auto 20px auto; display: table; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
          <div
            style="width: 100%;  background: #fff; border: 1px solid #d7e7ee; padding: 15px; border-radius: 10px; -moz-border-radius: 10px; -webkit-border-radius: 10px; -o-border-radius: 10px; -ms-border-radius: 10px; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
            <p style="font-size: 16px;">You have requested to change your password</p>
            
            <p style="font-size: 14px;"><span style="font-weight: 600;"><a style="color:blue; text-decoration:underline;" href="${BASE_URL}reset-password/${data.unique_code}">Click Here </a>to change your password.</span></p>
   
            <p style="font-size: 14px;">Not you? Contact your system administrator to report this incident</p>
             
          </div>
        </div>                                      
      </body> 
      </html>`,
    };

    await CommonService.sendMail(mailData, compId);
  };

  // sent mail to new gesiterd user
  mailToUserOnRegisterd = async (data, compId) => {
    
     const link="http://3.209.221.175:3000/";
    console.log("Sending Email");
    const mailData = {
      to: data.to,
      subject: "Registered with LOCK-CART",
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
        <p style="font-size: 25px; font-weight: 600; color:#09589d;">Welcome to LOCK-CART!</p>
        <p style="font-size: 14px; font-weight: 300; color:#404244;">You have been set up with a LOCK-CART account with <span style="font-weight: 600;">${data.companyName}</span>.</p>
        <p style="font-size: 14px; font-weight: 300; color:#404244;">
          Company ID: <span style="font-weight: 600;">${data.companyId}</span><br />
          Username: <span style="font-weight: 600;"><a style="color:blue; text-decoration:underline;" href="mailto:${data.to}">${data.to}</a></span><br /> 
          </p>
        
        <p style="font-size: 14px; font-weight: 300; color:#404244;">
        <a style="color:blue; text-decoration:underline;" href="${link}resetPassword/${data.companyId}/${data.to}">Click Here</a> to set a password for this account.
        </p>

        
      </div>
    </div>
  </body>
      
      </html>`,
    };

    await CommonService.sendMail(mailData, compId);
  };

  // test mail
  testMail = async (req, res, next) => {
    try {
      const mailData = {
        to: "saurvsatpathy@virtualemployee.com",
        subject: "Test Mail",
        html_text: `<!doctype html>
        <html>
        
        <head>
          <meta charset="utf-8">
          <title>ADSD</title>
        </head>
        
        <body style="padding: 0; margin: 0; font-family:Arial; line-height: 24px;">
          <div
            style="width: 100%; max-width: 700px; padding:0 15px; margin: 20px auto 20px auto; display: table; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
            <div
              style="width: 100%;  background: #fff; border: 1px solid #d7e7ee; padding: 15px; border-radius: 10px; -moz-border-radius: 10px; -webkit-border-radius: 10px; -o-border-radius: 10px; -ms-border-radius: 10px; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box;">
              <p style="font-size: 16px;">Hi! <strong>Saurav,</strong></p>
              <p style="font-size: 14px;">You are registered with LOCK_CART with <strong>Comany</strong></p>
              <p style="font-size: 14px;">
                Your Company Id is: <strong>1004</strong><br />
                Your User Name is: <strong>1004</strong><br />
                Your Password is: <strong>1004</strong>
              </p>
            </div>
          </div>
        </body>
        
        </html>`,
      };
      console.log(mailData);
      const sucess = await CommonService.sendMail(mailData);
      return res
        .status(200)
        .json({ status: 1, message: "Sent successfully", payload: sucess });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  //END OF CLASS
}
export default new UserController();
