import * as path from 'path';
import {replaceContent, spawn} from '../bin/util';

const fse = require('fs-extra');
const packageJson = require('../package');

export function action(project, {redux, skipInstall}) {
    fse.ensureDirSync(path.join(process.cwd(), project));


    spawn('npm', ['i', '@angular/cli@' + packageJson.peerDependencies['@angular/cli'], '-g'])
        .then(() => spawn('ng', ['new', project]))
        .then(() => spawn('ng', ['add', '@ngx-electron/schematics', ...redux ? ['--redux'] : [], ...skipInstall ? ['--skipInstall'] : []], {
            cwd: project
        }));
    // console.log('应用下载完成');
    // const templatePath = store ? '../template/ngx-electron-store' : '../template/ngx-electron-core';
    // fse.copySync(path.join(__dirname, templatePath), path.join(process.cwd(), project));
    // replaceContent(project, 'package.json')
    //     .then(() => replaceContent(project, 'angular.json'))
    //     .then(() => replaceContent(project, 'electron/main.ts'))
    //     .then(() => replaceContent(project, 'electron/electron-builder.json'))
    //     .then(() => replaceContent(project, 'electron/tsconfig.json'))
    //     .then(() => replaceContent(project, 'package.json', '"@ngx-electron/store": "lastest"',
    //         `"@ngx-electron/store": "${packageJson.version}"`))
    //     .then(() => replaceContent(project, 'package.json', '"@ngx-electron/core": "lastest"',
    //         `"@ngx-electron/core": "${packageJson.version}"`))
    //     .then(() => replaceContent(project, 'package.json', `"@ngx-electron/main": "lastest"`,
    //         `"@ngx-electron/main": "${packageJson.version}"`))
    //     .then(() => replaceContent(project, 'package.json', '"@ngx-electron/cli": "lastest"',
    //         `"@ngx-electron/cli": "${packageJson.version}"`))
    //     .then(() => {
    //         if (!skipInstall) {
    //             console.log('开始下载依赖包...');
    //             spawn('npm', ['install'], {
    //                 cwd: project
    //             });
    //         } else {
    //             console.log('取消下载依赖包。');
    //         }
    //     });
}
