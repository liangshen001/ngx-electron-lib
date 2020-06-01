import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import * as childProcess from 'child_process';
import {BrowserBuilderOutput, executeBrowserBuilder} from '@angular-devkit/build-angular';
import {Observable, of} from 'rxjs';
import {Schema as BrowserBuilderSchema} from './schema';
import {flatMap, map, switchMap} from 'rxjs/operators';

export default createBuilder<JsonObject & BrowserBuilderSchema>(commandBuilder);

function commandBuilder(
    options: BrowserBuilderSchema,
    context: BuilderContext,
): Observable<BrowserBuilderOutput> {
    return executeBrowserBuilder(options, context as any, {
        webpackConfiguration: config => ({
            ...config,
            ...options.electron ? {
                target: 'electron-renderer'
            } : {
                node: {fs: 'empty'}
            }
        })
    });
}
