module.exports = (sequelize, Sequelize) => {
  const ServiceTicketNotes = sequelize.define('Service_ticket_notes', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    service_ticket_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'service_ticket', // 'service_ticket' refers to table name
         key: 'id', // 'id' refers to column name in users table
      }
    },
    user_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'users', // 'users' refers to table name
         key: 'id', // 'id' refers to column name in users table
      }
    },
    note_description: { type: Sequelize.TEXT }
  }, {
    tableName: 'service_ticket_note'
  });
  return ServiceTicketNotes;
};


