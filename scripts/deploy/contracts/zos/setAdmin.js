/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

async function setAdmin(
    contracts,
    roles,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    /*
    * -----------------------------------------------------------------------
    * Change admin privileges to multisig
    * -----------------------------------------------------------------------
    */
    if (verbose) {
        console.log(`Setting zos-admin to MultiSigWallet '${roles.upgraderWallet}'`)
    }

    for (const contractName of contracts) {
        execSync(`npx zos set-admin ${contractName} ${roles.upgraderWallet} --yes ${flags}`)
    }

    execSync(`npx zos session --close ${flags}`)
}

module.exports = setAdmin
