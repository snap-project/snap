#!/bin/bash

if [ ! -e 'libudev.so.0' ]; then

  udevDependent=`which udisks 2> /dev/null` # Ubuntu, Mint
  if [ -z "$udevDependent" ]
  then
      udevDependent=`which systemd 2> /dev/null` # Fedora, SUSE
  fi
  if [ -z "$udevDependent" ]
  then
      udevDependent=`which findmnt` # Arch
  fi
  udevso=`ldd $udevDependent | grep libudev.so | awk '{print $3;}'`
  if [ -e "$udevso" ]; then
     ln -sf "$udevso" 'libudev.so.0'
  fi

fi
