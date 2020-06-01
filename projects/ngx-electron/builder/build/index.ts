import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import * as childProcess from 'child_process';
import { executeBrowserBuilder } from '@angular-devkit/build-angular';
import {Observable} from 'rxjs';

interface Options extends JsonObject {
    command: string;
    browserTarget: string;
    args: string[];
}

export default createBuilder(commandBuilder);

function commandBuilder(
    options: Options,
    context: BuilderContext,
): Promise<BuilderOutput> {
    // context.reportStatus(`Executing "${options.command}"...`);
// { success: code === 0 }
    // return executeBrowserBuilder(options as any, context as any, {
    //     webpackConfiguration: (config) => {
    //         return { ...config, target: 'electron-renderer' };
    //     }
    // });
    return spawn(context, 'ng', ['run', options.browserTarget])
        .then(code => Promise.resolve({success: code === 0}));
}

function spawn(context: BuilderContext, command: string, args?: string[], options?: childProcess.SpawnOptions) {
    const child = childProcess.spawn(command, args, options);
    child.stdout.on('data', data => context.logger.info(data.toString()));
    child.stderr.on('data', data => context.logger.error(data.toString()));
    return new Promise(resolve => {
        child.on('close', code => {
            context.reportStatus(`Done.`);
            resolve(code);
        });
    });
}
