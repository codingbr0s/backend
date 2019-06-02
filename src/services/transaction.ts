import * as fs from 'fs';
import * as _ from 'lodash';
import numeral from 'numeral';
import {ICategory, ISubCategory, ITransaction} from '../common';
import logger from '../util/winston';

let transactions: ITransaction[];
let topCategories: { [k: string]: ICategory };

const expenseCategoryIDs: string[] = [];
const incomeCategoryIDs: string[] = [];

const newTransactions: ITransaction[] = [];

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

        for (const key in topCategories) {
            if (key in topCategories) {
                topCategories[key].categoryId = Number(key);
            }
        }

        fs.readFile('./src/files/categories.json', (err2, data2) => {
            if (err2) {
                logger.error('Could not read categories.json. Maybe copy the file over? ', err2);
            } else {
                _.forIn(JSON.parse(data2.toString()), (subcat: ISubCategory) => {
                    const topCategory = topCategories[subcat.topCategoryId.toString()];

                    if (!topCategory.subcats) {
                        topCategory.subcats = {};
                    }
                    topCategory.subcats[subcat.categoryId] = subcat;
                });
            }
        });

        for (const cat in topCategories) {
            if (cat in topCategories) {
                if (topCategories[cat].type === 'expense') {
                    expenseCategoryIDs.push(cat);
                } else {
                    incomeCategoryIDs.push(cat);
                }
            }
        }
    }
});

export function sumUpExpenseCategories() {
    const categories = JSON.parse(JSON.stringify(topCategories));

    for (const catId of incomeCategoryIDs) {
        delete categories[catId];
    }

    _.forEach(transactions, (txn) => {
        if (!expenseCategoryIDs.includes(txn.topcatid.toString())) {
            return;
        }

        if (categories[txn.topcatid].subcats[txn.catid].amount) {
            categories[txn.topcatid].subcats[txn.catid].amount += txn.amount;
        } else {
            categories[txn.topcatid].subcats[txn.catid].amount = txn.amount;
        }

        if (categories[txn.topcatid].amount) {
            categories[txn.topcatid].amount += txn.amount;
        } else {
            categories[txn.topcatid].amount = txn.amount;
        }
    });
    const ret: ICategory[] = _.map(Object.keys(categories), (key) => Object.assign({}, categories[key]));

    return filterAndGenerateDisplayAmount(ret);
}

export function sumUpIncomeCategories() {
    const categories = JSON.parse(JSON.stringify(topCategories));

    for (const catId of expenseCategoryIDs) {
        delete categories[catId];
    }

    _.forEach(transactions, (txn) => {
        if (!incomeCategoryIDs.includes(txn.topcatid.toString())) {
            return;
        }

        if (categories[txn.topcatid].subcats[txn.catid].amount) {
            categories[txn.topcatid].subcats[txn.catid].amount += txn.amount;
        } else {
            categories[txn.topcatid].subcats[txn.catid].amount = txn.amount;
        }

        if (categories[txn.topcatid].amount) {
            categories[txn.topcatid].amount += txn.amount;
        } else {
            categories[txn.topcatid].amount = txn.amount;
        }
    });

    const ret: ICategory[] = _.map(Object.keys(categories), (key) => Object.assign({}, categories[key]));

    return filterAndGenerateDisplayAmount(ret, true);
}

export function sumUpCategories() {
    const categories = JSON.parse(JSON.stringify(topCategories));
    _.forEach(transactions, (txn) => {
        if (!categories[txn.topcatid]) {
            logger.error(`${txn.topcatid} not in categories! Skipping!`);
            return;
        } else if (!categories[txn.topcatid].subcats[txn.catid]) {
            logger.error(`${txn.catid} not in subcategories of ${txn.topcatid}! Skipping!`);
            return;
        }

        if (categories[txn.topcatid].subcats[txn.catid].amount) {
            categories[txn.topcatid].subcats[txn.catid].amount += txn.amount;
        } else {
            categories[txn.topcatid].subcats[txn.catid].amount = txn.amount;
        }

        if (categories[txn.topcatid].amount) {
            categories[txn.topcatid].amount += txn.amount;
        } else {
            categories[txn.topcatid].amount = txn.amount;
        }
    });

    const ret: ICategory[] = _.map(Object.keys(categories), (key) => Object.assign({}, categories[key]));

    return filterAndGenerateDisplayAmount(ret);
}

