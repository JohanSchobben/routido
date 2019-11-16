import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TodoListPageComponent} from './todo-list-page/todo-list-page.component';
import {NewTodoListComponent} from './new-todo-list/new-todo-list.component';
import {TodoPageComponent} from './todo-page/todo-page.component';


const routes: Routes = [
  {path: '', component: TodoListPageComponent},
  {path: 'new', component: NewTodoListComponent},
  {path: 'todo/:id', component: TodoPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
