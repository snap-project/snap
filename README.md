SNAP
====

**S**imple **N**omad **A**pplication **P**ortal


For developpers
---------------

```
git clone https://github.com/Bornholm/snap.git
cd snap
npm install
sudo npm install bower -g
sudo npm install grunt-cli -g
sudo npm install nw-gyp -g
# Rebuild leveldown with nw-gyp
cd node_*/snap-lib/node_*/express-pouchdb/node_*/pouchdb/node_*/level/node_*/leveldown
nw-gyp rebuild --target=<version node-webkit>
cd ../../../../../../../../../..
grunt run-nw
```
