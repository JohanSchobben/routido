import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'td-add-button',
  template: `
    <button mat-fab color="accent" (click)="addEvent.emit()">
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: [`
  :host{
    position: fixed;
    right: 5%;
    bottom: 5%;
  }
  `]
})
export class AddButtonComponent {
  @Output('add')
  addEvent: EventEmitter<void> = new EventEmitter();
}
