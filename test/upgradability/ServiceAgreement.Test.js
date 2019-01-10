/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')
const utils = require('../utils.js')

const ServiceAgreementWithBug = artifacts.require('ServiceAgreementWithBug')
const ServiceAgreementChangeInStorage = artifacts.require('ServiceAgreementChangeInStorage')
const ServiceAgreementExtraFunctionality = artifacts.require('ServiceAgreementExtraFunctionality')
const ServiceAgreementChangeInStorageAndLogic = artifacts.require('ServiceAgreementChangeInStorageAndLogic')
const ServiceAgreementChangeFunctionSignature = artifacts.require('ServiceAgreementChangeFunctionSignature')

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

contract('ServiceAgreement', (accounts) => {
    let pAddress
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000001'

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('ServiceAgreement')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('ServiceAgreement')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('ServiceAgreement')
    })

    describe('Test upgradability for ServiceAgreement', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('ServiceAgreementExtraFunctionality')
            let p = await ServiceAgreementExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('ServiceAgreementChangeInStorage')
            let p = await ServiceAgreementChangeInStorage.at(pAddress)
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
            let p = await ServiceAgreementChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('ServiceAgreementChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()
            // add test
            const result = await p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(templateId)
            assert.strictEqual(status, true)
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 1, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            /* eslint-disable-next-line no-unused-vars */
            let p = await ServiceAgreementWithBug.at(pAddress)
            await zos.upgradeToNewContract('ServiceAgreementWithBug')
            await zos.approveLatestTransaction()
            // add test
            const result = await p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], 0, { from: accounts[0] })
            // assert
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(templateId)
            assert.strictEqual(status, false)
        })

        it('Should be possible to change function signature', async () => {
            await zos.upgradeToNewContract('ServiceAgreementChangeFunctionSignature')
            let p = await ServiceAgreementChangeFunctionSignature.at(pAddress)
            await assertRevert(p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], { from: accounts[0] }))

            // Approve and test new logic
            await zos.approveLatestTransaction()
            const result = await p.setupAgreementTemplate(templateId, [], [], [], emptyBytes32, [], { from: accounts[0] })

            // assert
            utils.assertEmitted(result, 1, 'SetupAgreementTemplate')
            const status = await p.getTemplateStatus(templateId)
            assert.strictEqual(status, true)
        })
    })
})
