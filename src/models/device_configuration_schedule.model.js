module.exports = (sequelize, Sequelize) => {
  const DeviceConfigurationSchedule = sequelize.define('Device_configuration_schedule', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    device_configure_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_configuration', // 'device_configuration' refers to table name
         key: 'id', // 'id' refers to column name in device table
      }
    },
    schedule_day: { type: Sequelize.STRING },
    open_time: { type: Sequelize.TIME },
    close_time: { type: Sequelize.TIME },
    close_whole_day: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" }
  }, {
    tableName: 'device_configuration_schedule'
  });
  return DeviceConfigurationSchedule;
};


