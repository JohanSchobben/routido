import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {TodoList} from '../model/TodoList.model';
import {ActivatedRoute, Router} from '@angular/router';
import {flatMap, map} from 'rxjs/operators';
import {HeaderService} from '../header.service';
import {TodoService} from '../todo.service';
import {Todo} from '../model/Todo.model';

@Component({
  selector: 'td-todo-page',
  templateUrl: './todo-page.component.html',
  styleUrls: ['./todo-page.component.scss']
})
export class TodoPageComponent implements OnInit, OnDestroy {
  currentTodListSubscription: Subscription;
  currentTodoList: TodoList;
  constructor(private route: ActivatedRoute, private headerService: HeaderService, private todoService: TodoService, private router: Router) { }

  ngOnInit() {
    this.currentTodListSubscription = this.route.paramMap
      .pipe(
        map(paramMap => paramMap.get('id')),
        flatMap(id => this.todoService.readById(id))
      ).subscribe((todoList: TodoList) => {
        this.currentTodoList = todoList;
        this.headerService.setItitle(`RoutiDo - ${todoList.name}`);
      });

  }

  onTaskClick(todo: Todo) {
    this.todoService.markTodo(this.currentTodoList.id, todo.action);
  }

  onDelete() {
    this.todoService.deleteTodoList(this.currentTodoList.id);
    this.router.navigateByUrl('/');
  }

  ngOnDestroy() {
    this.currentTodListSubscription.unsubscribe();
  }

}
