const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  assignedTo: String,
  status: { type: String, enum: ['قيد الإنجاز', 'منجز'], default: 'قيد الإنجاز' }
});

module.exports = mongoose.model('Task', taskSchema);