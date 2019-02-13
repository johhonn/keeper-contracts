pragma solidity ^0.5.3;

 contract DispatcherStorage {
  address public lib;
  address private owner;

   constructor(address newLib) public {
    owner = msg.sender;
    replace(newLib);
  }

   modifier onlyOwner() {
    require(msg.sender == owner, 'Must be owner');
    _;
  }

   function replace(address newLib) public onlyOwner /* onlyDAO */ {
    lib = newLib;
  }
}