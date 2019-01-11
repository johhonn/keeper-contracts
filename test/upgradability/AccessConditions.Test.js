/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')
const utils = require('../helpers/utils.js')

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement')
const AccessConditions = artifacts.require('AccessConditions')
const AccessConditionsWithBug = artifacts.require('AccessConditionsWithBug')
const AccessConditionsChangeInStorage = artifacts.require('AccessConditionsChangeInStorage')
const AccessConditionsExtraFunctionality = artifacts.require('AccessConditionsExtraFunctionality')
const AccessConditionsChangeInStorageAndLogic = artifacts.require('AccessConditionsChangeInStorageAndLogic')
const AccessConditionsChangeFunctionSignature = artifacts.require('AccessConditionsChangeFunctionSignature')

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

contract('AccessConditions', (accounts) => {
    let pAddress
    const assetId = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const templateId = '0x0000000000000000000000000000000000000000000000000000000000000002'
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    let agreement
    // let contract
    let consumer
    let contracts
    let fingerprints
    let dependenciesBits
    let valueHashes
    let timeoutValues
    let serviceAgreementId

    function createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer) {
        const conditionKeys = utils.generateConditionsKeys(templateId, contracts, fingerprints)
        const hash = utils.createSLAHash(web3, templateId, conditionKeys, valueHashes, timeoutValues, serviceAgreementId)
        return web3.eth.sign(hash, consumer)
    }

    async function initAgreement() {
        agreement = await ServiceExecutionAgreement.at(zos.getProxyAddress('ServiceExecutionAgreement'))
        let p = await AccessConditions.at(pAddress)
        /* eslint-disable-next-line prefer-destructuring */
        consumer = accounts[1]
        contracts = [pAddress]
        fingerprints = [utils.getSelector(web3, p, 'grantAccess')]
        dependenciesBits = [0]
        valueHashes = utils.valueHash(['bytes32', 'bytes32'], [assetId, assetId])
        timeoutValues = [0]
        serviceAgreementId = utils.generateId(web3)

        const signature = await createSignature(contracts, fingerprints, valueHashes, timeoutValues, serviceAgreementId, consumer)
        await agreement.setupAgreementTemplate(templateId, contracts, fingerprints, dependenciesBits, templateId, [0], 0, { from: accounts[0] })
        await agreement.executeAgreement(templateId, signature, consumer, [valueHashes], timeoutValues, serviceAgreementId, templateId, { from: accounts[0] })
    }

    before('restore zos before all tests', async function() {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('AccessConditions')
        await zos.initialize(accounts[0], true)
        pAddress = zos.getProxyAddress('AccessConditions')
    })

    describe('Test upgradability for AccessConditions', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            await zos.upgradeToNewContract('AccessConditionsExtraFunctionality')
            let p = await AccessConditionsExtraFunctionality.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.getNumber().then(i => { n = i })
            assert.equal(n.toString(), '42', 'Error calling getNumber')
        })

        it('Should be possible to append storage variables ', async () => {
            await zos.upgradeToNewContract('AccessConditionsChangeInStorage')
            let p = await AccessConditionsChangeInStorage.at(pAddress)
            // should not be able to be called before upgrade is approved
            await assertRevert(p.called(zos.owner))

            // Approve and call again
            await zos.approveLatestTransaction()
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 0, 'Error calling added storage variable')
        })

        it('Should be possible to append storage variables and change logic', async () => {
            await initAgreement()
            let p = await AccessConditionsChangeInStorageAndLogic.at(pAddress)
            await zos.upgradeToNewContract('AccessConditionsChangeInStorageAndLogic')

            // Approve and test new logic
            await zos.approveLatestTransaction()

            // act
            await p.grantAccess(serviceAgreementId, assetId, assetId, { from: accounts[0] })
            let n
            await p.called(zos.owner).then(i => { n = i })
            assert.equal(n.toNumber(), 1, 'Error calling added storage variable')
        })

        it('Should be possible to fix/add a bug', async () => {
            await initAgreement()
            let p = await AccessConditionsWithBug.at(pAddress)
            await zos.upgradeToNewContract('AccessConditionsWithBug')
            await assertRevert(p.grantAccess(serviceAgreementId, emptyBytes32, emptyBytes32, { from: consumer })
            )
            await zos.approveLatestTransaction()
            await p.grantAccess(serviceAgreementId, emptyBytes32, emptyBytes32, { from: consumer })
        })

        it('Should be possible to change function signature', async () => {
            await initAgreement()
            let p = await AccessConditionsChangeFunctionSignature.at(pAddress)
            await zos.upgradeToNewContract('AccessConditionsChangeFunctionSignature')
            await assertRevert(p.grantAccess(serviceAgreementId, assetId, assetId, accounts[0]))

            await zos.approveLatestTransaction()
            await p.grantAccess(serviceAgreementId, assetId, assetId, accounts[0], { from: accounts[0] })
        })
    })
})
