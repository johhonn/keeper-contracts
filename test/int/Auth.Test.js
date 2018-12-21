/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before */
/* eslint-disable no-console, max-len */

const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const OceanAuth = artifacts.require('OceanAuth.sol')

const EthEcies = require('eth-ecies')
const EthCrypto = require('eth-crypto')
const EthjsUtil = require('ethereumjs-util')
const ethers = require('ethers')
const utils = require('../helpers/utils.js')

const web3 = utils.getWeb3()
const { BN } = web3.utils

contract('OceanAuth', (accounts) => {
    const scale = 10 ** 18
    const timeout = 9999999999
    let token
    let market
    let auth

    let publisher
    let consumer

    before(async () => {
        token = await OceanToken.deployed()
        market = await OceanMarket.deployed()
        auth = await OceanAuth.deployed()
    })

    describe('Test On-chain Authorization', () => {
        before(async () => {
            [publisher, consumer] = accounts

            // consumer request initial funds to play
            await market.requestTokens('0x' + (1000 * scale).toString(16), { from: consumer })
        })

        // support upto 50 assets and providers; each asset has one single provider at this time
        it('Should walk through Authorization Process', async () => {
            const resourceName = 'resource'
            const resourceId = await market.generateId(web3.utils.fromAscii(resourceName), { from: publisher })
            const resourcePrice = 100 * scale
            // 1. provider register dataset
            await market.register(resourceId, new BN(resourcePrice.toString()), { from: publisher })
            console.log('publisher registers asset with id = ', resourceId)

            console.log('consumer', consumer)
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf() / scale} now`)
            // consumer approve market to withdraw amount of token from his account
            await token.approve(market.address, new BN((300 * scale).toString()), { from: consumer })

            // 2. consumer initiate an access request
            const key = EthCrypto.createIdentity()
            const publicKey = EthjsUtil.privateToPublic(key.privateKey).toString('hex')
            console.log('public key is: =', publicKey)

            const initiateAccessRequestTx = await auth.initiateAccessRequest(resourceId, publisher, publicKey, timeout, { from: consumer })

            const accessId = initiateAccessRequestTx.logs.filter((log) => {
                return log.event === 'AccessConsentRequested'
            })[0].args._id

            console.log('consumer creates an access request with id :', accessId)

            // 3. provider commit the request
            await auth.commitAccessRequest(accessId, true, timeout, 'discovery', 'read', 'slaLink', 'slaType', { from: publisher })
            console.log('provider has committed the order')

            // 4. consumer make payment
            const bal1 = await token.balanceOf.call(market.address)
            console.log(`market has balance := ${bal1.valueOf() / scale} before payment`)
            await market.sendPayment(accessId, publisher, new BN(resourcePrice.toString()), timeout, { from: consumer })
            const bal2 = await token.balanceOf.call(market.address)
            console.log(`market has balance := ${bal2.valueOf() / scale} after payment`)
            console.log('consumer has paid the order')

            // 5. provider delivery the encrypted JWT token
            const OnChainPubKey = await auth.getTempPubKey(accessId, { from: publisher })
            // console.log('provider Retrieve the temp public key:', OnChainPubKey)
            assert.strictEqual(publicKey, OnChainPubKey, 'two public keys should match.')

            const encJWT = EthEcies.encrypt(Buffer.from(OnChainPubKey, 'hex'), Buffer.from('eyJhbGciOiJIUzI1')).toString('hex')
            console.log('encJWT:', `0x${encJWT}`)
            // check status

            await auth.deliverAccessToken(accessId, `0x${encJWT}`, { from: publisher })
            console.log('provider has delivered the encrypted JWT to on-chain')

            // 4. consumer download the encrypted token and decrypt
            const onChainencToken = await auth.getEncryptedAccessToken(accessId, { from: consumer })
            // remove 0x from token
            const tokenNo0x = onChainencToken.slice(2)
            const encryptedTokenBuffer = Buffer.from(tokenNo0x, 'hex')
            // remove 0x from private key
            const privateKey = key.privateKey.slice(2)
            const decryptJWT = EthEcies.decrypt(Buffer.from(privateKey, 'hex'), encryptedTokenBuffer).toString()
            console.log('consumer decrypts JWT token off-chain :', decryptJWT.toString())
            assert.strictEqual(decryptJWT.toString(), 'eyJhbGciOiJIUzI1', 'two public keys should match.')

            // 5. consumer sign the encypted JWT token using private key
            // const signature = web3.eth.sign(consumer, '0x' + Buffer.from(onChainencToken).toString('hex'))
            const prefix = '0x'
            const hexString = Buffer.from(onChainencToken).toString('hex')
            const signature = await web3.eth.sign(`${prefix}${hexString}`, consumer)
            console.log('consumer signature: ', signature)

            const sig = ethers.utils.splitSignature(signature)

            const fixedMsg = `\x19Ethereum Signed Message:\n${onChainencToken.length}${onChainencToken}`
            const fixedMsgSha = web3.utils.sha3(fixedMsg)
            console.log('signed message from consumer to be validated: ', fixedMsg)

            const res = await auth.verifySignature(consumer, fixedMsgSha, sig.v, sig.r, sig.s, { from: publisher })
            console.log('validate the signature comes from consumer? isSigned: ', res)

            // 6. provider send the signed encypted JWT to ACL contract for verification (verify delivery of token)
            // it shall release the payment to provider automatically
            await auth.verifyAccessTokenDelivery(accessId, consumer, fixedMsgSha, sig.v, sig.r, sig.s, { from: publisher })
            console.log('provider verify the delivery and request payment')

            // check balance
            const pbal = (await token.balanceOf.call(publisher)).valueOf() / scale
            console.log(`provider has balance := ${pbal} now`)
            assert.strictEqual(pbal, 100)

            const mbal = await token.balanceOf.call(market.address)
            console.log(`market has balance := ${mbal.valueOf() / scale} now`)
        })

        it('Should refund when authorization failed', async () => {
            // 1. consumer initiate an access request
            const key = EthCrypto.createIdentity()
            const publicKey = EthjsUtil.privateToPublic(key.privateKey).toString('hex')
            console.log('public key is: =', publicKey)

            // 2. consumer initiate new access request
            const resource2Id = await market.generateId(web3.utils.fromAscii('resource2'), { from: publisher })
            const initiateAccessRequest2Tx = await auth.initiateAccessRequest(resource2Id, publisher, publicKey, timeout, { from: consumer })

            const access2Id = initiateAccessRequest2Tx.logs.filter((log) => {
                return log.event === 'AccessConsentRequested'
            })[0].args._id

            // 3. provider commit the request
            await auth.commitAccessRequest(access2Id, true, timeout, 'discovery', 'read', 'slaLink', 'slaType', { from: publisher })
            console.log('provider has committed the order')

            // 4. consumer make payment
            await market.sendPayment(access2Id, publisher, new BN((100 * scale).toString()), timeout, { from: consumer })

            // 5. provider delivery token
            await auth.deliverAccessToken(access2Id, `0x1234`, { from: publisher })
            console.log('provider has delivered token to on-chain')

            // 6. provider send wrong token to ACL contract for verification
            await auth.verifyAccessTokenDelivery(access2Id, consumer, web3.utils.sha3('test'), 28, utils.emptyBytes32, utils.emptyBytes32, { from: publisher })
            console.log('provider fail verification the delivery and refund payment')

            // check balance
            const pbal2 = (await token.balanceOf.call(publisher)).valueOf() / scale
            console.log(`provider has balance := ${pbal2} now`)
            assert.strictEqual(pbal2, 100)

            console.log(`market has balance := ${await token.balanceOf.call(market.address) / scale} now`)
        })

        it('Should allow to cancel request by consumer when timeout rised', async () => {
            // 1. consumer initiate an access request
            const key = EthCrypto.createIdentity()
            const publicKey = EthjsUtil.privateToPublic(key.privateKey).toString('hex')
            console.log('public key is: =', publicKey)

            const resourceId = await market.generateId(web3.utils.fromAscii('resource2'), { from: publisher })
            const initiateAccessRequest3Tx = await auth.initiateAccessRequest(resourceId, publisher, publicKey, 1, { from: consumer })

            const accessId = initiateAccessRequest3Tx.logs.filter((log) => {
                return log.event === 'AccessConsentRequested'
            })[0].args._id

            // 2. provider commit the request
            await auth.commitAccessRequest(accessId, true, timeout, 'discovery', 'read', 'slaLink', 'slaType', { from: publisher })
            console.log('provider has committed the order')

            // 3. consumer make payment
            await market.sendPayment(accessId, publisher, new BN((100 * scale).toString()), timeout, { from: consumer })

            // 4. consumer cancel request
            await auth.cancelAccessRequest(accessId, { from: consumer })
            console.log('consumer cancel request to on-chain')

            // check balance
            const pbal = (await token.balanceOf.call(publisher)).valueOf() / scale
            console.log(`provider has balance := ${pbal} now`)
            assert.strictEqual(pbal, 100)

            console.log(`market has balance := ${await token.balanceOf.call(market.address) / scale} now`)
        })
    })
})
