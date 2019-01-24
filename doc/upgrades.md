# Keeper-contracts upgradability

This documents explains in detail how [keeper-contracts](https://github.com/oceanprotocol/keeper-contracts) should be deployed using zeppelinOS and how the contracts can be upgraded. The latest section describes the test procedure.

## Quickstart

The first step to work with `zos` is to install dependencies then initialize the project. Then compile contracts and add contracts to the project. Finally push the contracts into the network and create the  upgradable instances. Once the contracts are deployed they can be tested and upgraded. Also we change the proxy administrator to a MultiSignature wallet to approve upgrades. To deploy the contracts we use a [deployment script](../scripts/deployContracts.js), for more details on each step please keep reading.

## Details

Here we provide more details into each step of the initial deploy and the approach of upgradability and governance.

## Initial Deploy

Install dependencies

```console
$npm install
```

`zos` does not support migrations, hence all the initial configuration should be performed with a [deployment script](../scripts/deployContracts.js). Contract constructors are ignored so the initial setup of the contract should be made in a [`initialize`](https://docs.zeppelinos.org/docs/advanced.html#initializers-vs-constructors) function that will be executed only once after the initial deployment.

To get started first we initialize the zeppelin applications which will create a configuration file [`zos.json`](https://docs.zeppelinos.org/docs/advanced.html#format-of-zosjson-and-zos-network-json-files) that keeps track of the project's details. we use the command [`zos init`](https://docs.zeppelinos.org/docs/init.html)


```console
$npx zos init oceanprotocol 0.1.poc -v
[ZosPackageFile] Successfully written zos.json
```

Once the project is initializes we need to register all contracts in the project as upgradable contracts with the command [`zos add`](https://docs.zeppelinos.org/docs/add.html)

```console
$npx zos add DIDRegistry -v --skip-compile
[LocalController] Adding DIDRegistry
[ZosPackageFile] Successfully written zos.json
```

Next we need to deploy all contracts to the the specified network with [`zos push`](https://docs.zeppelinos.org/docs/push.html). This will Creates another configuration file  `zos.<network_name>.json`, specific to the network used, which keeps track of deployed addresses.

```console
$npx zos push --network development --skip-compile  -v
Validating contract DIDRegistry
Uploading DIDRegistry contract as DIDRegistry
Deploying logic contract for DIDRegistry
Created zos.dev-1545416723029.json
```

Finally, we need to create a proxy for the deployed contracts. Its important to note that we will be using the proxies and not the deployed contracts and the proxies will delegate to the deployed contracts. When creating the proxies the initialize function is invoked, this function can only be called once.

```console
$npx zos create DIDRegistry --network development --init initialize --args 0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1 -v
[SimpleProject] Creating proxy to logic contract 0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab and initializing by calling initialize with:
 - _owner (address): "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"
[SimpleProject] Instance created at 0x5b1869d9a4c187f2eaa108f3062412ecf0526b24
[ZosNetworkFile] Updated zos.dev-1545416723029.json
```

 A dApp could now use the address of the proxy specified in zos.<network_name>.json with `instance=DIDRegistry.at(0x5b1869d9a4c187f2eaa108f3062412ecf0526b24)`

### Governance

For governance [gnosis multisignature wallet](https://github.com/gnosis/MultiSigWallet) is used. This contract can be replaced with any contract that provides the desired behavior. The test script will create an instance and will give voting rights to the test accounts. When deploying to mainnet the wallet needs to be created accordingly. To change the admin of the proxies to the multisig wallet we use [`zos set-admin`](https://docs.zeppelinos.org/docs/cli_set-admin.html)

```console
$npx zos set-admin DIDRegistry 0xC89Ce4735882C9F0f0FE26686c53074E09B0D550 --network development --yes
Proxy 0x5b1869d9a4c187f2eaa108f3062412ecf0526b24 admin changed to 0xC89Ce4735882C9F0f0FE26686c53074E09B0D550
Updated zos.dev-1545416723029.json
```

### Upgradability

To upgrade a contract we need to use the `zos` tool. The script after deployment grants admin rights to the wallet rather than to the account that made the deployment. For each upgrade zeppelin is used to submit the upgrade and the multisig wallet is used to approve the upgrade. First we need to add and push the new contract as we did before.

```console
$npx zos add DIDRegistryExtraFunctionality:DIDRegistry --skip-compile -v
Adding DIDRegistry:DIDRegistryExtraFunctionality
Successfully written zos.json
$npx zos push --skip-compile --network development
Validating contract DIDRegistryExtraFunctionality
Uploading DIDRegistryExtraFunctionality contract as DIDRegistry
Deploying logic contract for DIDRegistryExtraFunctionality
Updated zos.dev-1545416723029.json
```

`DIDRegistry:DIDRegistryExtraFunctionality` can be simply `DIDRegistry` if the modified contract has the same name as the original. Once the new contract its deployed we can submit the upgrade request to the multisig wallet. To submit and approve the upgrade we use the following js script

```js
const encodeCall = require('zos-lib').encodeCall;
//request upgrade
async upgradeToNewContract(implementationAddress) {
    const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress]);
    let tx = await wallet.submitTransaction(this.proxyAddress, 0, upgradeCallData, { from: this.owner });
    // store transaction id to approve later
    return tx.logs[0].args.transactionId.toNumber();
}
//approve upgrade
async approveLatestTransaction(txID) {
    await this.wallet.confirmTransaction(txID, { from: this.users[0] });
}
```

### Test

To test the contract upgradability the following commands should be run

```console
$npx truffle compile
$npx truffle exec scripts/setupWalletWrapper.js
$npx truffle test test/upgradability/DIDRegistry.Test.js
```

to run all test the simple run

```console
$npx truffle compile
$npm run test
```

The test script will setup a multisig wallet, run the deployment script after setting the testing parameters and change proxies admin. After each test the contract is downgraded to the initial version.
