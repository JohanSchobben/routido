import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TodoList} from '../model/TodoList.model';
import {Todo} from '../model/Todo.model';

@Component({
  selector: 'td-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {
  @Input()
  todoList: TodoList;
  @Output()
  taskClick: EventEmitter<Todo> = new EventEmitter();
  @Output()
  delete: EventEmitter<void> = new EventEmitter();

  onTaskClick(task: Todo) {
    this.taskClick.emit(task);
  }

  onDelete() {
    this.delete.emit();
  }
}
