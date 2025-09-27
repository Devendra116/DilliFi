import mongoose from 'mongoose';

const StrategySchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    index: true
  },
  strategyHash: {
    type: String,
    required: true
  },
  strategy: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index to ensure strategies are unique per user
StrategySchema.index({ userAddress: 1, strategyHash: 1 }, { unique: true });

export const Strategy = mongoose.model('Strategy', StrategySchema);