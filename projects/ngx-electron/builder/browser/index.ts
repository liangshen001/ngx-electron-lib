import {BuilderContext, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {BrowserBuilderOutput, executeBrowserBuilder} from '@angular-devkit/build-angular';
import {Observable} from 'rxjs';
import {Schema} from './schema';

export default createBuilder<Schema & JsonObject>(commandBuilder);

function commandBuilder(
    options: Schema,
    context: BuilderContext,
): Observable<BrowserBuilderOutput> {
    return executeBrowserBuilder(options, context as any, {
        webpackConfiguration: config => ({
            ...config,
            target: 'web',
            node: {fs: 'empty'}
        })
    });
}
