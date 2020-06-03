import {SchematicContext, Tree} from '@angular-devkit/schematics';


/** The shortcut of `addPackageToPackageJson` */
export function addPackage(host: Tree, context: SchematicContext, pkgverion: string, type = '') {
    const pos = pkgverion.lastIndexOf('@');
    const pkg = pkgverion.substring(0, pos);
    const verstion = pkgverion.substring(pos + 1);

    if (host.exists('tsconfig.json')) {
        const tsconfigText = host.read('tsconfig.json')!.toString('utf-8');
        const tsconfigJson = JSON.parse(tsconfigText);
        if (tsconfigJson.compilerOptions) {
            if (tsconfigJson.compilerOptions.paths && tsconfigJson.compilerOptions.paths[pkg]) {
                context.logger.warn(pkg + ' already exists in the library;');
                return;
            }
            type === 'dev'
                ? addToPackageJson(host, pkg, verstion, 'devDependencies')
                : addToPackageJson(host, pkg, verstion, 'dependencies');
        }
    }
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

    if (host.exists('package.json')) {
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
    }

    return host;
}
