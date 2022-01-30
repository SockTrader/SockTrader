export default class BinanceErrorHandler {

  handle(error: Error): void {
    console.warn(`--- ${error.name} ---`);
    console.warn(`${error.message}`);
    console.warn('------------------------');
  }

}
