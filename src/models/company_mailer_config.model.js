module.exports = (sequelize, Sequelize) => {
  const CompanyMailerConfig = sequelize.define('companyMailerConfig', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    company_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'company', // 'company' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    host_name: { type: Sequelize.STRING },
    port_name: { type: Sequelize.STRING },
    user_name: { type: Sequelize.STRING },
    user_password: { type: Sequelize.STRING },
  }, {
    tableName: 'company_mailer_config'
  });
  return CompanyMailerConfig;
};


