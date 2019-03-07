# Symbolic analysis with Manticore
## Preliminaries

Before starting: 
1. Install all the keeper contract requierements (`npm i`) and build them with truffle (`truffle build`). 
2. Install the latest revision of `dev-truffle-artifacts` branch of [Manticore](https://github.com/trailofbits/manticore). 

Keep in mind that symbolic execution can have high requirements of memory and CPU: in particular, these tests will use up to 10 cores at the same time and a few GBs of memory. 

## Run

To run the full suite of scripts, execute the `mcore.sh` script.

## Results

If you don't want to wait for the tests to run, you can take a look to a sample of the output produced by the tests in the [`results`](test/verification/manticore/results) directory.
