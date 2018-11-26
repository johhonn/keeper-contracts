/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const OceanMarket = artifacts.require('OceanMarket.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const utils = require('../utils.js')

contract('OceanMarket constructor', (accounts) => {
    it('Should not deploy if token is empty', async () => {
        // act-assert
        try {
            await OceanMarket.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'Token address is 0x0.')
            return
        }
        assert.fail('Expected revert not received')
    })
})

contract('OceanMarket', (accounts) => {
    let token
    let contract
    let id

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] })
        contract = await OceanMarket.new(token.address, { from: accounts[0] })
        id = await contract.generateId('test')
    })

    describe('register', () => {
        it('Should register new asset', async () => {
            // act
            await contract.register(id, 1, { from: accounts[0] })

            // assert
            assert.strictEqual(await contract.checkAsset(id), true)
            assert.strictEqual(parseInt(await contract.getAssetPrice(id), 10), 1)
        })

        it('Should emit AssetRegistered event', async () => {
            // act
            const result = await contract.register(id, 1, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AssetRegistered')
        })

        it('Should not register one asset twice', async () => {
            // arrange
            await contract.register(id, 1, { from: accounts[0] })

            // act-assert
            try {
                await contract.register(id, 1, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Owner address is not 0x0.')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('sendPayment', () => {
        it('Should send payment', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })

            // act
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(contract.address)
            assert.strictEqual(parseInt(balance, 10), 1400000000000000000000000000)
        })

        it('Should emit PaymentReceived event', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })

            // act
            const result = await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'PaymentReceived')
        })

        it('Should not send payment when not enough balance', async () => {
            // arrange
            await contract.requestTokens(1, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })

            // act-assert
            try {
                await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            } catch (e) {
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not send payment when transfer is not allowed', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })

            // act-assert
            try {
                await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            } catch (e) {
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('releasePayment', () => {
        it('Should release payment', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })

            // act
            await contract.releasePayment(id, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[1])
            assert.strictEqual(balance.toNumber(), 10)
        })

        it('Should emit PaymentReceived event', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })

            // act
            const result = await contract.releasePayment(id, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'PaymentReleased')
        })

        it('Should not release payment for not authorized address', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })

            // act-assert
            try {
                await contract.releasePayment(id, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Sender is not an authorized contract.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not release payment twice', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })
            await contract.releasePayment(id, { from: accounts[0] })

            // act-assert
            try {
                await contract.releasePayment(id, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'State is not Locked')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('refundPayment', () => {
        it('Should refund payment', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })

            // act
            await contract.refundPayment(id, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 10)
        })

        it('Should emit PaymentRefunded event', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })

            // act
            const result = await contract.refundPayment(id, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'PaymentRefunded')
        })

        it('Should not refund payment for not authorized address', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })

            // act-assert
            try {
                await contract.refundPayment(id, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Sender is not an authorized contract.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not refund payment twice', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })
            await contract.refundPayment(id, { from: accounts[0] })

            // act-assert
            try {
                await contract.refundPayment(id, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'State is not Locked')
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('verifyPaymentReceived', () => {
        it('Should return true for not exists payment', async () => { // IMO strange that non-exist payment is valid
            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] })

            // assert
            assert.strictEqual(result, true)
        })

        it('Should return true for locked payment', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] })

            // assert
            assert.strictEqual(result, true)
        })

        it('Should return false for refunded payment', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })
            await contract.refundPayment(id, { from: accounts[0] })

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] })

            // assert
            assert.strictEqual(result, false)
        })

        it('Should return false for released payment', async () => {
            // arrange
            await contract.requestTokens(10, { from: accounts[0] })
            await token.approve(contract.address, 10, { from: accounts[0] })
            await contract.sendPayment(id, accounts[1], 10, 300, { from: accounts[0] })
            await contract.addAuthAddress({ from: accounts[0] })
            await contract.releasePayment(id, { from: accounts[0] })

            // act
            const result = await contract.verifyPaymentReceived(id, { from: accounts[0] })

            // assert
            assert.strictEqual(result, false)
        })
    })

    describe('deactivateAsset', () => {
        it('Should deactivate asset', async () => {
            // arrange
            await contract.register(id, 1, { from: accounts[0] })

            // act
            await contract.deactivateAsset(id, { from: accounts[0] })

            // assert
            assert.strictEqual(await contract.checkAsset(id), false)
        })

        it('Should deactivate asset by non-owner', async () => { // IMO strange that everybody can deactivate assets
            // arrange
            await contract.register(id, 1, { from: accounts[0] })

            // act
            await contract.deactivateAsset(id, { from: accounts[1] })

            // assert
            assert.strictEqual(await contract.checkAsset(id), false)
        })
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await contract.requestTokens(200, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 200)
        })

        it('Should not transfer frequently', async () => {
            // arrange
            await contract.limitTokenRequest(10, 10)
            await contract.requestTokens(10, { from: accounts[0] })

            // act
            const result = await contract.requestTokens(10, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 10)
            utils.assertEmitted(result, 1, 'FrequentTokenRequest')
        })

        it('Should not transfer more than max amount', async () => {
            // arrange
            await contract.limitTokenRequest(2, 10)

            // act
            const result = await contract.requestTokens(10, { from: accounts[0] })

            // assert
            const balance = await token.balanceOf(accounts[0])
            assert.strictEqual(balance.toNumber(), 2)
            utils.assertEmitted(result, 1, 'LimitTokenRequest')
        })
    })

    describe('addAuthAddress', () => {
        it('Should not mutate not empty authorized address', async () => {
            // arrange
            await contract.addAuthAddress({ from: accounts[0] })

            // act-assert
            try {
                await contract.addAuthAddress({ from: accounts[1] })
            } catch (e) {
                return
            }
            assert.fail('Expected revert not received')
        })
    })

    describe('generateId', () => {
        it('Should generate id from string', async () => {
            // act
            const id = await contract.generateId('test', { from: accounts[0] })

            // assert
            assert.strictEqual(id, '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658')
        })

        it('Should generate id from bytes', async () => {
            // act
            const id = await contract.generateId('0xff', { from: accounts[0] }) // not possible to call function generateId(bytes) with truffle, it call generateId(string)

            // assert
            assert.strictEqual(id, '0x420daffad4b177bce28bead5f76f7bc97ef63c3aae74c496db8ce6aafe9e6513')
        })
    })
})
