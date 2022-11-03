module.exports = (sequelize, Sequelize) => {
  const SettingMotorVoltage = sequelize.define('SettingMotorVoltage', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    min_voltage: { type: Sequelize.INTEGER },
    max_voltage: { type: Sequelize.INTEGER },
  }, {
    tableName: 'setting_motor_voltage'
  });
  return SettingMotorVoltage;
};
