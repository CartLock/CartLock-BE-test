import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { JWT_SECRET } from "../../util/secrets";
import { SettingCompany, ActivityLog, CompanyMailerConfig } from "../middleware/connection";
//import { Op, Sequelize } from "sequelize";
const messagingApi = require("@cmdotcom/text-sdk");
const myMessageApi = new messagingApi.MessageApiClient(process.env.PRODUCT_TOKEN);
import translate from 'translation-google';
import * as firebase from 'firebase-admin';
import Pushy from 'pushy';

import moment from "moment";

 
class CommonService {
  constructor() { }

  //Generate Unique TransID for Otp code
  generateTempPassword(howMany, type) {
    // type == alphaNumber or number
    let chars;
    if (type == 'alphaNumber') {
      chars = "ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    }
    else if (type == 'alphaNumber2') {
      chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    }
    else {
      chars = "0123456789";
    }
    var rnd = crypto.randomBytes(howMany),
      value = new Array(howMany),
      len = chars.length;
    for (var i = 0; i < howMany; i++) {
      value[i] = chars[rnd[i] % len];
    }
    return value.join("");
  }

  //Generate JWT Token
  generateToken(user) {
    let payload = user;
    // payload = {
    //   id: user.id,
    //   email: user.e_mail,
    //   role: user.role_id,
    //   company_id: 4
    // }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '10d' });
  };


  translateContent = async (text = '', to = 'zh-cn') => {
    const translation = await translate('This is Google Translate', { to })
    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation.text}`);
  }


  // number with leading zeros
  numberPad(number, length) {
    return String(number).padStart(length, '0')
  }

  // date formate
  dateFormate = originalDate => moment(originalDate, 'MM-DD-YYYY HH:mm:ss').format('YYYY/MM/DD')

  // get company settings
  async companySettings(companyId) {

    const settings = await SettingCompany.findOne({
      where: {
        company_id: companyId
      }
    })
    
    if(settings){
      settings.dataValues.schedule_opens = JSON.parse(settings.schedule_opens)
      settings.dataValues.schedule_exceptions = JSON.parse(settings.schedule_exceptions)
      settings.dataValues.fob_programmers = JSON.parse(settings.fob_programmers)
      settings.dataValues.default_time_zone = JSON.parse(settings.default_time_zone)
    }
    return settings
  }


  dateFormat(timeZone, date="", formate="") {
    const dFormate = formate ? formate : 'YYYY-MM-DD HH:mm:ss'
    const mFormate = date ? moment(date) : moment();
    return  mFormate.tz(timeZone).format(dFormate)    
  }

  UTCDateTimeFormat(dateTime, timeZone){
    var localFormat   = moment.tz(dateTime, timeZone)
    var utcFormat = moment.tz(localFormat, "UTC")

    return utcFormat;
  }

  timeFormatUTC(timeZone, time) {
    var utcTime = time;
    if(time && time != undefined && time != '00:00:00' && time != '00:00'){
      const formatted = moment().format('YYYY-MM-DD '+time)
      utcTime = moment(formatted).tz(timeZone).format('HH:mm:ss')
    }
    return utcTime
  }

  utcTimeFormat(time) {
    /*var utcTime
    if(time && time != undefined && time != '00:00:00' && time != '00:00'){
      const formatted = moment().format('YYYY-MM-DD '+time)
      utcTime = moment(formatted).tz('UTC').format('HH:mm:ss')
    }
    else{
      utcTime = ""
    }
    
    return utcTime
    */
    return time
  }


  utcToLocaleTimeFormat(time, timezone) {
    /*var localTime
    if(time && time != undefined && time != '00:00:00' && time != '00:00'){
      const formatted = moment().format('YYYY-MM-DD')+'T'+time+'Z'
      localTime = moment(formatted).tz(timezone).format('HH:mm')
    }
    else{
      localTime = time
    }
    
    return localTime
    */
    return time
  }


  // SEND MAIL HELLPER FUNCTION
  async sendMail(mailData, companyId) {
    var getTransporterDetails = await CompanyMailerConfig.findOne({where: {company_id: companyId}});
    if(!getTransporterDetails){
      companyId = 1; // Default admin Mailer config data
      var getTransporterDetails = await CompanyMailerConfig.findOne({where: {company_id: companyId}});
    }

   console.log("Common Services")

    if(getTransporterDetails.port_name=="465")
    {
      var is_Secure = true;
    } else {
      var is_Secure = false;
    }

    console.log("is_Secure "+is_Secure);

    const Transporter = nodemailer.createTransport({
      host: getTransporterDetails.host_name,
      port: getTransporterDetails.port_name,
      secure: is_Secure, // true for 465, false for other ports
      auth: {
        user: getTransporterDetails.user_name,
        pass: getTransporterDetails.user_password,
      },
      tls: {
        rejectUnauthorized: false,
      }

    });

    const mailOptions = {
      from: 'LOCK-CART '+getTransporterDetails.user_name,  // sender address
      to: mailData.to, // list of receivers 
      subject: mailData.subject, // Subject line
      // text: 'texing your point',
      html: mailData.html_text, // html body
    };

    const info = await Transporter.sendMail(mailOptions, async function (err, data) {
      if (err) {
         console.log('error occuring', err)
      } else {
        console.log("Successss")
         console.log(data)
        return await data
      }
    });
    console.log(info)
    return info;
  }


  //END
}


export default new CommonService;