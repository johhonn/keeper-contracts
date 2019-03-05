/* eslint-disable no-console */
/* global web3 */
const contract = require('truffle-contract')
const network = process.env.NETWORK || 'development'
const oceanTokenArtifact = require(`../../artifacts/OceanToken.${network}.json`)
const OceanToken = contract({ abi: oceanTokenArtifact.abi })

async function calculate(
    amount
) {
    OceanToken.setProvider(web3.currentProvider)
    const OceanTokenInstance = await OceanToken.at(oceanTokenArtifact.address)
    const vodka = amount * 10 ** await OceanTokenInstance.decimals()

    console.log(`${amount} OceanToken is ${vodka} Vodka`)
}

module.exports = (cb) => {
    const amount = process.argv.splice(4)[0]

    if (!amount) {
        throw new Error('no amount given')
    }

    calculate(amount)
        .then(() => cb())
        .catch(err => cb(err))
}
