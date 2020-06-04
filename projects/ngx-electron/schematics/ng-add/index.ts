import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const ngxElectronVersion = require('../package.json').version;

const mainTsContent = (name: string) => `import {app, BrowserWindow} from 'electron';
import {createTray, createWindow, initElectronMainIpcListener, isMac} from '@ngx-electron/main';

let win: BrowserWindow;
initElectronMainIpcListener();

function init() {
    // createTray('icon/logo.png');
    win = createWindow('', {
        width: 1024,
        height: 768,
        title: '${name}'
    });
    win.on('close', () => app.quit());
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMac()) {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        // loginWin = createLoginWindow(appTray);
    }
});`;

const electronBuilderJsonContent = (name: string) => '{\n' +
    '  "appId": "' + name + '",\n' +
    '  "productName": "' + name + '",\n' +
    '  "copyright": "Copyright©2020",\n' +
    '  "compression": "maximum",\n' +
    '  "artifactName": "${productName}-${version}-${os}-${arch}.${ext}",\n' +
    '  "directories": {\n' +
    '    "output": "dist/electron/"\n' +
    '  },\n' +
    '  "files": [\n' +
    '      "dist/${productName}/*",\n' +
    '      "dist/electron/*"\n' +
    '  ],\n' +
    '  "dmg": {\n' +
    '    "backgroundColor": "#FFFFFF",\n' +
    '    "contents": [\n' +
    '      {\n' +
    '        "x": 130,\n' +
    '        "y": 220\n' +
    '      },\n' +
    '      {\n' +
    '        "x": 410,\n' +
    '        "y": 220,\n' +
    '        "type": "link",\n' +
    '        "path": "/Applications"\n' +
    '      }\n' +
    '    ],\n' +
    '    "title": "TiEthWallet ${version}"\n' +
    '  },\n' +
    '  "win": {\n' +
    '    "target": [\n' +
    '      "nsis"\n' +
    '    ]\n' +
    '  },\n' +
    '  "mac": {\n' +
    '    "category": "public.app-category.utilities",\n' +
    '    "target": [\n' +
    '      "dmg"\n' +
    '    ]\n' +
    '  },\n' +
    '  "linux": {\n' +
    '    "category": "Utility",\n' +
    '    "synopsis": "TiEthWallet",\n' +
    '    "description": "TiEthWallet",\n' +
    '    "target": [\n' +
    '      "AppImage",\n' +
    '      "deb"\n' +
    '    ]\n' +
    '  },\n' +
    '  "nsis": {\n' +
    '    "oneClick": false,\n' +
    '    "perMachine": true,\n' +
    '    "allowToChangeInstallationDirectory": true,\n' +
    '    "installerIcon": "src/favicon.ico",\n' +
    '    "uninstallerIcon": "src/favicon.ico",\n' +
    '    "artifactName": "${productName}-${version}-${os}-${arch}-setup.${ext}",\n' +
    '    "deleteAppDataOnUninstall": true\n' +
    '  }\n' +
    '}\n';

const tsconfigJsonContent = `{
    "extends": "../tsconfig.json",
    "compilerOptions": {
        "outDir": "../dist/electron",
        "target": "es2015",
        "module": "commonjs",
        "moduleResolution": "node",
        "resolveJsonModule": true
    },
    "files": [
        "main.ts"
    ]
}
`;


