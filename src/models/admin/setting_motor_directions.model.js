module.exports = (sequelize, Sequelize) => {
  const SettingMotorDirections = sequelize.define('SettingMotorDirections', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    direction: { type: Sequelize.STRING },
    is_inactive: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
  }, {
    tableName: 'setting_motor_directions'
  });
  return SettingMotorDirections;
};
