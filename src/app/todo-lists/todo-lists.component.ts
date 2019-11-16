import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {TodoList} from '../model/TodoList.model';
import {TodoService} from '../todo.service';

@Component({
  selector: 'td-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.scss']
})
export class TodoListsComponent implements OnInit {
  @Output()
  itemClick: EventEmitter<string> = new EventEmitter<string>();

  todoLists$: Observable<TodoList[]>;
  constructor(private todoService: TodoService) { }

  ngOnInit() {
    this.todoLists$ = this.todoService.todoLists$;
  }

  onTodoListClick(id: string) {
    this.itemClick.emit(id);
  }

}
