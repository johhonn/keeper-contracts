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

            // condition1 --dependsOn--> condition2 --dependsOn--> condition3
            const contract1 = accounts[2]
            const contract2 = accounts[3]
            const contract3 = accounts[4]

            const fingerprint1 = "0x2e0a37a5"
            const fingerprint2 = "0xc8cd645f"
            const fingerprint3 = "0xc1964de7"

            /*
            condition1 --dependsOn--> condition2 --dependsOn----> condition3
                        \                                         /
                         \__dependsOn__> condition4 __dependsOn__/
            [   0                           ,    1        ,      2   ,         3        ]
            [ [[1, 1, 0], [3, 1, 0]]  ,     [[2, 1, 0]]   ,     []   ,    [[2, 0, 1]]   ]
            [         v1              ,          v2       ,     v3   ,        v4        ]
            [ 011 000 011 000,          000 011 000 000,        000 000 000 000,        000 101 000 000]
            */

            const dependencies = [2,4,0]

            const serviceTemplateId = "0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae"

            // setup service level agreement template
            console.log("\t >> Setup service level agreement template")
            const result = await sla.setupAgreementTemplate([contract1, contract2, contract3], [fingerprint1, fingerprint2, fingerprint3],
                                    dependencies, serviceTemplateId, { from: SLATemplateOwner })
            // msg.sender, service, dependencies.length, contracts.length
            const testTemplateId = web3.utils.soliditySha3({type: 'address', value: SLATemplateOwner},
                                                           {type: 'bytes32', value: serviceTemplateId},
                                                           {type: 'uint', value: 3},
                                                           {type: 'uint', value: 3}).toString('hex')
            templateId = result.logs[3].args.serviceTemplateId
            assert.strictEqual(templateId, testTemplateId, "Template Id should match indicating creating of agreement template")
            console.log("\t >> Template ID:", templateId,"... Done!")
            console.log("\t >> Execute service level agreement")
            // reconstruct the three condition off-chain
            const condition1 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract1, fingerprint1 ]).toString('hex')
            const condition2 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract2, fingerprint2 ]).toString('hex')
            const condition3 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract3, fingerprint3 ]).toString('hex')

            // generate template fingerprint including all the conditions and
            const hash = web3.utils.soliditySha3({type: 'bytes32', value: templateId}, {type: 'bytes32[]', value: [ condition1, condition2, condition3 ]}).toString('hex')
            const signature = await web3.eth.sign(hash, consumer)
            const EthereumMessage = `\x19Ethereum Signed Message:\n32`
            const EthereumMessageHash = web3.utils.soliditySha3({type: 'string', value:EthereumMessage}, {type:'bytes32', value: hash})
            const val = await sla.executeAgreement(templateId, signature, consumer, {from: SLATemplateOwner })
            assert.strictEqual(val.logs[3].args.state, true, "Execute Agreement should return true")
            console.log("\t >> Service Agreement ID: ",val.logs[3].args.serviceId ," ... Done!")


            const serviceAgreementId = val.logs[3].args.serviceId

            console.log("\t >> Fulfill 3nd condition by contract address: ", contract3, " Fingerprint: ",fingerprint3)
            const cond3 = await sla.setConditionStatus(serviceAgreementId, fingerprint3, { from: contract3 })
            const conditionId3Status = await sla.getConditionStatus(serviceAgreementId, condition3)
            console.log("\t >> Condition 3 status: ", conditionId3Status)

            console.log("\t >> Fulfill 2nd condition by contract address: ", contract2, " Fingerprint: ",fingerprint2)
            const cond2 = await sla.setConditionStatus(serviceAgreementId, fingerprint2, { from: contract2 })
            const conditionId2Status = await sla.getConditionStatus(serviceAgreementId, condition2)
            console.log("\t >> Condition 2 status: ", conditionId2Status)

            console.log("\t >> Fulfill 1st condition by contract address: ", contract1, " Fingerprint: ",fingerprint1)
            const cond1 = await sla.setConditionStatus(serviceAgreementId, fingerprint1, { from: contract1 })
            const conditionId1Status = await sla.getConditionStatus(serviceAgreementId, condition1)
            console.log("\t >> Condition 1 status: ", conditionId1Status)

            console.log("\t >> Fulfill Service Level Agreement")
            const fulfillSLA = await sla.fulfillAgreement(serviceAgreementId)
            const slaStatus = await sla.getAgreementStatus(serviceAgreementId)
            assert.strictEqual(slaStatus, true, "Agreement should be fulfilled")
            console.log("\t >> Agreement fulfillment status: ", slaStatus)

            console.log("\t >> Revoke Agreement Template: ", templateId)
            const revoked = await sla.revokeAgreementTemplate(templateId, {from : SLATemplateOwner})
            assert.strictEqual(revoked.logs[0].args.state, true, "Template is Revoked!")
            console.log("\t >> Revoked")


        })

    })


})
