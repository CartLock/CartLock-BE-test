module.exports = (sequelize, Sequelize) => {
  const DeviceGroupKey = sequelize.define('Device_group_key', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    device_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_configuration', // 'device_configuration' refers to table name
         key: 'id', // 'id' refers to column name in device table
      }
    },
    group_details_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_group', // 'device_group' refers to table name
         key: 'id', // 'id' refers to column name in device table
      }
    },
    device_full_name: { type: Sequelize.STRING }
  }, {
    tableName: 'device_group_key'
  });
  return DeviceGroupKey;
};


