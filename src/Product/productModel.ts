import mongoose, { Document, Schema, Model } from 'mongoose';

// ממשק עבור מסמך מוצר
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
}//_id

// סכמה עבור מוצר
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);