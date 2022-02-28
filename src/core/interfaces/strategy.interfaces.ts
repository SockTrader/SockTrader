export interface Strategy {
  onStart(): void;
  onStop?(): void;
}
