'use strict';

const plugin = require('../');
const EventEmitter = require('events');

const events = {};

describe('hermione-reassert-view', () => {
    const mkHermioneStub = () => {
        const hermione = new EventEmitter();
        hermione.events = events;

        return hermione;
    };

    it('should be enabled by default', () => {
        const hermione = mkHermioneStub();

        plugin(hermione);

        assert(false); // TODO
    });

    it('should do nothing if disabled', () => {
        const hermione = mkHermioneStub();

        plugin(hermione, {enabled: false});

        assert(false); // TODO
    });
});