export function getSubcategoriesForCategory(categoryId: number) {
    if (!topCategories[categoryId]) {
        logger.error(`No top category with id ${categoryId}!`);
        return {type: 'none'};
    }

    return Object.assign({}, topCategories[categoryId]);
}

export function getTransactionsForSubCategory(categoryId: number) {
    // tslint:disable-next-line:triple-equals
    return _.filter(transactions, (transaction) => transaction.catid == categoryId);
}

export function getTransactionForID(id: number) {
    // tslint:disable-next-line:triple-equals
    const ret = _.filter(transactions, (transaction) => transaction.transactid == id);
    if (ret) {
        return ret[0];
    }
    return {};
}

export function getTopBusinessPartners():
    Array<{ name: string, amount: number, displayamount: string, transactions: ITransaction[] }> {
    const partners: {
        [k: string]: {
            amount: number,
            transactions: ITransaction[]
        }
    } = {};

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < transactions.length; i++) {
        const transaction = Object.assign({}, transactions[i]);
        const expense = getSubcategoriesForCategory(transaction.topcatid).type === 'expense';
        transaction.displayamount = numeral(Math.abs(transaction.amount)).format('0.00[,]00$');
        const name = expense ? transaction.creditor : transaction.debitor;
        if (!partners[name]) {
            partners[name] = {
                amount: transaction.amount,
                transactions: [transaction]
            };
        } else {
            partners[name].amount += transaction.amount;
            partners[name].transactions.push(transaction);
        }
    }

    const sortedKeys = _.sortBy(Object.keys(partners), (key) => partners[key].amount);
    const ret = [];

    for (let i = 0; i < sortedKeys.length && i < 10; i++) {
        ret.push({
            name: sortedKeys[i],
            amount: partners[sortedKeys[i]].amount,
            displayamount: numeral(partners[sortedKeys[i]].amount).format('0.00[,]00$'),
            transactions: _.sortBy(partners[sortedKeys[i]].transactions, (transaction) => transaction.amount)
        });
    }

    return _.reverse(ret);
}

export function sumUpExpenses() {
    const cats = sumUpExpenseCategories();

    const amount = _.sumBy(cats, (cat) => cat.amount);
    return {
        amount,
        displayamount: numeral(Math.abs(amount)).format('0.00[,]00$')
    };
}

export function sumUpIncome() {
    const cats = sumUpIncomeCategories();

    const amount = _.sumBy(cats, (cat) => cat.amount);
    return {
        amount,
        displayamount: numeral(Math.abs(amount)).format('0.00[,]00$')
    };
}

export function getBusinessPartner(name: string) {
    let found = false;

    let amount = 0;
    const filteredTransactions: ITransaction[] = [];
    _.forEach(transactions, (transaction) => {
        const expense = getSubcategoriesForCategory(transaction.topcatid).type === 'expense';
        if (expense && transaction.creditor.toLowerCase() === name.toLowerCase() ||
            !expense && transaction.debitor.toLowerCase() === name.toLowerCase()) {
            found = true;
            amount += transaction.amount;
            filteredTransactions.push(transaction);
        }
    });
    const displayamount = numeral(amount).format('0.00[,]00$');

    if (found) {
        return {
            amount,
            displayamount,
            transactions: _.sortBy(filteredTransactions, (transaction) => transaction.amount)
        };
    } else {
        return {};
    }
}

export function getTopPartnersForSubCategory(id: number) {
    let found = false;

    const partners: {
        [k: string]: {
            name: string;
            transactions: ITransaction[];
            amount: number;
            displayamount?: string;
        }
    } = {};
    _.forEach(transactions, (transaction) => {
        if (transaction.catid === Number(id)) {

            found = true;
            const expense = getSubcategoriesForCategory(transaction.topcatid).type === 'expense';
            const name = expense ? transaction.creditor : transaction.debitor;
            if (!partners[name]) {
                partners[name] = {
                    name,
                    transactions: [Object.assign({
                        displayamount: numeral(Math.abs(transaction.amount)).format('0.00[,]00$')
                    }, transaction)],
                    amount: transaction.amount
                };
                found = true;
            } else {
                partners[name].transactions.push(Object.assign({
                    displayamount: numeral(Math.abs(transaction.amount)).format('0.00[,]00$')
                }, transaction));
                partners[name].amount += transaction.amount;
            }
        }
    });

    const sortedKeys = _.sortBy(Object.keys(partners), (key) => partners[key].amount);
    const ret = [];

    for (let i = 0; i < sortedKeys.length && i < 10; i++) {
        ret.push({
            name: sortedKeys[i],
            amount: partners[sortedKeys[i]].amount,
            displayamount: numeral(partners[sortedKeys[i]].amount).format('0.00[,]00$'),
            transactions: _.sortBy(partners[sortedKeys[i]].transactions, (transaction) => transaction.amount)
        });
    }

    if (found) {
        return ret;
    } else {
        return [];
    }
}

