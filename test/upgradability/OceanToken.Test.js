/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before, beforeEach */
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')
const testUtils = require('../helpers/utils')

const OceanTokenWithBug = artifacts.require('OceanTokenWithBug')
const OceanTokenChangeInStorage = artifacts.require('OceanTokenChangeInStorage')
const OceanTokenExtraFunctionality = artifacts.require('OceanTokenExtraFunctionality')
const OceanTokenChangeInStorageAndLogic = artifacts.require('OceanTokenChangeInStorageAndLogic')
const OceanTokenChangeFunctionSignature = artifacts.require('OceanTokenChangeFunctionSignature')

contract('OceanToken', (accounts) => {
    let zos
    let oceanTokenAddress

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.initialize(accounts[0], true)
        oceanTokenAddress = zos.getProxyAddress('OceanToken')
    })

    describe('Test upgradability for OceanToken', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('OceanTokenExtraFunctionality')
            let p = await OceanTokenExtraFunctionality.at(oceanTokenAddress)
            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.getNumber())
            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        xit('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('OceanTokenChangeInStorage')
            let p = await OceanTokenChangeInStorage.at(oceanTokenAddress)

            // should not be able to be called before upgrade is approved
            await testUtils.assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            const n = await p.called(zos.owner)
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        xit('Should be possible to append storage variables and change logic', async () => {
            let p = await OceanTokenChangeInStorageAndLogic.at(oceanTokenAddress)
            await zos.upgradeToNewContract('OceanTokenChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            await p.transfer(accounts[1], 100, { from: accounts[0] })
            await p.transfer(accounts[2], 100, { from: accounts[0] })
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 2, 'Error on internal counter')
        })

        xit('Should be possible to fix/add a bug', async () => {
            let p = await OceanTokenWithBug.at(oceanTokenAddress)
            await zos.upgradeToNewContract('OceanTokenWithBug')
            // Approve to insert bug and call again
            await zos.approveLatestTransaction()
            await p.transfer(0x11, 0, { from: accounts[0] })
            await p.transfer(0x12, 0, { from: accounts[0] })
        })

        xit('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('OceanTokenChangeFunctionSignature')
            // Approve and test new logic
            await zos.approveLatestTransaction()
            let p = await OceanTokenChangeFunctionSignature.at(oceanTokenAddress)
            await p.methods['transferFrom(uint256,address)'](100, accounts[2], { from: accounts[0] })
        })
    })
})
