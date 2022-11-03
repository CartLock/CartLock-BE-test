module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define(
    "Company",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: Sequelize.STRING },
      company_name: { type: Sequelize.STRING },
      company_address: { type: Sequelize.STRING },
      company_street: { type: Sequelize.STRING },
      company_country: { type: Sequelize.STRING },
      company_zip: { type: Sequelize.STRING },
      company_e_mail: { type: Sequelize.STRING },
      poc_first_name: { type: Sequelize.STRING },
      poc_last_name: { type: Sequelize.STRING },
      poc_e_mail: { type: Sequelize.STRING },
      poc_phone_number: { type: Sequelize.STRING },
      is_deactive: {
        type: Sequelize.ENUM("0", "1"),
        defaultValue: "0",
        comment: "0-NO, 1-YES",
      },
      // Added by Saurav
      company_code: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      registratation_date: { type: Sequelize.DATE },
      timezone: { type: Sequelize.STRING },
      payment_cost: { type: Sequelize.DOUBLE },
      waiting_hour: { type: Sequelize.TIME},
      payment_gateway: { type: Sequelize.STRING },
      acc_no: { type: Sequelize.STRING },
      currency: { type: Sequelize.STRING },
    },
    {
      tableName: "company",
    }
  );
  return Company;
};
