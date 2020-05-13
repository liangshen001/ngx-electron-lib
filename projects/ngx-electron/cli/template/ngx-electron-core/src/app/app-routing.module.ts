import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';


const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'page1'
    },
    {
        path: 'page1',
        loadChildren: () => import('src/app/modules/page1/page1.module').then(module => module.Page1Module)
    }, {
        path: 'page2',
        loadChildren: () => import('src/app/modules/page2/page2.module').then(module => module.Page2Module)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
