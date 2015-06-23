#!/usr/bin/env bash

IOJS_VERSION=2.3.1

unamestr=$(uname)
if [[ "$unamestr" == 'Linux' ]]; then
    sudo apt-get update
    sudo apt-get upgrade -y
    sudo apt-get install -y libcec-dev cec-utils

    if hash node 2>/dev/null; then
        echo "node found"
    else
        echo "node not found…installing io.js"
        sudo apt-get install -y gcc-4.8 g++-4.8

        sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.6 20
        sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 50
        sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.6 20
        sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 50

        CURRENT_PWD=$(pwd)

        cd /tmp
        wget https://iojs.org/dist/v${IOJS_VERSION}/iojs-v${IOJS_VERSION}.tar.gz
        tar xfvz iojs-v${IOJS_VERSION}.tar.gz
        cd iojs-v${IOJS_VERSION}/
        ./configure && make && sudo make install

        cd ${CURRENT_PWD}
    fi
elif [[ "$unamestr" == 'Darwin' ]]; then
    brew update
    brew upgrade --all
    brew install libcec

    if hash node 2>/dev/null; then
        echo "node found"
    else
        echo "node not found…installing io.js"
        brew install iojs
    fi
fi
