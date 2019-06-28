# Keeper-contracts upgradability

This documents explains in detail how [keeper-contracts](https://github.com/oceanprotocol/keeper-contracts) should be deployed using zeppelinOS and how the contracts can be upgraded. The latest section describes the test procedure.

## Quickstart

The first step to work with `zos` is to install dependencies then initialize the project. Then compile contracts and add contracts to the project. 
Finally push the contracts into the network and create the  upgradable instances. Once the contracts are deployed they can be tested and upgraded.
Also we change the proxy administrator to a MultiSignature wallet to approve upgrades.  We are going to use [dori](https://github.com/oceanprotocol/dori) in order to perform 
any future deployments/upgrades.

## Details

Here we provide more details into each step of the initial deploy and the approach of upgradeability and governance.


## Roles

Before going into more details about the deployment. We should differentiate between different roles in the system which 
govern the upgradeability in keeper-contracts.

Roles are defined as follows:

```
deployer: represented as accounts[0]
upgrader: represented as accounts[1]
upgraderWallet: represented as the upgrader from wallets.json
ownerWallet: represented as the owner from wallets.json
```
- **Deployer**: Can be any account. It is used for deploying the initial `proxy contracts` and the `logic contracts`.

- **Upgrader**: Has to be an `owner` of the `upgrader` multi sig wallet. It is used for issuing upgrade requests against the upgrader multi sig wallet.

- **UpgraderWallet**: One instance of the multi sig wallet, defined as `upgrader`. This wallet will be assigned as zos admin and is required to do upgrades.

- **OwnerWallet**: One instance of the multi sig wallet, defined as `owner`. This wallet will be assigned as the owner of all the contracts. It can be used to call specific functions in the contracts ie. change the configuration.

## Deploy & Upgrade
`zos` does not support migrations, hence all the initial configuration should be performed with a [dori](). 
Contract constructors are ignored so the initial setup of the contract should be made in a [`initialize`](https://docs.zeppelinos.org/docs/advanced.html#initializers-vs-constructors) 
function that will be executed only once after the initial deployment.

### 1. Configuration

[Dori]() checks the `contracts.json` in order to detect the current contracts that are going to be deployed:

```json
[
  "ConditionStoreManager",
  "TemplateStoreManager",
  "AgreementStoreManager",
  "SignCondition",
  "HashLockCondition",
  "LockRewardCondition",
  "AccessSecretStoreCondition",
  "EscrowReward",
  "EscrowAccessSecretStoreTemplate",
  "OceanToken",
  "DIDRegistry"
]
```

Moreover for each network, [dori]() needs to detect the roles and their addresses from a pre-defined wallets config file. 
The following configuration should be an example for `wallets-<NETWORK_NAME>.json`:

```json
[
    {
        "name": "upgrader",
        "address": "0x24eb26d4042a2ab576e7e39b87c3f33f276aef92"
    },
    {
        "name": "owner",
        "address": "0xd02d68c62401472ce35ba3c7e505deae62db2b8b"
    }
]
```

### 2. Preparation

The following commands clean, install dependencies and compile the contracts:
```console
$ npm run clean #to clean the work dir
$ npm i #install dependencies
$ npm run compile #to compile the contracts
```

### 3. Deploy & Upgrade

The following steps shows how to perform contracts deployment and upgrade on `Nile` and `Kovan` networks. 
#### Nile

- Copy the wallet file for `nile` 
  - `cp wallets_nile.json wallets.json`
- run `export MNEMONIC=<your nile mnemonic>`. You will find them in the password manager.

##### Deploy the whole application

- To deploy all contracts run `npm run deploy:nile`

##### Deploy a single contracts

- To deploy a single contract you need to specify the contracts to deploy as a parameter to the deploy script: ie. `npm run deploy:nile -- OceanToken Dispenser`will deploy `OceanToken` and `Dispenser`.

##### Upgrade the whole application

- To upgrade all contracts run `npm run upgrade:nile`

##### Upgrade a single contract

- To upgrade a single contract run `npm run upgrade:nile -- OceanToken`. For upgrading the `OceanToken` contract.

##### Persist artifacts

- Commit all changes in `artifacts/*.nile.json`

#### Kovan

- Copy the wallet file for `kovan` > `cp wallets_kovan.json wallets.json`
- run `export MNEMONIC=<your kovan mnemonic>`. You will find them in the password manager.
- run `export INFURA_TOKEN=<your infura token>`. You will get it from `infura`.

##### Deploy the whole application

- To deploy all the contracts run `npm run deploy:kovan`

##### Deploy a single contracts

- To deploy a single contracts you need to specify the contracts to deploy as a parameter to the deploy script: ie. `npm run deploy:kovan -- OceanToken Dispenser` will deploy `OceanToken` and `Dispenser`.

##### Upgrade the whole application

- To upgrade all contracts run `npm run upgrade:kovan`

##### Upgrade a single contract

- To upgrade a single contract run `npm run upgrade:kovan -- OceanToken`. For upgrading the `OceanToken` contract.

##### Persist artifacts

- Commit all changes in `artifacts/*.kovan.json`

### 4. Approve Upgrade(s)



### 5. Audit Contracts

### 6. Documentation
