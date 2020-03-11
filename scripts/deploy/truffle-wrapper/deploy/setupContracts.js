/* eslint-disable no-console */
const  registerActor = require('../templates/registerActor')

async function approveTemplate({
    TemplateStoreManagerInstance,
    roles,
    templateId
} = {}) {
    if (await TemplateStoreManagerInstance.isOwner({ from: roles.owner })) {
        await TemplateStoreManagerInstance.approveTemplate(
            templateId,
            { from: roles.owner }
        )
    } else {
        // todo: make call to multi sig wallet here instead of warning!
        console.log('=====================================================================================')
        console.log(`WARNING: Template ${templateId} could not be approved!`)
        console.log('The deployer is not anymore the owner of the TemplateStoreManager ')
        console.log('=====================================================================================')
    }
}

async function transferOwnership({
    ContractInstance,
    name,
    roles,
    verbose
} = {}) {
    if (verbose) {
        console.log(
            `Transferring ownership of ${name} from ${roles.deployer} to ${roles.ownerWallet}`
        )
    }

    if (await ContractInstance.isOwner({ from: roles.deployer })) {
        await ContractInstance.transferOwnership(
            roles.ownerWallet,
            { from: roles.deployer }
        )
    } else {
        console.log('=====================================================================================')
        console.log('WARNING: Ownership was not transferred!')
        console.log(`The deployer is not anymore the owner of the ${name} `)
        console.log('=====================================================================================')
    }
}

