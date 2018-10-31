'use strict';

const proxyquire = require('proxyquire');
const _ = require('lodash');

describe('hermione-reassert-view/util', () => {
    let util;
    let compareImages;

    beforeEach(() => {
        compareImages = sinon.stub().named('compareImages').resolves({});
        util = proxyquire('../util', {
            '@gemini-testing/resemblejs/compareImages': compareImages
        });
    });

    describe('compareImages', () => {
        const compareImages_ = (opts = {}) => {
            _.defaults(opts, {
                maxDiffSize: {
                    width: 100500,
                    height: 500100
                }
            });

            return util.compareImages(opts);
        };

        it('should compare images with antialiasing and without antialiasing', async () => {
            await compareImages_({refImagePath: '/ref', currentImagePath: '/curr'});

            assert.calledTwice(compareImages);
            assert.calledWith(compareImages, '/ref', '/curr', {ignore: 'antialiasing'});
            assert.calledWith(compareImages, '/ref', '/curr', {ignore: 'less'});
        });

        it('should return true if diff is antialiasing and diff bounds are less than passed', async () => {
            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'antialiasing'}).resolves({
                rawMisMatchPercentage: 0
            });

            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'less'}).resolves({
                diffBounds: {
                    top: 0, bottom: 9,
                    left: 5, right: 14
                }
            });

            const result = await compareImages_({
                maxDiffSize: {
                    width: 10,
                    height: 10
                }
            });

            assert.isTrue(result);
        });

        it('should return false if there are diffs even without antialiasing', async () => {
            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'antialiasing'}).resolves({
                rawMisMatchPercentage: 5
            });

            const result = await compareImages_();

            assert.isFalse(result);
        });

        it('should return false if there are diff is too big', async () => {
            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'antialiasing'}).resolves({
                rawMisMatchPercentage: 0
            });

            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'less'}).resolves({
                diffBounds: {
                    top: 0, bottom: 11,
                    left: 5, right: 14
                }
            });

            const result = await compareImages_({
                maxDiffSize: {
                    width: 10,
                    height: 10
                }
            });

            assert.isFalse(result);
        });
    });
});
