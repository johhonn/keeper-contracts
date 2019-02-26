/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

async function setAdmin(
    contracts,
    roles,
    stfu = false
) {
    const flags = stfu ? '-s' : '-v'

    /*
    * -----------------------------------------------------------------------
    * Change admin privileges to multisig
    * -----------------------------------------------------------------------
    */
    if (!stfu) {
        console.log(`Setting zos-admin to MultiSigWallet ${roles.upgraderWallet}`)
    }

    for (const contract of contracts) {
        execSync(`npx zos set-admin ${contract} ${roles.upgraderWallet} --yes ${flags}`)
    }
}

module.exports = setAdmin
