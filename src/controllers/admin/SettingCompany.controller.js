import { SettingCompany, User } from "../../util/middleware/connection";
import { Op, Sequelize } from "sequelize";
import _map from "lodash/map";
const operatorsAliases = {
  $eq: Op.eq,
  $or: Op.or,
};
class SettingCompanyController {
  constructor() {}

  /**
   * @api        {GET} /settings/getCompanySettings
   * @apiName     Get details of company setting
   * @apiGroup    AuthgetCompanySettings
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getCompanySettings = async (req, res, next) => {
    try {
      const companyId = req.user.company_id;
      const companySettings = await SettingCompany.findOne({
        where: { company_id: companyId },
      });

      if (companySettings) {
        companySettings.is_multi_phone_login =
          companySettings.is_multi_phone_login == "1" ? true : false;
        companySettings.is_force_firmware_update =
          companySettings.is_force_firmware_update == "1" ? true : false;
        companySettings.schedule_opens = companySettings.schedule_opens
          ? JSON.parse(companySettings.schedule_opens)
          : [];
        companySettings.schedule_exceptions =
          companySettings.schedule_exceptions
            ? JSON.parse(companySettings.schedule_exceptions)
            : [];
        companySettings.fob_programmers = companySettings.fob_programmers
          ? JSON.parse(companySettings.fob_programmers)
          : [];
        companySettings.default_time_zone = companySettings.default_time_zone
          ? JSON.parse(companySettings.default_time_zone)
          : {};

        companySettings.payment_cost = companySettings.payment_cost;
        companySettings.currency = companySettings.currency;
        companySettings.waiting_hour = companySettings.waiting_hour;
      }

      const msg = companySettings ? "Company settings" : "No record found";
      return res
        .status(200)
        .json({
          status: 1,
          message: msg,
          payload: companySettings ? companySettings : {},
        });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {PUT} /settings/modifyCompanySettings
   * @apiName     Update modify settings
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  modifyCompanySettings = async (req, res, next) => {
    try {
      const result = req.body;
      //  company setting data
      console.log("waiting hour:::"+result.waitingHour)
      const companySettingData = {
        company_id: result.companyId,
        is_multi_phone_login: result.isMultiPhoneLogin == true ? "1" : "0",
        offline_reconect: result.offlineReconectTime,
        schedule_opens: JSON.stringify(result.scheduleOpens),
        schedule_exceptions: JSON.stringify(result.scheduleExceptions),
        default_time_zone: JSON.stringify(result.defaultTimeZone),
        ekey_duration: result.ekeyDuration,
        default_country_code: result.defaultCountryCode,
        fob_programmers: JSON.stringify(result.fobProgrammers),
        is_force_firmware_update:
          result.is_force_firmware_update == true ? "1" : "0",
        allowed_firmware: result.allowed_firmware,
        //new Field goes here
        payment_cost: result.paymentCost,
        currency: result.currency,
        waiting_hour: result.waitingHour,
      };

      var msg;
      if (result.id != undefined && result.id != "") {
        await SettingCompany.update(companySettingData, {
          where: { id: result.id },
          returning: true,
        });
        companySettingData.id = result.id;
        msg = "Company settings modified successfully";
      } else {
        const success = await SettingCompany.create(companySettingData);
        companySettingData.id = success.id;
        msg = "Company settings created successfully";
      }

      companySettingData.is_multi_phone_login = result.isMultiPhoneLogin;
      companySettingData.schedule_opens = companySettingData.schedule_opens
        ? JSON.parse(companySettingData.schedule_opens)
        : [];
      companySettingData.schedule_exceptions =
        companySettingData.schedule_exceptions
          ? JSON.parse(companySettingData.schedule_exceptions)
          : [];
      companySettingData.fob_programmers = companySettingData.fob_programmers
        ? JSON.parse(companySettingData.fob_programmers)
        : [];
      companySettingData.default_time_zone =
        companySettingData.default_time_zone
          ? JSON.parse(companySettingData.default_time_zone)
          : {};

      return res
        .status(200)
        .json({ status: 1, message: msg, payload: companySettingData });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  /**
   * @api        {GET} /settings/getFobProgrammers
   * @apiName     Get list of fob programmers
   * @apiGroup    Auth
   * @apiSuccess  {String} code HTTP status code from API.
   * @apiSuccess  {String} message Message from API.
   * @create_at   {Date} 01-August-2022
   * @developer   Saurav Satpathy
   */

  getFobProgrammers = async (req, res, next) => {
    try {
      const fobProgrammers = await User.findAll({
        where: {
          [Op.and]: [
            {
              is_fob: "1",
              role_id: {
                [Op.notIn]: [3, 4],
              },
            },
          ],
        },
        order: [["dispay_name", "asc"]],
        attributes: ["id", ["dispay_name", "display_name"]],
      });

      const msg = fobProgrammers
        ? "Fob programmers listing"
        : "No record found";
      return res
        .status(200)
        .json({ status: 1, message: msg, payload: fobProgrammers });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  };

  //END OF CLASS
}
export default new SettingCompanyController();
