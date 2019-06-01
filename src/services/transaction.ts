import * as fs from 'fs';
import _ from 'lodash';
import {ICategory, ISubCategory} from '../common';
import logger from '../util/winston';

let transactions;
let topCategories: ICategory;

fs.readFile('../files/transactions.json', (err, data) => {
    if (err) {
        logger.error('Could not read transactions.json. Maybe copy the file over?', err);
    } else {
        transactions = JSON.parse(data.toString());
    }
});
fs.readFile('../files/topcategories.json', (err, data) => {
    if (err) {
        logger.error('Could not read topcategories.json. Maybe copy the file over?', err);
    } else {
        topCategories = JSON.parse(data.toString());
        fs.readFile('../files/categories.json', (err2, data2) => {
            if (err2) {
                logger.error('Could not read categories.json. Maybe copy the file over?', err2);
            } else {
               _.forIn(JSON.parse(data2.toString()), (subcat: ISubCategory) => {
                   topCategories[subcat.topCategoryId.toString()] = subcat;
               });
            }
        });
    }
});


export function listTransactionsInCategories() {
    const sorted = Object.assign({}, categories.top);

    _.forIn(categories, (cat) => {

    });
}
