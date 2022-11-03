module.exports = (sequelize, Sequelize) => {
  const ActivityLogNotes = sequelize.define('Activity_log_notes', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    activity_log_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'activity_log', 
         key: 'id'
      }
    },
    note_description: { type: Sequelize.TEXT }
  }, {
    tableName: 'activity_log_note'
  });
  return ActivityLogNotes;
};


