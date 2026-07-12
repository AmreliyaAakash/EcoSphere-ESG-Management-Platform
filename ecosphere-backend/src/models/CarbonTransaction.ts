import mongoose, { Document, Schema } from 'mongoose';

export interface ICarbonTransaction extends Document {
  sourceModule: string;
  quantity: number;
  emissionFactorId: mongoose.Types.ObjectId;
  co2eCalculated?: number;
  departmentId: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const carbonTransactionSchema = new Schema<ICarbonTransaction>({
  sourceModule: { type: String, required: true },
  quantity: { type: Number, required: true },
  emissionFactorId: { type: Schema.Types.ObjectId, ref: 'EmissionFactor', required: true, index: true },
  co2eCalculated: { type: Number },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  date: { type: Date, required: true, index: true }
}, { timestamps: true });

export const CarbonTransaction = mongoose.model<ICarbonTransaction>('CarbonTransaction', carbonTransactionSchema);
