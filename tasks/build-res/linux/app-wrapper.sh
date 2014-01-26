#!/bin/sh

. libudev-linker.sh

export SNAP_WRAPPER="`readlink -f "$0"`"

HERE="`dirname "$SNAP_WRAPPER"`"

# Always use our versions of ffmpeg libs.
# This also makes RPMs find the compatibly-named library symlinks.
if [[ -n "$LD_LIBRARY_PATH" ]]; then
  LD_LIBRARY_PATH="$HERE:$HERE/lib:$LD_LIBRARY_PATH"
else
  LD_LIBRARY_PATH="$HERE:$HERE/lib"
fi
export LD_LIBRARY_PATH

exec -a "$0" "$HERE/snap-bin"  "$@"