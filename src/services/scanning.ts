import * as fs from 'fs';
import _ from 'lodash';
import {IKnownImage, IWordWithConfidence} from '../common';
import {parseImage} from './googlevision';

const knownImages = JSON.parse(fs.readFileSync(__dirname + '\\..\\files\\knownimages.json').toString());

export function scanImageAndMatch(img: Buffer): Promise<any> {
    return parseImage(img).then((words) => {
        return matchToKnown(words);
    });
}

function matchToKnown(words: IWordWithConfidence[]): any {
    const filtered = _.filter(words, (word: IWordWithConfidence) => {
        return _.some(knownImages, (known: IKnownImage) => {
            return _.some(known.fixwords, (fixword: string) => {
                return fixword.toLowerCase() === word.text.toLowerCase();
            });
        });
    });

    const maxConf = _.maxBy(filtered, (val) => val.confidence);

    return _.filter(knownImages, (known: IKnownImage) => {
        return _.some(known.fixwords, (fixword: string) => {
            return fixword.toLowerCase() === maxConf.text.toLowerCase();
        });
    })[0];
}
