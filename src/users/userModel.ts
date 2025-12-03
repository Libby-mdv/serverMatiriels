import mongoose, {Schema} from 'mongoose';

const UserSchema = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
    alias: 'userId' // הוספת alias לנוחות הקריאה בקוד
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: {type: Number},
  createdAt: {
        type: Date,
        default: Date.now,}
    },
 { 
    _id: false, // **חשוב:** כיבוי יצירת _id אוטומטי ע"י Mongoose
    toJSON: { 
      virtuals: true,
      }
});

export const User = mongoose.model('User', UserSchema);
