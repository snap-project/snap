# <img src="./themes/default/img/logo_128.png" height="64px" alt="SNAP! logo" /> SNAP!

[![Code Climate](https://codeclimate.com/github/snap-project/snap/badges/gpa.svg)](https://codeclimate.com/github/snap-project/snap)

## What is SNAP! ?

SNAP! is the acronym for **S**imple **N**omad **A**pplication **P**ortal.

More to come.

## Nightly Builds

[From 'develop' branch](http://snap.lookingfora.name/)

## For developers & testers

```bash
git clone https://github.com/snap-project/snap
cd snap
# Download default apps
git clone https://github.com/snap-project/snap-apps.git apps
# Install development tools
sudo npm install grunt-cli bower bunyan -g
# Install SNAP! dependencies
npm install
# Install default apps & theme dependencies
grunt shell:bower-install
# Run in node-webkit
grunt | bunyan
# Or run as NodeJS app
node app | bunyan
```
