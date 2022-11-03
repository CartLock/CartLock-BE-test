module.exports = (sequelize, Sequelize) => {
  const SettingReLockTimmer = sequelize.define('SettingReLockTimmer', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    time_interval: { type: Sequelize.DECIMAL(10, 1) },
    init_time: { type: Sequelize.DECIMAL(10, 1) },
    max_time: { type: Sequelize.DECIMAL(10, 1) },
    time_mode: { type: Sequelize.STRING },
  }, {
    tableName: 'setting_relock_timmer'
  });
  return SettingReLockTimmer;
};
