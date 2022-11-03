module.exports = (sequelize, Sequelize) => {
  const DeviceConfiguration = sequelize.define('Device_configuration', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
         model: 'users', // 'users' refers to table name
         key: 'id', // 'id' refers to column name in device table
      }
    },
    devicebatch_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'device_batch', // 'device_info' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    company_id: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
         model: 'company', // 'company' refers to table
         key: 'id', // 'id' refers to column name in table
      }
    },
    serial_number: { type: Sequelize.STRING },
    full_name: { type: Sequelize.STRING },
    display_name: { type: Sequelize.STRING },
    lock_type: { type: Sequelize.STRING },
    relock_trigger: { type: Sequelize.STRING },
    trigger_mode: { type: Sequelize.STRING },
    relock_timer: { type: Sequelize.STRING },
    motor_run_time: { type: Sequelize.STRING },
    motor_direction: { type: Sequelize.STRING },
    servo_unlock_position: { type: Sequelize.STRING },
    servo_lock_position: { type: Sequelize.STRING },
    servo_power_time: { type: Sequelize.STRING },
    motor_voltage: { type: Sequelize.STRING },
    manual_lock: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-OFF, 1-ON" },
    sleep_mode: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-OFF, 1-ON" },
    bluetooth_power_level: { type: Sequelize.STRING },
    schedule_open: { type: Sequelize.ENUM('0', '1'), defaultValue: '0', comment: "0-OFF, 1-ON" },
    sensor1_open_name: { type: Sequelize.STRING },
    sensor1_close_name: { type: Sequelize.STRING },
    sensor2_open_name: { type: Sequelize.STRING },
    sensor2_close_name: { type: Sequelize.STRING },
    hardware_id: { type: Sequelize.STRING },
    battery_level: { type: Sequelize.STRING },
    fw_version: { type: Sequelize.STRING },
    device_type: { type: Sequelize.STRING },
    uuid: { type: Sequelize.STRING },
    dnort_time: { type: Sequelize.STRING },
    type: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    model_number: { type: Sequelize.STRING }
  }, {
    tableName: 'device_configuration'
  });
  return DeviceConfiguration;
};


