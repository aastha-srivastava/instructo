const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProgressReview = sequelize.define('ProgressReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trainee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trainees',
      key: 'id'
    }
  },
  shared_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('in_review', 'completed'),
    allowNull: false,
    defaultValue: 'in_review'
  },
  shared_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'progress_reviews',
  timestamps: false
});

module.exports = ProgressReview;
