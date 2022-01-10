import {NgxElectronAppProxy} from "../app/ngx-electron-app-proxy";
import {CommonInterface} from "electron";

export interface NgxElectronCommonInterfaceProxy extends CommonInterface {
    app: NgxElectronAppProxy;

}
