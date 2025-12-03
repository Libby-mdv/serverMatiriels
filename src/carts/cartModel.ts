import mongoose, { Document, Schema } from 'mongoose';
import {ICartItem, cartItemSchema} from "./cartItemModel"

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  totalPrice?: number; // שדה וירטואלי יתווסף כאן בזמן ריצה
}

const cartSchema = new Schema<ICart>(
  {//_id
    //12345678
    userId: { type: String, required: true, ref: 'User' }, // הקישור למודל User
    items:  { type: [cartItemSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {virtuals: true,},
    toObject: { virtuals: true }
  }
);

// הוספת שדה וירטואלי לחישוב סכום העגלה
cartSchema.virtual('totalPrice').get(function() {
  // 'this' מתייחס למסמך Cart הנוכחי
  const total: number = this.items.reduce((sum, item) => {
    // נשתמש ב-price שב-Snapshot, או שיהיה צורך ב-populate כדי להביא מחיר מעודכן מה-Product
    return sum + (item.quantity * item.price);
  }, 0);
  return total.toFixed(2); // נחזיר מחרוזת עם שני מקומות אחרי הנקודה
});


export const Cart = mongoose.model<ICart>('Cart', cartSchema);