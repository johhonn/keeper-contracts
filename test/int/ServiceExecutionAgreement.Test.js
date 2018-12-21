/* global artifacts, assert, contract, describe, it, before */
/* eslint-disable no-console, max-len */

const ServiceExecutionAgreement = artifacts.require('ServiceExecutionAgreement.sol')
const OceanToken = artifacts.require('OceanToken.sol')
const OceanMarket = artifacts.require('OceanMarket.sol')
const PaymentConditions = artifacts.require('PaymentConditions.sol')
const AccessConditions = artifacts.require('AccessConditions.sol')

const abi = require('ethereumjs-abi')
const utils = require('../utils')

const web3 = utils.getWeb3()

var colorSet = {
    Reset: '\x1b[0m',
    Red: '\x1b[31m',
    Green: '\x1b[32m',
    Yellow: '\x1b[33m',
    Blue: '\x1b[34m',
    Magenta: '\x1b[35m'
}

var funcNames = ['info', 'log', 'warn', 'error']
var colors = [colorSet.Green, colorSet.Blue, colorSet.Yellow, colorSet.Red]

for (var i = 0; i < funcNames.length; i++) {
    let funcName = funcNames[i]
    let color = colors[i]
    let oldFunc = console[funcName]
    console[funcName] = function() {
        var args = Array.prototype.slice.call(arguments)
        if (args.length) args = [color + args[0]].concat(args.slice(1), colorSet.Reset)
        oldFunc.apply(null, args)
    }
}

// console coloring source code here: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

