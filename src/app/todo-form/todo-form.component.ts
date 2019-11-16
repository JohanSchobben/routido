import { Component } from '@angular/core';
import {TodoService} from '../todo.service';
import {TodoList} from '../model/TodoList.model';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'td-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent {
  items: string[] = [];
  showError = false;
  showNameError: boolean;
  name = '';

  constructor(
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  addTodo(event) {
    if (this.items.includes(event.target.value) || event.target.value.trim().length === 0) {
      this.showError = true;
      return;
    } else  {
      this.showError = false;
    }

    this.items.push(event.target.value.trim());
    event.target.value = '';
  }

  onItemClick(item: string) {
    this.items = this.items.filter(t => t !== item);
  }

  onSave() {
    if (this.name.trim().length === 0) {
      this.showNameError = true;
      return;
    } else  {
      this.showNameError = false;
    }

    const todo = new TodoList();
    todo.id = Date.now().toString();
    todo.name = this.name;
    todo.tasks = this.items.map(name => ({action: name, done: false}));
    this.todoService.add(todo);
    this.router.navigateByUrl('/');
    this.snackBar.open('Todo is opgeslagen');
    setTimeout(() => {
      this.snackBar.dismiss();
    }, 5000);
  }
}
