/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, before */
/* eslint-disable no-console, max-len */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const { hashAgreement } = require('../../helpers/hashAgreement.js')
const testUtils = require('../../helpers/utils')

const web3 = testUtils.getWeb3()

contract('ServiceExecutionAgreement', (accounts) => {
    let sea
    /* eslint-disable-next-line prefer-destructuring */
    const consumer = accounts[0]
    /* eslint-disable-next-line prefer-destructuring */
    const templateOwner = accounts[1]
    const { templateId } = testUtils
    const contracts = accounts.slice(2, 6)
    const fingerprints = [
        '0x2e0a37a5',
        '0xc8cd645f',
        '0xc1964de7',
        '0xc1964ded'
    ]

    const agreementId = testUtils.generateId()

    const hashedValues = [
        testUtils.valueHash(['bool'], [true]),
        testUtils.valueHash(['bool'], [false]),
        testUtils.valueHash(['uint'], [120]),
        testUtils.valueHash(['string'], ['797FD5B9045B841FDFF72'])
    ]

    const timeoutValues = [0, 0, 0, 3] // timeout 5 blocks @ condition 4

    const conditionKeys = testUtils.generateConditionsKeys(
        templateId,
        contracts,
        fingerprints
    )

    const agreementHash = hashAgreement(
        templateId,
        conditionKeys,
        hashedValues,
        timeoutValues,
        agreementId
    )

    beforeEach(async () => {
        sea = await ServiceExecutionAgreement.new({ from: accounts[0] })
    })

    const fulfillCondition = async (activeCondition) => {
        await sea.fulfillCondition(
            agreementId,
            fingerprints[activeCondition],
            hashedValues[activeCondition],
            { from: contracts[activeCondition] })

        let conditionStatus = await sea.getConditionStatus(agreementId, conditionKeys[activeCondition])
        let isAgreementFulfilled = await sea.isAgreementFulfilled(agreementId)
        return {
            conditionStatus,
            isAgreementFulfilled
        }
    }

    describe('Test Service Level Agreement', () => {
        it('should be able to run through the full lifecycle of fulfilling a SEA', async () => {
            await sea.setupTemplate(
                templateId,
                contracts,
                fingerprints,
                [536, 192, 0, 320],
                [0], 0,
                { from: templateOwner }
            )

            const signature = await web3.eth.sign(agreementHash, consumer)

            // generate template fingerprint including all the conditions and
            const initializeResult = await sea.initializeAgreement(
                testUtils.templateId,
                signature,
                consumer,
                hashedValues,
                timeoutValues,
                agreementId,
                testUtils.did,
                { from: templateOwner }
            )

            assert.strictEqual(initializeResult.logs[4].args.agreementId, agreementId,
                'AgreementInitialized event not emitted.')
            let isAgreementFulfilled = await sea.isAgreementFulfilled(agreementId)
            assert.strictEqual(isAgreementFulfilled, false,
                'Agreement should not be fulfilled')
            let conditionStatus = await sea.getConditionStatus(agreementId, conditionKeys[2])
            assert.strictEqual(conditionStatus.toNumber(), 0,
                'Invalid condition state')

            let fulfillResult,
                activeCondition
            // fulfill condition 1
            activeCondition = 1
            fulfillResult = await fulfillCondition(activeCondition)
            assert.strictEqual(fulfillResult.conditionStatus.toNumber(), activeCondition,
                'Invalid condition state')
            assert.strictEqual(fulfillResult.isAgreementFulfilled, false,
                'Agreement should not be fulfilled')
            console.log(await sea.hasUnfulfilledDependencies(agreementId, conditionKeys[activeCondition]))

            // fulfill condition 2
            fulfillResult = await fulfillCondition(2)
            assert.strictEqual(fulfillResult.conditionStatus.toNumber(), 1,
                'Invalid condition state')
            assert.strictEqual(fulfillResult.isAgreementFulfilled, false,
                'Agreement should not be fulfilled')

            // fulfill condition 0
            fulfillResult = await fulfillCondition(0)
            assert.strictEqual(fulfillResult.conditionStatus.toNumber(), 1,
                'Invalid condition state')
            await sea.fulfillAgreement(agreementId, { from: accounts[0] })
            assert.strictEqual(fulfillResult.isAgreementFulfilled, false,
                'Agreement should be fulfilled')

            // await testUtils.sleep(2000)
            //
            // await sea.conditionTimedOut(agreementId, conditionKeys[3])
            //
            // // fulfill condition 3
            // fulfillResult = await fulfillCondition(3)
            // assert.strictEqual(fulfillResult.conditionStatus.toNumber(), 1,
            //     'Invalid condition state')
            // assert.strictEqual(fulfillResult.isAgreementFulfilled, false,
            //     'Agreement should be fulfilled')
            //
            // await sea.fulfillCondition(
            //     agreementId,
            //     fingerprints[3],
            //     hashedValues[3],
            //     { from: contracts[3] })
            // conditionStatus = await sea.getConditionStatus(agreementId, conditionKeys[3])
            // assert.strictEqual(conditionStatus.toNumber(), 1,
            //     'Invalid condition state')
            // let conditionId4Status = await sea.getConditionStatus(agreementId, conditionKeys[3])
            // assert.strictEqual(1, conditionId4Status.toNumber(), 'Invalid condition state')
            // await testUtils.sleep(3000)
            //
            // await sea.conditionTimedOut(agreementId, conditionKeys[3])
            // conditionId4Status = await sea.getConditionStatus(agreementId, conditionKeys[3])
            // if ((conditionId4Status.toNumber() === -1 || conditionId4Status.toNumber() === 0) && conditionId2Status.toNumber() === 1) {
            //     await sea.fulfillCondition(agreementId, fingerprint[0], hashedValues[0], { from: contract1 })
            //     const conditionId1Status = await sea.getConditionStatus(agreementId, conditionKeys[0])
            //     assert.strictEqual(1, conditionId1Status.toNumber(), 'Invalid condition state')
            //     const fulfilled = await sea.fulfillAgreement(agreementId, { from: accounts[8] })
            //     await sea.fulfillAgreement(agreementId, { from: accounts[8] })
            // }
        })
    })
})
