import {BuilderContext, BuilderOutput, createBuilder, targetFromTargetString} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {BrowserBuilderOutput, executeBrowserBuilder} from '@angular-devkit/build-angular';
import {Observable, of} from 'rxjs';
import {flatMap, map, switchMap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';

export default createBuilder<BrowserBuilderOptions>(commandBuilder);

interface BrowserBuilderOptions extends JsonObject {
    browserTarget: string;
}

function commandBuilder(
    options: BrowserBuilderOptions,
    context: BuilderContext,
): Observable<BrowserBuilderOutput> {
    const browserTarget = targetFromTargetString(options.browserTarget);
    return fromPromise(context.getTargetOptions(browserTarget)).pipe(
        flatMap(rawBrowserOptions => {
            return executeBrowserBuilder(rawBrowserOptions as any, context as any, {
                webpackConfiguration: config => ({
                    ...config,
                    node: {fs: 'empty'}
                })
            });
        })
    );
}
