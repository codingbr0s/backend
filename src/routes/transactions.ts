import {NextFunction, Request, Response} from 'express';

import * as fs from 'fs';
import _ from 'lodash';
import {sumUpCategories} from '../services/transaction';
import logger from '../util/winston';

export default (() => {
    const express = require('express');
    const router = express.Router();

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.type('application/json');
        res.json(sumUpCategories());
    });

    // router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    //     const id = req.params.id;
    //     logger.info(`Returning transaction ${id}`);
    //     res.json();
    // });

    // router.get('/category/:level', (req: Request, res: Response, next: NextFunction) => {
    // });

    // router.post('/', (req: Request, res: Response) => {
    //     const data = req.body;
    //
    //     const timestamp = new Date().toISOString();
    //
    //     const transaction = Object.assign({
    //         timestamp: timestamp.substr(timestamp.indexOf('T'))
    //     }, data);
    //
    //     res.json(transaction);
    // });

    return router;

})();
