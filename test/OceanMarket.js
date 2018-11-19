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
    });
});