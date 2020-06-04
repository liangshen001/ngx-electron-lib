const fs = require('fs');

const json = readJson('./package.json');
const version = json.version;
const packagePath = process.argv[2] + '/package.json';
const targetJson = readJson(packagePath);
targetJson.version = version;
writeJson(packagePath, targetJson);

function readJson(path: string) {
    const buffer = fs.readFileSync(path);
    const packageText = buffer.toString('utf-8');
    return JSON.parse(packageText);
}

function writeJson(path: string, content: any) {
    fs.writeFileSync(path, JSON.stringify(content, null, 2));
}



