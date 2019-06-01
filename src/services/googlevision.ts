/* tslint:disable:no-console no-var-requires */
// Imports the Google Cloud client library
// tslint:disable-next-line:no-var-requires

import * as fs from 'fs';
import _ from 'lodash';
import {IWordWithConfidence} from '../common';

const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: 'C:\\Users\\fko\\Documents\\SECRETZ\\googlevisionapicreds.json'
});

export function parseImage(img: Buffer): Promise<IWordWithConfidence[]> {

    return new Promise(((resolve) => {
        const json = JSON.parse(fs.readFileSync('output.json').toString());
        resolve(getWordsWithConfidence(json));
    }));

    // return client
    //     .documentTextDetection(img)
    //     .then((results: any) => {
    //         if (results.length > 0) {
    //             getWordsWithConfidence(results);
    //         }
    //     })
    //     .catch((err: any) => {
    //         console.error('ERROR:', err);
    //     });
}

function getWordsWithConfidence(fullTestAnnotation: any): IWordWithConfidence[] {
    // noinspection JSDeprecatedSymbols
    const pages = fullTestAnnotation.pages;

    const words: IWordWithConfidence[] = [];

    for (const page of pages) {
        for (const block of page.blocks) {
            for (const paragraph of block.paragraphs) {
                for (const word of paragraph.words) {
                    words.push({
                        confidence: word.confidence,
                        text: buildTextForWord(word),
                        pos: getPosForWord(word)
                    });
                }
            }
        }
    }

    return _.sortBy(_.filter(words, (word: any) => {
        return word.text.length > 2 && word.confidence > 0.9;
    }), (word: any) => {
        return word.confidence;
    }).reverse();
}

function buildTextForWord(word: any) {
    let s = '';
    for (const char of word.symbols) {
        s += char.text;
    }
    return s;
}

function getPosForWord(word: any): {
    x: number,
    y: number
} {
    const vertices = word.boundingBox.vertices;

    const x = vertices[0].x + (vertices[1].x - vertices[0].x) / 2;
    const y = vertices[0].y + (vertices[3].y - vertices[0].y) / 2;

    return {x, y};
}
