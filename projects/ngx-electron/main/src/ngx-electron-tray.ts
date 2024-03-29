import {ipcMain, Tray, nativeImage, NativeImage, app, Menu, MenuItemConstructorOptions} from 'electron';
import * as http from 'http';
import {host, isServe, port} from './ngx-electron-main-args';
import * as path from 'path';

let appTray: Tray;
// 得到nativeImage可以是一个网络图片
function convertImgToNativeImage(imageUrl): Promise<NativeImage | string> {
    return new Promise((resolve, reject) => {
        const isWeb = imageUrl.startsWith('http');
        if (isServe && !isWeb) {
            imageUrl = `http://${ host }:${ port }/${imageUrl}`;
        }
        if (isWeb || isServe) {
            http.get(imageUrl, res => {
                const chunks = []; // 用于保存网络请求不断加载传输的缓冲数据
                let size = 0;　　 // 保存缓冲数据的总长度
                res.on('data', chunk => {
                    chunks.push(chunk);
                    size += chunk.length;
                });
                res.on('error', reject);
                res.on('end', err => {
                    // Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
                    const data = Buffer.concat(chunks, size);
                    // 可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象
                    // 将Buffer对象转换为字符串并以base64编码格式显示
                    const base64Img = data.toString('base64');
                    const array = imageUrl.split('.');
                    // ${array[array.length - 1]}
                    const dataURL = `data:image/png;base64,${base64Img}`;
                    const image = nativeImage.createFromDataURL(dataURL);
                    resolve(image);
                });
            });
        } else {
            const image = nativeImage.createFromPath(
                path.join(app.getAppPath(), 'dist', app.name, imageUrl));
            resolve(image);
        }
    });
}

/**
 * 创建 tray
 * @param imageUrl imageUrl
 */
function createTray(imageUrl: string) {
    return convertImgToNativeImage(imageUrl)
        .then(image => {
            appTray = new Tray(image);
        });
}

function initTrayListener() {

    ipcMain.on('ngx-electron-set-tray-image', (event, imageUrl) => {
        if (appTray && !appTray.isDestroyed()) {
            convertImgToNativeImage(imageUrl)
                .then(image => appTray.setImage(image));
        }
    });
    ipcMain.on('ngx-electron-renderer-create-tray', (event, imageUrl) => {
        if (appTray && !appTray.isDestroyed()) {
            appTray.destroy();
        }
        createTray(imageUrl).then(() => event.returnValue = appTray);
    });

    // 单击菜单
    ipcMain.on('ngx-electron-renderer-set-tray-context-menu', (event, template, timestamp) => {
        if (appTray && !appTray.isDestroyed()) {
            appTray.setContextMenu(Menu.buildFromTemplate(template.map((currentValue, index) => ({
                ...currentValue,
                click: () => event.sender.send(`ngx-electron-click-tray-context-menu-item-${timestamp}`, index)
            }))));
        }
    });
    // 单击菜单
    ipcMain.on('ngx-electron-renderer-set-tray-menu-items', (event, template: any[]) => {
        if (appTray && !appTray.isDestroyed()) {
            // const click: any = template[0].click;
            // template[0].click = () => {
            //     console.log(click);
            //     click();
            // };
            appTray.setContextMenu(Menu.buildFromTemplate(template));
        }
        event.returnValue = null;
    });
    ipcMain.on('ngx-electron-tray-apply-method', (event, methodName, ...margs) =>
        event.returnValue = !!appTray && !appTray.isDestroyed() && appTray[methodName](...margs));

}

export {createTray, initTrayListener};
