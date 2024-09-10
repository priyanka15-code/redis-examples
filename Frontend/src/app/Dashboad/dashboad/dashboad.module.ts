import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboadComponent } from "./dashboad.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { DashbordLayoutComponent } from "./dashbord-layout/dashbord-layout.component";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    component: DashbordLayoutComponent,
    children: [
      { path: "", component: DashboadComponent },
      { path: "", component: NavbarComponent },
      {
        path: "user",
        loadChildren: () =>
          import("../dashboad/pages/user/user.module").then(
            (m) => m.UserModule
          ),
      },
      {
        path: "business-request",
        loadChildren: () =>
          import("../dashboad/pages/business-requests/business-requests.module").then(
            (m) => m.BusinessModule
          ),
      },
      {
        path: "backnoex",
        loadChildren: () =>
          import("./pages/backno-example/user-request.module").then(
            (m) => m.UserRequestModule
          ),
      },
      {
        path: "infinite",
        loadChildren: () =>
          import("../dashboad/pages/scrolling/scrolling.module").then(
            (m) => m.ScrollingModule
          )
      },
      {
        path: "undoex",
        loadChildren: () =>
          import("./pages/undoex/backno.module").then(
            (m) => m.BacknoModule
          )
      },
      
    ],
  },
];

@NgModule({
  declarations: [DashboadComponent, DashbordLayoutComponent, NavbarComponent,],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    
  ],
})
export class DashboardModule {}
