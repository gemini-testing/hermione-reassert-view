'use strict';

const parseConfig = require('./config');
const util = require('./util');
const debug = require('debug')('hermione-reassert-view');

/**
 * @param {Object} hermione
 * @param {Object} options
 */
module.exports = (hermione, opts) => {
    const config = parseConfig(opts);
    if (!config.enabled) {
        return;
    }

    hermione.on(hermione.events.NEW_BROWSER, (browser, {browserId}) => {
        if (!config.browsers.includes(browserId)) {
            return;
        }

        const baseAssertView = browser.assertView.bind(browser);
        browser.addCommand('assertView', async function(...args) {
            await baseAssertView(...args);

            const assertViewResults = this.executionContext.hermioneCtx.assertViewResults.get();

            await reassertLastResult(assertViewResults, config, this.executionContext.ctx.currentTest);
        }, true);
    });
};

async function reassertLastResult(assertViewResults, {maxDiffSize, dry}, test) {
    const lastResult = assertViewResults[assertViewResults.length - 1] || {};
    if (lastResult.name !== 'ImageDiffError') {
        return;
    }

    if (!util.validateDiffSize(lastResult, maxDiffSize)) {
        return;
    }

    try {
        const {stateName, refImg, currImg} = lastResult;
        const isEqual = await util.compareImages(refImg.path, currImg.path);

        const testTitle = test.fullTitle();
        const browserId = test.browserId;

        if (!isEqual) {
            debug(`'${testTitle} :: ${stateName} :: ${browserId}' images are really different!`);
            return;
        }

        debug(`'${testTitle} :: ${stateName} :: ${browserId}' images are the same!`);

        if (!dry) {
            assertViewResults[assertViewResults.length - 1] = {stateName, refImg};
        }
    } catch (e) {
        debug(e);
    }
}
