/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

function create(
    contract,
    args,
    stfu = false
) {
    const initializerConfiguration = args ? `--init initialize --args ${args.join(',')}` : ''

    const flags = stfu ? '-s' : '-v'

    return execSync(`npx zos create ${contract} ${initializerConfiguration} ${flags}`)
        .toString()
        .trim()
}

module.exports = create
