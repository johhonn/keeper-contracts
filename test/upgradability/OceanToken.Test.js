/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanToken = artifacts.require('OceanToken')
const OceanTokenWithBug = artifacts.require('OceanTokenWithBug')
const OceanTokenChangeInStorage = artifacts.require('OceanTokenChangeInStorage')
const OceanTokenExtraFunctionality = artifacts.require('OceanTokenExtraFunctionality')
const OceanTokenChangeInStorageAndLogic = artifacts.require('OceanTokenChangeInStorageAndLogic')
const OceanTokenChangeFunctionSignature = artifacts.require('OceanTokenChangeFunctionSignature')

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

contract('OceanToken', (accounts) => {
    let pAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('OceanToken')
        let p = await OceanToken.at(pAddress)
        p.setReceiver(accounts[0])
    })

    describe('Test upgradability for OceanToken', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('OceanTokenExtraFunctionality')
            let p = await OceanTokenExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('OceanTokenChangeInStorage')
            let p = await OceanTokenChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            // await p.setReceiver(accounts[0])
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            // let p = await OceanTokenChangeInStorageAndLogic.at(zos.proxyAddress)
            let p = await OceanTokenChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('OceanTokenChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            await p.transfer(accounts[1], 100, { from: accounts[0] })
            await p.transfer(accounts[2], 100, { from: accounts[0] })
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 2, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            let p = await OceanTokenWithBug.at(pAddress)
            await zos.upgradeToNewContract('OceanTokenWithBug')
            await assertRevert(p.setReceiver(accounts[1]))
            // Approve to insert bug and call again
            await zos.approveLatestTransaction()
            // Upgraded version should have a bug
            await p.setReceiver(accounts[1])
            await p.setReceiver(accounts[2])
            await p.setReceiver(accounts[0])
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('OceanTokenChangeFunctionSignature')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            let p = await OceanTokenChangeFunctionSignature.at(pAddress)
            await p.methods['transferFrom(uint256,address)'](100, accounts[2], { from: accounts[0] })
        })
    })
})
