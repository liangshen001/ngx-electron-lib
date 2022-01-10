import {BuilderContext, createBuilder} from '@angular-devkit/architect';
import {BrowserBuilderOutput, executeBrowserBuilder} from '@angular-devkit/build-angular';
import { getSystemPath, json, normalize, resolve, tags } from '@angular-devkit/core';
import {Observable} from 'rxjs';
import {Schema as BrowserBuilderSchema} from './schema';

export default createBuilder<json.JsonObject & BrowserBuilderSchema>(commandBuilder);

function commandBuilder(
    options: BrowserBuilderSchema,
    context: BuilderContext,
): Observable<BrowserBuilderOutput> {
    return executeBrowserBuilder(options, context as any, {
        webpackConfiguration: config => ({
            ...config,
            target: 'web',
            node: {fs: 'empty'}
        })
    }) as any;
}
