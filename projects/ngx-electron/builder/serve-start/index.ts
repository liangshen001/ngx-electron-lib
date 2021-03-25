import {DevServerBuilderOptions, DevServerBuilderOutput, executeDevServerBuilder} from '@angular-devkit/build-angular';
import {Observable, of} from 'rxjs';
import {BuilderContext, createBuilder, targetFromTargetString} from '@angular-devkit/architect';
import {flatMap, map, mergeMap} from 'rxjs/operators';
import {getOptions, spawn} from '../utils';
import {JsonObject} from '@angular-devkit/core';
import {fromPromise} from 'rxjs/internal-compatibility';
import * as path from 'path';

interface ServerStartBuilderOptions extends JsonObject {
    devServerTarget: string;
    electronRoot: string;
}

export default createBuilder<ServerStartBuilderOptions>(commandBuilder);

function commandBuilder(
    options: ServerStartBuilderOptions,
    context: BuilderContext,
): Observable<DevServerBuilderOutput> {
    const devServerTarget = targetFromTargetString(options.devServerTarget);
    let started = false;

    return spawn(context, 'tsc', ['-p', path.join(process.cwd(), options.electronRoot)]).pipe(
        mergeMap(() => fromPromise(context.getTargetOptions(devServerTarget))),
        mergeMap((rawBrowserOptions: DevServerBuilderOptions) => {
            rawBrowserOptions.host = rawBrowserOptions.host || 'localhost';
            rawBrowserOptions.port = rawBrowserOptions.port || 4200;
            rawBrowserOptions.watch = true;
            rawBrowserOptions.liveReload = true;
            return executeDevServerBuilder(rawBrowserOptions, context as any, {
                webpackConfiguration: config => ({
                    ...config,
                    target: 'electron-renderer'
                })
            }).pipe(
                mergeMap(data => {
                    if (started) {
                        return of(data);
                    }
                    started = true;
                    return spawn(context, 'electron', ['.', '--serve', ...getOptions({
                        host: rawBrowserOptions.host,
                        port: rawBrowserOptions.port,
                        'open-dev-tools': true
                    }, true)]).pipe(
                        map(() => data)
                    );
                }) as any
            );
        }),
    ) as any;
}
