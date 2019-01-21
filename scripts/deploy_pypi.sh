#!/bin/bash

pyenv global system 3.6.7
pip3 install --upgrade --user twine six==1.10.0 wheel==0.31.0 setuptools
shopt -s nullglob
abifiles=( ./artifacts/*.development.json )
[ "${#abifiles[@]}" -lt "1" ] && echo "ABI Files for development environment not found" && exit 1
python3 setup.py sdist bdist_wheel
twine upload dist/*
