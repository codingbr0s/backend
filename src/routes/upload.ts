import {NextFunction, Request, Response} from 'express';
import {checkSchema, ValidationSchema} from 'express-validator/check';

import {parseImage} from '../services/googlevision';

export default (() => {
    const express = require('express');
    const router = express.Router();

    const schema: ValidationSchema = {
        userid: {
            in: 'body'
        }, image: {
            in: 'body',
            isBase64: true
        }
    };

    router.post('/', [
        checkSchema(schema)
    ], (req: Request, res: Response, next: NextFunction) => {
        const buf = new Buffer(req.body.image, 'base64');

        const words = parseImage(buf);



        res.type('json');
        res.json();
    });
})();
