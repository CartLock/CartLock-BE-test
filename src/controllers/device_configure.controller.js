import {
  Device,
  DeviceConfiguration, DeviceConfigurationSchedule, DeviceConfigurationException, SettingLockTypes, SettingReLockTriggers,
  SettingReLockTimmer, SettingTriggerEvents, SettingMotorDirections, SettingMotorVoltage, SettingServoPowerTime,
  SettingServoLockUnlockPostion, SettingBluetoothLevel, SettingMotorRunTime, UsersAssignedEkey, ActivityLog,
  SettingCompany
} from "../util/middleware/connection";
import CommonService from "../util/helpers/common";
import ValidationService from "../util/helpers/validation_schema";
import { Op, Sequelize } from "sequelize";
import createError from "http-errors"
import { parseString } from "xml2js";
import moment from 'moment';
import { object, string } from "@hapi/joi";
import _map from 'lodash/map';

class DeviceConfiureController {
  constructor() {

  }


getDeviceDetails = async (req, res, next) => {
    try {
      const result = await ValidationService.createDevice().validateAsync(
        req.body
      );
      console.log("Validation Schema::" + result.macAddress);
      console.log("Before Fecthiong Query");
      //check if user alreday Register or not
      const isDeviceExist = await DeviceConfiguration.findOne({
        where: { hardware_id: result.macAddress },
        //here we need to write the like operator query
        attributes: [
          "id",
          "full_name",
          "display_name",
          "hardware_id",
          "createdAt",
          "updatedAt",
          "company_id",
        ],
      });

      if (isDeviceExist) {
        //getting Company Details
        const companySettings = await SettingCompany.findOne({
          where: { company_id: isDeviceExist.company_id },
          attributes: [
            "id",
            "company_id",
            "payment_cost",
            "currency",
            "waiting_hour",
          ],
        });
        isDeviceExist.dataValues.companySettings = companySettings;
      } else {
        return res.status(200).json({
          status: 0,
          message: "Device Not Found",
        });
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };



  /**
  * @api        {POST} /device/createDeviceConfigure
  * @apiName     Create device configure
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  createDeviceConfigure = async (req, res, next) => {
    try {
      // validate request
      if (req.body.userType == "ios") {
        if (typeof req.body.schedule === 'string') {
          req.body.schedule = JSON.parse(req.body.schedule);
        }
        if (typeof req.body.exceptions === 'string') {
          req.body.exceptions = JSON.parse(req.body.exceptions);
        }
      }
      const result = await ValidationService.createDeviceConfigureSchema().validateAsync(req.body)

      // check given serial's device configuration already exit or not
      const isConfigureExit = await DeviceConfiguration.findOne({
        where: {
          [Op.or]:[{
            serial_number: result.serial_number,
          },
          {
            full_name: result.full_name,
          }]
        }
      });
      
      if (isConfigureExit && isConfigureExit.serial_number == result.serial_number) throw createError.NotFound("Device configure already exist with given serial number");
      else if (isConfigureExit && isConfigureExit.full_name == result.full_name) throw createError.NotFound("Device configure already exist with given full name");

      // device configure data
      const userId = req.user.id;
      const companyId = req.user.company_id;
      const uuid = CommonService.generateTempPassword(32, 'alphaNumber2')

      const deviceConfigureData = {
        user_id: userId,
        serial_number: result.serial_number,
        full_name: result.full_name,
        display_name: result.display_name,
        lock_type: result.lock_type,
        relock_trigger: result.relock_trigger,
        trigger_mode: result.trigger_mode,
        relock_timer: result.relock_timer,
        motor_run_time: result.motor_run_time,
        motor_direction: result.motor_direction,
        servo_unlock_position: result.servo_unlock_position,
        servo_lock_position: result.servo_lock_position,
        servo_power_time: result.servo_power_time,
        motor_voltage: result.motor_voltage,
        manual_lock: result.manual_lock,
        sleep_mode: result.sleep_mode,
        bluetooth_power_level: result.bluetooth_power_level,
        schedule_open: result.schedule.length != 7 ? '0' : result.schedule_open,
        sensor1_open_name: result.sensor1_open_name,
        sensor1_close_name: result.sensor1_close_name,
        sensor2_open_name: result.sensor2_open_name,
        sensor2_close_name: result.sensor2_close_name,
        hardware_id: result.hardware_id,
        battery_level: result.battery_level,
        fw_version: result.fw_version,
        device_type: result.device_type,
        uuid: uuid,
        dnort_time:result.dnort_time
      }

      let deviceConfigure = await DeviceConfiguration.create(deviceConfigureData);
      // create device schedules    
      if (deviceConfigure.id && result.schedule_open == "1" && result.schedule.length == 7) {
        var scheduleData = [];
        result.schedule.forEach(element => {
          scheduleData.push({
            device_configure_id: deviceConfigure.id,
            schedule_day: element.schedule_day,
            open_time: CommonService.utcTimeFormat(element.open_time),
            close_time: CommonService.utcTimeFormat(element.close_time),
            close_whole_day: element.close_whole_day,
          });
        });

        deviceConfigure.dataValues.schedule = await DeviceConfigurationSchedule.bulkCreate(scheduleData);
      }
      else {
        deviceConfigure.dataValues.schedule = []
      }

      // create device exception schedules
      if (deviceConfigure.id && result.exceptions.length > 0) {
        var exceptionData = [];
        result.exceptions.forEach(element => {
          exceptionData.push({
            device_configure_id: deviceConfigure.id,
            schedule_month: element.schedule_month,
            schedule_day: element.schedule_day,
            open_time: CommonService.utcTimeFormat(element.open_time),
            close_time: CommonService.utcTimeFormat(element.close_time),
            close_whole_day: element.close_whole_day,
            schedule_full_date: element.schedule_full_date
          });
        });

        deviceConfigure.dataValues.exceptions = await DeviceConfigurationException.bulkCreate(exceptionData);
      }
      else {
        deviceConfigure.dataValues.exceptions = []
      }

      // create temporary ekey access for installer
      const compSetting = await CommonService.companySettings(companyId); // common function
      var schedule = {}
        compSetting.schedule_opens.forEach(el => {
        schedule[el.scheduleDay.substring(0,3)] = el.openWholeDay
      });
      
      /*if (deviceConfigure.id && result.create_date_time != "" && result.create_date_time != undefined) {
        const startDate = moment(result.create_date_time).tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        const currentTime = moment().tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        const endDate = moment(startDate).add(compSetting.ekey_duration, 'hours').format('YYYY-MM-DD HH:mm:ss')

        if (Date.parse(currentTime) <= Date.parse(endDate)) {
          const keyData = {
            user_id: userId,
            ekey_id: deviceConfigure.id,
            start_date_time: startDate,
            end_date_time: endDate,
            time_zone: JSON.stringify(compSetting.default_time_zone),
            schedule_days: JSON.stringify(schedule)
          }
          await UsersAssignedEkey.create(keyData);
        }
      }
      else if (deviceConfigure.id && !result.create_date_time) {*/
      if (deviceConfigure.id) {
        const compSetting = await CommonService.companySettings(companyId); // common function
        var timeZone = compSetting.default_time_zone.full_time_zone;            
        var currentTimeLocal = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss')
        var currentTime = CommonService.UTCDateTimeFormat(currentTimeLocal, timeZone)
        
        var endDateLocal = moment(currentTimeLocal).add(compSetting.ekey_duration, 'hours').format('YYYY-MM-DD HH:mm:ss')
        var endDate = CommonService.UTCDateTimeFormat(endDateLocal, timeZone)
        
        const keyData = {
          user_id: userId,
          ekey_id: deviceConfigure.id,
          start_date_time: currentTime,//moment().format('YYYY-MM-DD HH:mm:ss'),
          end_date_time: endDate,//moment().add(compSetting.ekey_duration, 'hours').format('YYYY-MM-DD HH:mm:ss'),
          time_zone: JSON.stringify(compSetting.default_time_zone),
          schedule_days: JSON.stringify(schedule)
        }

        await UsersAssignedEkey.create(keyData);
      }
      // end create temporary ekey access for installer
      

      return res.status(200).json({ status: 1, message: "Device configure created successfully", payload: await this.getConfDetails(deviceConfigure.id) });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }


  /**
  * @api        {PUT} /device/modifyDeviceConfigure
  * @apiName     Modify device configure
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Sauarv Satpathy
  */

  updateDeviceConfigure = async (req, res, next) => {
    try {
      // validate request
      if (req.body.userType == "ios") {
        if (typeof req.body.schedule === 'string') {
          req.body.schedule = JSON.parse(req.body.schedule);
        }
        if (typeof req.body.exceptions === 'string') {
          req.body.exceptions = JSON.parse(req.body.exceptions);
        }
      }
      const result = await ValidationService.createDeviceConfigureSchema().validateAsync(req.body)
      // check given device configuration id already exit or not
      const isConfigureExit = await DeviceConfiguration.findOne({
        where: {
          id: result.id,
        }
      });
      if (!isConfigureExit) throw createError.NotFound("Device configure id not exist");

      const isConfigureExit2 = await DeviceConfiguration.findOne({
        where: {
          [Op.and]:[
            {
              id: {
                [Op.ne] : result.id
              }
            },{
              [Op.or]:[{
                serial_number: result.serial_number,
              },
              {
                full_name: result.full_name,
              }]
            }
          ]
        }
      });

      if (isConfigureExit2 && isConfigureExit2.serial_number == result.serial_number) throw createError.NotFound("Device configure already exist with given serial number");
      else if (isConfigureExit2 && isConfigureExit2.full_name == result.full_name) throw createError.NotFound("Device configure already exist with given full name");

      // device configure data
      const deviceConfigureData = {
        serial_number: result.serial_number,
        full_name: result.full_name,
        display_name: result.display_name,
        lock_type: result.lock_type,
        relock_trigger: result.relock_trigger,
        trigger_mode: result.trigger_mode,
        relock_timer: result.relock_timer,
        motor_run_time: result.motor_run_time,
        motor_direction: result.motor_direction,
        servo_unlock_position: result.servo_unlock_position,
        servo_lock_position: result.servo_lock_position,
        servo_power_time: result.servo_power_time,
        motor_voltage: result.motor_voltage,
        manual_lock: result.manual_lock,
        sleep_mode: result.sleep_mode,
        bluetooth_power_level: result.bluetooth_power_level,
        schedule_open: result.schedule.length != 7 ? '0' : result.schedule_open,
        sensor1_open_name: result.sensor1_open_name,
        sensor1_close_name: result.sensor1_close_name,
        sensor2_open_name: result.sensor2_open_name,
        sensor2_close_name: result.sensor2_close_name,
        hardware_id: result.hardware_id,
        battery_level: result.battery_level,
        fw_version: result.fw_version,
        device_type: result.device_type,
        dnort_time:result.dnort_time
      }

      let update = await DeviceConfiguration.update(deviceConfigureData, { where: { id: result.id } });

      // update device schedules    
      await DeviceConfigurationSchedule.destroy({
        where: {
          device_configure_id: result.id
        }
      });

      if (result.id && result.schedule_open == "1" && result.schedule.length == 7) {
        var scheduleData = [];
        result.schedule.forEach(async element => {
          scheduleData.push({
            device_configure_id: result.id,
            schedule_day: element.schedule_day,
            open_time: CommonService.utcTimeFormat(element.open_time),
            close_time: CommonService.utcTimeFormat(element.close_time),
            close_whole_day: element.close_whole_day,
          })
        });

        await DeviceConfigurationSchedule.bulkCreate(scheduleData);
      }


      // update device exception schedules
      await DeviceConfigurationException.destroy({
        where: {
          device_configure_id: result.id
        }
      });

      if (result.id && result.exceptions.length > 0) {
        var exceptionData = [];
        result.exceptions.forEach(element => {
          exceptionData.push({
            device_configure_id: result.id,
            schedule_month: element.schedule_month,
            schedule_day: element.schedule_day,
            open_time: CommonService.utcTimeFormat(element.open_time),
            close_time: CommonService.utcTimeFormat(element.close_time),
            close_whole_day: element.close_whole_day,
            schedule_full_date: element.schedule_full_date
          });
        });

        await DeviceConfigurationException.bulkCreate(exceptionData);
      }

      return res.status(200).json({ status: 1, message: "Device configure updated successfully", payload: await this.getConfDetails(result.id) });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }



  /**
  * @api        {GET} /device/getDeviceConfigure
  * @apiName     Get all device configuration
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */
 
  getDeviceConfigure = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const configurations = await DeviceConfiguration.findAll({
        where: { user_id: userId },
        order: [['id', 'DESC']],
        attributes: ['id', 'serial_number', 'full_name', 'display_name', 'hardware_id', 'uuid'],
      });

      const msg = configurations.length > 0 ? 'Device Configuration listing' : 'No record found';
      return res.status(200).json({ status: 1, message: msg, payload: configurations });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }




  /**
  * @api        {GET} /device/getDetailsOfDeviceConfigure
  * @apiName     Get details of perticular device configuration
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  getDetailsOfDeviceConfigure = async (req, res, next) => {
    try {
      const configurationDetails = await this.getConfDetails(req.query.id)
      const msg = configurationDetails ? 'Device Configuration details' : 'No record found';
      const payload = configurationDetails ? configurationDetails : {};
      return res.status(200).json({ status: 1, message: msg, payload: payload });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }


  /**
  * @api        {DELETE} /device/removeDeviceConfigure
  * @apiName     Remove device configuration
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  removeDeviceConfigure = async (req, res, next) => {
    try {
      const configId = req.body.id
      const displayName = req.body.displayName

      // check given device configuration id already exit or not
      const isConfigureExit = await DeviceConfiguration.findOne({
        where: {
          [Op.and]: [
            { id: configId },
            { display_name: displayName }
          ]
        },
        attributes: ['id']
      });
      if (!isConfigureExit) throw createError.NotFound("Display name is wrong");

      await DeviceConfiguration.destroy({
        where: {
          id: isConfigureExit.id
        }
      });

      return res.status(200).json({ status: 1, message: "Device configure deleted successfully", payload: {} });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }




  /**
  * @api        {GET} /device/getLockTypeInfo
  * @apiName     Get all the info when select lock type, eq. relock trigger, timer, motor time, motor direction etc.
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  getLockTypeInfo = async (req, res, next) => {
    try {
      const lockTypes = await SettingLockTypes.findAll({
        where: { is_inactive: '0' },
        order: [['id', 'ASC']],
        attributes: ['id', 'lock_type_name'],
      });

      // relock triggers
      const relockTriggers = await SettingReLockTriggers.findAll({
        where: { is_inactive: '0' },
        order: [['relock_trigger_name', 'ASC']],
        attributes: ['id', 'relock_trigger_name'],
      });

      // relock timmer
      const reLockTimerDetails = await SettingReLockTimmer.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      const reLockTimmer = [];
      if (reLockTimerDetails) {
        var initTime = parseFloat(reLockTimerDetails.init_time);
        var intervalTime = parseFloat(reLockTimerDetails.time_interval);
        var maxTime = parseFloat(reLockTimerDetails.max_time);
        var time_mode = reLockTimerDetails.time_mode;
        for (let index = initTime; index < maxTime; index += intervalTime) {
          reLockTimmer.push(index.toFixed(1) + ' ' + time_mode);
        }
        reLockTimmer.push(reLockTimerDetails.max_time + ' ' + time_mode);
      }


      // triggers events
      const triggerEvents = await SettingTriggerEvents.findAll({
        where: { is_inactive: '0' },
        attributes: ['id', 'event_name'],
      });

      // motor directions
      const motorDirections = await SettingMotorDirections.findAll({
        where: { is_inactive: '0' },
        attributes: ['id', 'direction'],
      });

      // motor voltage
      const motorVoltageDetails = await SettingMotorVoltage.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      const motorVoltage = [];
      if (motorVoltageDetails) {
        var minVolt = motorVoltageDetails.min_voltage;
        var maxVolt = motorVoltageDetails.max_voltage;

        for (let index = minVolt; index <= maxVolt; index++) {
          motorVoltage.push(index + ' V');
        }
      }


      // motor run time
      const motorRunTimeDetails = await SettingMotorRunTime.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      const motorRunTime = [];
      if (motorRunTimeDetails) {
        var initTime = parseFloat(motorRunTimeDetails.init_time);
        var intervalTime = parseFloat(motorRunTimeDetails.time_interval);
        var maxTime = parseFloat(motorRunTimeDetails.max_time);
        var time_mode = motorRunTimeDetails.time_mode;
        for (let index = initTime; index < maxTime; index += intervalTime) {
          motorRunTime.push(index.toFixed(1) + ' ' + time_mode);
        }
        motorRunTime.push(motorRunTimeDetails.max_time + ' ' + time_mode);
      }

      // servo power time
      const servoPowerTimeDetails = await SettingServoPowerTime.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      const servoPowerTime = [];
      if (servoPowerTimeDetails) {
        var initTime = parseFloat(reLockTimerDetails.init_time);
        var intervalTime = parseFloat(reLockTimerDetails.time_interval);
        var maxTime = parseFloat(reLockTimerDetails.max_time);
        var time_mode = reLockTimerDetails.time_mode;
        for (let index = initTime; index < maxTime; index += intervalTime) {
          servoPowerTime.push(index.toFixed(1) + ' ' + time_mode);
        }
        servoPowerTime.push(reLockTimerDetails.max_time + ' ' + time_mode);
      }



      // servo lock unlock postions
      const servoLockUnlockPostionDetails = await SettingServoLockUnlockPostion.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });
      const servoLockUnlockPostion = [];
      if (servoLockUnlockPostionDetails) {
        var initPosition = servoLockUnlockPostionDetails.init_position;
        var maxPosition = servoLockUnlockPostionDetails.max_position;
        var positionInterval = servoLockUnlockPostionDetails.position_interval;
        var positionMode = servoLockUnlockPostionDetails.position_mode;
        for (let index = initPosition; index <= maxPosition; index += positionInterval) {
          servoLockUnlockPostion.push(index + ' ' + positionMode);
        }
      }


      // Bluetooth level
      const settingBluetoothLevelDetails = await SettingBluetoothLevel.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      const bluetoothLevels = [];
      if (settingBluetoothLevelDetails) {
        var initLevel = settingBluetoothLevelDetails.init_level;
        var maxLevel = settingBluetoothLevelDetails.max_level;
        let level;
        for (let index = initLevel; index <= maxLevel; index++) {
          level = index.toString();
          bluetoothLevels.push(level);
        }
      }

      const payload = {
        lockTypes: lockTypes,
        reLockTriggers: relockTriggers,
        reLockTimmer: reLockTimmer,
        triggerEvents: triggerEvents,
        motorDirections: motorDirections,
        motorVoltage: motorVoltage,
        motorRunTime: motorRunTime,
        servoPowerTime: servoPowerTime,
        servoLockUnlockPostion: servoLockUnlockPostion,
        bluetoothLevels: bluetoothLevels
      }

      return res.status(200).json({ status: 1, message: 'Lock type info listing', payload: payload });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }



  // get device congiruations
  getConfDetails = async (id) => {
    const payload = await DeviceConfiguration.findOne({
      where: { id: id },
      include: [{
        model: DeviceConfigurationSchedule,
        as: 'schedule',
        required: false,
        attributes: ['schedule_day', 'close_whole_day', [Sequelize.fn('date_format', Sequelize.col('schedule.open_time'), '%H:%i'), 'open_time'], [Sequelize.fn('date_format', Sequelize.col('schedule.close_time'), '%H:%i'), 'close_time']]
      },
      {
        model: DeviceConfigurationException,
        as: 'exceptions',
        required: false,
        attributes: ['schedule_month', 'schedule_full_date', 'schedule_day', 'close_whole_day', [Sequelize.fn('date_format', Sequelize.col('exceptions.open_time'), '%H:%i'), 'open_time'], [Sequelize.fn('date_format', Sequelize.col('exceptions.close_time'), '%H:%i'), 'close_time']]
      }]
    });
    
    /*
    const companyId = 8
    const compSetting = await CommonService.companySettings(companyId); // common function
    const timeZone = compSetting.default_time_zone ? compSetting.default_time_zone.full_time_zone: ""

    _map(payload.schedule, el => {
      el.dataValues.open_time = CommonService.utcToLocaleTimeFormat(el.open_time, timeZone)
      el.dataValues.close_time = CommonService.utcToLocaleTimeFormat(el.close_time, timeZone)
    });

    _map(payload.exceptions, el => {
      el.dataValues.open_time = CommonService.utcToLocaleTimeFormat(el.open_time, timeZone)
      el.dataValues.close_time = CommonService.utcToLocaleTimeFormat(el.close_time, timeZone)
    });
    */
   
    return payload;
  }

