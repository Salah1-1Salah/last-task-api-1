const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: String,
  members: [String],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

module.exports = mongoose.model('Team', teamSchema);