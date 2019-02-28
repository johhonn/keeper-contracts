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

    for (const contract of contracts) {
        execSync(`npx zos set-admin ${contract} ${roles.upgraderWallet} --yes ${flags}`)
    }
}

module.exports = setAdmin
