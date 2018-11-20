/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */

const ethers = require('ethers')

const OceanMarket = artifacts.require('OceanMarket.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const OceanAuth = artifacts.require('OceanAuth.sol')
const utils = require('./utils.js')

const web3 = utils.getWeb3()

contract('OceanAuth constructor', (accounts) => {
    it('Should not deploy if market address is empty', async () => {
        // act-assert
        try {
            await OceanAuth.new(0x0, { from: accounts[0] })
        } catch (e) {
            assert.strictEqual(e.reason, 'Market address cannot be 0x0')
            return
        }
        assert.fail('Expected revert not received')
    })
})

contract('OceanAuth', (accounts) => {
    let token
    let market
    let contract
    let assetId

    beforeEach(async () => {
        token = await OceanToken.new({ from: accounts[0] })
        market = await OceanMarket.new(token.address, { from: accounts[0] })
        contract = await OceanAuth.new(market.address, { from: accounts[0] })
        assetId = await market.generateId('test asset')
    })

    describe('initiateAccessRequest', () => {
        it('Should create access request', async () => {
            // act
            const result = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AccessConsentRequested')
            const requestId = result.logs.find(i => i.event === 'AccessConsentRequested').args._id
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 0)
        })

        it('Should create access request for own resource', async () => {
            // act
            const result = await contract.initiateAccessRequest(assetId, accounts[0], 'pk', 100, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AccessConsentRequested')
            const requestId = result.logs.find(i => i.event === 'AccessConsentRequested').args._id
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 0)
        })
    })

    describe('commitAccessRequest', () => {
        it('Should allow commit request by provider only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act-assert
            try {
                await contract.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Sender is not Provider.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should allow commit request with status Requested only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, false, 100, '', '', '', '', { from: accounts[1] })

            // act-assert
            try {
                await contract.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Status not requested.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should revoke access request if asset is not available', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act
            const result = await contract.commitAccessRequest(requestId, false, 100, '', '', '', '', { from: accounts[1] })

            // assert
            utils.assertEmitted(result, 1, 'AccessRequestRejected')
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 4)
        })

        it('Should commit access request if asset is available', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act
            const result = await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })

            // assert
            utils.assertEmitted(result, 1, 'AccessRequestCommitted')
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 1)
        })
    })

    describe('cancelAccessRequest', () => {
        it('Should allow cancel request by consumer only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })

            // act-assert
            try {
                await contract.cancelAccessRequest(requestId, { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Sender is not consumer.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should allow cancel request with status Committed only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act-assert
            try {
                await contract.cancelAccessRequest(requestId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Status not Committed.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should not allow cancel expired request', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 10000000000, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })

            // act-assert
            try {
                await contract.cancelAccessRequest(requestId, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Timeout not exceeded.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should cancel access request', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 0, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })
            await market.sendPayment(requestId, accounts[1], 0, 300, { from: accounts[0] })

            // act
            const result = await contract.cancelAccessRequest(requestId, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'AccessRequestRevoked')
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 4)
        })
    })

    describe('deliverAccessToken', () => {
        it('Should allow deliver request by provider only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act-assert
            try {
                await contract.deliverAccessToken(requestId, '0x1a2e', { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Sender is not Provider.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should allow deliver request with status Committed only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act-assert
            try {
                await contract.deliverAccessToken(requestId, '0x1a2e', { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Status not Committed.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should allow deliver request', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })

            // act
            const result = await contract.deliverAccessToken(requestId, '0x1a2e', { from: accounts[1] })

            // assert
            utils.assertEmitted(result, 1, 'EncryptedTokenPublished')
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 2)
        })
    })

    describe('verifyAccessTokenDelivery', () => {
        const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

        it('Should allow verify access token by provider only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act-assert
            try {
                // await contract.deliverAccessToken(requestId, '0x1a2e', { from: accounts[0] })
                await contract.verifyAccessTokenDelivery(requestId, '0x0', emptyBytes32, 0, emptyBytes32, emptyBytes32, { from: accounts[0] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Sender is not Provider.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should allow verify access token with status Delivered only', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id

            // act-assert
            try {
                await contract.verifyAccessTokenDelivery(requestId, '0x0', emptyBytes32, 0, emptyBytes32, emptyBytes32, { from: accounts[1] })
            } catch (e) {
                assert.strictEqual(e.reason, 'Status not Delivered.')
                return
            }
            assert.fail('Expected revert not received')
        })

        it('Should revoke access request if signature is not valid', async () => {
            // arrange
            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })
            await market.sendPayment(requestId, accounts[1], 0, 300, { from: accounts[0] })
            await contract.deliverAccessToken(requestId, '0x10', { from: accounts[1] })

            // act
            const result = await contract.verifyAccessTokenDelivery(requestId, accounts[0], emptyBytes32, 0, emptyBytes32, emptyBytes32, { from: accounts[1] })

            // assert
            utils.assertEmitted(result, 1, 'AccessRequestRevoked')
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 4)
        })

        it('Should accept access request if signature is valid', async () => {
            // arrange
            const msg = 'the_message_1)#'
            const signature = await web3.eth.sign(`0x${Buffer.from(msg).toString('hex')}`, accounts[0])
            const sig = ethers.utils.splitSignature(signature)
            const fixedMsgSha = web3.utils.sha3(`\x19Ethereum Signed Message:\n${msg.length}${msg}`)

            const initResult = await contract.initiateAccessRequest(assetId, accounts[1], 'pk', 100, { from: accounts[0] })
            const requestId = initResult.logs.find(i => i.event === 'AccessConsentRequested').args._id
            await contract.commitAccessRequest(requestId, true, 10000000000, '', '', '', '', { from: accounts[1] })
            await market.sendPayment(requestId, accounts[1], 0, 300, { from: accounts[0] })
            await contract.deliverAccessToken(requestId, '0x10', { from: accounts[1] })

            // act
            const result = await contract.verifyAccessTokenDelivery(requestId, accounts[0], fixedMsgSha, sig.v, sig.r, sig.s, { from: accounts[1] })

            // assert
            utils.assertEmitted(result, 1, 'AccessRequestDelivered')
            const status = await contract.statusOfAccessRequest(requestId)
            assert.strictEqual(parseInt(status, 10), 3)
        })
    })
})
