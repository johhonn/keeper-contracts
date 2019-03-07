FROM ubuntu:18.04

LABEL name=Manticore
LABEL src="https://github.com/trailofbits/manticore"
LABEL creator="Trail of Bits"
LABEL dockerfile_maintenance=trailofbits

ENV LANG C.UTF-8

RUN apt-get -y update && DEBIAN_FRONTEND=noninteractive apt-get -y install z3 python3 python3-pip git wget
RUN pip3 install capstone unicorn

# Install solc 0.5.3
RUN wget https://github.com/ethereum/solidity/releases/download/v0.5.3/solc-static-linux \
    && chmod +x solc-static-linux \
    && mv solc-static-linux /usr/bin/solc

# Install Manticore from dev-truffle-artifacts branch
RUN git clone https://github.com/trailofbits/manticore.git \
    && cd manticore \
    && git checkout dev-truffle-artifacts \
    && python3 setup.py install

CMD ["/bin/bash"]
