import mongoose, { Document, Schema, Types } from 'mongoose';
export interface ICartItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: 'Product' // הוספת הקישור למודל Product
    },
    name:      { type: String, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true, min: 0 },
  },
  { _id: false } // לא ליצור _id נפרד לכל פריט
);