async function setupContracts({
    web3,
    artifacts,
    addressBook,
    roles,
    verbose = true,
    disableSetup = true,
} = {}) {
    console.log(addressBook)
    if (addressBook.TemplateStoreManager &&
                addressBook.LockRewardCondition &&
                addressBook.EscrowReward &&
                addressBook.AccessSecretStoreCondition &&
                addressBook.ComputeExecutionCondition
            )
    {
        const ConditionStoreManager = artifacts.require('ConditionStoreManager')
        const ConditionStoreManagerInstance = await ConditionStoreManager.at(addressBook.ConditionStoreManager)

        const TemplateStoreManager = artifacts.require('TemplateStoreManager')
        const TemplateStoreManagerInstance = await TemplateStoreManager.at(addressBook.TemplateStoreManager)

        // transfer ownership from ownerWallet to deployer

        if (!disableSetup){
            /*
             * -----------------------------------------------------------------------
             * setup deployed contracts
             * -----------------------------------------------------------------------
             */
             var isTemplateApproved = false

             if (verbose) {
                console.log(
                    `Proposing template EscrowAccessSecretStore from ${roles.deployer}`
                )
             }

             const actors = [
                'provider',
                'consumer'
             ]

             let taskBook = {}

             for (const actorType of actors) {
                if(addressBook.TemplateStoreManager && roles.upgrader) {
                    taskBook[actorType] = await registerActor(
                                        addressBook.TemplateStoreManager,
                                        roles.upgrader,
                                        actorType,
                                        contractName = 'TemplateStoreManager',
                                        verbose = true
                                    )
                }
             }

             console.log(taskBook)
                //                await TemplateStoreManagerInstance.registerTemplateActorType(
                //                    'consumer',
                //                    {
                //                        from: roles.deployer
                //                    }
                //                )

//                const providerActorTypeId = await TemplateStoreManagerInstance.getTemplateActorTypeId(
//                    'provider',
//                    { from: roles.deployer }
//                )
//
//                console.log(providerActorTypeId)
//
//                await TemplateStoreManagerInstance.registerTemplateActorType(
//                    'consumer',
//                    {
//                        from: roles.deployer
//                    }
//                )
//
//                const consumerActorTypeId = await TemplateStoreManagerInstance.getTemplateActorTypeId(
//                    'consumer',
//                    { from: roles.deployer }
//                )
//                const actorTypeIds = [
//                    providerActorTypeId,
//                    consumerActorTypeId
//                ]
//
//                const EscrowAccessConditionTypes = [
//                    addressBook.LockRewardCondition,
//                    addressBook.AccessSecretStoreCondition,
//                    addressBook.EscrowReward
//                ]
//
//                const escrowAccessSecretStoreTemplateId = await TemplateStoreManagerInstance.generateId('EscrowAccessSecretStoreTemplate')
//
//                await TemplateStoreManagerInstance.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
//                    escrowAccessSecretStoreTemplateId,
//                    EscrowAccessConditionTypes,
//                    actorTypeIds,
//                    'EscrowAccessSecretStoreTemplate',
//                    { from: roles.deployer }
//                )
//
//                await approveTemplate({
//                    TemplateStoreManagerInstance: TemplateStoreManagerInstance,
//                    roles: roles,
//                    templateId: escrowAccessSecretStoreTemplateId
//                })
//
//                if (verbose) {
//                    isTemplateApproved = await TemplateStoreManagerInstance.isTemplateIdApproved(escrowAccessSecretStoreTemplateId)
//                    if (isTemplateApproved) {
//                        console.log(
//                            `EscrowAccessSecretStore has been approved successfully by ${roles.deployer}`
//                        )
//                    } else {
//                        console.log(
//                            `EscrowAccessSecretStore failed to approve by ${roles.deployer}`
//                        )
//                    }
//                    isTemplateApproved = false
//                }
//                // EscrowComputeExecution Template
//                if (verbose) {
//                    console.log(
//                        `Proposing template EscrowComputeExecution from ${roles.deployer}`
//                    )
//                }
//
//                const escrowComputeExecutionTemplateId = await TemplateStoreManagerInstance.generateId(
//                    'EscrowComputeExecutionTemplate',
//                    { from: roles.deployer }
//                )
//
//                const EscrowComputeConditionTypes = [
//                    addressBook.LockRewardCondition,
//                    addressBook.ComputeExecutionCondition,
//                    addressBook.EscrowReward
//                ]
//
//                await TemplateStoreManagerInstance.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
//                    escrowComputeExecutionTemplateId,
//                    EscrowComputeConditionTypes,
//                    actorTypeIds,
//                    'EscrowComputeExecutionTemplate',
//                    { from: roles.deployer }
//                )
//
//                await approveTemplate({
//                    TemplateStoreManagerInstance: TemplateStoreManagerInstance,
//                    roles: roles,
//                    templateId: escrowComputeExecutionTemplateId
//                })
//
//                if (verbose) {
//                    isTemplateApproved = await TemplateStoreManagerInstance.isTemplateIdApproved(escrowComputeExecutionTemplateId)
//                    if (isTemplateApproved) {
//                        console.log(
//                            `EscrowComputeExecution has been approved successfully by ${roles.deployer}`
//                        )
//                    } else {
//                        console.log(
//                            `EscrowComputeExecution failed to approve by ${roles.deployer}`
//                        )
//                    }
//                    isTemplateApproved = false
//                }
//
//            if (addressBook.ConditionStoreManager) {
//
//                if (addressBook.AgreementStoreManager) {
//                    if (verbose) {
//                        console.log(
//                            `Delegating create role to ${addressBook.AgreementStoreManager}`
//                        )
//                    }
//
//                    await ConditionStoreManagerInstance.delegateCreateRole(
//                        addressBook.AgreementStoreManager,
//                        { from: roles.deployer }
//                    )
//                }
//            }
//
//            if (addressBook.OceanToken) {
//                const OceanToken = artifacts.require('OceanToken')
//                const oceanToken = await OceanToken.at(addressBook.OceanToken)
//
//                if (addressBook.Dispenser) {
//                    if (verbose) {
//                        console.log(
//                            `adding dispenser as a minter ${addressBook.Dispenser} from ${roles.deployer}`
//                        )
//                    }
//
//                    await oceanToken.addMinter(
//                        addressBook.Dispenser,
//                        { from: roles.deployer }
//                    )
//                }
//
//                if (verbose) {
//                    console.log(
//                        `Renouncing deployer as initial minter from ${roles.deployer}`
//                    )
//                }
//
//                await oceanToken.renounceMinter({ from: roles.deployer })
//            }
        } else {
            /*
                     * -----------------------------------------------------------------------
                     * Reset deployer account, because it will be left in a strange state
                     * sometimes by zeppelin os
                     * -----------------------------------------------------------------------
                     */
                    await web3.eth.sendTransaction({
                        from: roles.deployer,
                        to: roles.deployer,
                        value: 0,
                        nonce: await web3.eth.getTransactionCount(roles.deployer)
                    })

                    await transferOwnership({
                                    ContractInstance: ConditionStoreManagerInstance,
                                    name: ConditionStoreManager.contractName,
                                    roles,
                                    verbose
                                })

                    await transferOwnership({
                                    ContractInstance: TemplateStoreManagerInstance,
                                    name: TemplateStoreManager.contractName,
                                    roles,
                                    verbose
                                })
        }
    }
}

module.exports = setupContracts
