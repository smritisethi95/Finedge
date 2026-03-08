const mongoose = require('mongoose');


const budgetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true 
  },
  monthlyGoal: { 
    type: Number, 
    required: true 
  },
  savingsTarget: { 
    type: Number, 
    required: true 
  }
});

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;