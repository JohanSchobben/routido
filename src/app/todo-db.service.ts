import {Inject, Injectable} from '@angular/core';
import {openDB} from 'idb';
import {DBSchema} from 'idb/lib/entry';
import {TodoList} from './model/TodoList.model';

@Injectable({
    providedIn: 'root'
})
export class IndexedDbService {
    db: Promise<any>;
    constructor(@Inject('DB_NAME') DB_NAME: string, @Inject('DB_VERSION') DB_VERSION: number) {
        this.db = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                const objectStore  = db.createObjectStore('todos', {
                    keyPath: 'id'
                });
                objectStore.createIndex('todoindex', 'id', {unique: true});
            }
        });
    }

    async store(todoList: TodoList) {
        const db = await this.db;
        const action = db.transaction('todos', 'readwrite')
            .objectStore('todos')
            .add(todoList.toObject());
        return await action.done;
    }

    async readData(): Promise<TodoList[]> {
        const db = await this.db;
        const action = db.transaction('todos', 'readonly')
            .objectStore('todos');
        const objects = await action.getAll();

        return objects.map(obj => {
            const todoList = new TodoList();
            todoList.id = obj.id;
            todoList.name = obj.name;
            todoList.tasks = obj.tasks;
            return todoList;
        });
    }

    async putData(todoList: TodoList) {
        const db = await this.db;
        const action = await db.transaction('todos', 'readwrite')
            .objectStore('todos')
            .put(todoList.toObject());
        return await action.done;
    }

    async deleteData(id: string) {
        const db = await this.db;
        const action = await db.transaction('todos', 'readwrite')
            .objectStore('todos')
            .delete(id);
    }
}
