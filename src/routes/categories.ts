import {NextFunction, Request, Response} from 'express';
import {
    getSubcategoriesForCategory, getTopPartnersForCategory, getTopPartnersForSubCategory,
    getTransactionsForSubCategory,
    sumUpCategories,
    sumUpExpenseCategories,
    sumUpIncomeCategories
} from '../services/transaction';
import logger from '../util/winston';

export default (() => {
    const express = require('express');
    const router = express.Router();

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.type('application/json');
        res.json(sumUpCategories());
    });

    router.get('/expenses/', (req: Request, res: Response, next: NextFunction) => {
        res.type('application/json');
        res.json(sumUpExpenseCategories());
    });

    router.get('/income/', (req: Request, res: Response, next: NextFunction) => {
        res.type('application/json');
        res.json(sumUpIncomeCategories());
    });

    router.get('/:id(\\d+)', (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Getting subcategories for id ${id}`);
        res.type('application/json');
        res.json(getSubcategoriesForCategory(id));
    });

    router.get('/sub/:id(\\d+)', (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Getting transactions for subcategory id ${id}`);
        res.type('application/json');
        res.json(getTransactionsForSubCategory(id));
    });

    router.get('/:id(\\d+)/partners', (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Getting top partners for category id ${id}`);
        res.type('application/json');
        res.json(getTopPartnersForCategory(id));
    });

    router.get('/sub/:id(\\d+)/partners', (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Getting top partners for subcategory id ${id}`);
        res.type('application/json');
        res.json(getTopPartnersForSubCategory(id));
    });

    return router;

})();
