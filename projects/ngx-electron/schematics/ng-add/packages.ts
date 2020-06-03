import {Tree} from '@angular-devkit/schematics';
import {addToPackageJson} from './package-config';

/** Add dependencies to package.json */
export function addKeyPkgsToPackageJson(tree: Tree) {
    addToPackageJson(tree, '@ngx-electron/builder', '~8.8.0', 'devDependencies');
    addToPackageJson(tree, '@ngx-electron/main', '~8.8.0', 'dependencies');
    addToPackageJson(tree, '@ngx-electron/core', '~8.8.0', 'dependencies');
}

export function addScriptsToPackageJson(tree: Tree) {
    const angularText = tree.get('angular.json')!.content.toString('utf-8');
    const angularJson = JSON.parse(angularText);
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
}
