import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {HeaderService} from '../header.service';

@Component({
  selector: 'td-todo-list-page',
  templateUrl: './todo-list-page.component.html',
  styleUrls: ['./todo-list-page.component.scss']
})
export class TodoListPageComponent implements OnInit {

  constructor(private router: Router, private headerService: HeaderService) { }

  ngOnInit() {
    this.headerService.setItitle();
  }

  onAdd(): void {
    this.router.navigate(['new']);
  }

  onItemClick(id: string) {
    this.router.navigateByUrl(`/todo/${id}`);
  }
}
