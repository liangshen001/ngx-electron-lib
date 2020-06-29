import {BuilderContext, createBuilder, targetFromTargetString} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import {BrowserBuilderOutput, executeBrowserBuilder} from '@angular-devkit/build-angular';
import {Observable} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {getOptions, spawn} from '../utils';
import * as path from 'path';
import {fromPromise} from 'rxjs/internal-compatibility';


interface BuildBuilderSchema extends JsonObject {
    browserTarget: string;
    electronRoot: string;
    config: string;
    mac: boolean;
    linux: boolean;
    win: boolean;
}

export default createBuilder<BuildBuilderSchema>(commandBuilder);

function commandBuilder(
    options: BuildBuilderSchema,
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
        flatMap(data => spawn(context, 'electron-builder', [
            'build',
            ...getOptions({
                win: options.win,
                mac: options.mac,
                linux: options.linux
            }),
            ...getOptions({
                config: options.config && `${path.join(process.cwd(), options.config)}`
            }, true)
        ]).pipe(
            map(() => data)
        ))
    );
}
