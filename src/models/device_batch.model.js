module.exports = (sequelize, Sequelize) => {
    const DeviceBatch = sequelize.define('DeviceBatch', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
     batch_name: { type: Sequelize.STRING },
     activation_date: { type: Sequelize.DATE },
     batch_number: { type: Sequelize.STRING },
     battery_replacement_date: { type: Sequelize.DATE },
     no_of_device: { type: Sequelize.STRING },
    }, {
      tableName: 'device_batch'
    });
    return DeviceBatch;
  };
  