module.exports = (sequelize, Sequelize) => {
  const SettingLockTypes = sequelize.define('SettingLockTypes', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    lock_type_name: { type: Sequelize.STRING },
    is_inactive: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
  }, {
    tableName: 'setting_lock_types'
  });
  return SettingLockTypes;
};
