# Symbolic analysis with Manticore
## Preliminaries

1. Install Docker Engine
2. Pull Manticore docker image
```bash
$ docker pull oceanprotocol/manticore:solc-0.5.3
```

Keep in mind that symbolic execution can have high requirements of memory and CPU: in particular, these tests will use up to 10 cores at the same time and a few GBs of memory. 

## Run

```bash
$ npm run test:manticore
```

## Results

If you don't want to wait for the tests to run, you can take a look to a sample of the output produced by the tests in the [`results`](test/verification/manticore/results) directory.
