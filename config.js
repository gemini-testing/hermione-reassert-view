'use strict';

const {root, section, option} = require('gemini-configparser');

const ENV_PREFIX = 'hermione_reassert_view_';
const CLI_PREFIX = '--hermione-reassert-view-';

const assertBool = (value, name) => {
    if (typeof value !== 'boolean') {
        throw new Error(`'${name}' must be boolean, but got '${value}'`);
    }
};

const assertPositiveInteger = (value, name) => {
    if (typeof value !== 'number' || value <= 0) {
        throw new Error(`'${name}' must be positive integer, but got '${value}'`);
    }
};

const getParser = () => {
    return root(section({
        enabled: option({
            defaultValue: true,
            parseEnv: JSON.parse,
            parseCli: JSON.parse,
            validate: (value) => assertBool(value, 'enabled')
        }),
        dry: option({
            defaultValue: false,
            parseEnv: JSON.parse,
            parseCli: JSON.parse,
            validate: (value) => assertBool(value, 'dry')
        }),
        browsers: option({
            defaultValue: [],
            validate: (value) => {
                if (!(value instanceof Array) || value.some((v) => typeof v !== 'string')) {
                    throw new Error(`"browsers" must be an array of strings`);
                }
            }
        }),
        maxDiffSize: section({
            width: option({
                defaultValue: 15,
                parseEnv: JSON.parse,
                parseCli: JSON.parse,
                validate: (value) => assertPositiveInteger(value, 'maxDiffSize.width')
            }),
            height: option({
                defaultValue: 15,
                parseEnv: JSON.parse,
                parseCli: JSON.parse,
                validate: (value) => assertPositiveInteger(value, 'maxDiffSize.height')
            })
        })
    }), {envPrefix: ENV_PREFIX, cliPrefix: CLI_PREFIX});
};

module.exports = (options) => {
    const {env, argv} = process;

    return getParser()({options, env, argv});
};
