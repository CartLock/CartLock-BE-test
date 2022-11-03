module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Roles', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    role_title: { type: Sequelize.STRING },
    role_description: { type: Sequelize.STRING },
  }, {
    tableName: 'roles'
  });
  return Role;
};
