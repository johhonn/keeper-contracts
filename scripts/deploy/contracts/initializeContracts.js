/* eslint-disable no-console */
const zosCreate = require('./zos/setup/create')

async function initializeContracts(
    contracts,
    roles,
    verbose = true
) {
    // Deploy all implementations in the specified network.
    // NOTE: Creates another zos.<network_name>.json file, specific to the network used,
    // which keeps track of deployed addresses, etc.

    // Here we run initialize which replace contract constructors
    // Since each contract initialize function could be different we can not use a loop
    // NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
    // instance=MyContract.at(proxyAddress)

    const addressBook = {}

    // WARNING!
    // use this only when deploying a selective portion of the contracts
    // Only use this if you know what you do, otherwise it can break the contracts deployed
    const proxies = {}

    // returns either the address from the address book or the address of the manual set proxies
    const getAddress = (contract) => {
        return addressBook[contract] || proxies[contract]
    }

    if (contracts.indexOf('DIDRegistry') > -1) {
        addressBook['DIDRegistry'] = zosCreate(
            'DIDRegistry',
            [roles.ownerWallet],
            verbose
        )
    }

    if (contracts.indexOf('OceanToken') > -1) {
        addressBook['OceanToken'] = zosCreate(
            'OceanToken',
            [
                roles.ownerWallet,
                roles.deployer
            ],
            verbose
        )
    }

    if (getAddress('OceanToken')) {
        if (contracts.indexOf('Dispenser') > -1) {
            addressBook['Dispenser'] = zosCreate(
                'Dispenser',
                [
                    getAddress('OceanToken'),
                    roles.ownerWallet
                ],
                verbose
            )
        }
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        addressBook['ConditionStoreManager'] = zosCreate(
            'ConditionStoreManager',
            [roles.deployer],
            verbose
        )
    }

    if (contracts.indexOf('TemplateStoreManager') > -1) {
        addressBook['TemplateStoreManager'] = zosCreate(
            'TemplateStoreManager',
            [roles.deployer],
            verbose
        )
    }

    if (getAddress('ConditionStoreManager')) {
        if (contracts.indexOf('SignCondition') > -1) {
            addressBook['SignCondition'] = zosCreate(
                'SignCondition',
                [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            )
        }

        if (contracts.indexOf('HashLockCondition') > -1) {
            addressBook['HashLockCondition'] = zosCreate(
                'HashLockCondition',
                [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            )
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('TemplateStoreManager') &&
        getAddress('DIDRegistry')) {
        if (contracts.indexOf('AgreementStoreManager') > -1) {
            addressBook['AgreementStoreManager'] = zosCreate(
                'AgreementStoreManager',
                [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('TemplateStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            )
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('OceanToken')) {
        if (contracts.indexOf('LockRewardCondition') > -1) {
            addressBook['LockRewardCondition'] = zosCreate(
                'LockRewardCondition',
                [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('OceanToken')
                ],
                verbose
            )
        }

        if (contracts.indexOf('EscrowReward') > -1) {
            addressBook['EscrowReward'] = zosCreate(
                'EscrowReward',
                [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('OceanToken')
                ],
                verbose
            )
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('AgreementStoreManager')) {
        if (contracts.indexOf('AccessSecretStoreCondition') > -1) {
            addressBook['AccessSecretStoreCondition'] = zosCreate(
                'AccessSecretStoreCondition',
                [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('AgreementStoreManager')
                ],
                verbose
            )
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('DIDRegistry') &&
        getAddress('AccessSecretStoreCondition') &&
        getAddress('LockRewardCondition') &&
        getAddress('EscrowReward')) {
        if (contracts.indexOf('EscrowAccessSecretStoreTemplate') > -1) {
            addressBook['EscrowAccessSecretStoreTemplate'] = zosCreate(
                'EscrowAccessSecretStoreTemplate',
                [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('AccessSecretStoreCondition'),
                    getAddress('LockRewardCondition'),
                    getAddress('EscrowReward')
                ],
                verbose
            )
        }
    }

    return addressBook
}

module.exports = initializeContracts
