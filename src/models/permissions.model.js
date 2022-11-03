module.exports = (sequelize, Sequelize) => {
  const Permission = sequelize.define('permissions', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    role_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'roles', // 'roles' refers to table name
         key: 'id', // 'id' refers to column name in roles
      }
    },
    permission_add: { type: Sequelize.BOOLEAN, defaultValue: false, comment: "0-No, 1-Yes" },
    permission_modifly: { type: Sequelize.BOOLEAN, defaultValue: false, comment: "0-No, 1-Yes" },
    permission_view: { type: Sequelize.BOOLEAN, defaultValue: false, comment: "0-No, 1-Yes" },
    permission_delete: { type: Sequelize.BOOLEAN, defaultValue: false, comment: "0-No, 1-Yes" },
    permission_module: { type: Sequelize.TEXT },
    permission_all: { type: Sequelize.BOOLEAN, defaultValue: false, comment: "0-No, 1-Yes" },
    permission_title: { type: Sequelize.STRING },
    permission_description: { type: Sequelize.TEXT }
  },
  {
    timestamps: false
  },
   {
    tableName: 'permissions'
  });
  return Permission;
};


