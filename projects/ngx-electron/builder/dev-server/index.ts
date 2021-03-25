import {BuilderContext, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {DevServerBuilderOutput, executeDevServerBuilder} from '@angular-devkit/build-angular';
import {Observable} from 'rxjs';
import {Schema} from '../browser/schema';

export default createBuilder<Schema & JsonObject>(commandBuilder);

function commandBuilder(
    options: Schema & JsonObject,
    context: BuilderContext,
): Observable<DevServerBuilderOutput> {
    return executeDevServerBuilder(options as any, context as any, {
        webpackConfiguration: config => ({
            ...config,
            target: 'web',
            node: {fs: 'empty'}
        })
    }) as any;
}
