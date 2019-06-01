import {NextFunction, Request, Response} from 'express';

import * as fs from 'fs';
import _ from 'lodash';
import logger from '../util/winston';

const transactions = JSON.parse(fs.readFileSync('../files/transactions.json').toString());

export default (() => {
    const express = require('express');
    const router = express.Router();

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.type('application/json');
        res.json(transactions);
    });

    router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Returning transaction ${id}`);
        res.json(_.filter(transactions, (transaction) => transaction.TransactionId === id));
    });

    router.get('/category/:level', (req: Request, res: Response, next: NextFunction) => {

    });

    router.post('/', (req: Request, res: Response) => {
        const data = req.body;

        const transaction = Object.assign({
            timestamp: Date.now()
        }, data);

    });

});
