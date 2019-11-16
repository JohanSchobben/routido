import {Component, OnInit, Renderer2} from '@angular/core';
import {Observable} from 'rxjs';
import {HeaderService} from '../header.service';
import {Location} from '@angular/common';

@Component({
  selector: 'td-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title$: Observable<string>;
  isBottom$: Observable<boolean>;
  eventRenderer: any;
  online = true;

  constructor(
    private headerService: HeaderService,
    private location: Location,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.title$ = this.headerService.tilte$;
    this.isBottom$ = this.headerService.isBottom$;
    this.renderer.listen('window', 'online', () => {this.online = true; });
    this.renderer.listen('window', 'offline', () => {this.online = false; });
    this.online = window.navigator.onLine;
  }


  goBack() {
    this.location.back();
  }

}
