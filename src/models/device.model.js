module.exports = (sequelize, Sequelize) => {
    const Device = sequelize.define('Device', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
     device_name: { type: Sequelize.STRING },
     mac_address: { type: Sequelize.STRING },
     group_id: { type: Sequelize.STRING },
    }, {
      tableName: 'device'
    });
    return Device;
  };
  