module.exports = (sequelize, Sequelize) => {
  const DeviceConfigurationException = sequelize.define('Device_configuration_exception', {
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
    schedule_month: { type: Sequelize.STRING },
    schedule_day: { type: Sequelize.INTEGER },
    schedule_full_date: { type: Sequelize.DATEONLY },
    open_time: { type: Sequelize.TIME },
    close_time: { type: Sequelize.TIME },
    close_whole_day: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" }
  }, {
    tableName: 'device_configuration_exception'
  });
  return DeviceConfigurationException;
};


