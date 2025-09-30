import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'business' | 'admin';

export interface NotificationSettings {
  emailNewClient: boolean;
  emailNewRequest: boolean;
  emailPayment: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  professionalRole?: string;
  bio?: string;
  address?: string;
  fiscalCode?: string;
  registrationNumber?: string;
  notificationSettings?: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['business', 'admin'],
    default: 'business'
  },
  phone: {
    type: String,
    trim: true
  },
  professionalRole: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  fiscalCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  notificationSettings: {
    type: {
      emailNewClient: { type: Boolean, default: true },
      emailNewRequest: { type: Boolean, default: true },
      emailPayment: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true }
    },
    default: {
      emailNewClient: true,
      emailNewRequest: true,
      emailPayment: false,
      pushNotifications: true,
      weeklyReport: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', UserSchema);