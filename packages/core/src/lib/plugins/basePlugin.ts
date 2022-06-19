import { Observable, Subscription } from 'rxjs'
import { Plugin } from './plugin.interfaces'

export class BasePlugin implements Plugin {

  private _subscriptions: Subscription[] = []

  onRegister(): void {

  }

  onUnregister(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe())
  }

  protected subscribe<T>(observable: Observable<T>, next: (value: T) => void): void {
    this._subscriptions.push(observable.subscribe(next))
  }

}
