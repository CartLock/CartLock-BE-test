import HttpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import {
  User,
  Role,
  Permission,
  Company,
  Device,
  ServiceTicket,
  ActivityLog,
  DeviceGroup,
  DeviceGroupKey,
  EKey,
  DeviceConfiguration,
  UsersAssignedEkey,
  DeviceBatch,
} from "../../util/middleware/connection";
import CommonService from "../../util/helpers/common";
import ValidationService from "../../util/helpers/validation_schema_admin";
import { Op, Sequelize } from "sequelize";
import createError from "http-errors";
import { isElement } from "lodash";
import _map from "lodash/map";
import moment from "moment";
import { json } from "body-parser";

const server_url = process.env.SERVER_URL;
const operatorsAliases = {
  $eq: Op.eq,
  $or: Op.or,
};
class deviceGroupController {
  constructor() {}

  /**
   * @api        {POST} /deviceGroup/getAvailableDevices
   * @apiName     get list of all available devices
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  registerDevice = async (req, res, next) => {};

  getAvailableDevices = async (req, res, next) => {
    try {
      const groupId = req.query.groupId;
      var deviceConf;
      if (groupId) {
        deviceConf = await DeviceConfiguration.findAll({
          order: [["id", "DESC"]],
          attributes: [
            "id",
            "serial_number",
            "full_name",
            "display_name",
            "createdAt",
            [
              Sequelize.fn(
                "date_format",
                Sequelize.col("createdAt"),
                "%m/%d/%Y %H:%i"
              ),
              "createdAt",
            ],
          ],
          where: {
            id: {
              [Op.notIn]: [
                Sequelize.literal(
                  `(SELECT device_id FROM device_group_key where group_details_id=${groupId})`
                ),
              ],
            },
          },
        });
      } else {
        deviceConf = await DeviceConfiguration.findAll({
          order: [["id", "DESC"]],
          attributes: [
            "id",
            "serial_number",
            "full_name",
            "display_name",
            "createdAt",
            [
              Sequelize.fn(
                "date_format",
                Sequelize.col("createdAt"),
                "%m/%d/%Y %H:%i"
              ),
              "createdAt",
            ],
          ],
        });
      }

      const msg =
        deviceConf.length > 0 ? "Available devices listing" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: deviceConf });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /deviceGroup/createDeviceGroup
   * @apiName     create group of devices
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */
  createDeviceGroup = async (req, res, next) => {
    try {
      // validate request
      const result =
        await ValidationService.createDeviceGroupSchema().validateAsync(
          req.body
        );

      // device configure data
      const deviceGroupData = {
        display_name: result.display_name,
        full_name: result.full_name,
        description: result.description,
        sch_monday: result.sch_monday,
        sch_tuesday: result.sch_tuesday,
        sch_wednesday: result.sch_wednesday,
        sch_thursday: result.sch_thursday,
        sch_friday: result.sch_friday,
        sch_saturday: result.sch_saturday,
        sch_sunday: result.sch_sunday,
        start_at: result.start_at,
        end_at: result.end_at,
        time_zone: result.time_zone ? JSON.stringify(result.time_zone) : null,
        status: result.status,
      };

      let deviceGroup = await DeviceGroup.create(deviceGroupData);
      //create device group
      if (deviceGroup.id && result.available_devices.length > 0) {
        var deviceData = [];
        result.available_devices.forEach((element) => {
          deviceData.push({
            group_details_id: deviceGroup.id,
            device_id: element.id,
            device_full_name: element.full_name,
          });
        });

        deviceGroup.dataValues.available_devices =
          await DeviceGroupKey.bulkCreate(deviceData);
      }

      return res.status(200).json({
        status: 1,
        message: "Device group created successfully",
        payload: deviceGroup,
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /deviceGroup/getDeviceGroups
   * @apiName     get list of all created device groups
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getDeviceGroups = async (req, res, next) => {
    try {
      const companyId = req.user.company_id;
      const deviceGroups = await DeviceGroup.findAll({
        order: [["id", "DESC"]],
      });

      const msg =
        deviceGroups.length > 0 ? "Device group listing" : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: deviceGroups });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /deviceGroup/getDeviceGroupDetails
   * @apiName     get details of device group
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getDeviceGroupDetails = async (req, res, next) => {
    try {
      const deviceGroupId = req.query.id;
      const deviceGroupDetails = await DeviceGroup.findOne({
        where: { id: deviceGroupId },
      });

      const deviceDetails = await DeviceGroupKey.findAll({
        where: { group_details_id: deviceGroupId },
        attributes: [
          ["device_id", "id"],
          ["device_full_name", "full_name"],
        ],
      });

      let msg = "";
      if (deviceGroupDetails) {
        deviceGroupDetails.dataValues.start_at = deviceGroupDetails.start_at
          ? moment(
              moment().format("YYYY-MM-DD " + deviceGroupDetails.start_at)
            ).format("HH:mm")
          : null;
        deviceGroupDetails.dataValues.end_at = deviceGroupDetails.end_at
          ? moment(
              moment().format("YYYY-MM-DD " + deviceGroupDetails.end_at)
            ).format("HH:mm")
          : null;
        deviceGroupDetails.dataValues.deviceDetails = deviceDetails;
        deviceGroupDetails.dataValues.time_zone = deviceGroupDetails.time_zone
          ? JSON.parse(deviceGroupDetails.time_zone)
          : "";

        msg = "Device group details";
      } else {
        msg = "No record found";
      }

      return res
        .status(200)
        .json({ status: 1, message: msg, payload: deviceGroupDetails });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /deviceGroup/deleteDeviceGroup
   * @apiName     delete device group
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  deleteDeviceGroup = async (req, res, next) => {
    try {
      const success = await DeviceGroup.destroy({
        where: { id: req.query.id },
      });
      return res.status(200).json({
        status: 1,
        message: "Device group removed successfully",
        payload: {},
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /deviceGroup/modiflyDeviceGroup
   * @apiName     modify group devices
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */
  modifyDeviceGroup = async (req, res, next) => {
    try {
      // validate request
      const result =
        await ValidationService.createDeviceGroupSchema().validateAsync(
          req.body
        );

      // device configure data
      const deviceGroupData = {
        display_name: result.display_name,
        full_name: result.full_name,
        description: result.description,
        sch_monday: result.sch_monday,
        sch_tuesday: result.sch_tuesday,
        sch_wednesday: result.sch_wednesday,
        sch_thursday: result.sch_thursday,
        sch_friday: result.sch_friday,
        sch_saturday: result.sch_saturday,
        sch_sunday: result.sch_sunday,
        start_at: result.start_at,
        end_at: result.end_at,
        time_zone: result.time_zone ? JSON.stringify(result.time_zone) : null,
        status: result.status,
      };

      let deviceGroup = await DeviceGroup.update(deviceGroupData, {
        where: { id: result.id },
      });

      // update device device details
      await DeviceGroupKey.destroy({
        where: {
          group_details_id: result.id,
        },
      });
      if (result.id && result.available_devices.length > 0) {
        var deviceData = [];
        result.available_devices.forEach((element) => {
          deviceData.push({
            group_details_id: result.id,
            device_id: element.id,
            device_full_name: element.full_name,
          });
        });

        await DeviceGroupKey.bulkCreate(deviceData);
      }

      return res.status(200).json({
        status: 1,
        message: "Device group modified successfully",
        payload: {},
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  //Added By Saurav

  createDeviceBatch = async (req, res, next) => {
    console.log("Backend Hited");
    try {
      const result =
        await ValidationService.createDeviceBatchSchema().validateAsync(
          req.body
        );
      console.log(result.ExcelFileData);
      if (result.ExcelFileData) {
        const excelData = JSON.parse(result.ExcelFileData);
        const deviceBatchData = {
          batch_name: result.batchName,
          activation_date: result.activationDate,
          batch_number: result.batchNo,
          battery_replacement_date: result.relcementdate,
          no_of_device: excelData.length-1,
        };
        //checking is the batch already availbale
        const isBatchExist = await DeviceBatch.findOne({
          where: { batch_name: result.batchName },
        });
        if (isBatchExist)
          throw createError.NotFound("Batch Alreday Exist with Same Name");

        let deviceBatch = await DeviceBatch.create(deviceBatchData);
        var deviceBatchId = deviceBatch.id;

        var deviceConfigurationData = [];

        if (deviceBatchId && excelData.length > 0) {
          const defaultName = "test";
          for (let index = 1; index < excelData.length; index++) {
            const eachRowData = excelData[index];
            deviceConfigurationData.push({
              user_id: result.userId,
              devicebatch_id: deviceBatchId,
              company_id: result.companyId,
              serial_number: eachRowData[0],
              full_name: defaultName,
              display_name: defaultName,
              lock_type: null,
              relock_trigger: null,
              trigger_mode: null,
              relock_timer: null,
              motor_run_time: null,
              motor_direction: null,
              servo_unlock_position: null,
              servo_lock_position: null,
              servo_power_time: null,
              motor_voltage: null,
              manual_lock: "0",
              sleep_mode: "0",
              bluetooth_power_level: null,
              schedule_open: "0",
              sensor1_open_name: null,
              sensor1_close_name: null,
              sensor2_open_name: null,
              sensor2_close_name: null,
              hardware_id: eachRowData[1],
              battery_level: null,
              fw_version: null,
              device_type: null,
              uuid: null,
              dnort_time: null,
              type: eachRowData[3],
              description: eachRowData[4],
              model_number: eachRowData[2],
            });
          }
          try {
            await DeviceConfiguration.bulkCreate(deviceConfigurationData);
          } catch (error) {
            if (error.isJoi === true) error.status = 422;
            next(error);
          }
        }

        return res.status(200).json({
          status: 1,
          message: "Device batch created successfully",
          batchId:deviceBatchId,
          payload: {deviceBatch },
        });
      }
      return res.status(200).json({
        status: 0,
        message: "Required Excel Data",
        payload: { },
      });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  //END OF CLASS
}
export default new deviceGroupController();
