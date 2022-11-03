import HttpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import {
  User,
  ServiceTicket,
  ServiceTicketNotes,
  UsersAssignedEkey,
  DeviceConfiguration,
  Customer,
} from "../../util/middleware/connection";
import CommonService from "../../util/helpers/common";
import ValidationService from "../../util/helpers/validation_schema_admin";
import { Op, Sequelize } from "sequelize";
import createError from "http-errors";
import { isElement } from "lodash";
import _map from "lodash/map";
import moment from "moment";

const server_url = process.env.SERVER_URL;
const operatorsAliases = {
  $eq: Op.eq,
  $or: Op.or,
};
class supportTicketController {
  constructor() {}

  /**
   * @api        {POST} /support/getAllGeneratedTickets
   * @apiName     get list of all generated support tickets
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getAllGeneratedTickets = async (req, res, next) => {
    try {
      const serviceTickets = await ServiceTicket.findAll({
        where: { ticket_status:'1'},
        order: [["id", "DESC"]],
        attributes: ["id", "ticket_number", "ticket_status", "createdAt","problem_description","phone"],
        include: [
          {
            model: User,
            as: "User",
            required: false,
            attributes: ["id", "dispay_name", "e_mail", "phone_number"],
          },
        ],
      });

      var serviceTicketDetails = [];
      var count = serviceTickets.length;
      serviceTickets.forEach((el) => {
        //if (el.User) {
          var details = {
            sequence: count,
            id: el.id,
            ticket_id: el.ticket_number,
            //full_name: el.User.dispay_name,
            phone: el.phone,
            //email: el.User.e_mail,
            status: el.ticket_status,
            created: el.createdAt,
            problem_description:el.problem_description,
            // created: moment(el.createdAt).format('YYYY-MM-DD HH:mm')
          };
          serviceTicketDetails.push(details);
        //}
        count--;
      });

      const msg =
        serviceTicketDetails.length > 0
          ? "Generated service tickets listing"
          : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: serviceTicketDetails });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /support/generatedTicketDetails
   * @apiName     get details of generated support ticket
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at  {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  generatedTicketDetails = async (req, res, next) => {
    console.log("Backend Hited");
    try {
      const id = req.query.id;
      const supportTicketDetails = await ServiceTicket.findOne({
        where: { id: id },
        order: [["id", "DESC"]],
        include: [
          {
            model: User,
            as: "User",
            required: false,
            attributes: [
              "id",
              "dispay_name",
              "first_name",
              "last_name",
              "e_mail",
              "phone_number",
              
            ],
          },
        ],
      });
      //get support ticket notes
      const serviceTicketNotes = await ServiceTicketNotes.findAll({
        where: { service_ticket_id: id },
        order: [["id", "DESC"]],
        attributes: ["id", "note_description", "createdAt"],
        include: [
          {
            model: User,
            as: "User",
            required: false,
            attributes: ["id", "dispay_name"],
          },
        ],
      });

      if (supportTicketDetails) {
        // var gps = JSON.parse(supportTicketDetails.phone_gps)
        // supportTicketDetails.dataValues.gps_location = gps//.latitude + ", " + gps.longitude;
        // supportTicketDetails.dataValues.phone_gps_location = gps.latitude + ", " + gps.longitude;
        // supportTicketDetails.dataValues.latitude = gps.latitude;
        // supportTicketDetails.dataValues.longitude = gps.longitude;

        //get the customer details
        var customerDetails;
        if (!supportTicketDetails.user_id) {
          if (supportTicketDetails.customer_id) {
            const custId = supportTicketDetails.customer_id;
            customerDetails = await Customer.findOne({
              where: { id: custId},
            });
          }
        }

        supportTicketDetails.dataValues.phoneNumber = "";
        if (supportTicketDetails.User) {
          const fNumber = supportTicketDetails.User.phone_number;
          supportTicketDetails.dataValues.phoneNumber =
            fNumber.substring(0, 3) +
            "-" +
            fNumber.substring(3, 6) +
            "-" +
            fNumber.substring(6, fNumber.length);
        }

        if (typeof supportTicketDetails.active_lock === "string") {
          supportTicketDetails.dataValues.active_lock = JSON.parse(
            supportTicketDetails.active_lock
          );
        } else {
          supportTicketDetails.dataValues.active_lock =
            supportTicketDetails.active_lock;
        }

        /* const user_id = supportTicketDetails.user_id
        const currentDate = new Date();
        const assinedEkeys = await UsersAssignedEkey.findAll({
          where: { 
            [Op.and]:[
              {
                user_id: user_id
              },
              {
                start_date_time: { 
                  [Op.lte]: currentDate
                }
              },
              {
                end_date_time: { 
                  [Op.gte]: currentDate
                }
              }
            ]
          },
          attributes: ['id', 'one_time_use', 'start_date_time', 'end_date_time'],
          include: [
            {
              model: DeviceConfiguration,
              as: "ekeyDetails",
              required: false,
              attributes: ['id', 'serial_number', 'full_name', 'display_name'],
            }
          ],
          order:[ 
            [{model: DeviceConfiguration, as: 'ekeyDetails'},'full_name', 'ASC']
          ],
        });
        */

        // supportTicketDetails.dataValues.reportedDevices = assinedEkeys
        // supportTicketDetails.dataValues.assignedSeninel = assinedEkeys
        supportTicketDetails.dataValues.serviceTicketNotes = serviceTicketNotes;
        supportTicketDetails.dataValues.customerDeatils=customerDetails;
      }
      const msg = supportTicketDetails
        ? "Support tickets details"
        : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: supportTicketDetails });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {POST} /support/createSupportNotes
   * @apiName     Create support notes
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  createSupportNotes = async (req, res, next) => {
    var ticketStatus;
    console.log("createSupportNotes")
    try {
      var result = req.body;
      console.log("Ticket Status:::"+result.ticketStatus)
      const Data = {
        service_ticket_id: result.serviceTicketId,
        user_id: result.userId,
        note_description: result.notes,
      };

      let success = await ServiceTicketNotes.create(Data);

if(result.ticketStatus){
  ticketStatus='0';
}
await ServiceTicket.update({ticket_status: ticketStatus}, { where: { id: result.serviceTicketId }});  
    

return res
        .status(200)
        .json({
          status: 1,
          message: "Ticket Update Successfully ",
          payload: success,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  createSupportTicket = async (req, res, next) => {
    try {
      console.log("createSupportTicket")
      //const result = await ValidationService.createSupportTicketSchema().validateAsync(req.body)
      const result = req.body;
      const Data = {
        user_id: result.userId != "" ? result.userId : null,
        customer_id: result.customerId != "" ? result.customerId : null,
        ticket_number: result.ticketNumber,
        phone: result.phone,
        brand: result.brand,
        phone_model: result.phoneModel,
        software_version: result.softwareVersion,
        active_lock: result.activeLock,
        reporting_date_time: result.reportingDate,
        sentinel_date_time: result.sentinelDate,
        bluetooth_status: result.bluetoothStatus,
        ekey: result.ekey,
        phone_gps: result.phoneGps,
        problem_description: result.problemDescription,
        ticket_status: result.ticketStatus,
      };
      let success = await ServiceTicket.create(Data);
      return res
        .status(200)
        .json({
          status: 1,
          message: " ServiceTicket created successfully",
          payload: success,
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  //END OF CLASS
}
export default new supportTicketController();
