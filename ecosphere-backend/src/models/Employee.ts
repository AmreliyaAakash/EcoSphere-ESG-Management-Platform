import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEmployee extends Document {
  name: string;
  email: string;
  password?: string;
  role: string;
  departmentId: mongoose.Types.ObjectId;
  xpBalance: number;
  pointsBalance: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
}

const employeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  xpBalance: { type: Number, default: 0 },
  pointsBalance: { type: Number, default: 0 },
  avatarUrl: { type: String }
}, { timestamps: true });

employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password as string, 10);
});

employeeSchema.methods.isPasswordCorrect = async function (password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
