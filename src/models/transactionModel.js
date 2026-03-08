const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount must be a positive number']
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;