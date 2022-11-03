module.exports = (sequelize, Sequelize) => {
  const UsersAssignedEkey = sequelize.define('Users_assigned_ekey', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },    
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'users', // 'users' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    ekey_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_configuration', // 'device_configuration' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    group_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_group', // 'device_group' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    one_time_use: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    start_date_time: { type: Sequelize.DATE },
    end_date_time: { type: Sequelize.DATE },
    schedule_days: { type: Sequelize.STRING},
    time_zone: { type: Sequelize.STRING },
    fob_device_id: { type: Sequelize.STRING },
    is_group: { type: Sequelize.BOOLEAN, defaultValue: '0', comment: "0-NO, 1-YES" },
    status: { type: Sequelize.ENUM('1', '2', '3', '4', '5'), defaultValue: '1', comment: "1-ASSIGNED, 2-ONE TIME, 3-NO LONGER VALID, 4-ACTIVE, 5-INACTIVE"},
  }, {
    tableName: 'users_assigned_ekey'
  });
  return UsersAssignedEkey;
};


