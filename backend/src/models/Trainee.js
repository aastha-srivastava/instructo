const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trainee = sequelize.define('Trainee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  institution_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  joining_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expected_completion_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instructors',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending_approval', 'approved', 'rejected', 'active', 'completed'),
    allowNull: false,
    defaultValue: 'pending_approval'
  },
  local_guardian_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  local_guardian_phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  local_guardian_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  reference_person_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  reference_person_phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  reference_person_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  }
}, {
  tableName: 'trainees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Trainee;
