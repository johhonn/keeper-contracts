/* eslint-disable no-console */
const { execSync } = require('child_process')
const verbose = true
const flags = verbose ? '-v' : '-s'

function zosCreate(
    contract,
    args
) {
    return execSync(`npx zos create ${contract} --init initialize --args ${args.join(',')} ${flags}`).toString().trim()
}

async function initializeContracts(
    artifacts,
    contracts,
    roles
) {
    // Deploy all implementations in the specified network.
    // NOTE: Creates another zos.<network_name>.json file, specific to the network used,
    // which keeps track of deployed addresses, etc.

    // Here we run initialize which replace contract constructors
    // Since each contract initialize function could be different we can not use a loop
    // NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
    // instance=MyContract.at(proxyAddress)

    const addressBook = {}

    // v0.7
    if (contracts.indexOf('DIDRegistry') > -1) {
        addressBook['DIDRegistry'] = zosCreate(
            'DIDRegistry',
            [roles.owner]
        )
    }

    if (contracts.indexOf('OceanToken') > -1) {
        addressBook['OceanToken'] = zosCreate(
            'OceanToken',
            [roles.owner, roles.initialMinter]
        )
    }

    if (addressBook['OceanToken']) {
        if (contracts.indexOf('Dispenser') > -1) {
            addressBook['Dispenser'] = zosCreate(
                'Dispenser',
                [addressBook['OceanToken'], roles.owner]
            )
        }
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        addressBook['ConditionStoreManager'] = zosCreate(
            'ConditionStoreManager',
            []
        )
    }

    if (contracts.indexOf('TemplateStoreManager') > -1) {
        addressBook['TemplateStoreManager'] = zosCreate(
            'TemplateStoreManager',
            [roles.owner]
        )
    }

    if (addressBook['ConditionStoreManager']) {
        if (contracts.indexOf('SignCondition') > -1) {
            addressBook['SignCondition'] = zosCreate(
                'SignCondition',
                [roles.owner, addressBook['ConditionStoreManager']]
            )
        }
        if (contracts.indexOf('HashLockCondition') > -1) {
            addressBook['HashLockCondition'] = zosCreate(
                'HashLockCondition',
                [roles.owner, addressBook['ConditionStoreManager']]
            )
        }
    }

    if (addressBook['ConditionStoreManager'] &&
        addressBook['TemplateStoreManager'] &&
        addressBook['DIDRegistry']) {
        if (contracts.indexOf('AgreementStoreManager') > -1) {
            addressBook['AgreementStoreManager'] = zosCreate(
                'AgreementStoreManager',
                [
                    roles.owner,
                    addressBook['ConditionStoreManager'],
                    addressBook['TemplateStoreManager'],
                    addressBook['DIDRegistry']
                ]
            )
        }
    }

    if (addressBook['ConditionStoreManager'] &&
        addressBook['OceanToken']) {
        if (contracts.indexOf('LockRewardCondition') > -1) {
            addressBook['LockRewardCondition'] = zosCreate(
                'LockRewardCondition',
                [
                    roles.owner,
                    addressBook['ConditionStoreManager'],
                    addressBook['OceanToken']
                ]
            )
        }
        if (contracts.indexOf('EscrowReward') > -1) {
            addressBook['EscrowReward'] = zosCreate(
                'EscrowReward',
                [
                    roles.owner,
                    addressBook['ConditionStoreManager'],
                    addressBook['OceanToken']
                ]
            )
        }
    }

    if (addressBook['ConditionStoreManager'] &&
        addressBook['AgreementStoreManager']) {
        if (contracts.indexOf('AccessSecretStoreCondition') > -1) {
            addressBook['AccessSecretStoreCondition'] = zosCreate(
                'AccessSecretStoreCondition',
                [
                    roles.owner,
                    addressBook['ConditionStoreManager'],
                    addressBook['AgreementStoreManager']
                ]
            )
        }
    }

    if (addressBook['AgreementStoreManager'] &&
        addressBook['DIDRegistry'] &&
        addressBook['AccessSecretStoreCondition'] &&
        addressBook['LockRewardCondition'] &&
        addressBook['EscrowReward']) {
        if (contracts.indexOf('EscrowAccessSecretStoreTemplate') > -1) {
            addressBook['EscrowAccessSecretStoreTemplate'] = zosCreate(
                'EscrowAccessSecretStoreTemplate',
                [
                    roles.owner,
                    addressBook['AgreementStoreManager'],
                    addressBook['DIDRegistry'],
                    addressBook['AccessSecretStoreCondition'],
                    addressBook['LockRewardCondition'],
                    addressBook['EscrowReward']
                ]
            )
        }
    }

    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */

    // TODO: @sebastian - please check
    if (addressBook['AgreementStoreManager']) {
        const ConditionStoreManager = artifacts.require('ConditionStoreManager')
        const conditionStoreManager = await ConditionStoreManager.at(addressBook['AgreementStoreManager'])
        await conditionStoreManager.initialize(
            roles.owner,
            addressBook['AgreementStoreManager'],
            { from: roles.upgrader })
    }

    if (addressBook['OceanToken']) {
        const OceanToken = artifacts.require('OceanToken')
        const oceanToken = await OceanToken.at(addressBook['OceanToken'])

        if (addressBook['Dispenser']) {
            console.log(`adding dispenser as a minter ${addressBook['Dispenser']} from ${roles.initialMinter}`)
            await oceanToken.addMinter(
                addressBook['Dispenser'],
                { from: roles.initialMinter })
        }

        console.log(`Renouncing initialMinter as a minter from ${roles.initialMinter}`)
        await oceanToken.renounceMinter({ from: roles.initialMinter })
    }

    /*
     * -----------------------------------------------------------------------
     * Change admin privileges to multisig
     * -----------------------------------------------------------------------
     */
    console.log(`Setting zos-admin to MultiSigWallet ${roles.admin}`)
    for (const contract of contracts) {
        execSync(`npx zos set-admin ${contract} ${roles.admin} --yes`)
    }

    return addressBook
}

module.exports = initializeContracts