// Just return the tree
export function ngAdd(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        if (!tree.exists('angular.json') || !tree.exists('package.json') || !tree.exists('tsconfig.json')) {
            context.logger.error('This is not an angular cli application');
            return;
        }

        const angularText = tree.get('angular.json')!.content.toString('utf-8');
        const angularJson = JSON.parse(angularText);

        tree.create('/electron/main.ts', mainTsContent(angularJson.defaultProject));
        tree.create('/electron/electron-builder.json', electronBuilderJsonContent(angularJson.defaultProject));
        tree.create('/electron/tsconfig.json', tsconfigJsonContent);


        addToPackageJson(tree, 'electron-browser',
            'ng run ' + angularJson.defaultProject + ':electron-browser:production', 'scripts');
        addToPackageJson(tree, 'electron-server-start',
            'ng run ' + angularJson.defaultProject + ':electron-server-start:production', 'scripts');
        addToPackageJson(tree, 'electron-local-start',
            'ng run ' + angularJson.defaultProject + ':electron-local-start:production', 'scripts');
        addToPackageJson(tree, 'electron-build:win',
            'ng run ' + angularJson.defaultProject + ':electron-build:production --win=true', 'scripts');
        addToPackageJson(tree, 'electron-build:mac',
            'ng run ' + angularJson.defaultProject + ':electron-build:production --mac=true', 'scripts');
        addToPackageJson(tree, 'electron-build:linux',
            'ng run ' + angularJson.defaultProject + ':electron-build:production --linux=true', 'scripts');


        addToPackageJson(tree, '@ngx-electron/main', ngxElectronVersion, 'dependencies');
        addToPackageJson(tree, '@ngx-electron/builder', ngxElectronVersion, 'devDependencies');
        addToPackageJson(tree, '@ngx-electron/core', ngxElectronVersion, 'devDependencies');
        addToPackageJson(tree, 'electron-updater', '~4.2.0', 'dependencies');
        addToPackageJson(tree, 'electron-reload', '~1.5.0', 'dependencies');
        addToPackageJson(tree, 'electron', '~7.1.7', 'devDependencies');

        const sourceText = tree.read('package.json')!.toString('utf-8');
        const json = JSON.parse(sourceText);
        json.main = 'dist/electron/main.js';
        tree.overwrite('package.json', JSON.stringify(json, null, 2));
        addArchitectToAngularJson(tree);
        context.addTask(new NodePackageInstallTask());
        return tree;
    };
}

function addArchitectToAngularJson(tree: Tree) {
    const angularText = tree.get('angular.json')!.content.toString('utf-8');
    const angularJson = JSON.parse(angularText);
    const architect = angularJson.projects[angularJson.defaultProject].architect;
    if (!architect['electron-build']) {
        architect['electron-build'] = {
            builder: '@ngx-electron/builder:build',
            options: {
                electronRoot: 'electron',
                config: 'electron/electron-builder.json',
                browserTarget: angularJson.defaultProject + ':build:production'
            },
            configurations: {
                production: {
                    browserTarget: angularJson.defaultProject + ':build:production'
                }
            }
        };
    }
    if (!architect['electron-server-start']) {
        architect['electron-server-start'] = {
            builder: '@ngx-electron/builder:server-start',
            options: {
                devServerTarget: angularJson.defaultProject + ':serve'
            },
            configurations: {
                production: {
                    devServerTarget: angularJson.defaultProject + ':serve:production'
                }
            }
        };
    }
    if (!architect['electron-local-start']) {
        architect['electron-local-start'] = {
            builder: '@ngx-electron/builder:local-start',
            options: {
                electronRoot: 'electron',
                browserTarget: angularJson.defaultProject + ':build'
            },
            configurations: {
                production: {
                    browserTarget: angularJson.defaultProject + ':build:production'
                }
            }
        };
    }
    if (!architect['electron-browser']) {
        architect['electron-browser'] = {
            builder: '@ngx-electron/builder:browser',
            options: {
                browserTarget: angularJson.defaultProject + ':build'
            },
            configurations: {
                production: {
                    browserTarget: angularJson.defaultProject + ':build:production'
                }
            }
        };
    }
    tree.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
}


/**
 * Sorts the keys of the given object.
 * @returns A new object instance with sorted keys
 */
function sortObjectByKeys(obj: any) {
    return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => (result[key] = obj[key]) && result, {});
}

export function addToPackageJson(
    host: Tree,
    key: string,
    value: string,
    type: 'dependencies' | 'devDependencies' | 'scripts' = 'dependencies'
): Tree {

    const tsconfigText = host.read('tsconfig.json')!.toString('utf-8');
    const tsconfigJson = JSON.parse(tsconfigText);

    if (tsconfigJson.compilerOptions && tsconfigJson.compilerOptions.paths && tsconfigJson.compilerOptions.paths[key]) {
        return host;
    }

    const sourceText = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);

    if (!json[type]) {
        json[type] = {};
    }

    if (!json[type][key]) {
        json[type][key] = value;
        json[type] = sortObjectByKeys(json[type]);
    }

    host.overwrite('package.json', JSON.stringify(json, null, 2));
    return host;
}
