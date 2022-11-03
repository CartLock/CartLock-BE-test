import Joi from "@hapi/joi";

// Joi.objectId = require('joi-objectid')(Joi)

class ValidationService {
  // login schema
  appLoginSchema = () => {
    const schema = Joi.object({
      companyId: Joi.string().required(),
      userName: Joi.string().required(),
      password: Joi.string().min(2).required(),
    });
    return schema;
  };

  // forgot password schema
  forgotPasswordSchema = () => {
    const schema = Joi.object({
      userName: Joi.string().required(),
    });
    return schema;
  };

  // reset password schema
  restPasswordSchema = () => {
    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required().valid(Joi.ref("newPassword")),
    });
    return schema;
  };

  // reset password schema
  webForgotPasswordSchema = () => {
    const schema = Joi.object({
      userName: Joi.string().required(),
      companyId: Joi.string().required(),
      company_id: Joi.string().required(),
    });
    return schema;
  };

  // web reset password schema
  webResetPasswordSchema = () => {
    const schema = Joi.object({
      password: Joi.string().required(),
      uid: Joi.string().required(),
    });
    return schema;
  };

  // add user schema
  addUserSchema = () => {
    const schema = Joi.object({
      userId: Joi.number(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      displayName: Joi.string().required(),
      emailId: Joi.string().email().required(),
      phoneNumer: Joi.string().min(10).required(),
      userNotes: Joi.string().allow(null).allow(""),
      isSentinel: Joi.string().required(),
      isInstaller: Joi.string().required(),
      isFob: Joi.string().required(),
      isInactive: Joi.string().required(),
      isSupervisor: Joi.string().required(),
      isHouseKeeping: Joi.string().required(),
      isHouseKeepingWithoutEvent:Joi.string().required(),
      isSupervisorWithoutEvent:Joi.string().required(),
      checkboxValue:Joi.string().required(),
      companyId:Joi.string().required(),
      
    });
    return schema;
  };

  // assign key to uaser schema
  assignKeyToUserSchema = () => {
    const schema = Joi.object({
      assignedKeyId: Joi.number().allow(null).allow(""),
      userId: Joi.number().required(),
      eKey: Joi.number().required(),
      status: Joi.string().allow(null).allow(""),
      type: Joi.string().allow(null).allow(""),
      FOBDeviceId: Joi.string().allow(null).allow(""),
      oneTimeUse: Joi.string().allow(null).allow(""),
      startDate: Joi.string().allow(null).allow(""),
      startTime: Joi.string().allow(null).allow(""),
      endDate: Joi.string().allow(null).allow(""),
      endTime: Joi.string().allow(null).allow(""),
      scheduleDays: Joi.string().allow(null).allow(""),
      zone: Joi.any().allow(null).allow(""),
    });
    return schema;
  };

  //----------------------COMAPNY SCHEMA---------------
  // add company schema
  addCompanySchema = () => {
    const schema = Joi.object({
      // id: Joi.number().allow(null).allow(''),
      // companyId: Joi.string().required(),
      // companyName: Joi.string().required(),
      // companyAddress: Joi.string().allow(null).allow(''),
      // companyStreet: Joi.string().allow(null).allow(''),
      // companyCountry: Joi.string().allow(null).allow(''),
      // companyZip: Joi.string().allow(null).allow(''),
      // companyEmail: Joi.string().allow(null).allow(''),
      // POCFirstName: Joi.string().required(),
      // POCLastName: Joi.string().required(),
      // POCEmail: Joi.string().required(),
      // POCPhoneNumber: Joi.string().required(),
      // isDeactive: Joi.string().allow(null).allow(''),

      //added By Saurav Satpathy
      id: Joi.number().allow(null).allow(""),
      companyId: Joi.string().required(),
      companyCode: Joi.string().required(),
      location: Joi.string().required(),
      companyEmail: Joi.string().allow(null).allow(""),
      registratationDate: Joi.string().required(),
      timezone: Joi.string().allow(null).allow(""),
      POCPhoneNumber: Joi.string().required(),
      cartFee: Joi.string().required(),
      timing: Joi.string().allow(null).allow(""),
      paymentGateway: Joi.string().required(),
      merchantAccNo: Joi.string().required(),
      isDeactive: Joi.string().allow(null).allow(""),
      currency:Joi.string().allow(null).allow(""),
      companyName:Joi.string().allow(null).allow(""),
    });
    return schema;
  };


  updateCompanySchema = () => {
    const schema = Joi.object({

      //added By Saurav Satpathy
      id: Joi.number().allow(null).allow(""),
      companyId: Joi.string().allow(null).allow(""),
      companyCode: Joi.string().allow(null).allow(""),
      location: Joi.string().allow(null).allow(""),
      companyEmail: Joi.string().allow(null).allow(""),
      registratationDate: Joi.string().allow(null).allow(""),
      timezone: Joi.string().allow(null).allow(""),
      POCPhoneNumber: Joi.string().allow(null).allow(""),
      cartFee: Joi.number().allow(null).allow(""),
      timing: Joi.string().allow(null).allow(""),
      paymentGateway: Joi.string().allow(null).allow(""),
      merchantAccNo:Joi.string().allow(null).allow(""),
      isDeactive: Joi.string().allow(null).allow(""),
      companyName:Joi.string().allow(null).allow("")
    });
    return schema;
  };

  //---------------------- DEVICE GROUP SCHEMA---------------
  // assign key to uaser schema
  createDeviceGroupSchema = () => {
    const schema = Joi.object({
      id: Joi.number().allow(null).allow(""),
      display_name: Joi.string().required(),
      full_name: Joi.string().required(),
      description: Joi.string().allow(null).allow(""),
      sch_monday: Joi.boolean().allow(null).allow(""),
      sch_tuesday: Joi.boolean().allow(null).allow(""),
      sch_wednesday: Joi.boolean().allow(null).allow(""),
      sch_thursday: Joi.boolean().allow(null).allow(""),
      sch_friday: Joi.boolean().allow(null).allow(""),
      sch_saturday: Joi.boolean().allow(null).allow(""),
      sch_sunday: Joi.boolean().allow(null).allow(""),
      start_at: Joi.string().allow(null).allow(""),
      end_at: Joi.string().allow(null).allow(""),
      time_zone: Joi.any().allow(null).allow(""),
      available_devices: Joi.array().allow(null).allow(""),
      status: Joi.string().allow(null).allow(""),
    });
    return schema;
  };
  createDeviceBatchSchema = () => {
    const schema = Joi.object({
      batchName: Joi.string().required(),
      batchNo: Joi.string().required(),
      activationDate: Joi.string().required(),
      relcementdate: Joi.string().required(),
      noOfDevice: Joi.string(),
      userId: Joi.string().required(),
      companyId:Joi.string().required(),
      ExcelFileData: Joi.string().required(),
    });
    return schema;
  };
  createSupportTicketSchema = () => {
    const schema = Joi.object({
      userId: Joi.string(),
      customerId:Joi.string(),
      ticketNumber: Joi.string().required(),
      phoneModel: Joi.string(),
      activeLock: Joi.string(),
      reportingDate: Joi.string(),
      sentinelDate: Joi.string(),
      bluetoothStatus: Joi.string(),
      ekey: Joi.string(),
      phone: Joi.string(),
      phoneGps: Joi.string(),
      problemDescription:Joi.string(),
      ticketStatus:Joi.string(),
      phone:Joi.string(),
      brand:Joi.string(),
      softwareVersion:Joi.string()
    });
    return schema;
  };
}

export default new ValidationService();
