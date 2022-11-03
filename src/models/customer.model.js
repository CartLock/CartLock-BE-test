module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('Customer', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      mobile: { type: Sequelize.STRING, allowNull: false },
    }, 
    {
      tableName: 'customer'
    });
    return Customer;
  };
  
  
  