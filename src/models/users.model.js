module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('Users', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    role_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'roles', // 'roles' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    // company_id: { type: Sequelize.STRING },
    company_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'company', // 'company' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    first_name: { type: Sequelize.STRING, allowNull: false },
    last_name: { type: Sequelize.STRING, allowNull: false },
    dispay_name: { type: Sequelize.STRING, allowNull: false },
    e_mail: { type: Sequelize.STRING, allowNull: false },
    phone_number: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING },
    user_notes: { type: Sequelize.TEXT },
    is_sentinel: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    is_installer: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    is_fob: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    is_inactive: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    language: { type: Sequelize.STRING, defaultValue: 'en' },
    unique_code: { type: Sequelize.STRING},
    is_supervisor: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
    is_housekeeping: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-NO, 1-YES" },
  }, {
    tableName: 'users'
  });
  return User;
};


