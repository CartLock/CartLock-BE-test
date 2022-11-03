import { Device, Company, ServiceTicket, User } from "../util/middleware/connection";
import CommonService from "../util/helpers/common";
import ValidationService from "../util/helpers/validation_schema";
import { Op, Sequelize, where } from "sequelize";
import createError from "http-errors"
import moment from "moment";

class DeviceController {
  
/**
* @api        {GET} /device/deviceSupport
* @apiName     generate device support
* @apiGroup    Auth
* @apiSuccess  {String} code HTTP status code from API.
* @apiSuccess  {String} message Message from API.
* @create_at   {Date} 01-August-2022
* @developer   Saurav Satpathy
*/

generateDeviceSupport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;
    // check given serial's device configuration already exit or not
    /*const isTicketExit = await ServiceTicket.findOne({
      where: {
        [Op.and]:[
          { user_id: userId },
          { ticket_status: "1" }
        ]
      }
    });
    if (isTicketExit) throw createError.NotFound("Support ticket already generated");
    */

    const company = await Company.findOne({
      where: {id: companyId},
      attributes: ['poc_phone_number']
    })
    const supportNumber = company ? company.poc_phone_number : ""
    
    let serviceTicketData = {
      user_id: userId,
      ticket_number: "",
      phone: supportNumber,
      brand: req.body.brand,
      phone_model: req.body.phoneModel,
      software_version: req.body.softwareVersion,
      active_lock: req.body.userType == 'ios' ? req.body.serialAllActiveLocksInRange : JSON.stringify(req.body.serialAllActiveLocksInRange),
      reporting_date_time: req.body.dateTimeReportedFromPhone,
      sentinel_date_time: req.body.dateTimeSentinel,
      bluetooth_status: req.body.bluetoothStatus,
      ekey: req.body.ekey,
      phone_gps: JSON.stringify({
        latitude: req.body.phoneGPSLatitude,
        longitude: req.body.phoneGPSLongitude
      }),
      problem_description: null,
    }


    let serviceTicket = await ServiceTicket.create(serviceTicketData);
    
    if(serviceTicket.id){
      const userDetails = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'phone_number']
      });

      const serviceTicketId = serviceTicket.id;
      var ticketId = userDetails.phone_number + "-" + moment().format('YYMMDD') + '-' + CommonService.numberPad(serviceTicketId, 4);
      await ServiceTicket.update({ticket_number: ticketId}, { where: { id: serviceTicketId }});
    }
    
    let ticketDetails = {
      phone: supportNumber,
      ticket: ticketId
    }

    serviceTicket.dataValues.ticket_number = ticketId

    return res.status(200).json({status: 1, message: "Support ticket generate successfully", payload: ticketDetails, details: serviceTicket});

  } catch (error) {
    if (error.isJoi === true) error.status = 422
    next(error)
  }
}



/**
* @api        {GET} /device/supportTicketResolved
* @apiName     resolved support ticket
* @apiGroup    Auth
* @apiSuccess  {String} code HTTP status code from API.
* @apiSuccess  {String} message Message from API.
* @create_at   {Date} 01-August-2022
* @developer   Saurav Satpathy
*/

supportTicketResolved = async (req, res, next) => {
  try {
    const ticketId = req.body.id;
    const ticket_status = req.body.ticket_status;
    
    await ServiceTicket.update({ticket_status: ticket_status}, {where: {id: ticketId}});

    return res.status(200).json({status: 1, message: "Support ticket status changed successfully", payload: {}});

  } catch (error) {
    if (error.isJoi === true) error.status = 422
    next(error)
  }
}
  //END OF CLASS
}
export default new DeviceController();