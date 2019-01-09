#!/bin/bash

shopt -s nullglob
python3 setup.py sdist bdist_wheel
ls -lah dist/
tar tvzf dist/keeper-contracts-*.tar.gz
twine upload dist/*

