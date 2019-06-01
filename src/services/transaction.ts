import * as fs from 'fs';
import * as _ from 'lodash';
import {ICategory, ISubCategory} from '../common';
import logger from '../util/winston';

let transactions;
let topCategories: { [k: string]: ICategory };

fs.readFile('./src/files/transactions.json', (err, data) => {
    if (err) {
        logger.error('Could not read transactions.json. Maybe copy the file over? ', err);
    } else {
        transactions = JSON.parse(data.toString());
    }
});

fs.readFile('./src/files/topcategories.json', (err, data) => {
    if (err) {
        logger.error('Could not read topcategories.json. Maybe copy the file over? ', err);
    } else {
        topCategories = JSON.parse(data.toString());
        fs.readFile('./src/files/categories.json', (err2, data2) => {
            if (err2) {
                logger.error('Could not read categories.json. Maybe copy the file over? ', err2);
            } else {
                _.forIn(JSON.parse(data2.toString()), (subcat: ISubCategory) => {
                    const topCategory = topCategories[subcat.topCategoryId.toString()];

                    if (!topCategory.subcats) {
                        topCategory.subcats = [];
                    }
                    topCategory.subcats.push(subcat);
                });
            }
        });
    }
});

export function sumUpCategories() {
    const categories = Object.assign({}, topCategories);
}

