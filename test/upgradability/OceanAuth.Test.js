/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanMarket = artifacts.require('OceanMarket')
const OceanAuthWithBug = artifacts.require('OceanAuthWithBug')
const OceanAuthChangeInStorage = artifacts.require('OceanAuthChangeInStorage')
const OceanAuthExtraFunctionality = artifacts.require('OceanAuthExtraFunctionality')
const OceanAuthChangeInStorageAndLogic = artifacts.require('OceanAuthChangeInStorageAndLogic')
const OceanAuthChangeFunctionSignature = artifacts.require('OceanAuthChangeFunctionSignature')

global.artifacts = artifacts
global.web3 = web3
let zos

async function assertRevert(promise) {
    try {
        await promise
        assert.fail('Expected revert not received')
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0
        assert(revertFound, `Expected "revert", got ${error} instead`)
    }
}

contract('OceanAuth', (accounts) => {
    let pAddress

    async function createAccessRequest(contract, resourceId, provider, timeout, from) {
        const result = await contract.initiateAccessRequest(resourceId, provider, 'pk', timeout, { from: from })
        return result.logs.find(i => i.event === 'AccessConsentRequested').args._id
    }

    before('restore zos before all tests', async function () {
        zos = new ZeppelinHelper('OceanAuth')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function () {
        zos = new ZeppelinHelper('OceanAuth')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('OceanAuth')
        let market = await OceanMarket.at(zos.getProxyAddress('OceanMarket'))
        await market.requestTokens('0x' + (1000 * 10 ** 18).toString(16), { from: accounts[0] })
    })

    describe('Test upgradability for OceanAuth', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('OceanAuthExtraFunctionality')
            let p = await OceanAuthExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('OceanAuthChangeInStorage')
            let p = await OceanAuthChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            let p = await OceanAuthWithBug.at(pAddress)
            await zos.upgradeToNewContract('OceanAuthWithBug')
            let market = await OceanMarket.at(zos.getProxyAddress('OceanMarket'))
            let assetId = await market.generateId(web3.utils.fromAscii('test asset'))
            const requestId = await createAccessRequest(p, assetId, accounts[1], 100, accounts[0])
            await assertRevert(p.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[0] }))
            await zos.approveLatestTransaction()
            await p.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[0] })
        })

        it('Should be possible to append storage variables and change logic', async () => {
            let p = await OceanAuthChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('OceanAuthChangeInStorageAndLogic')
            let market = await OceanMarket.at(zos.getProxyAddress('OceanMarket'))
            let assetId = await market.generateId(web3.utils.fromAscii('test asset'))
            const requestId = await createAccessRequest(p, assetId, accounts[0], 100, accounts[0])
            await zos.approveLatestTransaction()
            await p.commitAccessRequest(requestId, false, 1, '', '', '', '', { from: accounts[0] })
            let n
            await p.called(accounts[0]).then(i => { n = i })

            assert.equal(n.toNumber() > 0, true, 'function access counter not increased')
        })

        it('Should be possible to change function signature', async () => {
            let p = await OceanAuthChangeFunctionSignature.at(pAddress)
            await zos.upgradeToNewContract('OceanAuthChangeFunctionSignature')
            let market = await OceanMarket.at(zos.getProxyAddress('OceanMarket'))
            let assetId = await market.generateId(web3.utils.fromAscii('test asset'))
            const requestId = await createAccessRequest(p, assetId, accounts[0], 100, accounts[0])
            await assertRevert(p.commitAccessRequest(requestId, false, 1, { from: accounts[0] }))
            await zos.approveLatestTransaction()
            await p.commitAccessRequest(requestId, false, 1, { from: accounts[0] })
        })
    })
})
