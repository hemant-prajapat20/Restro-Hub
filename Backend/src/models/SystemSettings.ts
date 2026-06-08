import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  platformName: string;
  maintenanceMode: boolean;
  jwtExpirationTime: string;
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    platformName: { type: String, default: 'IndiServe Pro', required: true },
    maintenanceMode: { type: Boolean, default: false, required: true },
    jwtExpirationTime: { type: String, default: '30 Days', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
