module.exports = (sequelize, Sequelize) => {
  const DeviceGroup = sequelize.define('Device_group', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    display_name: { type: Sequelize.STRING },
    full_name: { type: Sequelize.STRING },
    description: { type: Sequelize.TEXT },
    sch_monday: { type: Sequelize.BOOLEAN },
    sch_tuesday: { type: Sequelize.BOOLEAN },
    sch_wednesday: { type: Sequelize.BOOLEAN },
    sch_thursday: { type: Sequelize.BOOLEAN },
    sch_friday: { type: Sequelize.BOOLEAN },
    sch_saturday: { type: Sequelize.BOOLEAN },
    sch_sunday: { type: Sequelize.BOOLEAN },
    start_at: { type: Sequelize.TIME },
    end_at: { type: Sequelize.TIME },
    time_zone: { type: Sequelize.STRING },
    status: { type: Sequelize.ENUM('1', '2', '3'), defaultValue: '1', comment: "1-FUTURE, 2-ACTIVE, 3-INACTIVE"},
  }, {
    tableName: 'device_group'
  });
  return DeviceGroup;
};


