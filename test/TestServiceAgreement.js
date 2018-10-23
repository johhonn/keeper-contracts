/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const ethers = require('ethers')
const Web3 = require('web3')
const abi = require('ethereumjs-abi')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))


contract('SLA', (accounts) => {
    describe('Test Service Level Agreement', () => {

        it('should be able to run through the full lifecycle of fulfilling SLA', async () => {

            const sla = await ServiceAgreement.deployed()

            const consumer = accounts[0]
            const SLATemplateOwner = accounts[1]

            /*

                                                condition-1             Index: 0
                                                   / \
                                                  /   \
                                                 /     \
                                                /       \
                                               /         \
                                          F=1 /           \ F=1
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
                 [ [  [1,1, 0 ], [3, 1, 0]],      [[2, 1 , 0]],  [[0,0,0]],          [2, 0, 1] ]
                 Generating compressed version of nested arrays (one array)
                   condition 1                  condition 2             condition 3             condition 4
                 [ 011 000 011 000,             000 011 000 000,        000 000 000 000,        000 101 000 000]
                 [ 1560           ,             192            ,        0              ,        320            ]
            */

            const contract1 = accounts[2]
            const contract2 = accounts[3]
            const contract3 = accounts[4]
            const contract4 = accounts[5]

            const fingerprint1 = "0x2e0a37a5"
            const fingerprint2 = "0xc8cd645f"
            const fingerprint3 = "0xc1964de7"
            const fingerprint4 = "0xc1964ded"

            const dependencies = [1560,192,0, 320]

            const serviceTemplateId = "0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae"

            // setup service level agreement template
            console.log("\t >> Create service level agreement template")
            const result = await sla.setupAgreementTemplate([contract1, contract2, contract3, contract4], [fingerprint1, fingerprint2, fingerprint3, fingerprint4],
                                    dependencies, serviceTemplateId, { from: SLATemplateOwner })
            // msg.sender, service, dependencies.length, contracts.length
            const testTemplateId = web3.utils.soliditySha3({type: 'address', value: SLATemplateOwner},
                                                           {type: 'bytes32', value: serviceTemplateId},
                                                           {type: 'uint', value: 4},
                                                           {type: 'uint', value: 4}).toString('hex')

            templateId = result.logs[4].args.serviceTemplateId
            assert.strictEqual(templateId, testTemplateId, "Template Id should match indicating creating of agreement template")
            console.log("\t >> Template ID:", templateId,"... Done!")
            console.log("\t >> Execute service level agreement")
            // reconstruct the three condition keys off-chain
            const conditionKey1 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract1, fingerprint1 ]).toString('hex')
            const conditionKey2 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract2, fingerprint2 ]).toString('hex')
            const conditionKey3 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract3, fingerprint3 ]).toString('hex')
            const conditionKey4 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract4, fingerprint4 ]).toString('hex')

            const valHash1 = "0x"+abi.soliditySHA3([ 'bool'],[true]).toString('hex') // True
            const valHash2 = "0x"+abi.soliditySHA3([ 'bool'],[false]).toString('hex') // False
            const valHash3 = "0x"+abi.soliditySHA3([ 'uint'],[120]).toString('hex') // $120
            const valHash4 = "0x"+abi.soliditySHA3([ 'string'],["797FD5B9045B841FDFF72"]).toString('hex') // asset Id: 797FD5B9045B841FDFF72

            const timeoutValues = [0, 0, 0, 5] // timeout 5 blocks @ condition 4
            /*
                To reconstruct the right signature, as SLA provider you should
                get a signed message by the consumer with the following parameters:
                1) SLA Template ID
                2) Array of Condition Keys
                3) Array of Controller Methods inputs hash (valueHash)
                4) Array of timeout for each condition in terms of blocks
            */

            // generate template fingerprint including all the conditions and
            const hash = web3.utils.soliditySha3({type: 'bytes32', value: templateId},
                         {type: 'bytes32[]', value: [ conditionKey1, conditionKey2, conditionKey3, conditionKey4 ]},
                         {type: 'bytes32[]', value: [ valHash1, valHash2, valHash3, valHash4]},
                         {type: 'uint256[]', value: timeoutValues}).toString('hex')


            const signature = await web3.eth.sign(hash, consumer)
            const EthereumMessage = `\x19Ethereum Signed Message:\n32`
            const EthereumMessageHash = web3.utils.soliditySha3({type: 'string', value:EthereumMessage}, {type:'bytes32', value: hash})
            const val = await sla.executeAgreement(templateId, signature, consumer,
                                                   [ valHash1, valHash2, valHash3, valHash4],
                                                   timeoutValues, {from: SLATemplateOwner })
            assert.strictEqual(val.logs[4].args.state, true, "Execute Agreement should return true")
            console.log("\t >> Service Agreement ID: ",val.logs[4].args.serviceId ," ... Done!")


            const serviceAgreementId = val.logs[4].args.serviceId

//            console.log("\t >> Fulfill 3rd condition by contract address: ", contract3, " Fingerprint: ",fingerprint3)
//            console.log("\t >> Reconstruct condition-3 authorized hash")
//            console.log("\t >> Hash(ConditionKey, ValueHash): ",)
//            const cond3 = await sla.setConditionStatus(serviceAgreementId, fingerprint3, valHash3,  { from: contract3 })
//            const conditionId3Status = await sla.getConditionStatus(serviceAgreementId, condition3)
//            console.log("\t >> Condition 3 status: ", conditionId3Status)
//
//            console.log("\t >> Fulfill 2nd condition by contract address: ", contract2, " Fingerprint: ",fingerprint2)
//            const cond2 = await sla.setConditionStatus(serviceAgreementId, fingerprint2, { from: contract2 })
//            const conditionId2Status = await sla.getConditionStatus(serviceAgreementId, condition2)
//            console.log("\t >> Condition 2 status: ", conditionId2Status)
//
//            console.log("\t >> Fulfill 1st condition by contract address: ", contract1, " Fingerprint: ",fingerprint1)
//            const cond1 = await sla.setConditionStatus(serviceAgreementId, fingerprint1, { from: contract1 })
//            const conditionId1Status = await sla.getConditionStatus(serviceAgreementId, condition1)
//            console.log("\t >> Condition 1 status: ", conditionId1Status)
//
//            console.log("\t >> Fulfill Service Level Agreement")
//            const fulfillSLA = await sla.fulfillAgreement(serviceAgreementId)
//            const slaStatus = await sla.getAgreementStatus(serviceAgreementId)
//            assert.strictEqual(slaStatus, true, "Agreement should be fulfilled")
//            console.log("\t >> Agreement fulfillment status: ", slaStatus)
//
//            console.log("\t >> Revoke Agreement Template: ", templateId)
//            const revoked = await sla.revokeAgreementTemplate(templateId, {from : SLATemplateOwner})
//            assert.strictEqual(revoked.logs[0].args.state, true, "Template is Revoked!")
//            console.log("\t >> Revoked")


        })

    })


})
