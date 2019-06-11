/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const TIMEOUT = 1 * 60 * 60 // 1 hour

async function registerContracts(
    contracts,
    force,
    verbose = true
) {
    const flags = verbose ? '-v' : '-s'

    execSync(`npx zos add ${contracts.join(' ')} --skip-compile ${flags}`)

    // push them using zos
    execSync(`npx zos push ${force ? ' --force' : ''} --skip-compile ${flags} --timeout ${TIMEOUT}`)
}

module.exports = registerContracts
