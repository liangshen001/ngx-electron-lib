import {BrowserBuilderOutput, DevServerBuilderOutput, executeBrowserBuilder, executeDevServerBuilder} from '@angular-devkit/build-angular';
import {Observable} from 'rxjs';
import {BuilderContext, createBuilder, targetFromTargetString} from '@angular-devkit/architect';
import {flatMap, map} from 'rxjs/operators';
import {getOptions, spawn} from '../utils';
import {JsonObject} from '@angular-devkit/core';
import {fromPromise} from 'rxjs/internal-compatibility';
import * as path from 'path';

interface ServerStartBuilderOptions extends JsonObject {
    browserTarget: string;
    electronRoot: string;
}

export default createBuilder<ServerStartBuilderOptions>(commandBuilder);

function commandBuilder(
    options: ServerStartBuilderOptions,
    context: BuilderContext,
): Observable<BrowserBuilderOutput> {
    const browserTarget = targetFromTargetString(options.browserTarget);
    return fromPromise(context.getTargetOptions(browserTarget)).pipe(
        flatMap(rawBrowserOptions => {
            rawBrowserOptions.baseHref = './';
            return executeBrowserBuilder(rawBrowserOptions as any, context as any, {
                webpackConfiguration: config => ({
                    ...config,
                    target: 'electron-renderer'
                })
            });
        }),
        flatMap(data => spawn(context, 'tsc', ['-p', path.join(process.cwd(), options.electronRoot)]).pipe(
            map(() => data)
        )),
        flatMap(data => spawn(context, 'electron', ['.', '--open-dev-tools']).pipe(
            map(() => data)
        )),
    );
}
