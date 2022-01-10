const fs = require('fs');

const json = readJson('./package.json');
const version = json.version;
const libName = process.argv[2];
const packagePath = 'projects/' + libName + '/package.json';
const readmeDistPath = 'dist/' + libName + '/README.md';

const targetJson = readJson(packagePath);
targetJson.version = version;
targetJson.peerDependencies.electron = json.devDependencies.electron;
targetJson.peerDependencies['@angular/cli'] = json.devDependencies['@angular/cli'];
targetJson.peerDependencies['electron-builder'] = json.devDependencies['electron-builder'];
targetJson.peerDependencies['electron-updater'] = json.dependencies['electron-updater'];
targetJson.peerDependencies['electron-reload'] = json.dependencies['electron-reload'];
targetJson.peerDependencies['@angular/core'] = json.dependencies['@angular/core'];
targetJson.peerDependencies['@angular/common'] = json.dependencies['@angular/common'];
if (libName === 'schematics' || libName === 'redux') {
    targetJson.peerDependencies['@ngrx/effects'] = json.dependencies['@ngrx/effects'];
    targetJson.peerDependencies['@ngrx/entity'] = json.dependencies['@ngrx/entity'];
    targetJson.peerDependencies['@ngrx/store'] = json.dependencies['@ngrx/store'];
}
writeJson(packagePath, targetJson);


let readmeContent = fs.readFileSync(readmeDistPath).toString('utf-8');
readmeContent = readmeContent.replace('angularCliVersion', json.devDependencies['@angular/cli']);
fs.writeFileSync(readmeDistPath, readmeContent);



function readJson(path: string) {
    const buffer = fs.readFileSync(path);
    const packageText = buffer.toString('utf-8');
    return JSON.parse(packageText);
}

function writeJson(path: string, content: any) {
    fs.writeFileSync(path, JSON.stringify(content, null, 2));
}



