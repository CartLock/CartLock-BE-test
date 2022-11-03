import dotenv from "dotenv";
import Sequelize from 'sequelize';
import UserModel from '../../models/users.model';
import RoleModel from '../../models/roles.model';
import PermissionModel from '../../models/permissions.model';
import CompanyModel from '../../models/company.model';
import CompanyMailerConfigModel from '../../models/company_mailer_config.model';
import ServiceTicketModel from '../../models/service_ticket.model';
import ServiceTicketNotesModel from '../../models/service_ticket_notes.model';
import ActivityLogModel from '../../models/activity_log.model';
import ActivityLogNotesModel from '../../models/activity_log_notes.model';
import DeviceGroupModel from '../../models/device_group.model';
import DeviceGroupKeyModel from '../../models/device_group_key.model';
import DeviceConfigurationModel from '../../models/device_configuration.model';
import DeviceConfigurationScheduleModel from '../../models/device_configuration_schedule.model';
import DeviceConfigurationExceptionModel from '../../models/device_configuration_exception.model';
import UsersAssignedEkeyModel from '../../models/users_assigned_ekey.model';

// admin's
import SettingLockTypesModel from '../../models/admin/setting_lock_types.model';
import SettingReLockTriggersModel from '../../models/admin/setting_relock_triggers.model';
import SettingReLockTimmerModel from '../../models/admin/setting_relock_timmer.model';
import SettingTriggerEventsModel from '../../models/admin/setting_trigger_events.model';
import SettingMotorDirectionsModel from '../../models/admin/setting_motor_directions.model';
import SettingMotorVoltageModel from '../../models/admin/setting_motor_voltage.model';
import SettingMotorRunTimeModel from '../../models/admin/setting_motor_run_time.model';
import SettingServoPowerTimeModel from '../../models/admin/setting_servo_power_time.model';
import SettingServoLockUnlockPostionModel from '../../models/admin/setting_servo_lock_unlock_position.mode';
import SettingBluetoothLevelModel from '../../models/admin/setting_bluetooth_levels.model';
import SettingTimeZoneModel from '../../models/admin/setting_time_zone.model';
import SettingCompanyModel from '../../models/admin/setting_company.model';
import OtaModel from '../../models/admin/ota.model';
import CustomerModel from "../../models/customer.model";
import DeviceModel from "../../models/device.model";
import DeviceBatchModel from "../../models/device_batch.model";

const result = dotenv.config() 
 
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,  
  dialectOptions: {  
    // encrypt: true,
    // timezone: 'Asia/Calcutta'
  },
});



const Customer = CustomerModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);
const Role = RoleModel(sequelize, Sequelize);
const Permission = PermissionModel(sequelize, Sequelize);
const Company = CompanyModel(sequelize, Sequelize);
const CompanyMailerConfig = CompanyMailerConfigModel(sequelize, Sequelize);
const ServiceTicket = ServiceTicketModel(sequelize, Sequelize);
const ServiceTicketNotes = ServiceTicketNotesModel(sequelize, Sequelize);
const ActivityLog = ActivityLogModel(sequelize, Sequelize);
const ActivityLogNotes = ActivityLogNotesModel(sequelize, Sequelize);

const Device=DeviceModel(sequelize, Sequelize);
const DeviceBatch=DeviceBatchModel(sequelize, Sequelize);
const DeviceGroup = DeviceGroupModel(sequelize, Sequelize);
const DeviceGroupKey = DeviceGroupKeyModel(sequelize, Sequelize);
const DeviceConfiguration = DeviceConfigurationModel(sequelize, Sequelize);
const DeviceConfigurationSchedule = DeviceConfigurationScheduleModel(sequelize, Sequelize);
const DeviceConfigurationException = DeviceConfigurationExceptionModel(sequelize, Sequelize);
const UsersAssignedEkey = UsersAssignedEkeyModel(sequelize, Sequelize);

