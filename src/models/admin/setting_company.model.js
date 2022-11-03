module.exports = (sequelize, Sequelize) => {
  const SettingCompany = sequelize.define('SettingCompany', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    company_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'company', // 'company' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    is_multi_phone_login: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    offline_reconect: { type: Sequelize.STRING },
    schedule_opens: { type: Sequelize.TEXT },
    schedule_exceptions: { type: Sequelize.TEXT },
    default_time_zone: { type: Sequelize.STRING },
    ekey_duration: { type: Sequelize.STRING },
    default_country_code: { type: Sequelize.STRING },
    fob_programmers: { type: Sequelize.TEXT },
    allowed_firmware: { type: Sequelize.TEXT },
    is_force_firmware_update: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    payment_cost: { type: Sequelize.DOUBLE },
    currency: { type: Sequelize.STRING },
    waiting_hour: { type: Sequelize.TIME},
  
  
  }, {
    tableName: 'setting_company'
  });
  return SettingCompany;
};
