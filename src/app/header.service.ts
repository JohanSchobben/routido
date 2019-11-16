import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private title: BehaviorSubject<string>;
  private isBottom: BehaviorSubject<boolean>;
  public readonly tilte$: Observable<string>;
  public readonly isBottom$: Observable<boolean>;

  constructor(
    @Inject('APP_NAME') APP_NAME: string,
    private router: Router
    ) {
    this.title = new BehaviorSubject<string>(APP_NAME);
    this.isBottom = new BehaviorSubject<boolean>(true);
    this.tilte$ = this.title.asObservable();
    this.isBottom$ = this.isBottom.asObservable();

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.isBottom.next(event.url === '/');
      }
    });
  }

  public setItitle(newTitle: string = 'RoutiDo'): void {
    this.title.next(newTitle);
  }
}
