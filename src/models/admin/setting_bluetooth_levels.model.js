module.exports = (sequelize, Sequelize) => {
  const SettingBluetoothLevels = sequelize.define('SettingBluetoothLevels', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    init_level: { type: Sequelize.INTEGER },
    max_level: { type: Sequelize.INTEGER },
  }, {
    tableName: 'setting_bluetooth_levels'
  });
  return SettingBluetoothLevels;
};
