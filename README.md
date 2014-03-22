# <img src="https://raw.githubusercontent.com/snap-project/snap-core/develop/public/img/logo.svg" height="64px" alt="SNAP! logo" /> SNAP!

**S**imple **N**omad **A**pplication **P**ortal

## Nightly Builds

[From 'develop' branch](http://snap.lookingfora.name/)


## For developers & testers

```
git clone https://github.com/Bornholm/snap.git
cd snap
git clone https://github.com/Bornholm/snap-apps.git apps
sudo npm install grunt-cli -g
npm install
grunt run
```
**'Headless' mode**

You can launch SNAP! as a regular node application
```
cd snap
node app
```

## Linux: Lack of libudev.so.0 ?

See [node-webkit documentation](https://github.com/rogerwang/node-webkit/wiki/The-solution-of-lacking-libudev.so.0)

**Workaround**
```
. tasks/build-res/linux/libudev-linker.sh
grunt run
```


