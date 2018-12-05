const HDWalletProvider = require('truffle-hdwallet-provider')

const rpcHost = process.env.KEEPER_RPC_HOST
const rpcPort = process.env.KEEPER_RPC_PORT
const url = process.env.KEEPER_RPC_URL

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: rpcHost || 'localhost',
            port: rpcPort || 8545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6000000
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
        // only used locally, i.e. docker
        ocean_poa_net_local_new: {
            provider: () => new HDWalletProvider(process.env.POA_NMEMORIC, url || `http://localhost:8545`),
            // poa from docker usually
            network_id: 0x2324,
            gas: 4500000
        },
        ocean_poa_net_local: {
            host: rpcHost,
            port: rpcPort,
            // poa from docker usually
            network_id: 0x2324,
            gas: 4500000,
            from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e'
        },
        // new aws instance of POA
        ocean_poa_aws: {
            provider: () => new HDWalletProvider(process.env.POA_NMEMORIC, url || `http://52.1.94.55:8545`),
            network_id: 0x2323,
            gas: 6000000,
            gasPrice: 10000,
            from: '0x90eE7A30339D05E07d9c6e65747132933ff6e624'
        },
        // kovan testnet
        kovan: {
            provider: () => new HDWalletProvider(process.env.KOVAN_NMEMORIC, url || `https://kovan.infura.io/v2/${process.env.INFURA_TOKEN}`),
            network_id: '42',
            from: '0x2c0d5f47374b130ee398f4c34dbe8168824a8616'
        }
    },
    compilers: {
        solc: {
            version: '0.4.25'
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
}
