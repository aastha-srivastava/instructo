const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
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
  project_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'assigned'
  },
  performance_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  project_report_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attendance_document_path: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',  hooks: {
    beforeCreate: async (project) => {
      // Auto-set start_date when project is created
      if (!project.start_date) {
        project.start_date = new Date();
      }
    },
    beforeUpdate: async (project) => {
      // Auto-set end_date when status changes to 'completed'
      if (project.changed('status') && project.status === 'completed' && !project.end_date) {
        project.end_date = new Date();
      }
    }
  }
});

module.exports = Project;
