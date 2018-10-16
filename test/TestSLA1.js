/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const ethers = require('ethers')
const Web3 = require('web3')
const abi = require('ethereumjs-abi')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))


contract('Fitchain', (accounts) => {
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

            await sla.setupAgreementTemplate([contract1, contract2, contract3], [fingerprint1, fingerprint2, fingerprint3],
                                    dependencies, serviceTemplateId, { from: SLATemplateOwner })

            // setup service level agreement template
            const setupAgreementTemplate = sla.SetupAgreementTemplate()
            const conditions = []


            const setupCondition = sla.SetupCondition()
            setupCondition.watch((error, result) => {
                if(!error){
                    console.log(result.args.condition)
                }else{
                    console.log(error)
                }
            })

            console.log(conditions)

            setupAgreementTemplate.watch((error, result) => {
                if (!error) {
                    console.log("setup agreement")
                    console.log(result.args.serviceTemplateId)
                    console.log("execute agreement")
                    const templateId = result.args.serviceTemplateId
                    const a = abi.solidityPack([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract1, fingerprint1 ])
                    const condition1 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract1, fingerprint1 ]).toString('hex')
                    const condition2 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract2, fingerprint2 ]).toString('hex')
                    const condition3 = "0x"+abi.soliditySHA3([ 'bytes32', 'address', 'bytes4' ],[ templateId, contract3, fingerprint3 ]).toString('hex')

                    // get hash of conditions
                    const hash = abi.soliditySHA3([ 'bytes32', 'bytes32', 'bytes32', 'bytes32' ], [templateId, contract1, contract2, contract3])
                    const prefix = '0x'
                    const hexString = Buffer.from(hash).toString('hex')
                    console.log(`${prefix}${hexString}`)
                    const signature = web3.eth.sign(consumer, `${prefix}${hexString}`)

                    console.log('\t >> consumer signature: ', signature)

                    const EthereumMessage = `\x19Ethereum Signed Message:\n${hash.length}${hash}`
                    const EthereumMessageHash = web3.sha3(EthereumMessage)
                    console.log('signed message from consumer to be validated: ', EthereumMessage)

                    await sla.splitSignature(signature)


                    //sla.executeAgreement(templateId, EthereumMessageHash, consumer, {from: SLATemplateOwner })

                    //const res = await fitchain.verifySignature(validator1, EthereumPoTMessageHash, sig.v, sig.r, sig.s, { from: accounts[0] })
                    //console.log('validate the signature comes from consumer: ', res)

                    // catenating the signatures into one piece (Final Proof)
                    //const signatures = signature1+signature2
                    // "0xff04120c5fc487949b44cfa352a5b4135d9511286c79f32a8579ebde40dbdb67", "0x9c4e477188259ef2c9f7953526cc868a7b1cd66e", "0x5a62da9f19b466881d616361b268ae5f1835259b990cfd309c0da2d1c917a007604ffd4727be435ccf03517e2802f2d895cffad2d5470bca88864d4af26734e001",0

                    //const isValid1 = await fitchain.isValidSignature(EthereumPoTMessageHash, validator1, signature1, 0, { from : dataProvider })




                }else{
                    console.log(error)
                }
            })


        })

    })


})
