/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common.sol')
const IEpochLibrary = artifacts.require('IEpochLibrary.sol')
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const EpochLibraryUpgrade = artifacts.require('EpochLibraryUpgrade.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')

const constants = require('../helpers/constants.js')
const ZeppelinHelper = require('../helpers/ZeppelinHelper.js')

contract('Library Governance', (accounts) => {
    let zos
    let epochLibraryAddress

    before('Restore zos before all tests', async function() {
        zos = new ZeppelinHelper('EpochLibrary')
        await zos.restoreState(accounts[9])
    })

    beforeEach('Deploy with zos before each tests', async function() {
        zos = new ZeppelinHelper('EpochLibrary')
        await zos.initialize(accounts[0], true)
        epochLibraryAddress = zos.getProxyAddress('EpochLibrary')
    })

    describe('epoch library dispatcher', () => {
        it('should link library and replace library', async () => {
            const common = await Common.new()
            await EpochLibrary.at(epochLibraryAddress)

            await ConditionStoreManager.link('IEpochLibrary', EpochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(accounts[0])

            const blockNumberCondition = await common.getCurrentBlockNumber()
            const conditionId = constants.bytes32.zero
            await conditionStoreManager.createCondition(conditionId, accounts[0])
            const condition = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(
                condition.blockNumber.toNumber(),
                blockNumberCondition.toNumber()
            )

            // Upgrade to new EpochLibrary
            await zos.upgradeToNewContract('EpochLibraryUpgrade', accounts[0])
            await EpochLibraryUpgrade.at(epochLibraryAddress)
            await zos.approveLatestTransaction(accounts[1])

            const conditionIdUpgrade = constants.bytes32.one
            await conditionStoreManager.createCondition(conditionIdUpgrade, accounts[0])
            const conditionUpgrade = await conditionStoreManager.getCondition(conditionIdUpgrade)

            assert.strictEqual(
                conditionUpgrade.blockNumber.toNumber(),
                1984
            )
        })
    })
})
