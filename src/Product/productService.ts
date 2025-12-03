import { Product, IProduct } from './productModel';

/**
 * 🛠️ שירות מוצרים (Product Service)
 */
export const ProductService = {
  
  /**
   * אחזור כל המוצרים
   */
  async getAllProducts(): Promise<IProduct[]> {
    return await Product.find().exec();
  },

  /**
   * אחזור מוצר לפי ID
   */
  async getProductById(productId: string): Promise<IProduct | null> {
    return await Product.findById(productId).exec();
  },

  /**
   * יצירת מוצר חדש
   */
  async createProduct(productData: { name: string, description: string, price: number, stock: number }): Promise<IProduct> {
    const newProduct = new Product(productData);
    return await newProduct.save();
  },

  /**
   * עדכון מוצר קיים
   */
  async updateProduct(productId: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true }).exec();
  },

  /**
   * מחיקת מוצר
   */
  async deleteProduct(productId: string): Promise<IProduct | null> {
    return await Product.findByIdAndDelete(productId).exec();
  }
};