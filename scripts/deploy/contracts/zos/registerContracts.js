/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

async function registerContracts(
    contracts,
    force,
    stfu = false
) {
    const flags = stfu ? '-s' : '-v'

    execSync(`npx zos add ${contracts.join(' ')} --skip-compile ${flags}`)

    // push them using zos
    execSync(`npx zos push ${force ? ' --force' : ''} --skip-compile ${flags}`)
}

module.exports = registerContracts