// admins's
const SettingLockTypes = SettingLockTypesModel(sequelize, Sequelize);
const SettingReLockTriggers = SettingReLockTriggersModel(sequelize, Sequelize);
const SettingReLockTimmer = SettingReLockTimmerModel(sequelize, Sequelize);
const SettingTriggerEvents = SettingTriggerEventsModel(sequelize, Sequelize);
const SettingMotorDirections = SettingMotorDirectionsModel(sequelize, Sequelize);
const SettingMotorVoltage = SettingMotorVoltageModel(sequelize, Sequelize);
const SettingMotorRunTime = SettingMotorRunTimeModel(sequelize, Sequelize);
const SettingServoPowerTime = SettingServoPowerTimeModel(sequelize, Sequelize);
const SettingServoLockUnlockPostion = SettingServoLockUnlockPostionModel(sequelize, Sequelize);
const SettingBluetoothLevel = SettingBluetoothLevelModel(sequelize, Sequelize);
const SettingTimeZone = SettingTimeZoneModel(sequelize, Sequelize);
const SettingCompany = SettingCompanyModel(sequelize, Sequelize);
const CompanyOta = OtaModel(sequelize, Sequelize);





const associations = {};

associations.deviceCongSechedule = DeviceConfiguration.hasMany(DeviceConfigurationSchedule, { as: 'schedule', foreignKey: 'device_configure_id', sourceKey: 'id' });
associations.deviceCongExecution = DeviceConfiguration.hasMany(DeviceConfigurationException, { as: 'exceptions', foreignKey: 'device_configure_id', sourceKey: 'id' });

associations.userAssignEkeys = UsersAssignedEkey.hasOne(DeviceGroup, { as : 'deviceGroup', foreignKey: 'id', sourceKey: 'group_id', constraints: false });

associations.userAssignEkeys = UsersAssignedEkey.hasOne(DeviceConfiguration, { as : 'ekeyDetails', foreignKey: 'id', sourceKey: 'ekey_id', constraints: false });
associations.userAssignEkeysUsers = UsersAssignedEkey.hasOne(User, { foreignKey: 'id', sourceKey: 'user_id', constraints: false });
associations.userServierTicket = ServiceTicket.hasOne(User, { as: 'User', foreignKey: 'id', sourceKey: 'user_id', constraints: false });
associations.userServierTicketNotes = ServiceTicketNotes.hasOne(User, { as: 'User', foreignKey: 'id', sourceKey: 'user_id', constraints: false });
associations.PermissionRole = Role.hasOne(Permission, { as: 'Permission', foreignKey: 'role_id', sourceKey: 'id', constraints: false });
associations.UserRole = User.hasOne(Role, { as: 'Role', foreignKey: 'id', sourceKey: 'role_id', constraints: false });
associations.userAndEkeys = User.hasOne(UsersAssignedEkey, { as : 'UsersAssignedEkey', foreignKey: 'user_id', sourceKey: 'id', constraints: false });

associations.userActivityLog = ActivityLog.hasOne(User, { as : 'User', foreignKey: 'id', sourceKey: 'user_id', constraints: false });
associations.userActivityLog2 = User.hasMany(ActivityLog, { as : 'logDetails', foreignKey: 'user_id', sourceKey: 'id', constraints: false });
// associations.userActivityLogBelong = User.belongsTo(ActivityLog, { as: 'logDetails', foreignKey: 'id', sourceKey: 'user_id', constraints: false });
associations.deviceConfActivityLog = ActivityLog.hasOne(DeviceConfiguration, { as : 'Device', foreignKey: 'id', sourceKey: 'device_id', constraints: false });
associations.deviceGroupActivityLog = ActivityLog.hasOne(DeviceGroup, { as : 'DeviceGroup', foreignKey: 'id', sourceKey: 'device_group_id', constraints: false });


sequelize.authenticate()
  .then(() => {
    console.log(`Database & tables created!`)
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// to regenerate table
// User.sequelize.sync({alter: true});
module.exports = {
  Customer,
  User, 
  Role, 
  Permission, 
  Company,
  CompanyMailerConfig,
  ServiceTicket, 
  ServiceTicketNotes, 
  ActivityLog, 
  ActivityLogNotes,
  Device,
  DeviceBatch,
  DeviceGroup, 
  DeviceGroupKey,
  DeviceConfiguration, 
  DeviceConfigurationSchedule, 
  DeviceConfigurationException,
  UsersAssignedEkey,
  SettingLockTypes,
  SettingReLockTriggers,
  SettingReLockTimmer,
  SettingTriggerEvents,
  SettingMotorDirections,
  SettingMotorVoltage,
  SettingMotorRunTime,
  SettingServoPowerTime,
  SettingServoLockUnlockPostion,
  SettingBluetoothLevel,
  SettingTimeZone,
  SettingCompany,
  associations,
  CompanyOta
};