  /**
* @api        {GET} /device/getDeviceConfigureFullDetails
* @apiName     Get all device configuration with full details
* @apiGroup    Auth
* @apiSuccess  {String} code HTTP status code from API.
* @apiSuccess  {String} message Message from API.
* @create_at   {Date} 01-August-2022
* @developer   Saurav Satpathy
*/

  getDeviceConfigureFullDetails = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const configurations = await DeviceConfiguration.findAll({
        where: { user_id: userId },
        order: [['id', 'DESC']],
        attributes: { exclude: ['user_id'] },
        include: [{
          model: DeviceConfigurationSchedule,
          as: 'schedule',
          required: false,
          attributes: ['schedule_day', 'close_whole_day', [Sequelize.fn('date_format', Sequelize.col('schedule.open_time'), '%H:%i'), 'open_time'], [Sequelize.fn('date_format', Sequelize.col('schedule.close_time'), '%H:%i'), 'close_time']]
        },
        {
          model: DeviceConfigurationException,
          as: 'exceptions',
          required: false,
          attributes: ['schedule_month', 'schedule_full_date', 'schedule_day', 'close_whole_day', [Sequelize.fn('date_format', Sequelize.col('exceptions.open_time'), '%H:%i'), 'open_time'], [Sequelize.fn('date_format', Sequelize.col('exceptions.close_time'), '%H:%i'), 'close_time']]
        }]
      });

