const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Instructor = sequelize.define('Instructor', {
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
  },  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'instructors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (instructor) => {
      if (instructor.password) {
        instructor.password = await bcrypt.hash(instructor.password, 12);
      }
    },
    beforeUpdate: async (instructor) => {
      if (instructor.changed('password')) {
        instructor.password = await bcrypt.hash(instructor.password, 12);
      }
    }
  }
});

// Instance methods
Instructor.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

Instructor.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = Instructor;
