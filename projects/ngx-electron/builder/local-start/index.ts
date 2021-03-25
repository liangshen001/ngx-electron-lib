import {BrowserBuilderOutput, DevServerBuilderOutput, executeBrowserBuilder, executeDevServerBuilder} from '@angular-devkit/build-angular';
import {Observable, of} from 'rxjs';
import {BuilderContext, createBuilder, targetFromTargetString} from '@angular-devkit/architect';
import {mergeMap, map} from 'rxjs/operators';
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
    let started = false;
    return fromPromise(context.getTargetOptions(browserTarget)).pipe(
        mergeMap(rawBrowserOptions => {
            rawBrowserOptions.baseHref = './';
            rawBrowserOptions.watch = true;
            return executeBrowserBuilder(rawBrowserOptions as any, context as any, {
                webpackConfiguration: config => ({
                    ...config,
                    target: 'electron-renderer'
                })
            }).pipe(
                mergeMap((data: any) => {
                    if (!started) {
                        started = true;
                        return (spawn(context, 'tsc', ['-p', path.join(process.cwd(), options.electronRoot)]).pipe(
                            mergeMap(() => spawn(context, 'electron', ['.', '--open-dev-tools'])),
                            map(() => data)
                        ));
                    }
                    return of(data);
                }) as any
            );
        })
    ) as any;
}
