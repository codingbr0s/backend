import {NextFunction, Request, Response} from 'express';
import {checkSchema, validationResult, ValidationSchema} from 'express-validator/check';

export default (() => {
    const express = require('express');
    const router = express.Router();

    /* GET users listing. */
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.send('respond with a resource');
    });

    const schema: ValidationSchema = {
        username: {
            in: 'body',
            isEmail: {
                errorMessage: 'Username has to be a valid email.'
            }
        }, password: {
            in: 'body',
            isLength: {
                errorMessage: 'Password has to be at least 5 characters long',
                options: {
                    min: 5
                }
            }
        }
    };

    router.post('/login', [
        checkSchema(schema)
    ], (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).send('Unauthorized!');
        }
        const username = req.body.username;
        res.json({id: 1234, username});
    });

    return router;
})();
