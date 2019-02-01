pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';

contract OceanToken is ERC20, ERC20Detailed {

    uint256 public INITIAL_SUPPLY = 10000000000000 * (10 ** uint256(decimals()));

    constructor() public ERC20Detailed('OceanToken', 'OCN', 18){
        _mint(msg.sender, INITIAL_SUPPLY);
    }

}