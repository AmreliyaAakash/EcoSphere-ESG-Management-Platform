import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  headEmployeeId?: mongoose.Types.ObjectId;
  parentDepartmentId?: mongoose.Types.ObjectId;
  employeeCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  headEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
  parentDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  employeeCount: { type: Number, default: 0 },
  status: { type: String, default: 'ACTIVE', index: true }
}, { timestamps: true });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
