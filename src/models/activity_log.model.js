module.exports = (sequelize, Sequelize) => {
  const ActivityLog = sequelize.define('Activity_log', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    operation_type: { type: Sequelize.STRING },
    device_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_configuration', // 'device_configuration' refers to table name
         key: 'id', // 'id' refers to column name in device_configuration
      }
    },
    user_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'users', // 'users' refers to table name
         key: 'id', // 'id' refers to column name in users
      }
    },
    device_group_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_group', // 'device_group' refers to table name
         key: 'id', // 'id' refers to column name in device_group
      }
    },
    cust_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'customer', // 'customer' refers to table name
         key: 'id', // 'id' refers to column name in device_group
      }
    },
    summary: { type: Sequelize.STRING },
    gps_location: { type: Sequelize.TEXT },
    activity_description: { type: Sequelize.TEXT },
  },
  {
    tableName: 'activity_log'
  });
  return ActivityLog;
};


