import * as fs from 'fs';
import _ from 'lodash';
import {IKnownImage, IWordWithConfidence} from '../common';
import {parseImage} from './googlevision';

const knownImages = JSON.parse(fs.readFileSync('../files/knownimages.json').toString());

export function scanImageAndMatch(img: Buffer): Promise<Buffer> {
    return parseImage(img).then((words) => {
        return matchToKnown(words);
    });
}

function matchToKnown(words: IWordWithConfidence[]): Buffer {
    const filtered = _.filter(words, (word: IWordWithConfidence) => {
        return _.some(knownImages, (known: IKnownImage) => {
            return _.some(known.fixwords, (fixword: string) => {
                return fixword === word.text;
            });
        });
    });

    const maxConf = _.maxBy(filtered, (val) => val.confidence);

    const matches: IKnownImage = _.filter(knownImages, (known: IKnownImage) => {
        return _.some(known.fixwords, (fixword: string) => {
            return fixword === maxConf.text;
        });
    })[0];

    return new Buffer(matches.base64, 'base64');
}
