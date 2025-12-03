import { Router, Request, Response } from 'express';
import {User} from './userModel'

export const router = Router();

router.get('/test',(req :Request, res :Response) => 
    { 
        res.send(`we here`); 
    }); 

router.post('/', async (req :Request, res :Response) => {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
});

router.get('/', async (req :Request, res :Response) => {
    const users = await User.find();
    res.send(users);
});

router.get('/:name', async (req :Request, res :Response) => {
    const name = req.params.name;              
    const users = await User.findOne({ name });
    res.send(users);
});

router.delete('/:name', async (req :Request, res :Response) => {
    const name = req.params.name;              
    const users = await User.findOneAndDelete({ name });
    res.send(users);
});
router.delete('/:id', async (req :Request, res :Response) => {
    const id = req.params.id;              
    const users = await User.findByIdAndDelete(id);
    res.send(users);
});
