import {NextFunction, Request, Response} from 'express';
import {getBusinessPartner, getTopBusinessPartners} from '../services/transaction';
import logger from '../util/winston';

export default (() => {
    const express = require('express');
    const router = express.Router();

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        logger.info('Returning top partners!');
        res.json(getTopBusinessPartners());
    });

    router.get('/:name', (req: Request, res: Response, next: NextFunction) => {
        const partner = req.params.name;
        logger.info(`Returning info for partner ${partner}`);
        res.json(getBusinessPartner(partner));
    });

    return router;
})();
