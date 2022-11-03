import Joi from '@hapi/joi'

// Joi.objectId = require('joi-objectid')(Joi)



class ValidationService {

//Customer Register Schema
customerRegisterSchema = ()=>{
    const schema = Joi.object({
      mobile: Joi.string().required()
  })
  return schema
}
//Create Device Schema
createDevice = ()=>{
  const schema = Joi.object({
    macAddress: Joi.string().required()
})
return schema
}



  // app login schema
  appLoginSchema = ()=>{
    const schema = Joi.object({
      companyId: Joi.string().required(),
      userName: Joi.string().required(),
      password: Joi.string().min(2).required(),
      language: Joi.string().allow(null).allow(''),
    })
    return schema
  }

  // forgot password schema
  forgotPasswordSchema = ()=>{
    const schema = Joi.object({
      userName: Joi.string().required(),
      companyId:Joi.string().required(),
    })
    return schema
  }

   // app login schema
   restPasswordSchema = ()=>{
    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword:Joi.string().required().valid(Joi.ref('newPassword'))
    })
    return schema
  }




  //----------------------DEVICE SCHEMA---------------
  // create device schema
  createDeviceSchema = ()=>{
    const schema = Joi.object({
      id: Joi.number().allow(null).allow(''),
      serialNumber: Joi.string().required(),  
      hardwareId: Joi.string().required(),
      fullName: Joi.string().required(),
      displayName: Joi.string().required(),
      dateInstalled: Joi.date().required()
    })
    return schema
  }

  // create device configure schema
  createDeviceConfigureSchema = ()=>{
    const schema = Joi.object({
      id: Joi.number().allow(null).allow(''),
      serial_number: Joi.string().required(),
      full_name: Joi.string().required(),
      display_name: Joi.string().required(),
      lock_type: Joi.string().required(),
      relock_trigger: Joi.string().required(),
      trigger_mode: Joi.string().allow(null).allow(''),
      relock_timer: Joi.string().allow(null).allow(''),
      motor_run_time: Joi.string().allow(null).allow(''),
      motor_direction: Joi.string().allow(null).allow(''),
      servo_unlock_position: Joi.string().allow(null).allow(''),
      servo_lock_position: Joi.string().allow(null).allow(''),
      servo_power_time: Joi.string().allow(null).allow(''),
      motor_voltage: Joi.string().allow(null).allow(''),
      manual_lock: Joi.string().required(),
      sleep_mode: Joi.string().required(),
      bluetooth_power_level: Joi.string().required(),
      schedule_open: Joi.string().required(),
      schedule: Joi.array().allow(null).allow(''),
      exceptions: Joi.array().allow(null).allow(''),
      sensor1_open_name: Joi.string().allow(null).allow(''),
      sensor1_close_name: Joi.string().allow(null).allow(''),
      sensor2_open_name: Joi.string().allow(null).allow(''),
      sensor2_close_name: Joi.string().allow(null).allow(''),
      schedule_full_date: Joi.string().allow(null).allow(''),
      userType: Joi.string().allow(null).allow(''),
      create_date_time: Joi.string().allow(null).allow(''),
      hardware_id: Joi.string().allow(null).allow(''),
      battery_level: Joi.string().allow(null).allow(''),
      fw_version: Joi.string().allow(null).allow(''),
      device_type: Joi.string().allow(null).allow(''),
      dnort_time: Joi.string().allow(null).allow(''),
    })
    return schema
  }
}

export default new ValidationService;
