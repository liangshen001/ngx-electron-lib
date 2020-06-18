import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const packageJson = require('../package.json');

const mainTsContent = (name: string) => `import {app, BrowserWindow} from 'electron';
import {createTray, createWindow, initElectronMainIpcListener, isMac} from '@ngx-electron/main';

let win: BrowserWindow;
initElectronMainIpcListener();

function init() {
    // createTray('icon/logo.png');
    win = createWindow({
        path: '',
        width: 1024,
        height: 768,
        title: '${name}',
        webPreferences: {
            nodeIntegration: true
        }
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

interface NgAddOptions {
    redux: boolean;
    skipInstall: boolean;
}


// Just return the tree
export function ngAdd(options: NgAddOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        if (!tree.exists('angular.json') || !tree.exists('package.json') || !tree.exists('tsconfig.json')) {
            context.logger.error('This is not an angular cli application');
            return;
        }

        const angularText = tree.get('angular.json')!.content.toString('utf-8');
        const angularJson = JSON.parse(angularText);
        const configurations = angularJson.projects[angularJson.defaultProject].architect.build.configurations;

        createElectronMainTs(tree);

        createELectronELectronBuilderJson(tree);

        createELectronTsconfigJson(tree);


        addToPackageJson(tree, 'electron-serve-start',
            'ng run ' + angularJson.defaultProject + ':electron-serve-start', 'scripts');
        addToPackageJson(tree, 'electron-local-start',
            'ng run ' + angularJson.defaultProject + ':electron-local-start', 'scripts');
        addToPackageJson(tree, 'electron-build:win',
            'ng run ' + angularJson.defaultProject + ':electron-build --win', 'scripts');
        addToPackageJson(tree, 'electron-build:mac',
            'ng run ' + angularJson.defaultProject + ':electron-build --mac', 'scripts');
        addToPackageJson(tree, 'electron-build:linux',
            'ng run ' + angularJson.defaultProject + ':electron-build --linux', 'scripts');
        Object.keys(configurations).forEach(key => {
            addToPackageJson(tree, 'electron-serve-start:' + key,
                'ng run ' + angularJson.defaultProject + ':electron-serve-start:' + key, 'scripts');
            addToPackageJson(tree, 'electron-local-start:' + key,
                'ng run ' + angularJson.defaultProject + ':electron-local-start:' + key, 'scripts');
            addToPackageJson(tree, 'electron-build:win:' + key,
                'ng run ' + angularJson.defaultProject + ':electron-build:' + key + ' --win=true', 'scripts');
            addToPackageJson(tree, 'electron-build:mac:' + key,
                'ng run ' + angularJson.defaultProject + ':electron-build:' + key + ' --mac=true', 'scripts');
            addToPackageJson(tree, 'electron-build:linux:' + key,
                'ng run ' + angularJson.defaultProject + ':electron-build:' + key + ' --linux=true', 'scripts');
        });


        addToPackageJson(tree, '@ngx-electron/main', packageJson.version, 'dependencies');
        addToPackageJson(tree, '@ngx-electron/builder', packageJson.version, 'devDependencies');
        addToPackageJson(tree, '@ngx-electron/core', packageJson.version, 'dependencies');
        addToPackageJson(tree, 'electron-updater', packageJson.peerDependencies['electron-updater'], 'dependencies');
        addToPackageJson(tree, 'electron-builder', packageJson.peerDependencies['electron-builder'], 'devDependencies');
        addToPackageJson(tree, 'electron-reload', packageJson.peerDependencies['electron-reload'], 'dependencies');
        addToPackageJson(tree, 'electron', packageJson.peerDependencies.electron, 'devDependencies');
        if (options.redux) {
            addToPackageJson(tree, '@ngx-electron/redux', packageJson.version, 'dependencies');
            addToPackageJson(tree, '@ngrx/effects', packageJson.peerDependencies['@ngrx/effects'], 'dependencies');
            addToPackageJson(tree, '@ngrx/entity', packageJson.peerDependencies['@ngrx/entity'], 'dependencies');
            addToPackageJson(tree, '@ngrx/store', packageJson.peerDependencies['@ngrx/store'], 'dependencies');
        }

        const sourceText = tree.read('package.json')!.toString('utf-8');
        const json = JSON.parse(sourceText);
        json.main = 'dist/electron/main.js';
        tree.overwrite('package.json', JSON.stringify(json, null, 2));
        addArchitectToAngularJson(tree);
        if (!options.skipInstall) {
            context.addTask(new NodePackageInstallTask());
        }
        return tree;
    };
}

function createElectronMainTs(tree: Tree) {
    const angularText = tree.get('angular.json')!.content.toString('utf-8');
    const angularJson = JSON.parse(angularText);
    if (!tree.exists('/electron/main.ts')) {
        tree.create('/electron/main.ts', mainTsContent(angularJson.defaultProject));
    }
}

function createELectronTsconfigJson(tree: Tree) {

    if (!tree.exists('/electron/tsconfig.json')) {
        const json = {
            extends: '../tsconfig.json',
            compilerOptions: {
                outDir: '../dist/electron',
                target: 'es2015',
                module: 'commonjs',
                moduleResolution: 'node',
                resolveJsonModule: true
            },
            files: [
                'main.ts'
            ]
        };


        tree.create('/electron/tsconfig.json', JSON.stringify(json, null, 2));
    }

}

function createELectronELectronBuilderJson(tree: Tree) {
    const angularText = tree.get('angular.json')!.content.toString('utf-8');
    const angularJson = JSON.parse(angularText);

    const json = {
        appId: 'appId',
        productName: angularJson.defaultProject,
        copyright: 'Copyright©2020',
        compression: 'maximum',
        artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
        directories: {
            output: 'dist/electron/'
        },
        files: [
            'dist/${productName}/*',
            'dist/electron/*'
        ],
        dmg: {
            backgroundColor: '#FFFFFF',
            contents: [
                {
                    x: 130,
                    y: 220
                },
                {
                    x: 410,
                    y: 220,
                    type: 'link',
                    path: '/Applications'
                }
            ],
            title: 'TiEthWallet ${version}'
        },
        win: {
            target: [
                'nsis'
            ]
        },
        mac: {
            category: 'public.app-category.utilities',
            target: [
                'dmg'
            ]
        },
        linux: {
            category: 'Utility',
            synopsis: 'TiEthWallet',
            description: 'TiEthWallet',
            target: [
                'AppImage',
                'deb'
            ]
        },
        nsis: {
            oneClick: false,
            perMachine: true,
            allowToChangeInstallationDirectory: true,
            artifactName: '${productName}-${version}-${os}-${arch}-setup.${ext}',
            deleteAppDataOnUninstall: true
        }
    };


    if (!tree.exists('/electron/electron-builder.json')) {
        tree.create('/electron/electron-builder.json', JSON.stringify(json, null, 2));
    }
}

function addArchitectToAngularJson(tree: Tree) {
    const angularText = tree.get('angular.json')!.content.toString('utf-8');
    const angularJson = JSON.parse(angularText);
    const architect = angularJson.projects[angularJson.defaultProject].architect;

    architect.build.builder = '@ngx-electron/builder:browser';
    architect.serve.builder = '@ngx-electron/builder:dev-server';

    const getConfigurations = (targetKey: string, targetValue: string) => Object.keys(architect.build.configurations)
        .reduce((p, v) => ({...p, [v]: {[targetKey]: targetValue + ':' + v}}), {});
    const browserTarget = angularJson.defaultProject + ':build';
    const devServerTarget = angularJson.defaultProject + ':serve';

    architect['electron-build'] = {
        builder: '@ngx-electron/builder:build',
        options: {
            electronRoot: 'electron',
            config: 'electron/electron-builder.json',
            browserTarget
        },
        configurations: getConfigurations('browserTarget', browserTarget)
    };
    architect['electron-serve-start'] = {
        builder: '@ngx-electron/builder:serve-start',
        options: {
            electronRoot: 'electron',
            devServerTarget
        },
        configurations: getConfigurations('devServerTarget', devServerTarget)
    };
    architect['electron-local-start'] = {
        builder: '@ngx-electron/builder:local-start',
        options: {
            electronRoot: 'electron',
            browserTarget
        },
        configurations: getConfigurations('browserTarget', browserTarget)
    };
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
