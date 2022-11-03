module.exports = (sequelize, Sequelize) => {
  const ServiceTicket = sequelize.define('Service_ticket', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'users', // 'users' refers to table name
         key: 'id', // 'id' refers to column name in users table
      }
    },
    customer_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'customer', // 'customer' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    ticket_number: { type: Sequelize.STRING },
    phone: { type: Sequelize.STRING },
    brand: { type: Sequelize.STRING },
    phone_model: { type: Sequelize.STRING },
    software_version: { type: Sequelize.STRING },
    active_lock: { type: Sequelize.TEXT },
    reporting_date_time: { type: Sequelize.DATE },
    sentinel_date_time: { type: Sequelize.DATE },
    bluetooth_status: { type: Sequelize.STRING },
    ekey: { type: Sequelize.STRING },
    phone_gps: { type: Sequelize.STRING },
    problem_description: { type: Sequelize.STRING },
    ticket_status: { type: Sequelize.ENUM('0', '1'), defaultValue: '1', comment: "0-CLOSED, 1-OPEN" }
  }, {
    tableName: 'service_ticket'
  });
  return ServiceTicket;
};


