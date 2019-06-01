import {NextFunction, Request, Response} from 'express';

import {scanImageAndMatch} from '../services/scanning';
import logger from '../util/winston';

export default (() => {
    const express = require('express');
    const router = express.Router();

    router.post('/', (req: Request, res: Response, next: NextFunction) => {
        logger.info('Handling upload!');
        const body = req.body;

        if (!req.files || req.files.length < 1) {
            const errmsg = 'Request has to be form encoded and contain a single file!';
            logger.error(errmsg);
            throw new Error(errmsg);
        }

        const files: any = req.files;

        res.type('application/json');
        scanImageAndMatch(files[0].buffer).then((obj) => {
            logger.info('Sending response.');
            res.json({
                filename: `${files[0].originalname}-scanned.jpg`,
                data: obj.matched ? obj.matched.toString('base64') : files[0].buffer,
                iban: obj.iban
            });
        }).catch((reason) => {
            logger.error('Error while handling image!', reason);
        });

    });

    return router;
})();
