/* eslint-disable no-console */
const { loadWallet } = require('@oceanprotocol/dori')
const sendTransaction = require('./../sendTransaction.js')

async function submitTransactions({
    web3,
    artifacts,
    addressBook,
    roles,
    verbose = true
} = {}) {
    if (
        addressBook.TemplateStoreManager &&
        addressBook.LockRewardCondition &&
        addressBook.EscrowReward &&
        addressBook.AccessSecretStoreCondition &&
        addressBook.ComputeExecutionCondition
        )
    {

        // step 1: register actor provider
        const ConditionStoreManager = artifacts.require('ConditionStoreManager')
        const ConditionStoreManagerInstance = await ConditionStoreManager.at(addressBook.ConditionStoreManager)

        const TemplateStoreManager = artifacts.require('TemplateStoreManager')
        const TemplateStoreManagerInstance = await TemplateStoreManager.at(addressBook.TemplateStoreManager)

        var isTemplateApproved = false

        if (verbose) {
            console.log(
                `Registering actor type  ${roles.deployer}`
            )
        }

        console.log(
            `Is Owner ${roles.ownerWallet} ? ${await TemplateStoreManagerInstance.owner()} `
        )
        // step 1. register provider actor type
//        const calldata = [
//            'registerTemplateActorType',
//            ['string'],
//            ['provider']
//        ]

        const ownerWallet = await loadWallet(
            web3,
            'owner',
            verbose
        )

        const contractName = 'TemplateStoreManager'
        const contractAddress = addressBook.TemplateStoreManager

//        const transactionId = await sendTransaction({
//            web3,
//            artifacts,
//            roles,
//            contractAddress,
//            contractName,
//            calldata,
//            ownerWallet,
//            verbose
//        })
//
//        if (verbose) {
//            console.log(`Contract  ${addressBook[contractName]} has a transaction Id: ${transactionId}`)
//        }
        //TODO: MULTISIG: confirm trx using multi-sig
        // step 2: register actor type  consumer

//        const calldata = [
//            'registerTemplateActorType',
//            ['string'],
//            ['consumer']
//        ]
//        const transactionId = await sendTransaction({
//            web3,
//            artifacts,
//            roles,
//            contractAddress,
//            contractName,
//            calldata,
//            ownerWallet,
//            verbose
//        })
//
//        if (verbose) {
//            console.log(`Contract  ${addressBook[contractName]} has a transaction Id: ${transactionId}`)
//        }

        //TODO: MULTISIG: confirm trx using multi-sig
        // setp 3. get actor type ids
        const consumerActorTypeId = await TemplateStoreManagerInstance.getTemplateActorTypeId('consumer')
        const providerActorTypeId = await TemplateStoreManagerInstance.getTemplateActorTypeId('provider')
        console.log(
            `consumer actor type Id: ${consumerActorTypeId} `
        )

        console.log(
            `provider actor type Id: ${providerActorTypeId}`
        )

        // step 4. generate template Id
        const escrowAccessSecretStoreTemplateId = await TemplateStoreManagerInstance.generateId('EscrowAccessSecretStoreTemplate')

        console.log(
            `EscrowAccessSecretStoreTemplate Id: ${escrowAccessSecretStoreTemplateId}`
        )

        const escrowComputeExecutionTemplateId = await TemplateStoreManagerInstance.generateId('EscrowComputeExecutionTemplate')

        console.log(
            `EscrowComputeExecutionTemplate Id: ${escrowComputeExecutionTemplateId}`
        )
        // step 5. propose template

          // EscrowAccessSecretStore Conditions
//        const conditionTypes = [
//            addressBook.LockRewardCondition,
//            addressBook.AccessSecretStoreCondition,
//            addressBook.EscrowReward
//        ]

//        const calldata = [
//            'proposeTemplate',
//            ['bytes32','address[]','bytes32[]','string'],
//            [
//                escrowAccessSecretStoreTemplateId,
//                conditionTypes,
//                [
//                    providerActorTypeId,
//                    consumerActorTypeId
//                ],
//                'EscrowAccessSecretStoreTemplate'
//            ]
//        ]



        // TODO: No multi-sig should be used for proposal
//        await TemplateStoreManagerInstance.proposeTemplate(
//            escrowAccessSecretStoreTemplateId,
//            conditionTypes,
//            [
//                providerActorTypeId,
//                consumerActorTypeId
//            ],
//            'EscrowAccessSecretStoreTemplate'
//        )

        // EscrowComputeTemplate conditions
//        const conditionTypes = [
//            addressBook.LockRewardCondition,,
//            addressBook.ComputeExecutionCondition,
//            addressBook.EscrowReward
//        ]
//
//        await TemplateStoreManagerInstance.proposeTemplate(
//            escrowComputeExecutionTemplateId,
//            conditionTypes,
//            [
//                providerActorTypeId,
//                consumerActorTypeId
//            ],
//            'EscrowComputeExecutionTemplate'
//        )



//        const transactionId = await sendTransaction({
//            web3,
//            artifacts,
//            roles,
//            contractAddress,
//            contractName,
//            calldata,
//            ownerWallet,
//            verbose
//        })
//
//       if (verbose) {
//            console.log(`Contract  ${addressBook[contractName]} has a transaction Id: ${transactionId}`)
//       }

        //TODO: MULTISIG: confirm trx using multi-sig
        // step 6. get EscrowAccessSecretStore template template

//        console.log(
//            await TemplateStoreManagerInstance.getTemplate(escrowAccessSecretStoreTemplateId)
//        )
//
//        //  step 7. approve template
//        const calldata = [
//            'approveTemplate',
//            ['bytes32'],
//            [escrowAccessSecretStoreTemplateId]
//        ]

//        const calldata = [
//            'approveTemplate',
//            ['bytes32'],
//            [escrowComputeExecutionTemplateId]
//        ]
//        const transactionId = await sendTransaction({
//            web3,
//            artifacts,
//            roles,
//            contractAddress,
//            contractName,
//            calldata,
//            ownerWallet,
//            verbose
//        })

        //TODO: MULTISIG: confirm trx using multi-sig
        isTemplateApproved = await TemplateStoreManagerInstance.isTemplateIdApproved(escrowAccessSecretStoreTemplateId)
        console.log(
            `Is Escrow Access Secret Store template approved ? ${isTemplateApproved}`
        )

        isTemplateApproved = await TemplateStoreManagerInstance.isTemplateIdApproved(escrowComputeExecutionTemplateId)
        console.log(
            `Is Escrow Compute Execution template approved ? ${isTemplateApproved}`
        )
    }
}

module.exports = submitTransactions
