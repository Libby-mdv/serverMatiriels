import express, { Request, Response }  from 'express';
import {router as usersRouter} from './users/userRouter';
import {router as cartsRouter} from './carts/cartRouter';
import {productRouter} from './Product/productRouter'
import {myDB} from './db';
const app = express();

app.use(express.json());
myDB.getDB();

app.use('/users', usersRouter);
app.use('/carts', cartsRouter);
app.use('/products', productRouter);

app.use((err: Error, req: Request , res: Response, next: any) => {
    res.status(500).send(err);
});

export default app;