
import { Cart, ICart } from './cartModel';
import {ICartItem} from './cartItemModel'
import mongoose, {Types} from "mongoose"

/**
 * פונקציית עזר פרטית ל-populate מלא של העגלה
 */
const populateCart = (query: mongoose.Query<ICart | null, ICart>) => {
  return query
    // 1. אכלוס המשתמש (userId הוא String/ת.ז.)
    .populate('userId', 'name email')
    // 2. אכלוס המוצרים (productId הוא ObjectId)
    .populate({
      path: 'items.productId',
      select: 'name price stock' 
    });
};


export class CartService {

  async getCartWithOnlyUserPopulated(userId: string): Promise<any | null> {
    const cart = await Cart.findOne({ userId })
      .populate('userId', 'name email') // אכלס את userId, והבא רק את name ו-email
      .select('userId items') // בחר להציג רק את שדה userId ואת items
      .exec();
    return cart;
  }

  // יצירת סל חדש למשתמש
  async createCart(userId: string): Promise<ICart> {
    const cart = await Cart.create({ userId });    
    const populatedCart = await populateCart(Cart.findById(cart._id)).exec();
    if (!populatedCart) throw new Error("Could not populate created cart");
    return populatedCart;
  }

  async getCartByUser(userId: string): Promise<ICart | null> {
    const cartQuery = Cart.findOne({ userId }); 
    const cart = await populateCart(cartQuery).exec();
    
    return cart; 
  }

  // הוספת מוצר לסל
  async addItemToCart(userId: string, item: ICartItem): Promise<ICart> {
    const productIdObj = item.productId as Types.ObjectId; 
    const cart = await Cart.findOne({ userId }); 
    
    if (!cart) {
      const newCart = await Cart.create({ userId, items: [{ ...item, productId: productIdObj }] });
      const populatedCart = await populateCart(Cart.findById(newCart._id)).exec();
      if (!populatedCart) throw new Error("Could not populate created cart");
      return populatedCart;
    }

    const existing = cart.items.find(i => i.productId.equals(productIdObj));
    
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push({ ...item, productId: productIdObj } as any);
    }
    
    await cart.save();
    
    // אחזור העגלה שוב, הפעם עם populate ו-Virtuals
    const updatedCart = await this.getCartByUser(userId); 
    if (!updatedCart) throw new Error("Could not retrieve updated cart");
    return updatedCart;
  }

  // עדכון כמות של מוצר בסל
  async updateItemQuantity(
    userId: string,
    productId: string,
    newQuantity: number
  ): Promise<ICart> {
    const productIdObj = new Types.ObjectId(productId);
    
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');
    
    const item = cart.items.find(i => i.productId.equals(productIdObj));
    if (!item) throw new Error('Item not in cart');
    
    item.quantity = newQuantity;
    await cart.save();
    
    const updatedCart = await this.getCartByUser(userId);
    if (!updatedCart) throw new Error("Could not retrieve updated cart");
    return updatedCart;
  }

  // מחיקת מוצר מהסל
  async removeItemFromCart(
    userId: string,
    productId: string
  ): Promise<ICart> {
    const productIdObj = new Types.ObjectId(productId);

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');
    
    // ✅ תיקון: שימוש ב-!equals() לסינון (השאר את אלה שאינם שווים)
    cart.items = cart.items.filter(i => !i.productId.equals(productIdObj));
    
    await cart.save();
    
    // אחזור עם populate ו-Virtuals
    const updatedCart = await this.getCartByUser(userId);
    if (!updatedCart) throw new Error("Could not retrieve updated cart");
    return updatedCart;
  }

  async getCartTotal(userId: string): Promise<number> {
    
    const cart = await this.getCartByUser(userId); 

    if (!cart) {
      return 0.00; 
    }
    if (!cart.totalPrice) {
        throw new Error("Could not calculate total price. Virtual field is missing.");
    }

    return cart.totalPrice;
  }

}

export const cart_service = new CartService();