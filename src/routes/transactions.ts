import {NextFunction, Request, Response} from 'express';
import {addTransaction, getNewTransactions, getTopBusinessPartners, getTransactionForID} from '../services/transaction';
import logger from '../util/winston';

export default (() => {
    const express = require('express');
    const router = express.Router();

    router.get('/:id(\\d+)', (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Returning transaction ${id}`);
        res.json(getTransactionForID(id));
    });

    router.get('/toppartners', (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('Getting top partners.');
            const partners = getTopBusinessPartners();
            res.json(partners);
        } catch (e) {
            logger.error(e);
        }
    });

    router.get('/new', (req: Request, res: Response) => {
        logger.info('Returning new transactions');
        res.json(getNewTransactions());
    });

    router.post('/', (req: Request, res: Response) => {
        const data = req.body;
        addTransaction(data);
        res.json(data);
    });

    return router;

})();
