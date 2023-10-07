import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'secretaria' | 'employee';
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'secretaria', 'employee'],
    default: 'user',
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
