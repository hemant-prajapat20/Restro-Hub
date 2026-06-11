import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  platformName: string;
  maintenanceMode: boolean;
  jwtExpirationTime: string;
  masterSecretKey: string;
  smartMapping: boolean;
  kdsWebhook: boolean;
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    platformName: { type: String, default: 'IndiServe Pro', required: true },
    maintenanceMode: { type: Boolean, default: false, required: true },
    jwtExpirationTime: { type: String, default: '30 Days', required: true },
    masterSecretKey: { type: String, default: 'restrohub_owner_777', required: true },
    smartMapping: { type: Boolean, default: false },
    kdsWebhook: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
