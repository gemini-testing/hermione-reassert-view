'use strict';

const EventEmitter = require('events');
const util = require('../util');
const plugin = require('../');

const events = {
    NEW_BROWSER: 'fooBar'
};

describe('hermione-reassert-view', () => {
    const sandbox = sinon.sandbox.create();

    const stubBrowser_ = ({assertView, assertViewResults} = {}) => {
        const browser = {
            assertView: assertView || sinon.stub(),
            executionContext: {
                ctx: {
                    currentTest: {
                        fullTitle: () => 'foo-bar'
                    }
                },
                hermioneCtx: {
                    assertViewResults: {
                        get: () => assertViewResults || [{}]
                    }
                }
            }
        };

        browser.addCommand = sinon.stub().callsFake((name, fn) => {
            browser[name] = fn.bind(browser);
        });

        return browser;
    };

    beforeEach(() => {
        sandbox.stub(util, 'compareImages').resolves(false);
        sandbox.stub(util, 'validateDiffSize').resolves(true);
    });

    afterEach(() => sandbox.restore());

    const mkHermioneStub = () => {
        const hermione = new EventEmitter();
        hermione.events = events;

        return hermione;
    };

    it('should be enabled by default', () => {
        const hermione = mkHermioneStub();

        plugin(hermione);

        assert.equal(hermione.listenerCount(events.NEW_BROWSER), 1);
    });

    it('should do nothing if disabled', () => {
        const hermione = mkHermioneStub();

        plugin(hermione, {enabled: false});

        assert.equal(hermione.listenerCount(events.NEW_BROWSER), 0);
    });

    it('should wrap assertView command for specified browser', () => {
        const browser = stubBrowser_();

        const hermione = mkHermioneStub();
        plugin(hermione, {browsers: ['bro']});

        hermione.emit(events.NEW_BROWSER, browser, {browserId: 'bro'});

        assert.calledOnceWith(browser.addCommand, 'assertView', sinon.match.func, true);
    });

    it('should not wrap assertView command for other browser', () => {
        const browser = stubBrowser_();

        const hermione = mkHermioneStub();
        plugin(hermione, {browsers: ['otherBro']});

        hermione.emit(events.NEW_BROWSER, browser, {browserId: 'bro'});

        assert.notCalled(browser.addCommand);
    });

    describe('wrapper', () => {
        const init_ = ({assertView, assertViewResults, config = {}}) => {
            const browser = stubBrowser_({assertView, assertViewResults});

            const hermione = mkHermioneStub();
            config.browsers = ['bro'];
            plugin(hermione, config);

            hermione.emit(events.NEW_BROWSER, browser, {browserId: 'bro'});

            return browser;
        };

        it('should call base assertView', async () => {
            const assertView = sinon.stub().named('baseAssertView');
            const browser = init_({assertView});

            await browser.assertView('foo', 'bar');

            assert.calledOn(assertView, browser);
            assert.calledOnceWith(assertView, 'foo', 'bar');
        });

        it('should fail on base assertView fail', async () => {
            const assertView = sinon.stub().named('baseAssertView').rejects(new Error('foo'));
            const browser = init_({assertView});

            try {
                await browser.assertView();
            } catch (e) {
                assert.equal(e.message, 'foo');
                return;
            }

            assert(false, 'Should reject');
        });

        it('should not compare images on success', async () => {
            const assertViewResults = [
                {stateName: 'foo'}
            ];
            const browser = init_({assertViewResults});

            await browser.assertView();

            assert.notCalled(util.compareImages);
        });

        it('should not compare images on no reference', async () => {
            const assertViewResults = [
                {name: 'NoRefImageError'}
            ];
            const browser = init_({assertViewResults});

            await browser.assertView();

            assert.notCalled(util.compareImages);
        });

        it('should not compare images if there are no assertView results', async () => {
            const browser = init_({assertViewResults: []});

            await browser.assertView();

            assert.notCalled(util.compareImages);
        });

        it('should validate diff size', async () => {
            const diffError = {name: 'ImageDiffError'};
            const assertViewResults = [diffError];
            const maxDiffSize = {
                width: 100500, height: 500100
            };
            const browser = init_({assertViewResults, config: {maxDiffSize}});

            await browser.assertView();

            assert.calledOnceWith(util.validateDiffSize, diffError, maxDiffSize);
        });

        it('should not compare images if diffs are too big', async () => {
            const assertViewResults = [
                {name: 'ImageDiffError', refImg: {}, currImg: {}}
            ];
            const browser = init_({assertViewResults});
            util.validateDiffSize.returns(false);

            await browser.assertView();

            assert.notCalled(util.compareImages);
        });

        it('should compare images on diff', async () => {
            const assertViewResults = [
                {name: 'ImageDiffError', refImg: {path: '/ref'}, currImg: {path: '/curr'}}
            ];
            const browser = init_({assertViewResults});

            await browser.assertView();

            assert.calledOnceWith(util.compareImages, '/ref', '/curr');
        });

        it('should not fail on compare fail', async () => {
            const assertViewResults = [
                {name: 'ImageDiffError'}
            ];
            const browser = init_({assertViewResults});
            util.compareImages.rejects(new Error('foo'));

            await browser.assertView();

            assert(true);
        });

        it('should do nothing if images are really different', async () => {
            const assertViewResults = [{name: 'ImageDiffError'}];
            const browser = init_({assertViewResults});
            util.compareImages.resolves(false);

            await browser.assertView();

            assert.deepEqual(
                browser.executionContext.hermioneCtx.assertViewResults.get(),
                [{name: 'ImageDiffError'}]
            );
        });

        it('should replace last diff error with success if images are in fact the same', async () => {
            const assertViewResults = [{
                name: 'ImageDiffError',
                stateName: 'foo',
                refImg: {path: '/bar/baz'},
                currImg: {path: '/qux'}
            }];
            const browser = init_({assertViewResults});
            util.compareImages.resolves(true);

            await browser.assertView();

            assert.deepEqual(
                browser.executionContext.hermioneCtx.assertViewResults.get(),
                [{stateName: 'foo', refImg: {path: '/bar/baz'}}]
            );
        });

        it('should not replace last diff error with success in dry mode', async () => {
            const assertViewResults = [{
                name: 'ImageDiffError'
            }];
            const browser = init_({assertViewResults, config: {dry: true}});
            util.compareImages.resolves(true);

            await browser.assertView();

            assert.deepEqual(
                browser.executionContext.hermioneCtx.assertViewResults.get(),
                [{name: 'ImageDiffError'}]
            );
        });
    });
});