      const msg = configurations.length > 0 ? 'Device Configuration full details listing' : 'No record found';
      return res.status(200).json({ status: 1, message: msg, payload: configurations });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }



  /**
  * @api        {POST} /device/syncOfflineCreatedDeviceConfigure
  * @apiName     sync offline Created device configure
  * @apiGroup    Auth
  * @apiSuccess  {String} code HTTP status code from API.
  * @apiSuccess  {String} message Message from API.
  * @create_at   {Date} 01-August-2022
  * @developer   Saurav Satpathy
  */

  syncOfflineCreatedDeviceConfigure = async (req, res, next) => {
    try {
      const result = req.body.offlineDeviceData
      const userId = req.user.id;
      const companyId = req.user.company_id;
      var afterSyncData = []

      await Promise.all(result.map(async (config) => {
        // validate request
        if (config.userType == "ios") {
          if (typeof config.schedule === 'string') {
            config.schedule = JSON.parse(config.schedule);
          }
          if (typeof config.exceptions === 'string') {
            config.exceptions = JSON.parse(config.exceptions);
          }
        }

        let isConfigureExit = await DeviceConfiguration.findOne({
          where: {
            [Op.or]:[{
              serial_number: config.serial_number,
            },
            {
              full_name: config.full_name,
            }]
          },
          attributes: ['id', 'serial_number', 'full_name']
        })
          .then(result => {
            return result
          });

        if (isConfigureExit && isConfigureExit.serial_number == config.serial_number) {
          afterSyncData.push({ status: 0, message: "Device configure already exist with given serial number", payload: config });
        }
        else if (isConfigureExit && isConfigureExit.full_name == config.full_name) {
          afterSyncData.push({ status: 0, message: "Device configure already exist with given full name", payload: config });
        }
        else {
          // device configure data
          const deviceConfigureData = {
            user_id: userId,
            serial_number: config.serial_number,
            full_name: config.full_name,
            display_name: config.display_name,
            lock_type: config.lock_type,
            relock_trigger: config.relock_trigger,
            trigger_mode: config.trigger_mode,
            relock_timer: config.relock_timer,
            motor_run_time: config.motor_run_time,
            motor_direction: config.motor_direction,
            servo_unlock_position: config.servo_unlock_position,
            servo_lock_position: config.servo_lock_position,
            servo_power_time: config.servo_power_time,
            motor_voltage: config.motor_voltage,
            manual_lock: config.manual_lock,
            sleep_mode: config.sleep_mode,
            bluetooth_power_level: config.bluetooth_power_level,
            schedule_open: config.schedule.length != 7 ? '0' : config.schedule_open,
            sensor1_open_name: config.sensor1_open_name,
            sensor1_close_name: config.sensor1_close_name,
            sensor2_open_name: config.sensor2_open_name,
            sensor2_close_name: config.sensor2_close_name,
            hardware_id: config.hardware_id,
            battery_level: config.battery_level,
            fw_version: config.fw_version,
            device_type: config.device_type,
            uuid: config.uuid,
          }

          let deviceConfigure = await DeviceConfiguration.create(deviceConfigureData);

          // create device schedules    
          if (deviceConfigure.id && config.schedule_open == "1" && config.schedule.length == 7) {
            var scheduleData = [];
            config.schedule.forEach(element => {
              scheduleData.push({
                device_configure_id: deviceConfigure.id,
                schedule_day: element.schedule_day,
                open_time: CommonService.utcTimeFormat(element.open_time),
                close_time: CommonService.utcTimeFormat(element.close_time),
                close_whole_day: element.close_whole_day,
              });
            });

            await DeviceConfigurationSchedule.bulkCreate(scheduleData);
          }


          // create device exception schedules
          if (deviceConfigure.id && config.exceptions.length > 0) {
            var exceptionData = [];
            config.exceptions.forEach(element => {
              exceptionData.push({
                device_configure_id: deviceConfigure.id,
                schedule_month: element.schedule_month,
                schedule_day: element.schedule_day,
                open_time: CommonService.utcTimeFormat(element.open_time),
                close_time: CommonService.utcTimeFormat(element.close_time),
                close_whole_day: element.close_whole_day,
                schedule_full_date: element.schedule_full_date
              });
            });

            await DeviceConfigurationException.bulkCreate(exceptionData);
          }

          afterSyncData.push({ status: 1, message: "Device configure created successfully", payload: await this.getConfDetails(deviceConfigure.id) });

          // create temporary ekey access for installer
          if (deviceConfigure.id && config.create_date_time != "0000-00-00 00:00:00", config.create_date_time != undefined) {
            const compSetting = await CommonService.companySettings(companyId); // common function
            var schedule = {}
            compSetting.schedule_opens.forEach(el => {
              schedule[el.scheduleDay.substring(0,3)] = el.openWholeDay
            });
            
            var timeZone = compSetting.default_time_zone.full_time_zone;            
            var currentTimeLocal = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss')
            var currentTime = CommonService.UTCDateTimeFormat(currentTimeLocal, timeZone)

            var startDate = CommonService.UTCDateTimeFormat(config.create_date_time, timeZone)
            
            var endDateLocal = moment(config.create_date_time).add(compSetting.ekey_duration, 'hours').format('YYYY-MM-DD HH:mm:ss')
            var endDate = CommonService.UTCDateTimeFormat(endDateLocal, timeZone)

            if (Date.parse(currentTime) <= Date.parse(endDate)) {
              const keyData = {
                user_id: userId,
                ekey_id: deviceConfigure.id,
                start_date_time: startDate,
                end_date_time: endDate,
                time_zone: JSON.stringify(compSetting.default_time_zone),
                schedule_days: JSON.stringify(schedule)
              }
              await UsersAssignedEkey.create(keyData);
            }
          }
        }
      }));

      return res.status(200).json({ status: 1, message: "Synced successfully", payload: afterSyncData });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }



  /**
 * @api        {POST} /device/syncOfflineModifiedDeviceConfigure
 * @apiName     sync offline Modified device configure
 * @apiGroup    Auth
 * @apiSuccess  {String} code HTTP status code from API.
 * @apiSuccess  {String} message Message from API.
 * @create_at   {Date} 01-August-2022
 * @developer   Saurav Satpathy
 */

  syncOfflineModifiedDeviceConfigure = async (req, res, next) => {
    try {
      const result = req.body.offlineDeviceData
      const userId = req.user.id;
      var afterSyncData = []

      await Promise.all(result.map(async (config) => {
        // validate request
        if (config.userType == "ios") {
          if (typeof config.schedule === 'string') {
            config.schedule = JSON.parse(config.schedule);
          }
          if (typeof config.exceptions === 'string') {
            config.exceptions = JSON.parse(config.exceptions);
          }
        }

        let isConfigureExit = await DeviceConfiguration.findOne({
          where: {
            id: config.id,
          },
          attributes: ['id']
        })
        .then(result => {
          return result
        });

        if (!isConfigureExit) {
          afterSyncData.push({ status: 0, message: "Device configure id not exist", payload: config });
        }
        else {
          // device configure data
          const deviceConfigureData = {
            serial_number: config.serial_number,
            full_name: config.full_name,
            display_name: config.display_name,
            lock_type: config.lock_type,
            relock_trigger: config.relock_trigger,
            trigger_mode: config.trigger_mode,
            relock_timer: config.relock_timer,
            motor_run_time: config.motor_run_time,
            motor_direction: config.motor_direction,
            servo_unlock_position: config.servo_unlock_position,
            servo_lock_position: config.servo_lock_position,
            servo_power_time: config.servo_power_time,
            motor_voltage: config.motor_voltage,
            manual_lock: config.manual_lock,
            sleep_mode: config.sleep_mode,
            bluetooth_power_level: config.bluetooth_power_level,
            schedule_open: config.schedule.length != 7 ? '0' : config.schedule_open,
            sensor1_open_name: config.sensor1_open_name,
            sensor1_close_name: config.sensor1_close_name,
            sensor2_open_name: config.sensor2_open_name,
            sensor2_close_name: config.sensor2_close_name,
            hardware_id: config.hardware_id,
            battery_level: config.battery_level,
            fw_version: config.fw_version,
            device_type: config.device_type,
          }

          await DeviceConfiguration.update(deviceConfigureData, { where: { id: config.id } });

          // update device schedules    
          await DeviceConfigurationSchedule.destroy({
            where: {
              device_configure_id: config.id
            }
          });

          if (config.id && config.schedule_open == "1" && config.schedule.length == 7) {
            var scheduleData = [];
            config.schedule.forEach(element => {
              scheduleData.push({
                device_configure_id: config.id,
                schedule_day: element.schedule_day,
                open_time: CommonService.utcTimeFormat(element.open_time),
                close_time: CommonService.utcTimeFormat(element.close_time),
                close_whole_day: element.close_whole_day,
              });
            });

            await DeviceConfigurationSchedule.bulkCreate(scheduleData);
          }


          // update device exception schedules
          await DeviceConfigurationException.destroy({
            where: {
              device_configure_id: config.id
            }
          });

          if (config.id && config.exceptions.length > 0) {
            var exceptionData = [];
            config.exceptions.forEach(element => {
              exceptionData.push({
                device_configure_id: config.id,
                schedule_month: element.schedule_month,
                schedule_day: element.schedule_day,
                open_time: CommonService.utcTimeFormat(element.open_time),
                close_time: CommonService.utcTimeFormat(element.close_time),
                close_whole_day: element.close_whole_day,
                schedule_full_date: element.schedule_full_date
              });
            });

            await DeviceConfigurationException.bulkCreate(exceptionData);
          }

          afterSyncData.push({ status: 1, message: "Device configure updated successfully", payload: await this.getConfDetails(config.id) });
        }
      }));

      return res.status(200).json({ status: 1, message: "Synced successfully", payload: afterSyncData });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }


  /**
 * @api        {POST} /device/syncOfflineRemovedDeviceConfigure
 * @apiName     sync offline deleted device configure
 * @apiGroup    Auth
 * @apiSuccess  {String} code HTTP status code from API.
 * @apiSuccess  {String} message Message from API.
 * @create_at   {Date} 01-August-2022
 * @developer   Saurav Satpathy
 */

   syncOfflineRemovedDeviceConfigure = async (req, res, next) => {
    try {
      const result = req.body.offlineDeviceData
      const userId = req.user.id;
      var afterSyncData = []

      await Promise.all(result.map(async (config) => {

        let isConfigureExit = await DeviceConfiguration.findOne({
          where: {
            [Op.and]: [
              { id: config.id },
              { display_name: config.displayName }
            ]
          },
          attributes: ['id']
        })
        .then(result => {
          return result
        });

        if (!isConfigureExit) {
          afterSyncData.push({ status: 0, message: "Display name is wrong", payload: config });
        }
        else {
          await DeviceConfiguration.destroy({
            where: {
              id: isConfigureExit.id
            }
          });

          afterSyncData.push({ status: 1, message: "Device configure deleted successfully", payload: config });
        }
      }));

      return res.status(200).json({ status: 1, message: "Synced successfully", payload: afterSyncData });

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  }


  //END OF CLASS
}
export default new DeviceConfiureController();
