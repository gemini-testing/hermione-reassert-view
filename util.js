'use strict';

const compareImages = require('@gemini-testing/resemblejs/compareImages');
const util = require('util');
const debug = require('debug')('hermione-reassert-view');

exports.compareImages = async function({refImagePath, currentImagePath, maxDiffSize}) {
    const [results, resultsWithoutAntialiasing] = await Promise.all([
        compareImages(refImagePath, currentImagePath, {ignore: 'less'}),
        compareImages(refImagePath, currentImagePath, {ignore: 'antialiasing'})
    ]);

    debug(`maxDiffSize: ${util.inspect(maxDiffSize)}`);
    debug(`with Antialiasing: ${util.inspect(results)}`);
    debug(`without Antialiasing: ${util.inspect(resultsWithoutAntialiasing)}`);

    const {diffBounds} = results;

    return resultsWithoutAntialiasing.rawMisMatchPercentage === 0
        && diffBounds.right - diffBounds.left < maxDiffSize.width
        && diffBounds.bottom - diffBounds.top < maxDiffSize.height;
};
