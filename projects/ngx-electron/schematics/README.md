# @ngx-electron/schematics

support angular version 8.x.x.

Enabling Angular application to support Electron schematics

## Install
```
## create an angular app
ng new ngx-electron-test

## Added electron characteristic
ng add @ngx-electron/schematics

```

```
CREATE electron/main.ts (1095 bytes)
CREATE electron/electron-builder.json (1205 bytes)
CREATE electron/tsconfig.json (237 bytes)
UPDATE package.json (2031 bytes)
√ Packages installed successfully.
```

## Usage

```
## Start the Angular application on port 8080, and electron loads the Angular application
npm run electron-serve-start

## The Angular application is packaged locally and transmitted loads the Angular application
npm run electron-local-start

## Package as a Windows application
npm run electron-build:win

## Package as a Mac application (on MacOs)
npm run electron-build:mac

## Package as a Linux application
npm run electron-build:linux

```
