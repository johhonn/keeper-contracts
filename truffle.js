const HDWalletProvider = require('truffle-hdwallet-provider')
const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker')

const rpcHost = process.env.KEEPER_RPC_HOST
const rpcPort = process.env.KEEPER_RPC_PORT
const url = process.env.KEEPER_RPC_URL
// support MNEMONIC and NMEMORIC for some time to be backward compatible
const MNEMONIC = process.env.MNEMONIC || process.env.NMEMORIC

const hdWalletStartIndex = 0
const hdWalletAccounts = 5

let hdWalletProvider

const setupWallet = (
    url
) => {
    if (!hdWalletProvider) {
        hdWalletProvider = new HDWalletProvider(
            MNEMONIC,
            url,
            hdWalletStartIndex,
            hdWalletAccounts)
        hdWalletProvider.engine.addProvider(new NonceTrackerSubprovider())
    }
    return hdWalletProvider
}

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: rpcHost || 'localhost',
            port: rpcPort || 8545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6721975
        },
        // local network for generate coverage
        coverage: {
            host: 'localhost',
            // has to be '*' because this is usually ganache
            network_id: '*',
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        // spree from docker
        spree: {
            provider: () => setupWallet(
                url || `http://localhost:8545`
            ),
            network_id: 0x2324, // 8996
            gas: 8000000,
            gasPrice: 10000,
            from: '0xe2DD09d719Da89e5a3D0F2549c7E24566e947260'
        },
        // nile the ocean testnet
        nile: {
            provider: () => setupWallet(
                url || `https://nile.dev-ocean.com`
            ),
            network_id: 0x2323, // 8995
            gas: 6000000,
            gasPrice: 10000,
            from: '0x90eE7A30339D05E07d9c6e65747132933ff6e624'
        },
        // kovan testnet
        kovan: {
            provider: () => setupWallet(
                url || `https://kovan.infura.io/v2/${process.env.INFURA_TOKEN}`
            ),
            network_id: 0x2A, // 42
            from: '0x2c0D5F47374b130EE398F4C34DBE8168824A8616'
        },
        // rinkeby testnet
        rinkeby: {
            provider: () => setupWallet(
                url || `https://rinkeby.infura.io/v2/${process.env.INFURA_TOKEN}`
            ),
            network_id: 0x4, // 4
            from: '0x2C63bf697f74C72CFB727Fb5eB8e6266cE341e13'
        }
    },
    compilers: {
        solc: {
            version: '0.5.3',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
}
