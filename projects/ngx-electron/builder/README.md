# @ngx-electron/builder

Provides a set of Angular Architect（angular.json）

## @ngx-electron/builder:browser

Use @ngx-electron/builder:browser instead of @angular-devkit/build-angular:browser in angular.json.
Add some information when using WebPack.

```
webpackConfiguration: config => ({
    ...config,
    target: 'web',
    node: {fs: 'empty'}
})
```

## @ngx-electron/builder:dev-server

Use @ngx-electron/builder:dev-server instead of @angular-devkit/build-angular:dev-server in angular.json.
Add some information when using WebPack.

```
webpackConfiguration: config => ({
    ...config,
    target: 'web',
    node: {fs: 'empty'}
})
```

## @ngx-electron/builder:build

```
"electron-build": {
  "builder": "@ngx-electron/builder:build",
  "options": {
    "electronRoot": "electron",
    "config": "electron/electron-builder.json",
    "browserTarget": "ngx-electron-lib:build"
  },
  "configurations": {
    "production": {
      "browserTarget": "ngx-electron-lib:build:production"
    }
  }
}
```

## @ngx-electron/builder:serve-start
```
"electron-serve-start": {
  "builder": "@ngx-electron/builder:serve-start",
  "options": {
    "electronRoot": "electron",
    "devServerTarget": "ngx-electron-lib:serve"
  },
  "configurations": {
    "production": {
      "devServerTarget": "ngx-electron-lib:serve:production"
    }
  }
}
```

## @ngx-electron/builder:local-start
```
"electron-local-start": {
  "builder": "@ngx-electron/builder:local-start",
  "options": {
      "electronRoot": "electron",
      "browserTarget": "ngx-electron-lib:build"
  },
  "configurations": {
    "production": {
        "browserTarget": "ngx-electron-lib:build:production"
    }
  }
}
```
