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
        total: number;
    };
}

export interface ICategory {
    name: string;
    type: 'expense' | 'income';
    subcats?: ICategory[];
}

export interface ISubCategory extends ICategory {
    topCategoryId: number;
}
