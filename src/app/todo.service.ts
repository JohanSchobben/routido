import { Injectable } from '@angular/core';
import {BehaviorSubject, from,  Observable} from 'rxjs';
import {TodoList} from './model/TodoList.model';
import {filter, mergeMap} from 'rxjs/operators';
import {IndexedDbService} from "./todo-db.service";

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private data: BehaviorSubject<TodoList[]> = new BehaviorSubject([]);
  public todoLists$: Observable<TodoList[]> = this.data.asObservable();

  constructor(private idbService: IndexedDbService){
      this.idbService.readData()
          .then(lists => this.data.next(lists));
  }

  public readById(id: string): Observable<TodoList> {
    return this.data
      .pipe(
        mergeMap((todolists: TodoList[]) => from(todolists)),
        filter((todolist: TodoList) => todolist.id === id)
      );
  }

  public async add(todoList: TodoList): Promise<void> {
    const currentLists = this.data.getValue();
    currentLists.push(todoList);
    await this.idbService.store(todoList);
    this.data.next(currentLists);

  }

  public async markTodo(todoListId: string, action: string): Promise<void> {
    const todoLists = this.data.getValue();
    const todoList = todoLists.find(todolist => todolist.id === todoListId);
    const todoItem = todoList.tasks.find(t => t.action === action);
    todoItem.done = !todoItem.done;
    this.data.next(todoLists);
    await this.idbService.putData(todoList);
  }

  public async deleteTodoList(id: string): Promise<void> {
    let currentLists = this.data.getValue();
    currentLists = currentLists.filter(todoList => todoList.id !== id);
    this.data.next(currentLists);
    await this.idbService.deleteData(id);
  }
}
