const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  document_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  document_type: {
    type: DataTypes.ENUM('project_report', 'attendance_record', 'other'),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'documents',
  timestamps: false
});

module.exports = Document;
