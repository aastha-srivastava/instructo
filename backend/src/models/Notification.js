const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipient_type: {
    type: DataTypes.ENUM('admin', 'instructor'),
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sender_type: {
    type: DataTypes.ENUM('admin', 'instructor'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('trainee_created', 'progress_shared', 'general'),
    allowNull: false
  },
  read_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Notification;
