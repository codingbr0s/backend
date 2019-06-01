import bodyparser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import errorhandler from 'errorhandler';
import express from 'express';
import {NextFunction, Request, Response} from 'express-serve-static-core';
import session from 'express-session';
import expressValidator from 'express-validator';
import createError from 'http-errors';
import multer from 'multer';

import uploadRouter from './routes/upload';

import {SESSION_SECRET} from './util/secrets';
import logger from './util/winston';

const MemoryStore = (require('memorystore'))(session);

const app = express();

const base = '/api';

const upload = multer();

app.set('port', process.env.PORT || 3000);

app.use(express.urlencoded({extended: true}));
app.use(compression());
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MemoryStore({
        checkPeriod: 3600000 // prune expired entries every hour
    })
}));
app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

if (app.get('env') === 'development') {
    app.use(errorhandler({log: logger.error}));
}

// Init services

// Routes
app.use(base + '/upload', upload.any(), uploadRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(`{
    "error": ${err},
    "msg": ${err.message}
    }`);
});

logger.log('info', 'Started backend.');

export default app;
