import {BuilderContext} from '@angular-devkit/architect';
import * as childProcess from 'child_process';
import {Observable} from 'rxjs';

export function spawn(context: BuilderContext, command: string, args?: string[], options?: childProcess.SpawnOptions) {
    context.logger.info(`run:${command} args:${args}`);
    const child = childProcess.spawn(process.platform === 'win32' ? `${command}.cmd` : command, args, options);
    child.stdout.on('data', data => context.logger.info(data.toString()));
    child.stderr.on('data', data => context.logger.error(data.toString()));
    return new Observable<number>(subscriber => {
        child.on('close', code => {
            context.reportStatus(`Done.`);
            subscriber.next(code);
            subscriber.complete();
        });
    });
}


export function getOptions(obj: object, withValue = false) {
    const args = [];
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (value) {
            args.push(`--${key}`);
            if (withValue) {
                args.push(value);
            }
        }
    }
    return args;
}
