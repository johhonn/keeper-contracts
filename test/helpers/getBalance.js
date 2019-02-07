const Web3 = require('web3')
const constants = require('./constants.js')

const web3 = new Web3(new Web3.providers.HttpProvider(constants.keeper.nodeUrl))

const getBalance = async (token, address) => {
    return web3.utils.toDecimal(
        await token.balanceOf.call(address)
    )
}

module.exports = getBalance
