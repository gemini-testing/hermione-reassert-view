'use strict';

const parseConfig = require('./config');

/**
 * @param {Object} hermione
 * @param {Object} options
 */
module.exports = (hermione, opts) => {
    const config = parseConfig(opts);
    if (!config.enabled) {
        return;
    }
};
