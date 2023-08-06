import { SHARE_ENV, Worker as NativeWorker } from 'worker_threads';
import { WorkerData } from './worker.interfaces';

export class Worker {
  private _tsNodeAvailable: boolean | undefined;

  run(script: string): void {
    new NativeWorker(this._createScript(), {
      eval: true,
      workerData: <WorkerData>{
        strategy: script,
      },
      env: SHARE_ENV,
    });
  }

  private _createScript(): string {
    if (!this.isTsNodeAvailable())
      throw new Error(
        'ts-node is not installed. Run "npm install -D ts-node“ and continue.'
      );

    return `
      require("ts-node/register/transpile-only");
      require("${__dirname}/execution.script").default();
    `;
  }

  private isTsNodeAvailable(): boolean {
    if (this._tsNodeAvailable) return this._tsNodeAvailable;

    try {
      require.resolve('ts-node');
      this._tsNodeAvailable = true;
    } catch (e: unknown) {
      if (e && (e as { code?: string })?.code === 'MODULE_NOT_FOUND') {
        this._tsNodeAvailable = false;
      } else {
        throw e;
      }
    }

    return this._tsNodeAvailable;
  }
}
