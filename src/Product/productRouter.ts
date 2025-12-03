import express, { Request, Response } from 'express';
import { ProductService } from './productService';

export const productRouter = express.Router();

//  GET /api/products - אחזור כל המוצרים
productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

//  GET /api/products/:id - אחזור מוצר לפי ID
productRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

//  POST /api/products - יצירת מוצר חדש
productRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newProduct = await ProductService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    // טיפול בשגיאת Unique Index (כפילות בשם)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
        res.status(400).json({ error: 'Product name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});