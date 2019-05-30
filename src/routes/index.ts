import {NextFunction, Request, Response} from 'express';

export default (() => {
    const express = require('express');
    const router = express.Router();

    /* GET home page. */
    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.render('index', {title: 'Express'});
    });

    return router;
})();
