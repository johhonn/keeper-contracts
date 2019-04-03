[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# keeper-contracts

> 💧 Integration of TCRs, CPM and Ocean Tokens in Solidity
> [oceanprotocol.com](https://oceanprotocol.com)

| Dockerhub | TravisCI | Ascribe | Greenkeeper |
|-----------|----------|---------|-------------|
|[![Docker Build Status](https://img.shields.io/docker/build/oceanprotocol/keeper-contracts.svg)](https://hub.docker.com/r/oceanprotocol/keeper-contracts/)|[![Build Status](https://api.travis-ci.com/oceanprotocol/keeper-contracts.svg?branch=master)](https://travis-ci.com/oceanprotocol/keeper-contracts)|[![js ascribe](https://img.shields.io/badge/js-ascribe-39BA91.svg)](https://github.com/ascribe/javascript)|[![Greenkeeper badge](https://badges.greenkeeper.io/oceanprotocol/keeper-contracts.svg)](https://greenkeeper.io/)|

---

**🐲🦑 THERE BE DRAGONS AND SQUIDS. This is in alpha state and you can expect running into problems. If you run into them, please open up [a new issue](https://github.com/oceanprotocol/keeper-contracts/issues). 🦑🐲**

---


## Table of Contents

  - [Get Started](#get-started)
     - [Docker](#docker)
     - [Local development](#local-development)
     - [Testnet deployment](#testnet-deployment)
        - [Nile Testnet](#nile-testnet)
        - [Kovan Testnet](#kovan-testnet)
  - [Libraries](#libraries)
  - [Testing](#testing)
     - [Code Linting](#code-linting)
  - [Documentation](#documentation)
  - [New Version / New Release](#new-version-new-release)
  - [Contributing](#contributing)
  - [Prior Art](#prior-art)
  - [License](#license)

---

## Get Started

For local development you can either use Docker, or setup the development environment on your machine.

### Docker

The most simple way to get started is with Docker:

```bash
git clone git@github.com:oceanprotocol/keeper-contracts.git
cd keeper-contracts/

docker build -t oceanprotocol/keeper-contracts:0.1 .
docker run -d -p 8545:8545 oceanprotocol/keeper-contracts:0.1
```

or simply pull it from docker hub:

```bash
docker pull oceanprotocol/keeper-contracts
docker run -d -p 8545:8545 oceanprotocol/keeper-contracts
```

Which will expose the Ethereum RPC client with all contracts loaded under localhost:8545, which you can add to your `truffle.js`:

```js
module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*',
            gas: 6000000
        },
    }
}
```

### Local development

As a pre-requisite, you need:

- Node.js >=6, <=v10.13.0
- npm

Clone the project and install all dependencies:

```bash
git clone git@github.com:oceanprotocol/keeper-contracts.git
cd keeper-contracts/

# install dependencies
npm i

# install RPC client globally
npm install -g ganache-cli
```

Compile the solidity contracts:

```bash
npm run compile
```

In a new terminal, launch an Ethereum RPC client, e.g. [ganache-cli](https://github.com/trufflesuite/ganache-cli):

```bash
ganache-cli
```

Switch back to your other terminal and deploy the contracts:

```bash
npm run deploy

# for redeployment run this instead
npm run clean
npm run compile
npm run deploy
```

Upgrade contract [**optional**]:
```bash
npm run upgrade <DEPLOYED_CONTRACT>:<NEW_CONTRACT>
```

### Testnet deployment

#### Nile Testnet

Follow the steps for local deployment. Make sure that the address [`0x90eE7A30339D05E07d9c6e65747132933ff6e624`](https://submarine.dev-ocean.com/address/0x90ee7a30339d05e07d9c6e65747132933ff6e624) is having enough (~1) Ether.

```bash
export MNEMONIC=<your nile mnemonic>
npm run deploy:nile
```

The transaction should show up on the account: [`0x90eE7A30339D05E07d9c6e65747132933ff6e624`](https://submarine.dev-ocean.com/address/0x90ee7a30339d05e07d9c6e65747132933ff6e624/transactions)

The contract addresses deployed on Ocean Nile testnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.9.1  | `0x45DE141F8Efc355F1451a102FB6225F1EDd2921d` |
| AgreementStoreManager             | v0.9.1  | `0x62f84700b1A0ea6Bfb505aDC3c0286B7944D247C` |
| ConditionStoreManager             | v0.9.1  | `0x39b0AA775496C5ebf26f3B81C9ed1843f09eE466` |
| DIDRegistry                       | v0.9.1  | `0x4A0f7F763B1A7937aED21D63b2A78adc89c5Db23` |
| DIDRegistryLibrary                | v0.9.1  | `0x3B3504908Db36f5D5f07CD420ee2BBBbDfB674cF` |
| Dispenser                         | v0.9.1  | `0x865396b7ddc58C693db7FCAD1168E3BD95Fe3368` |
| EpochLibrary                      | v0.9.1  | `0x34fa1530C0B1a2106Bf84E81Cd9D654087fB93d2` |
| EscrowAccessSecretStoreTemplate   | v0.9.1  | `0xfA16d26e9F4fffC6e40963B281a0bB08C31ed40C` |
| EscrowReward                      | v0.9.1  | `0xeD4Ef53376C6f103d2d7029D7E702e082767C6ff` |
| HashLockCondition                 | v0.9.1  | `0xB5f2e45e8aD4a1339D542f2defd5095B98054590` |
| LockRewardCondition               | v0.9.1  | `0xE30FC30c678437e0e8F78C52dE9db8E2752781a0` |
| OceanToken                        | v0.9.1  | `0x9861Da395d7da984D5E8C712c2EDE44b41F777Ad` |
| SignCondition                     | v0.9.1  | `0x5a4301F8a7a8A13485621b9B4C82B1E66c112ee2` |
| TemplateStoreManager              | v0.9.1  | `0x9768c8ae44f1dc81cAA98F48792aA5730cAd2F73` |

#### Kovan Testnet

Follow the steps for local deployment. Make sure that the address [`0x2c0d5f47374b130ee398f4c34dbe8168824a8616`](https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616) is having enough (~1) Ether.

If you managed to deploy the contracts locally do:

```bash
export INFURA_TOKEN=<your infura token>
export MNEMONIC=<your kovan mnemonic>
npm run deploy:kovan
```

The transaction should show up on: [`0x2c0d5f47374b130ee398f4c34dbe8168824a8616`](https://kovan.etherscan.io/address/0x2c0d5f47374b130ee398f4c34dbe8168824a8616)

The contract addresses deployed on Kovan testnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.9.1  | `0x9Ee06Ac392FE11f1933a51B48D1d07dd97f1dec7` |
| AgreementStoreManager             | v0.9.1  | `0x412d4F57425b41FE027e06b9f37D569dcAE2eAa4` |
| ConditionStoreManager             | v0.9.1  | `0xA5f5BaB34DE3782A71D37d0B334217Ded341cd64` |
| DIDRegistry                       | v0.9.1  | `0x9254f7c8f1176C685871E7A8A99E11e96775F488` |
| DIDRegistryLibrary                | v0.9.1  | `0xf6242973290aC0c45CbE4d242059E0DF6cdd2D54` |
| Dispenser                         | v0.9.1  | `0x5B92243133094210F504dF6B9D54fD70E7B281DC` |
| EpochLibrary                      | v0.9.1  | `0xe85BFc566F7876798Ec5DA7D037d9b28428F7182` |
| EscrowAccessSecretStoreTemplate   | v0.9.1  | `0xe0Afe9a948f9Fa39524c8d29a98d75409018ABf0` |
| EscrowReward                      | v0.9.1  | `0xa182ff844c71803Bf767c3AB4180B3bfFADa6B2B` |
| HashLockCondition                 | v0.9.1  | `0x11ef2D50868c1f1063ba0141aCD53691A0293c25` |
| LockRewardCondition               | v0.9.1  | `0x2a2A2C5fF51C5f1c84547FC7a194c00F82763432` |
| OceanToken                        | v0.9.1  | `0xB57C4D626548eB8AC0B82b086721516493E2908d` |
| SignCondition                     | v0.9.1  | `0x7B8B2756de9Ab474ddbCc87047117a2A16419194` |
| TemplateStoreManager              | v0.9.1  | `0xD20307e2620Bb8a60991f43c52b64f981103A829` |

## Libraries

To facilitate the integration of the Ocean Keeper Smart Contracts, Python and Javascript libraries are ready to be integrated. Those libraries include the Smart Contract ABI's.
Using these libraries helps to avoid compiling the Smart Contracts and copying the ABI's manually to your project. In that way the integration is cleaner and easier.
The libraries provided currently are:

* JavaScript npm package - As part of the [@oceanprotocol npm organization](https://www.npmjs.com/settings/oceanprotocol/packages), the [npm keeper-contracts package](https://www.npmjs.com/package/@oceanprotocol/keeper-contracts) provides the ABI's to be imported from your JavaScript code.
* Python Pypi package - The [Pypi keeper-contracts package](https://pypi.org/project/keeper-contracts/) provides the same ABI's to be used from Python.
* Java Maven package - It's possible to generate the maven stubs to interact with the smart contracts. It's necessary to have locally web3j and run the `scripts/maven.sh` script

## Testing

Run tests with `npm run test`, e.g.:

```bash
npm run test -- test/unit/agreements/AgreementStoreManager.Test.js
```

### Code Linting

Linting is setup for JavaScript with [ESLint](https://eslint.org) & Solidity with [Ethlint](https://github.com/duaraghav8/Ethlint).

Code style is enforced through the CI test process, builds will fail if there're any linting errors.

## Documentation

* [Main Documentation](doc/)
* [Keeper-contracts Diagram](doc/files/Keeper-Contracts.png)
* [Packaging of libraries](doc/packaging.md)
* [Upgrading contracts](doc/upgrades.md)

## New Version / New Release

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md)

## Contributing

See the page titled "[Ways to Contribute](https://docs.oceanprotocol.com/concepts/contributing/)" in the Ocean Protocol documentation.

## Prior Art

This project builds on top of the work done in open source projects:
- [zeppelinos/zos](https://github.com/zeppelinos/zos)
- [OpenZeppelin/openzeppelin-eth](https://github.com/OpenZeppelin/openzeppelin-eth)

## License

```
Copyright 2018 Ocean Protocol Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
