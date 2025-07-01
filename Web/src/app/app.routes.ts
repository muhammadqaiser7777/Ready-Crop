import { Routes } from '@angular/router';
import  {LayoutComponent} from './Layout/layout/layout.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent
  },
  {
    path: '**',
    redirectTo: '/' // Redirect unknown routes to home
  }
];

export default routes;
