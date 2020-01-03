import {ApplicationRef, NgModuleRef, Type} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import {createNewHosts} from '@angularclass/hmr';


export function bootstrapModule<M>(moduleType: Type<M>) {

    const hmrBootstrap = (module: any, bootstrap2: () => Promise<NgModuleRef<any>>) => {
        let ngModule: NgModuleRef<any>;
        module.hot.accept();
        bootstrap2().then(currentModule => ngModule = currentModule);
        module.hot.dispose(() => {
            const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
            const elements = appRef.components.map(c => c.location.nativeElement);
            // const removeOldHosts = createNewHosts(elements);
            // ngModule.destroy();
            // removeOldHosts();
        });
    };

    const bootstrap = () => platformBrowserDynamic().bootstrapModule(moduleType);
    if (module[ 'hot' ]) {
        hmrBootstrap(module, bootstrap);
    } else {
        bootstrap();
    }
}
