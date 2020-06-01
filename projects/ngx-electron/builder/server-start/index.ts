import {DevServerBuilderOutput, executeDevServerBuilder} from '@angular-devkit/build-angular';
import {Observable} from 'rxjs';
import {BuilderContext, createBuilder, targetFromTargetString} from '@angular-devkit/architect';
import {flatMap, map} from 'rxjs/operators';
import {getOptions, spawn} from '../utils';
import {JsonObject} from '@angular-devkit/core';
import {fromPromise} from 'rxjs/internal-compatibility';

interface ServerStartBuilderOptions extends JsonObject {
    devServerTarget: string;
}

export default createBuilder<ServerStartBuilderOptions>(commandBuilder);

function commandBuilder(
    options: ServerStartBuilderOptions,
    context: BuilderContext,
): Observable<DevServerBuilderOutput> {
    const devServerTarget = targetFromTargetString(options.devServerTarget);
    return fromPromise(context.getTargetOptions(devServerTarget)).pipe(
        flatMap(rawBrowserOptions => {
            rawBrowserOptions.host = rawBrowserOptions.host || 'localhost';
            rawBrowserOptions.port = rawBrowserOptions.port || 8080;
            return executeDevServerBuilder(rawBrowserOptions as any, context as any, {
                webpackConfiguration: config => ({
                    ...config,
                    target: 'electron-renderer'
                })
            }).pipe(
                flatMap(data => spawn(context, 'electron', ['.', '--server', ...getOptions({
                    host: rawBrowserOptions.host,
                    port: rawBrowserOptions.port
                }, true)]).pipe(
                    map(() => data)
                ))
            );
        })
    );
}
