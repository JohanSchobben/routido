import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment} from "../environments/environment";
import { TodoListsComponent } from './todo-lists/todo-lists.component';
import {
    MatButtonModule,
    MatCardModule, MatCheckboxModule, MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule, MatSnackBarModule,
    MatToolbarModule, MatTooltipModule
} from '@angular/material';
import { AddButtonComponent } from './add-button/add-button.component';
import { TodoListPageComponent } from './todo-list-page/todo-list-page.component';
import { NewTodoListComponent } from './new-todo-list/new-todo-list.component';
import { HeaderComponent } from './header/header.component';
import { TodoFormComponent } from './todo-form/todo-form.component';
import {FormsModule} from '@angular/forms';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoPageComponent } from './todo-page/todo-page.component';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    declarations: [
        AppComponent,
        TodoListsComponent,
        AddButtonComponent,
        TodoListPageComponent,
        NewTodoListComponent,
        HeaderComponent,
        TodoFormComponent,
        TodoListComponent,
        TodoPageComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatDividerModule,
        MatCheckboxModule,
        MatTooltipModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [
        {provide: "APP_NAME", useValue: "RoutiDo"}
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