contract('ServiceExecutionAgreement', (accounts) => {
    let sla

    before(async () => {
        sla = await ServiceExecutionAgreement.new({ from: accounts[0] })
        /* eslint-disable-next-line prefer-destructuring */
    })

    describe('Test Service Level Agreement', () => {
        it('should be able to run through the full lifecycle of fulfilling SLA', async () => {
            const consumer = accounts[0]
            const SLATemplateOwner = accounts[1]

            /*

                                                condition-1            Index: 0
                                                   / \
                                                  /   \
                                                 /     \
                                                /       \
                                               /         \
                                          F=0 /           \ F=1
                                Index: 3 condition-4    condition-2     Index: 1
                                              \            /
                                               \          /
                                           Timeout=1     /
                                                 \      /
                                                  \    /
                                               F=0 \  / F=1
                                                condition3              Index: 2

                1st bit --> dependency index
                2nd bit --> Flag (indicating the expected value of the dependency condition)
                3rd bit --> exit strategy (i.e timeout)

                       condition 1               condition 2      condition 3,      condition 4
                 [ [  [1,1, 0 ], [3, 0, 0]],      [[2, 1 , 0]],  [[0,0,0]],          [2, 0, 1] ]
                 Generating compressed version of nested arrays (one array)
                   condition 1                  condition 2             condition 3             condition 4
                 [ 001 000 011 000,             000 011 000 000,        000 000 000 000,        000 101 000 000]
                 [ 536           ,             192            ,        0              ,        320            ]
            */

            const contract1 = accounts[2]
            const contract2 = accounts[3]
            const contract3 = accounts[4]
            const contract4 = accounts[5]

            const fingerprint1 = '0x2e0a37a5'
            const fingerprint2 = '0xc8cd645f'
            const fingerprint3 = '0xc1964de7'
            const fingerprint4 = '0xc1964ded'

            const dependencies = [536, 192, 0, 320]

            const serviceTemplateId = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
            const did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
            const contracts = [contract1, contract2, contract3, contract4]
            const fingerprints = [fingerprint1, fingerprint2, fingerprint3, fingerprint4]
            // setup service level agreement template
            console.log('\t >> Create service level agreement template')
            const result = await sla.setupTemplate(
                serviceTemplateId,
                contracts,
                fingerprints,
                dependencies,
                [0], 0,
                { from: SLATemplateOwner })

            // msg.sender, service, dependencies.length, contracts.length

            const { templateId } = result.logs[4].args
            assert.strictEqual(templateId, serviceTemplateId, 'Template Id should match indicating creating of agreement template')
            console.log('\x1b[36m%s\x1b[0m', '\t >> Template ID:', templateId, '... Done!')
            console.log('\t >> Execute service level agreement')
            // reconstruct the three condition keys off-chain
            const condKeys = utils.generateConditionsKeys(templateId, contracts, fingerprints)
            const valHashList = [
                utils.valueHash(['bool'], [true]),
                utils.valueHash(['bool'], [false]),
                utils.valueHash(['uint'], [120]),
                utils.valueHash(['string'], ['797FD5B9045B841FDFF72']) // asset Id: 797FD5B9045B841FDFF72
            ]

            const timeoutValues = [0, 0, 0, 3] // timeout 5 blocks @ condition 4
            /*
                To reconstruct the right signature, as SLA provider you should
                get a signed message by the consumer with the following parameters:
                1) SLA Template ID
                2) Array of Condition Keys
                3) Array of Controller Methods inputs hash (valueHash)
                4) Array of timeout for each condition in terms of blocks
                5) bytes32 service_definition_id (id of service in DID)
                6) bytes32 DID --> refer to the off-chain DID document
            */

            // generate template fingerprint including all the conditions and
            const agreementId = utils.generateId(web3)
            const hash = utils.createSLAHash(web3, templateId, condKeys, valHashList, timeoutValues, agreementId)
            const signature = await web3.eth.sign(hash, consumer)
            const val = await sla.executeAgreement(templateId, signature, consumer, [ valHashList[0], valHashList[1], valHashList[2], valHashList[3] ], timeoutValues, agreementId, did, { from: SLATemplateOwner })
            assert.strictEqual(val.logs[4].args.agreementId, agreementId, 'Execute Agreement event not emitted.')
            console.log('\x1b[36m%s\x1b[0m', '\t >> Service Agreement ID: ', val.logs[4].args.agreementId, ' ... Done!')

            console.log('\x1b[36m%s\x1b[0m', '\t >> Set 3rd condition status to 1 by contract address: ', contract3, ' Fingerprint: ', fingerprint3)
            console.log('\t >> Reconstruct condition-3 authorized hash')
            const condition3 = '0x' + abi.soliditySHA3([ 'bytes32', 'bytes32' ], [ condKeys[2], valHashList[2] ]).toString('hex')
            console.log('\t >> Hash(ConditionKey, ValueHash): ', condition3)
            await sla.fulfillCondition(agreementId, fingerprint3, valHashList[2], { from: contract3 })
            const conditionIdStatus = await sla.getConditionStatus(agreementId, condKeys[2])
            assert.strictEqual(1, conditionIdStatus.toNumber(), 'Invalid condition state')
            console.log('\x1b[36m%s\x1b[0m', '\t >> Condition 3 status: ', conditionIdStatus.toNumber())

            console.log('\x1b[36m%s\x1b[0m', '\t >> Set 2nd condition status to 1 by contract address: ', contract2, ' Fingerprint: ', fingerprint2)
            console.log('\t >> Reconstruct condition-2 authorized hash')
            const condition2 = '0x' + abi.soliditySHA3([ 'bytes32', 'bytes32' ], [ condKeys[1], valHashList[1] ]).toString('hex')
            console.log('\t >> Hash(ConditionKey, ValueHash): ', condition2)
            await sla.fulfillCondition(agreementId, fingerprint2, valHashList[1], { from: contract2 })
            const conditionId2Status = await sla.getConditionStatus(agreementId, condKeys[1])
            assert.strictEqual(1, conditionId2Status.toNumber(), 'Invalid condition state')
            console.log('\x1b[36m%s\x1b[0m', '\t >> Condition 2 status: ', conditionId2Status.toNumber())

            console.warn('\t >> Try to change the state of condition 4')
            console.info('\t >> wait for 2 sec condition 3 timeout')
            await sleep(2000)
            if (await sla.conditionTimedOut(agreementId, condKeys[3])) {
                console.info('yes')
            } else {
                console.warn('\t >> Condition-3 is not timed out yet')
                try {
                    console.log('\x1b[36m%s\x1b[0m', '\t >> Set 4th condition status to 0 by contract address: ', contract4, ' Fingerprint: ', fingerprint4)
                    console.log('\t >> Reconstruct condition-4 authorized hash')
                    const condition4 = '0x' + abi.soliditySHA3([ 'bytes32', 'bytes32' ], [ condKeys[3], valHashList[3] ]).toString('hex')
                    console.log('\t >> Hash(ConditionKey, ValueHash): ', condition4)
                    await sla.fulfillCondition(agreementId, fingerprint4, valHashList[3], { from: contract4 })
                    const conditionId4Status = await sla.getConditionStatus(agreementId, condKeys[3])
                    assert.strictEqual(1, conditionId4Status.toNumber(), 'Invalid condition state')
                    console.log('\x1b[36m%s\x1b[0m', '\t >> Condition 4 status: ', conditionId4Status.toNumber())
                } catch (err) {
                    console.error('\t >> Error: Unauthorized access for condition 4 state, wait for timeout')
                }
            }

            console.info('\t >> wait for 3 sec, the actual condition 3 timeout')
            await sleep(3000)

            if (await sla.conditionTimedOut(agreementId, condKeys[3])) {
                const conditionId4Status = await sla.getConditionStatus(agreementId, condKeys[3])
                console.log('\x1b[36m%s\x1b[0m', '\t >> Condition 4 status: ', conditionId4Status.toNumber())

                if ((conditionId4Status.toNumber() === -1 || conditionId4Status.toNumber() === 0) && conditionId2Status.toNumber() === 1) {
                    console.info('\t >> Set condition-1 to true if condition2=1 and condition4=0')
                    console.log('\t >> Reconstruct condition-1 authorized hash')
                    const condition1 = '0x' + abi.soliditySHA3([ 'bytes32', 'bytes32' ], [ condKeys[0], valHashList[0] ]).toString('hex')
                    console.log('\t >> Hash(ConditionKey, ValueHash): ', condition1)
                    await sla.fulfillCondition(agreementId, fingerprint1, valHashList[0], { from: contract1 })
                    const conditionId1Status = await sla.getConditionStatus(agreementId, condKeys[0])
                    assert.strictEqual(1, conditionId1Status.toNumber(), 'Invalid condition state')
                    console.log('\x1b[36m%s\x1b[0m', '\t >> Condition 1 status: ', conditionId1Status.toNumber())
                } else {
                    console.error('\t >> Condition 1 do not match the state')
                }
            } else {
                console.warn('\t >> Condition-4 is not timed out yet')
            }

            console.info('\t >> fulfill agreement')
            const fulfilled = await sla.fulfillAgreement(agreementId, { from: accounts[8] })
            console.log('\t >> Agreement ', fulfilled.logs[0].args.agreementId, ' has been fulfilled')

            console.log('\t >> Fulfill agreement: ', agreementId)
            try {
                await sla.fulfillAgreement(agreementId, { from: accounts[8] })
                console.log('\t >> Done!')
            } catch (error) {
                console.log('\t >> Unable to fulfill agreement!')
            }
        })
    })

    describe('Test Access Service Agreement', () => {
        let token, market, sea, paymentConditions, accessConditions, resourceId, valuesHashList, serviceId, conditionKeys, templateId

        let funcFingerPrints, contracts
        const provider = accounts[0]
        const consumer = accounts[1]
        const fromProvider = { from: provider }
        const fromConsumer = { from: consumer }
        const resourcePrice = 3
        const resourceName = 'self-driving ai data'
        const serviceName = resourceName
        let timeouts = [0, 0, 0, 3]
        const fulfillmentIndices = [0] // Root Condition
        const fulfilmentOperator = 0 // AND
        const dependencies = [0, 1, 4, 1 | 2 ** 2 | 2 ** 3] // dependency bit | timeout bit
        const did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
        const serviceTemplateId = '0x419d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
        before(async () => {
            token = await OceanToken.new()
            // await token.setReceiver(consumer)
            market = await OceanMarket.new(token.address)
            sea = await ServiceExecutionAgreement.new()
            paymentConditions = await PaymentConditions.new(sea.address, token.address)
            accessConditions = await AccessConditions.new(sea.address)
            // Do some preperations: give consumer funds, add an asset
            // consumer request initial funds to play
            console.log(consumer)
            await market.requestTokens(1000, fromConsumer)
            const bal = await token.balanceOf.call(consumer)
            console.log(`consumer has balance := ${bal.valueOf()} now`)
            resourceId = did
            console.log('publisher registers asset with id = ', resourceId)
            contracts = [paymentConditions.address, accessConditions.address, paymentConditions.address, paymentConditions.address]
            funcFingerPrints = [
                utils.getSelector(web3, paymentConditions, 'lockPayment'),
                utils.getSelector(web3, accessConditions, 'grantAccess'),
                utils.getSelector(web3, paymentConditions, 'releasePayment'),
                utils.getSelector(web3, paymentConditions, 'refundPayment')
            ]
            valuesHashList = [
                utils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                utils.valueHash(['bytes32', 'bytes32'], [resourceId, resourceId]),
                utils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice]),
                utils.valueHash(['bytes32', 'uint256'], [resourceId, resourcePrice])]
            console.log('conditions control contracts', contracts)
            console.log('functions: ', funcFingerPrints, valuesHashList)
            const setupTx = await sea.setupTemplate(
                serviceTemplateId, contracts, funcFingerPrints, dependencies,
                web3.utils.fromAscii(serviceName), fulfillmentIndices,
                fulfilmentOperator, fromProvider
            )
            // Grab `SetupAgreementTemplate` event to fetch the serviceTemplateId
            templateId = utils.getEventArgsFromTx(setupTx, 'SetupAgreementTemplate').serviceTemplateId

            // console.log('templateid: ', templateId)
            conditionKeys = utils.generateConditionsKeys(templateId, contracts, funcFingerPrints)
            console.log('conditions: ', conditionKeys)
        })

        it('Consume asset happy path', async () => {
            const serviceAgreementId = utils.generateId(web3)
            const slaMsgHash = utils.createSLAHash(
                web3, templateId, conditionKeys,
                valuesHashList, timeouts,
                serviceAgreementId
            )
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            serviceId = await utils.signAgreement(
                sea, templateId, signature, consumer, valuesHashList, timeouts, serviceAgreementId, did, fromProvider
            )

            try {
                const fn = utils.getSelector(web3, accessConditions, 'checkPermissions')
                const invalidKey = utils.generateConditionsKeys(templateId, [accessConditions.address], [fn])[0]
                await sea.getConditionStatus(serviceId, invalidKey)
            } catch (error) {
                console.log('invalid condition status: ', error)
            }

            let locked = await sea.getConditionStatus(serviceId, conditionKeys[0])
            await token.approve(paymentConditions.address, 200, fromConsumer)
            const payTx = await paymentConditions.lockPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            console.log('lockpayment event: ', utils.getEventArgsFromTx(payTx, 'PaymentLocked').serviceId)

            locked = await sea.getConditionStatus(serviceId, conditionKeys[0])
            console.log('locked: ', locked.toNumber())
            const hasPermission = await accessConditions.checkPermissions(consumer, resourceId)
            console.log('consumer permission: ', hasPermission)
            // grant access
            const dep = await sea.hasUnfulfilledDependencies(serviceId, conditionKeys[1])
            console.log('has dependencies: ', dep)

            await sea.getConditionStatus(serviceId, conditionKeys[1])
            const gaccTx = await accessConditions.grantAccess(serviceId, resourceId, resourceId, fromProvider)
            console.log('accessgranted event: ', utils.getEventArgsFromTx(gaccTx, 'AccessGranted').serviceId)
            const hasPermission1 = await accessConditions.checkPermissions(consumer, resourceId)
            console.log('consumer permission: ', hasPermission1)
            await sea.getConditionStatus(serviceId, conditionKeys[1])

            // release payment
            await sea.getConditionStatus(serviceId, conditionKeys[2])
            const releaseTx = await paymentConditions.releasePayment(serviceId, resourceId, resourcePrice, fromProvider)
            console.log('releasepayment event: ', utils.getEventArgsFromTx(releaseTx, 'PaymentReleased').serviceId)
            await sea.getConditionStatus(serviceId, conditionKeys[2])

            try {
                await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            } catch (err) {
                console.log('\t >> Good, refund is denied as expected.')
            }
        })

        it('Consume asset with Refund', async () => {
            const serviceAgreementId = utils.generateId(web3)
            const slaMsgHash = utils.createSLAHash(
                web3, templateId, conditionKeys,
                valuesHashList, timeouts,
                serviceAgreementId
            )
            const signature = await web3.eth.sign(slaMsgHash, consumer)

            serviceId = await utils.signAgreement(
                sea, templateId, signature, consumer, valuesHashList, timeouts, serviceAgreementId, did, fromProvider
            )
            try {
                await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            } catch (err) {
                console.log('\t >> Good, refund is denied as expected since payment is not locked yet.')
            }

            await token.approve(paymentConditions.address, 200, fromConsumer)
            const payTx = await paymentConditions.lockPayment(serviceId, resourceId, resourcePrice, fromConsumer)
            console.log('lockpayment event: ', utils.getEventArgsFromTx(payTx, 'PaymentLocked').serviceId)
            // Now refund should go through, after timeout
            await utils.sleep(4000)
            try {
                const refundTx = await paymentConditions.refundPayment(serviceId, resourceId, resourcePrice, fromConsumer)
                console.log('refundPayment event: ', utils.getEventArgsFromTx(refundTx, 'PaymentRefund').serviceId)
            } catch (err) {
                console.log('\t >> Error: refund is denied, this should not occur.', err.message)
            }
        })
    })
})
