import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';

interface NgUpdateOptions {
    skipInstall: boolean;
}

export function ngUpdate(options: NgUpdateOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        if (!options.skipInstall) {
            context.addTask(new NodePackageInstallTask());
        }
        return tree;
    };
}
