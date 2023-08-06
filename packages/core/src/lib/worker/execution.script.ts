import { access } from 'fs';
import { resolve } from 'path';
import { workerData } from 'worker_threads';
import { Strategy } from '../interfaces';
import { WorkerData } from './worker.interfaces';

class ExecutionScript {
  private _data: WorkerData = workerData;

  constructor() {
    //noinspection SuspiciousTypeOfGuard
    if (typeof this._data.strategy !== 'string')
      throw new Error('Strategy is not a string');

    const file = resolve(process.cwd(), this._data.strategy);
    access(file, (notAccessible) => {
      if (notAccessible) throw new Error(`File: ${file} not found`);

      //eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: StrategyClass } = require(file);
      const instance: Strategy = new StrategyClass();
      instance.onStart();
    });
  }
}

export default () => new ExecutionScript();
