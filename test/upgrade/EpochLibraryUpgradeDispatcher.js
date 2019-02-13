/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common.sol')
const Dispatcher = artifacts.require('Dispatcher.sol')
const DispatcherStorage = artifacts.require('DispatcherStorage.sol')
const EpochLibrary = artifacts.require('EpochLibrary.sol')
const EpochLibraryUpgrade = artifacts.require('EpochLibraryUpgrade.sol')
const ConditionStoreManager = artifacts.require('ConditionStoreManager.sol')
const constants = require('../helpers/constants.js')

contract('Library Governance', (accounts) => {
    describe('epoch library dispatcher', () => {
        it('should link library and replace library', async () => {
            const common = await Common.new()
            const epochLibrary = await EpochLibrary.new()
            const dispatcherStorage = await DispatcherStorage.new(epochLibrary.address)
            Dispatcher.unlinked_binary = Dispatcher.unlinked_binary
                .replace('1111222233334444555566667777888899990000',
                    dispatcherStorage.address.slice(2))
            const dispatcher = await Dispatcher.new()
            await ConditionStoreManager.link('IEpochLibrary', dispatcher.address)
            const conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(accounts[0])

            const blockNumberCondition = await common.getCurrentBlockNumber()
            const conditionId = constants.bytes32.zero
            await conditionStoreManager.createCondition(conditionId, accounts[0])

            const epochLibraryUpgrade = await EpochLibraryUpgrade.new()
            await dispatcherStorage.replace(epochLibraryUpgrade.address)

            const conditionIdUpgrade = constants.bytes32.one
            await conditionStoreManager.createCondition(conditionIdUpgrade, accounts[0])

            const condition = await conditionStoreManager.getCondition(conditionId)
            const conditionUpgrade = await conditionStoreManager.getCondition(conditionIdUpgrade)

            assert.strictEqual(
                condition.blockNumber.toNumber(),
                blockNumberCondition.toNumber()
            )
            assert.strictEqual(
                conditionUpgrade.blockNumber.toNumber(),
                1984
            )
        })
    })
})
