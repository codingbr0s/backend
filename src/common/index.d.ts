export interface IWordWithConfidence {
    confidence: number;
    text: string;
    pos: { x: number, y: number };
}

export interface IKnownImage {
    fixwords: string[];
    base64: string;
}
