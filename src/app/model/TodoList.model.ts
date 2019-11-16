import {Todo} from './Todo.model';

export class TodoList {
  private _id: string;
  private _name: string;
  private _tasks: Todo[];


  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get tasks(): Todo[] {
    return this._tasks;
  }

  set tasks(value: Todo[]) {
    this._tasks = value;
  }

  getPercentage(): number {
    const total = this._tasks.length;
    const done = this._tasks.filter(todo => todo.done).length;
    return 100 / total * done;
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      tasks: this.tasks
    };
  }
}
