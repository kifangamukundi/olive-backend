const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'employee']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

employeeSchema.statics.getAdmins = function () {
    return this.find({ role: 'admin' });
  };
  

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
