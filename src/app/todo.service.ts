import { Injectable } from '@angular/core';
import {BehaviorSubject, from,  Observable} from 'rxjs';
import {TodoList} from './model/TodoList.model';
import {filter, mergeMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private data: BehaviorSubject<TodoList[]> = new BehaviorSubject([]);
  public todoLists$: Observable<TodoList[]> = this.data.asObservable();

  public readById(id: string): Observable<TodoList> {
    return this.data
      .pipe(
        mergeMap((todolists: TodoList[]) => from(todolists)),
        filter((todolist: TodoList) => todolist.id === id)
      );
  }

  public add(todoList: TodoList): void {
    const currentLists = this.data.getValue();
    currentLists.push(todoList);
    this.data.next(currentLists);

  }

  public markTodo(todoListId: string, action: string): void {
    const todoLists = this.data.getValue();
    const todoList = todoLists.find(todolist => todolist.id === todoListId);
    const todoItem = todoList.tasks.find(t => t.action === action);
    todoItem.done = !todoItem.done;
    this.data.next(todoLists);
  }

  public deleteTodoList(id: string): void {
    let currentLists = this.data.getValue();
    currentLists = currentLists.filter(todoList => todoList.id !== id);
    this.data.next(currentLists);
  }
}
