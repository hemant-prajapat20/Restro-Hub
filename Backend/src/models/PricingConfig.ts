import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingMatrix {
  months1: number;
  months3: number;
  months6: number;
  months12: number;
}

export interface IPricingConfig extends Document {
  onePlatform: IPricingMatrix;
  twoPlatforms: IPricingMatrix;
  threePlatforms: IPricingMatrix;
  updatedAt: Date;
}

const pricingConfigSchema = new Schema<IPricingConfig>(
  {
    onePlatform: {
      months1: { type: Number, default: 1000 },
      months3: { type: Number, default: 2800 },
      months6: { type: Number, default: 5500 },
      months12: { type: Number, default: 10000 },
    },
    twoPlatforms: {
      months1: { type: Number, default: 1800 },
      months3: { type: Number, default: 5000 },
      months6: { type: Number, default: 9500 },
      months12: { type: Number, default: 18000 },
    },
    threePlatforms: {
      months1: { type: Number, default: 2500 },
      months3: { type: Number, default: 7000 },
      months6: { type: Number, default: 13500 },
      months12: { type: Number, default: 25000 },
    }
  },
  { timestamps: true }
);

export default mongoose.model<IPricingConfig>('PricingConfig', pricingConfigSchema);
