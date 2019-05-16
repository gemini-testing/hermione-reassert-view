'use strict';

const compareImages = require('@gemini-testing/resemblejs/compareImages');
const util = require('util');
const debug = require('debug')('hermione-reassert-view');

exports.validateDiffSize = function({diffClusters}, maxDiffSize) {
    debug(`diffClusters: ${util.inspect(diffClusters)}`);
    debug(`maxDiffSize: ${util.inspect(maxDiffSize)}`);

    return diffClusters.every(({left, right, top, bottom}) => {
        return right - left <= maxDiffSize.width
            && bottom - top <= maxDiffSize.height;
    });
};

exports.compareImages = async function(refPath, currPath) {
    const res = await compareImages(refPath, currPath, {ignore: 'antialiasing'});

    debug(`compare results ignoring Antialiasing: ${util.inspect(res)}`);

    return res.rawMisMatchPercentage === 0;
};
