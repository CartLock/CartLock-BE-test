module.exports = (sequelize, Sequelize) => {
  const SettingTimeZone = sequelize.define('SettingTimeZone', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    time_zone: { type: Sequelize.STRING },
    full_time_zone: { type: Sequelize.STRING },
    is_inactive: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
  }, {
    tableName: 'setting_time_zone'
  });
  return SettingTimeZone;
};
