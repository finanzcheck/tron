#!/usr/bin/env bash

NODEJS_VERSION=2.3.0
NUM_PROCS=$(nproc)
UNAME_STR=$(uname)
SCRIPT_PWD=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

if [[ "$UNAME_STR" == 'Linux' ]]; then
    sudo apt-get update
    sudo apt-get upgrade -y
    sudo apt-get install -y libcec-dev cec-utils libavahi-compat-libdnssd-dev
    # chromium environment
    sudo apt-get install -y matchbox chromium x11-xserver-utils ttf-mscorefonts-installer xwit sqlite3 libnss3

    sudo cp ${SCRIPT_PWD}/xinitrc /boot/xinitrc
    sudo cp ${SCRIPT_PWD}/rc.local /etc/rc.local

    if ! grep -Fxq "## TRON ##" /boot/config.txt; then
        sudo -s "cat ${SCRIPT_PWD}/config.txt >> /boot/config.txt"
    fi

    if ! hash gpio 2>/dev/null; then
        CURRENT_PWD=$(pwd)

        cd /tmp
        git clone git://git.drogon.net/wiringPi
        cd wiringPi
        ./build

        cd ${CURRENT_PWD}
    fi

    if hash node 2>/dev/null; then
        echo "node found"
    else
        echo "node not found…installing io.js"

        CURRENT_PWD=$(pwd)

        cd /tmp
        wget https://nodejs.org/dist/v${NODEJS_VERSION}/iojs-v${NODEJS_VERSION}.tar.gz
        tar xvfz node-v${NODEJS_VERSION}.tar.gz
        cd node-v${NODEJS_VERSION}/
        ./configure && make -j ${NUM_PROCS} 2> build.err | tee build.log && sudo make install

        cd ${CURRENT_PWD}
    fi
elif [[ "$UNAME_STR" == 'Darwin' ]]; then
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

cd ${SCRIPT_PWD}/..
npm install

cd ${SCRIPT_PWD}
