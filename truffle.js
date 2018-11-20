const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: 'localhost',
            port: 8545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6000000
        },
        // only used locally, i.e. docker
        ocean_poa_net_local: {
            host: process.env.POA_HOST,
            port: 8545,
            // poa from docker usually
            network_id: 0x2324,
            gas: 4500000,
            from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e'
        },
        // old azure instance of POA
        ocean_poa_net: {
            host: '40.115.16.244',
            port: 8545,
            // todo: set to a real id
            network_id: '*',
            gas: 6000000,
            from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e'
        },
        // new aws instance of POA
        ocean_poa_aws: {
            host: '52.1.94.55',
            port: 8545,
            // poa from aws cloud
            network_id: 0x2323,
            gas: 6000000,
            gasPrice: 10000,
            from: '0x64137aF0104d2c96C44bb04AC06f09eC84CC5Ae4'
        },
        // kovan testnet
        kovan: {
            provider: () => new HDWalletProvider(process.env.KOVAN_NMEMORIC, `https://kovan.infura.io/v2/${process.env.INFURA_TOKEN}`),
            network_id: '42',
            from: '0x2c0d5f47374b130ee398f4c34dbe8168824a8616'
        },
        // local testnet for generate coverage
        coverage: {
            host: 'localhost',
            // has to be '*' because this is usually ganache
            network_id: '*',
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
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
