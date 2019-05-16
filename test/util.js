'use strict';

const proxyquire = require('proxyquire');

describe('hermione-reassert-view/util', () => {
    let util;
    let compareImages;

    beforeEach(() => {
        compareImages = sinon.stub().named('compareImages').resolves({});
        util = proxyquire('../util', {
            'resemblejs/compareImages': compareImages
        });
    });

    describe('validateDiffSize', () => {
        it('should return true if all diff clusters are less than max diff size', () => {
            const diffClusters = [
                {left: 10, right: 15, top: 10, bottom: 15},
                {left: 10, right: 20, top: 10, bottom: 20}
            ];
            const maxDiffSize = {width: 15, height: 15};

            const result = util.validateDiffSize({diffClusters}, maxDiffSize);

            assert.isTrue(result);
        });

        it('should return true if diff clusters are the same as max diff size', () => {
            const diffClusters = [
                {left: 10, right: 25, top: 10, bottom: 25}
            ];
            const maxDiffSize = {width: 15, height: 15};

            const result = util.validateDiffSize({diffClusters}, maxDiffSize);

            assert.isTrue(result);
        });

        it('should return false if there are diff clusters bigger than max diff size', () => {
            const diffClusters = [
                {left: 10, right: 15, top: 10, bottom: 15},
                {left: 10, right: 30, top: 10, bottom: 30}
            ];
            const maxDiffSize = {width: 15, height: 15};

            const result = util.validateDiffSize({diffClusters}, maxDiffSize);

            assert.isFalse(result);
        });

        it('should return true if no diff clusters', () => {
            const maxDiffSize = {width: 15, height: 15};

            const result = util.validateDiffSize({diffClusters: []}, maxDiffSize);

            assert.isTrue(result);
        });
    });

    describe('compareImages', () => {
        const compareImages_ = (opts = {}) => {
            return util.compareImages(opts.refImgPath, opts.currImgPath);
        };

        it('should compare images with antialiasing', async () => {
            await compareImages_({refImgPath: '/ref', currImgPath: '/curr'});

            assert.calledOnceWith(compareImages, '/ref', '/curr', {ignore: 'antialiasing'});
        });

        it('should return true if diff is antialiasing', async () => {
            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'antialiasing'}).resolves({
                rawMisMatchPercentage: 0
            });

            const result = await compareImages_();

            assert.isTrue(result);
        });

        it('should return false if diffs is not antialiasing', async () => {
            compareImages.withArgs(sinon.match.any, sinon.match.any, {ignore: 'antialiasing'}).resolves({
                rawMisMatchPercentage: 5
            });

            const result = await compareImages_();

            assert.isFalse(result);
        });
    });
});
