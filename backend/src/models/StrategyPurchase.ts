import mongoose from 'mongoose';

const StrategyPurchaseSchema = new mongoose.Schema({
  buyerAddress: {
    type: String,
    required: true,
    index: true
  },
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true
  },
  // Payment information
  paymentAmount: {
    type: Number,
    required: true
  },
  paymentRecipient: {
    type: String,
    required: true
  },
  paymentCurrency: {
    type: String,
    required: true,
    default: 'USDC'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  // X402 payment information
  x402PaymentId: {
    type: String,
    required: true,
    unique: true
  },
  // Optional blockchain transaction hash for verification
  transactionHash: {
    type: String,
    sparse: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate purchases by same user
StrategyPurchaseSchema.index({ buyerAddress: 1, strategyId: 1 }, { unique: true });

export const StrategyPurchase = mongoose.model('StrategyPurchase', StrategyPurchaseSchema);