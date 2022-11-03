module.exports = (sequelize, Sequelize) => {
  const ota = sequelize.define('ota', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    company_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'company', // 'company' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    }, 
    version: { type: Sequelize.TEXT },
    zip_files: { type: Sequelize.TEXT }, 
    version_description: { type: Sequelize.TEXT }, 
    status: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    createdAt: { type: Date }, 
  }, {
    tableName: 'company_firmware'
  });
  return ota;
};  
   