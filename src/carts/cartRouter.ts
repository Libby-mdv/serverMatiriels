import { Router, Request, Response, RequestHandler } from 'express';
import { cart_service } from './cartService';
import { Types } from 'mongoose'; // נשתמש בזה לבדיקות ID

export const router = Router();

// פונקציית עזר לטיפול בשגיאות (כדי לא לחזור על הקוד)
const handleError = (res: Response, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // טיפול ספציפי בשגיאות 404 שה-Service זורק
    if (errorMessage.includes('not found') || errorMessage.includes('Cart is empty')) {
        return res.status(404).json({ error: errorMessage });
    }
    
    // טיפול בשגיאות ID לא תקין (אם כי עדיף לשים במידלוור)
    if (errorMessage.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ error: 'Invalid ID format.' });
    }

    return res.status(500).json({ error: 'Internal Server Error: ' + errorMessage });
};

router.get('/cartUser/:userId', async (req: Request, res: Response) => {
    try {
        const cart = await cart_service.getCartWithOnlyUserPopulated(req.params.userId);
        
        if (!cart) {
           res.status(404).json({ error: 'Cart not found for this user ID.' });
        }
        
        res.json(cart);
    } catch (error) {
        handleError(res, error);
    }
});

// 1. יצירת סל חדש
router.post('/:userId', async (req: Request, res: Response) => {
    try {
        const cart = await cart_service.createCart(req.params.userId);
        res.status(201).json(cart);
    } catch (error) {
        handleError(res, error);
    }
});

// 2. קבלת סל קיים (מאוכלס ומחושב!)
router.get('/:userId', (async (req: Request, res: Response) => {
    try {
        const cart = await cart_service.getCartByUser(req.params.userId);
        
        if (!cart) {
             // שימו לב: אם ה-Service לא זורק שגיאה, נטפל ב-null כאן
            return res.status(404).send('Cart not found for this user ID.'); 
        }
        
        // ה-cart יכיל כעת את הנתונים המאוכלסים ואת totalPrice הווירטואלי
        res.json(cart);
    } catch (error) {
        handleError(res, error);
    }
})as RequestHandler);


// 3. הוספת מוצר לסל
router.post('/:userId/items', async (req: Request, res: Response) => {
    try {
        // בודקים רק את הנתונים החיוניים
        const { productId, quantity } = req.body; 
        
        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
            res.status(400).json({ error: 'Invalid product details provided.' });
        }
        
        // נניח ש-name ו-price יגיעו בבקשה או יובאו על ידי ה-Service מה-Product
        // לצורך השמירה על הקוד המקורי שלך, נשאר עם המבנה הנוכחי:
        const { name, price } = req.body; 

        const cart = await cart_service.addItemToCart(req.params.userId, {
            productId, name, quantity, price
        });
        res.json(cart);
    } catch (error) {
        handleError(res, error);
    }
});

// 4. עדכון כמות מוצר
router.patch('/:userId/items/:productId', async (req: Request, res: Response) => {
    try {
        const newQuantity = Number(req.body.quantity);
        
        if (isNaN(newQuantity) || newQuantity < 0) {
            res.status(400).json({ error: 'Quantity must be a non-negative number.' });
        }

        const cart = await cart_service.updateItemQuantity(
            req.params.userId,
            req.params.productId,
            newQuantity
        );
        res.json(cart);
    } catch (error) {
        handleError(res, error);
    }
});

// 5. הסרת מוצר מהסל
router.delete('/:userId/items/:productId', async (req: Request, res: Response) => {
    try {
        const cart = await cart_service.removeItemFromCart(
            req.params.userId,
            req.params.productId
        );
        res.json(cart);
    } catch (error) {
        handleError(res, error);
    }
});

// 6. 💰 נקודת קצה חדשה: קבלת הסכום הסופי
router.get('/:userId/total', async (req: Request, res: Response) => {
    try {
        const total = await cart_service.getCartTotal(req.params.userId);
        res.status(200).json({ userId: req.params.userId, totalPrice: total });
    } catch (error) {
        handleError(res, error);
    }
});