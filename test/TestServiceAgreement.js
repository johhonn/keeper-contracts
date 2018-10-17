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

            const dependencies = [2,4,0]

            const serviceTemplateId = "0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae"

            // setup service level agreement template
            const result = await sla.setupAgreementTemplate([contract1, contract2, contract3], [fingerprint1, fingerprint2, fingerprint3],
                                    dependencies, serviceTemplateId, { from: SLATemplateOwner })
            templateId = result.logs[3].args.serviceTemplateId

            console.log("execute agreement")
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

            console.log(val.logs[3].args)

        })

    })


})
