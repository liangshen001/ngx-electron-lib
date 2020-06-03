import {Tree} from '@angular-devkit/schematics';

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
