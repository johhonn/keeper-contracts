/* eslint-disable no-console */
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')

const whitelist = [
    0x2324, // spree
    0x2323, // nile
    0x2A // kovan
]

async function cleanup(
    networkId,
    deep = false,
    deeper = false,
    verbose = true
) {
    const stuffToDelete = [
        './zos.json'
    ]

    if (deep) {
        if (verbose) {
            console.log(`Doing deep clean`)
        }

        stuffToDelete.push(
            './.zos.*' // this will clear the session
        )

        if (deeper) {
            if (verbose) {
                console.log(`Doing deeper clean`)
            }

            if (!whitelist.find((whitelistEntruy) => whitelistEntruy === networkId)) {
                stuffToDelete.push(
                    `./zos.dev-${networkId}.json`
                )
            }
        }
    }

    if (verbose) {
        console.log(`Deleting zos files: ${stuffToDelete.join(' ')}`)
    }

    execSync(`rm -f ${stuffToDelete.join(' ')}`, { stdio: 'ignore' })
}

module.exports = cleanup
