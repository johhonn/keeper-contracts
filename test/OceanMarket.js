const assert = require('assert');

const OceanMarket = artifacts.require('OceanMarket.sol');
const OceanToken = artifacts.require('OceanToken.sol');
const utils = require('./utils.js');

contract('OceanMarket constructor', (accounts) => {
    it('Shouldn\'t deploy if token is empty', async () => {
        // act-assert
        try {
            await OceanMarket.new(0x0, { from: accounts[0] });
        } catch (e) {
            assert.equal(e.reason, 'Token address is 0x0.');
            return;
        }
        assert.fail('Expected revert not received');
    });
});

contract('OceanMarket', (accounts) => {
    let token;
    let contract;

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] });
        contract = await OceanMarket.new(token.address, { from: accounts[0] });
    });

    describe('register', () => {
        it('Should register new asset', async () => {
            // arrange
            const id = await contract.generateId("test asset");

            // act
            await contract.register(id, 1, { from: accounts[0] });

            // assert
            assert.equal(await contract.checkAsset(id), true);
            assert.equal(await contract.getAssetPrice(id), 1);
        });

        it('Should emit AssetRegistered event', async () => {
            // arrange
            const id = await contract.generateId("test asset");

            // act
            const result = await contract.register(id, 1, { from: accounts[0] });

            // assert
            utils.assertEmitted(result, 1, 'AssetRegistered');
        });
    });

    describe('sendPayment', () => {
        it('Should send payment', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });

            // act
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });

            // assert
            const balance = await token.balanceOf(contract.address);
            assert.equal(parseInt(balance, 10), 1400000000000000000000000000);
        });

        it('Should emit PaymentReceived event', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });

            // act
            const result = await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });

            // assert
            utils.assertEmitted(result, 1, 'PaymentReceived');
        });

        it('Shouldn\'t send payment when not enough balance', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(1, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });

            // act-assert
            try {
                await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            } catch (e) {
                return;
            }
            assert.fail('Expected revert not received');
        });

        it('Shouldn\'t send payment when transfer is not allowed', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });

            // act-assert
            try {
                await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            } catch (e) {
                return;
            }
            assert.fail('Expected revert not received');
        });
    });

    describe('releasePayment', () => {
        it('Should release payment', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });

            // act
            await contract.releasePayment(id, { from: accounts[0] });

            // assert
            const balance = await token.balanceOf(accounts[1]);
            assert.equal(parseInt(balance, 10), 10);
        });

        it('Should emit PaymentReceived event', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });

            // act
            const result = await contract.releasePayment(id, { from: accounts[0] });

            // assert
            utils.assertEmitted(result, 1, 'PaymentReleased');
        });

        it('Shouldn\'t release payment for not authorized address', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });

            // act-assert
            try {
                await contract.releasePayment(id, { from: accounts[0] });
            } catch (e) {
                assert.equal(e.reason, 'Sender is not an authorized contract.');
                return;
            }
            assert.fail('Expected revert not received');
        });

        it('Shouldn\'t release payment twice', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });
            await contract.releasePayment(id, { from: accounts[0] });

            // act-assert
            try {
                await contract.releasePayment(id, { from: accounts[0] });
            } catch (e) {
                assert.equal(e.reason, 'State is not Locked');
                return;
            }
            assert.fail('Expected revert not received');
        });
    });

    describe('refundPayment', () => {
        it('Should refund payment', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });

            // act
            await contract.refundPayment(id, { from: accounts[0] });

            // assert
            const balance = await token.balanceOf(accounts[0]);
            assert.equal(parseInt(balance, 10), 10);
        });

        it('Should emit PaymentRefunded event', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });

            // act
            const result = await contract.refundPayment(id, { from: accounts[0] });

            // assert
            utils.assertEmitted(result, 1, 'PaymentRefunded');
        });

        it('Shouldn\'t refund payment for not authorized address', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });

            // act-assert
            try {
                await contract.refundPayment(id, { from: accounts[0] });
            } catch (e) {
                assert.equal(e.reason, 'Sender is not an authorized contract.');
                return;
            }
            assert.fail('Expected revert not received');
        });

        it('Shouldn\'t refund payment twice', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });
            await contract.refundPayment(id, { from: accounts[0] });

            // act-assert
            try {
                await contract.refundPayment(id, { from: accounts[0] });
            } catch (e) {
                assert.equal(e.reason, 'State is not Locked');
                return;
            }
            assert.fail('Expected revert not received');
        });
    });

    describe('verifyPaymentReceived', () => {
        it('Should return true for not exists payment', async () => {      // imo: strange that non-exist payment is valid
            // arrange
            const id = await contract.generateId("test payment1");

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] });

            // assert
            assert.equal(result, true);
        });
        
        it('Should return true for locked payment', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] });

            // assert
            assert.equal(result, true);
        });
        
        it('Should return false for refunded payment', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });
            await contract.refundPayment(id, { from: accounts[0] });

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] });

            // assert
            assert.equal(result, false);
        });
        
        it('Should return false for released payment', async () => {
            // arrange
            const id = await contract.generateId("test payment");
            await contract.requestTokens(10, { from: accounts[0] });
            await token.approve(contract.address, 10, { from: accounts[0] });
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] });
            await contract.addAuthAddress({ from: accounts[0] });
            await contract.releasePayment(id, { from: accounts[0] });

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] });

            // assert
            assert.equal(result, false);
        });
    });

    describe('deactivateAsset', () => {
        it('Should deactivate asset', async () => {
            // arrange
            const id = await contract.generateId("test asset");
            await contract.register(id, 1, { from: accounts[0] });

            // act
            await contract.deactivateAsset(id, { from: accounts[0] });

            // assert
            assert.equal(await contract.checkAsset(id), false);
        });
        
        it('Should deactivate asset by non-owner', async () => {        // imo: strange that everybody can deactivate assets
            // arrange
            const id = await contract.generateId("test asset");
            await contract.register(id, 1, { from: accounts[0] });

            // act
            await contract.deactivateAsset(id, { from: accounts[1] });

            // assert
            assert.equal(await contract.checkAsset(id), false);
        });
    });
});