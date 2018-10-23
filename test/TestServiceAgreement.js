/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const ServiceAgreement = artifacts.require('ServiceAgreement.sol')
const ethers = require('ethers')
const Web3 = require('web3')
const abi = require('ethereumjs-abi')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))



var colorSet = {
    Reset: "\x1b[0m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m"
};

var funcNames = ["info", "log", "warn", "error"];
var colors = [colorSet.Green, colorSet.Blue, colorSet.Yellow, colorSet.Red];

for (var i = 0; i < funcNames.length; i++) {
    let funcName = funcNames[i];
    let color = colors[i];
    let oldFunc = console[funcName];
    console[funcName] = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length) args = [color + args[0]].concat(args.slice(1), colorSet.Reset);
        oldFunc.apply(null, args);
    };
}

// console coloring source code here: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
//console.info("Info is green.");
//console.log("Log is blue.");
//console.warn("Warn is orange.");
//console.error("Error is red.");
//console.info("--------------------");
//console.info("Formatting works as well. The number = %d", 123);

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

contract('SLA', (accounts) => {
    describe('Test Service Level Agreement', () => {

        it('should be able to run through the full lifecycle of fulfilling SLA', async () => {

            const sla = await ServiceAgreement.deployed()

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

            const fingerprint1 = "0x2e0a37a5"
            const fingerprint2 = "0xc8cd645f"
            const fingerprint3 = "0xc1964de7"
            const fingerprint4 = "0xc1964ded"

            const dependencies = [536,192,0, 320]

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
                        console.log(''+ '\n' +
'                                                condition-1            Index: 0   '+'\n' +
'                                                   //\                            '+'\n' +
'                                                  /  /\                           '+'\n' +
'                                                 /    /\                          '+'\n' +
'                                                /      /\                         '+'\n' +
'                                               /        /\                        '+'\n' +
'                                          F=0 /          /\ F=1                   '+'\n' +
'                                Index: 3 condition-4    condition-2     Index: 1  '+'\n' +
'                                             /\            /                      '+'\n' +
'                                              /\          /                       '+'\n' +
'                                          Timeout=1     /                        '+'\n' +
'                                                /\      /                         '+'\n' +
'                                                 /\    /                          '+'\n' +
'                                               F=0/\  / F=1                       '+'\n' +
'                                                condition3              Index: 2  '+'\n\n'

            )
            console.log('\x1b[36m%s\x1b[0m',"\t >> Template ID:", templateId,"... Done!")
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

            const timeoutValues = [0, 0, 0, 30] // timeout 5 blocks @ condition 4
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
            console.log('\x1b[36m%s\x1b[0m',"\t >> Service Agreement ID: ",val.logs[4].args.serviceId ," ... Done!")


            const serviceAgreementId = val.logs[4].args.serviceId

            console.log('\x1b[36m%s\x1b[0m',"\t >> Set 3rd condition status to 1 by contract address: ", contract3, " Fingerprint: ",fingerprint3)
            console.log("\t >> Reconstruct condition-3 authorized hash")
            const condition3 = "0x"+abi.soliditySHA3([ 'bytes32', 'bytes32'], [conditionKey3, valHash3]).toString('hex')
            console.log("\t >> Hash(ConditionKey, ValueHash): ", condition3)
            const cond3 = await sla.setConditionStatus(serviceAgreementId, fingerprint3, valHash3, 1 ,{ from: contract3 })

            const conditionIdStatus = await sla.getConditionStatus(serviceAgreementId, conditionKey3)
            assert.strictEqual(cond3.logs[0].args.state.toNumber(), conditionIdStatus.toNumber(), "Invalid condition state")
            console.log('\x1b[36m%s\x1b[0m',"\t >> Condition 3 status: ", conditionIdStatus.toNumber())


            console.log('\x1b[36m%s\x1b[0m',"\t >> Set 2nd condition status to 1 by contract address: ", contract2, " Fingerprint: ",fingerprint2)
            console.log("\t >> Reconstruct condition-2 authorized hash")
            const condition2 = "0x"+abi.soliditySHA3([ 'bytes32', 'bytes32'], [conditionKey2, valHash2]).toString('hex')
            console.log("\t >> Hash(ConditionKey, ValueHash): ", condition2)
            const cond2 = await sla.setConditionStatus(serviceAgreementId, fingerprint2, valHash2, 1 ,{ from: contract2 })

            const conditionId2Status = await sla.getConditionStatus(serviceAgreementId, conditionKey2)
            assert.strictEqual(cond2.logs[0].args.state.toNumber(), conditionId2Status.toNumber(), "Invalid condition state")
            console.log('\x1b[36m%s\x1b[0m',"\t >> Condition 2 status: ", conditionId2Status.toNumber())



//            console.log('\x1b[36m%s\x1b[0m',"\t >> Try to set condition 1 state to 1, Please do note that condition 4 status is -1")
//            console.log('\x1b[36m%s\x1b[0m',"\t >> Set 1st condition status to 1 by contract address: ", contract1, " Fingerprint: ",fingerprint1)
//
//
//            try {
//                console.log("\t >> Reconstruct condition-1 authorized hash")
//                const condition1 = "0x"+abi.soliditySHA3([ 'bytes32', 'bytes32'], [conditionKey1, valHash1]).toString('hex')
//                console.log("\t >> Hash(ConditionKey, ValueHash): ", condition1)
//                const cond1 = await sla.setConditionStatus(serviceAgreementId, fingerprint1, valHash1, 1 ,{ from: contract1 })
//
//                const conditionId1Status = await sla.getConditionStatus(serviceAgreementId, conditionKey1)
//                assert.strictEqual(cond1.logs[0].args.state.toNumber(), conditionId1Status.toNumber(), "Invalid condition state")
//                console.log('\x1b[36m%s\x1b[0m',"\t >> Condition 1 status: ", conditionId1Status.toNumber())
//            }catch(err){
//
//                console.error("\t >> Error: Unauthorized access to condition-1, dependencies have not fulfilled yet!")
//                const conditionId1State = await sla.getConditionStatus(serviceAgreementId, conditionKey1)
//                console.warn("\t >> Current State of condition-1: ", conditionId1State.toNumber())
//            }

            console.warn("\t >> Try to change the state of condition 4")
            console.info("\t >> wait for 2 sec condition 3 timeout")
            await sleep(2000);
            if (await sla.conditionTimedOut(serviceAgreementId, conditionKey4)){
                  console.info("yes")
            }else{
                console.warn("\t >> Condition-3 isn't timeout yet")

                try{
                    console.log('\x1b[36m%s\x1b[0m',"\t >> Set 4th condition status to 0 by contract address: ", contract4, " Fingerprint: ",fingerprint4)
                    console.log("\t >> Reconstruct condition-4 authorized hash")
                    const condition4 = "0x"+abi.soliditySHA3([ 'bytes32', 'bytes32'], [conditionKey4, valHash4]).toString('hex')
                    console.log("\t >> Hash(ConditionKey, ValueHash): ", condition4)
                    const cond4 = await sla.setConditionStatus(serviceAgreementId, fingerprint4, valHash4, 0 ,{ from: contract4 })

                    const conditionId4Status = await sla.getConditionStatus(serviceAgreementId, conditionKey4)
                    assert.strictEqual(cond4.logs[0].args.state.toNumber(), conditionId4Status.toNumber(), "Invalid condition state")
                    console.log('\x1b[36m%s\x1b[0m',"\t >> Condition 4 status: ", conditionId4Status.toNumber())
                }catch(err){
                    console.error("\t >> Error: Unauthorized access for condition 4 state, wait for timeout")

                }
            }
            console.info("\t >> wait for 30 sec, the actual condition 3 timeout")
            await sleep(30000);

            if (await sla.conditionTimedOut(serviceAgreementId, conditionKey4)){

                const conditionId4Status = await sla.getConditionStatus(serviceAgreementId, conditionKey4)
                console.log('\x1b[36m%s\x1b[0m',"\t >> Condition 4 status: ", conditionId4Status.toNumber())

                if((conditionId4Status.toNumber() == -1 || conditionId4Status.toNumber() == 0) && conditionId2Status.toNumber() == 1){
                    console.info("\t >> Set condition-1 to true if condition2=1 and condition4=0")
                    console.log("\t >> Reconstruct condition-1 authorized hash")
                    const condition1 = "0x"+abi.soliditySHA3([ 'bytes32', 'bytes32'], [conditionKey1, valHash1]).toString('hex')
                    console.log("\t >> Hash(ConditionKey, ValueHash): ", condition1)
                    const cond1 = await sla.setConditionStatus(serviceAgreementId, fingerprint1, valHash1, 1 ,{ from: contract1 })
                    const conditionId1Status = await sla.getConditionStatus(serviceAgreementId, conditionKey1)
                    assert.strictEqual(cond1.logs[0].args.state.toNumber(), conditionId1Status.toNumber(), "Invalid condition state")
                    console.log('\x1b[36m%s\x1b[0m',"\t >> Condition 1 status: ", conditionId1Status.toNumber())

                }else{
                    console.error("\t >> Condition 1 don't match the state")
                }
            }else{
                console.warn("\t >> Condition-4 isn't timeout yet")
            }

//
//                console.log('\x1b[36m%s\x1b[0m',"\t >> Set 4th condition status to 0 by contract address: ", contract4, " Fingerprint: ",fingerprint4)
//                console.log("\t >> Reconstruct condition-4 authorized hash")
//                const condition4 = "0x"+abi.soliditySHA3([ 'bytes32', 'bytes32'], [conditionKey4, valHash4]).toString('hex')
//                console.log("\t >> Hash(ConditionKey, ValueHash): ", condition4)
//                const cond4 = await sla.setConditionStatus(serviceAgreementId, fingerprint4, valHash4, 0 ,{ from: contract4 })


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