export function getTopPartnersForCategory(id: number) {
    let found = false;

    const partners: {
        [k: string]: {
            name: string;
            transactions: ITransaction[];
            amount: number;
            displayamount?: string;
        }
    } = {};
    _.forEach(transactions, (transaction) => {
        if (transaction.topcatid === Number(id)) {
            found = true;

            const expense = getSubcategoriesForCategory(transaction.topcatid).type === 'expense';
            const name = expense ? transaction.creditor : transaction.debitor;
            if (!partners[name]) {
                partners[name] = {
                    name,
                    transactions: [Object.assign({
                        displayamount: numeral(Math.abs(transaction.amount)).format('0.00[,]00$')
                    }, transaction)],
                    amount: transaction.amount
                };
                found = true;
            } else {
                partners[name].transactions.push(Object.assign({
                    displayamount: numeral(Math.abs(transaction.amount)).format('0.00[,]00$')
                }, transaction));
                partners[name].amount += transaction.amount;
            }
        }
    });

    const sortedKeys = _.sortBy(Object.keys(partners), (key) => partners[key].amount);
    const ret = [];

    for (let i = 0; i < sortedKeys.length && i < 10; i++) {
        ret.push({
            name: sortedKeys[i],
            amount: partners[sortedKeys[i]].amount,
            displayamount: numeral(partners[sortedKeys[i]].amount).format('0.00[,]00$'),
            transactions: _.sortBy(partners[sortedKeys[i]].transactions, (transaction) => transaction.amount)
        });
    }

    if (found) {
        return ret;
    } else {
        return [];
    }
}

export function addTransaction(transaction: ITransaction) {
    const transactid = getMaxTransactionID() + 1;
    const date = new Date().toISOString();

    transaction = Object.assign(transaction, {
        bankacctname: 'Girokonto',
        debitor: 'Schmidt',
        counterparty: transaction.debitor,
        date: date.substr(0, date.indexOf('T')).replace(/-/gm, ''),
        assetiban: 'DE51300606011111111100',
        assetname: 'Girokonto',
        // @ts-ignore
        opposingiban: transaction.iban,
        opposingname: transaction.debitor
    });

    transaction.amount = -transaction.amount;
    transaction.transactid = transactid;

    transactions.push(transaction);
    newTransactions.push(transaction);

    return transaction;
}

export function getNewTransactions(): {
    amount: number,
    displayamount: string,
    transactions: ITransaction[]
} {
    let amount = 0;

    for (const newTransaction of newTransactions) {
        amount += newTransaction.amount;
    }

    const displayamount = numeral(Math.abs(amount)).format('0.00[,]00$');

    return {
        amount,
        displayamount,
        transactions: _.reverse(newTransactions)
    };
}

function getMaxTransactionID() {
    return _.maxBy(transactions, (transaction) => transaction.transactid).transactid;
}

function filterAndGenerateDisplayAmount(cats: ICategory[], reverse = false): ICategory[] {
    try {
        const ret = _.sortBy(Object.assign({}, cats), (cat) => cat.amount ? cat.amount : 0).map((cat) => {
            cat.displayamount = numeral(Math.abs(cat.amount ? cat.amount : 0)).format('0.00[,]00$');
            // @ts-ignore
            cat.subcats = _.sortBy(_.map(cat.subcats, (subcat) => {
                subcat.displayamount = numeral(Math.abs(subcat.amount ? subcat.amount : 0)).format('0.00[,]00$');
                return subcat;
            }), (subcat) => subcat.amount);

            if (reverse) {
                // @ts-ignore
                cat.subcats = _.reverse(cat.subcats);
            }

            return cat;
        });
        return reverse ? _.reverse(ret) : ret;
    } catch (e) {
        logger.error(e);
        return [];
    }
}
