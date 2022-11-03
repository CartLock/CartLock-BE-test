module.exports = (sequelize, Sequelize) => {
  const SettingServoLockUnlockPosition = sequelize.define('SettingServoLockUnlockPosition', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    position_interval: { type: Sequelize.INTEGER },
    init_position: { type: Sequelize.INTEGER },
    max_position: { type: Sequelize.INTEGER },
    position_mode: { type: Sequelize.STRING },
  }, {
    tableName: 'setting_servo_lock_unlock_position'
  });
  return SettingServoLockUnlockPosition;
};
