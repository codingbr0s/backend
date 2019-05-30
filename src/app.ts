import compression from 'compression';
import errorhandler from 'errorhandler';
import express from 'express';
import {NextFunction, Request, Response} from 'express-serve-static-core';
import session from 'express-session';
import expressValidator from 'express-validator';

import createError from 'http-errors';
import sassMiddleware from 'node-sass-middleware';
import path from 'path';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import {SESSION_SECRET} from './util/secrets';
import logger from './util/winston';

const MemoryStore = (require('memorystore'))(session);

const app = express();

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(express.json());
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
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));

app.use(
    express.static(path.join(__dirname, 'public'), {maxAge: 31557600000})
);

if (app.get('env') === 'development') {
    app.use(errorhandler({log: logger.error}));
}

// App globals

// Init services

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

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
    res.render('error');
});

logger.log('info', 'Started app.');

export default app;
