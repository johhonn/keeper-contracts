/* eslint-disable no-console */

async function setupContracts(
    web3,
    artifacts,
    addressBook,
    roles,
    verbose = true
) {
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

    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */
    if (addressBook['TemplateStoreManager']) {
        const TemplateStoreManager =
            artifacts.require('TemplateStoreManager')
        const TemplateStoreManagerInstance =
            await TemplateStoreManager.at(addressBook['TemplateStoreManager'])

        if (addressBook['EscrowAccessSecretStoreTemplate']) {
            if (verbose) {
                console.log(
                    `Proposing template ${addressBook['EscrowAccessSecretStoreTemplate']} from ${roles.deployer}`
                )
            }

            await TemplateStoreManagerInstance.proposeTemplate(
                addressBook['EscrowAccessSecretStoreTemplate'],
                { from: roles.deployer }
            )

            if (verbose) {
                console.log(
                    `Approving template ${addressBook['EscrowAccessSecretStoreTemplate']} from ${roles.deployer}`
                )
            }

            await TemplateStoreManagerInstance.approveTemplate(
                addressBook['EscrowAccessSecretStoreTemplate'],
                { from: roles.deployer }
            )
        }

        if (verbose) {
            console.log(
                `TemplateStoreManager transferring ownership from ${roles.deployer} to ${roles.ownerWallet}`
            )
        }

        await TemplateStoreManagerInstance.transferOwnership(
            roles.ownerWallet,
            { from: roles.deployer }
        )
    }

    if (addressBook['ConditionStoreManager']) {
        const ConditionStoreManager = artifacts.require('ConditionStoreManager')
        const ConditionStoreManagerInstance =
            await ConditionStoreManager.at(addressBook['ConditionStoreManager'])

        if (addressBook['AgreementStoreManager']) {
            if (verbose) {
                console.log(
                    `Delegating create role to ${addressBook['AgreementStoreManager']}`
                )
            }

            await ConditionStoreManagerInstance.delegateCreateRole(
                addressBook['AgreementStoreManager'],
                { from: roles.deployer }
            )
        }

        if (verbose) {
            console.log(
                `ConditionStoreManager transferring ownership from ${roles.deployer} to ${roles.ownerWallet}`
            )
        }

        await ConditionStoreManagerInstance.transferOwnership(
            roles.ownerWallet,
            { from: roles.deployer }
        )
    }

    if (addressBook['OceanToken']) {
        const OceanToken = artifacts.require('OceanToken')
        const oceanToken = await OceanToken.at(addressBook['OceanToken'])

        if (addressBook['Dispenser']) {
            if (verbose) {
                console.log(
                    `adding dispenser as a minter ${addressBook['Dispenser']} from ${roles.deployer}`
                )
            }

            await oceanToken.addMinter(
                addressBook['Dispenser'],
                { from: roles.deployer }
            )
        }

        if (verbose) {
            console.log(
                `Renouncing deployer as initial minter from ${roles.deployer}`
            )
        }

        await oceanToken.renounceMinter({ from: roles.deployer })
    }
}

module.exports = setupContracts
