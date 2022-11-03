module.exports = (sequelize, Sequelize) => {
  const SettingReLockTriggers = sequelize.define('SettingReLockTriggers', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    relock_trigger_name: { type: Sequelize.STRING },
    is_inactive: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
  }, {
    tableName: 'setting_relock_triggers'
  });
  return SettingReLockTriggers;
};
