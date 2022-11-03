module.exports = (sequelize, Sequelize) => {
  const SettingTriggerEvents = sequelize.define('SettingTriggerEvents', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    event_name: { type: Sequelize.STRING },
    is_inactive: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
  }, {
    tableName: 'setting_trigger_events'
  });
  return SettingTriggerEvents;
};
