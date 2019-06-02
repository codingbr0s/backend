export interface IWordWithConfidence {
    confidence: number;
    text: string;
    pos: { x: number, y: number };
}

export interface IKnownImage {
    fixwords: string[];
    info: {
        desc: string;
        creditor: string;
        iban: string;
        amount: number;
        displayamount?: string;
    };
}

export interface ICategory {
    categoryId: number;
    name: string;
    amount?: number;
    displayamount: string;
    type: 'expense' | 'income';
    subcats?: {[k: string]: ICategory};
}

export interface ISubCategory extends ICategory {
    topCategoryId: number;
}

export interface ITransaction {
    transactid: number;
    bankacctname: string;
    catname: string;
    catid: number;
    topcatid: number;
    debitor: string;
    creditor: string;
    counterparty: string;
    desc: string;
    note: string;
    date: string;
    amount: number;
    assetiban: string;
    assetname: string;
    opposingiban: string;
    opposingname: string;
}
