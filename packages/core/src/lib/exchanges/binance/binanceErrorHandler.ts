export class BinanceErrorHandler {
  handle(error: Error): void {
    console.warn(`\x1b[31m--- ${error.name} ---\x1b[0m`);
    console.warn(`${error.message}`);
    console.warn('\x1b[31m---------------------\x1b[0m');
  }
}
