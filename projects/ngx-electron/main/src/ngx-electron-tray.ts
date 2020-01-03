import {ipcMain, Tray, nativeImage, NativeImage, app, Menu} from 'electron';
import * as http from 'http';
import {isMac} from './ngx-electron-main-util';
import {host, isServer, port} from './ngx-electron-main-args';
import * as path from 'path';

let appTray: Tray;
// 得到nativeImage可以是一个网络图片
function convertImgToNativeImage(imageUrl, isWeb): Promise<NativeImage | string> {
    return new Promise((resolve, reject) => {
        if (isWeb) {
            http.get(imageUrl, res => {
                const chunks = []; // 用于保存网络请求不断加载传输的缓冲数据
                let size = 0;　　 // 保存缓冲数据的总长度
                res.on('data', chunk => size += chunk.length);
                res.on('error', reject);
                res.on('end', err => {
                    // Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
                    const data = Buffer.concat(chunks, size);
                    // 可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象
                    console.log(Buffer.isBuffer(data));
                    // 将Buffer对象转换为字符串并以base64编码格式显示
                    const base64Img = data.toString('base64');
                    const array = imageUrl.split('.');
                    const image = nativeImage.createFromDataURL(
                        `data:image/${array[array.length - 1]};base64,${base64Img}`);
                    resolve(image);
                });
            });
        } else {
            const image = nativeImage.createFromDataURL(
                path.join(app.getAppPath(), 'dist', app.getName(), 'assets', imageUrl));
            resolve(image);
        }
    });
}

/**
 * 创建 tray 对于mac无效果
 * @param imageUrl
 * @param isWeb
 */
function createTray(imageUrl: string, isWeb = false) {
    if (isMac()) {
        return null;
    }
    if (isServer && !isWeb) {
        imageUrl = `http://${ host }:${ port }/${imageUrl}`;
    }
    convertImgToNativeImage(imageUrl, isWeb)
        .then(image => appTray = new Tray(image));
}

function initTrayListener() {

    ipcMain.on('ngx-electron-tray-created', event => event.returnValue = appTray);

    ipcMain.on('ngx-electron-set-tray-image', (event, imageUrl, isWeb) => {
        if (appTray) {
            convertImgToNativeImage(imageUrl, isWeb)
                .then(image => appTray.setImage(image));
        }
    });

    // 单击菜单
    ipcMain.on('ngx-electron-set-tray-context-menu', (event, template, timestamp) => {
        console.log(JSON.stringify(template));
        if (appTray) {
            appTray.setContextMenu(Menu.buildFromTemplate(template.map((currentValue, index) => ({
                ...currentValue,
                click: () => event.sender.send(`ngx-electron-click-tray-context-menu-item-${timestamp}`, index)
            }))));
        }
    });

    ipcMain.on('ngx-electron-tray-on-event', (event, eventName, timestamp) => {
        if (appTray) {
            appTray.on(eventName, (...margs) => {
                try {
                    event.sender.send(`ngx-electron-tray-on-${eventName}-${timestamp}`, ...margs);
                } catch (e) {

                }
            });
        }
    });

    ipcMain.on('ngx-electron-tray-once-event', (event, eventName, timestamp) =>
        appTray.once(eventName, (...margs) => event.sender.send(`ngx-electron-tray-once-${eventName}-${timestamp}`, ...margs)));

    ipcMain.on('ngx-electron-tray-apply-method', (event, methodName, ...margs) =>
        appTray && appTray[methodName](...margs));

    ipcMain.on('ngx-electron-set-tray-tool-tip', (event, toolTip) => appTray && appTray.setToolTip(toolTip));

}

export {createTray, initTrayListener};
