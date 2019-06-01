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
        scanImageAndMatch(files[0].buffer).then((buf2) => {
            logger.info('Sending response.');
            res.json({
                filename: `${files[0].originalname}-scanned.jpg`,
                data: buf2.toString('base64')
            });
        }).catch((reason) => {
            logger.error('Error while handling image!', reason);
        });

    });

    return router;
})();