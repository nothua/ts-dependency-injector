class SingletonDependency<T> {
  private instance?: T;
  readonly onCreate: () => T;
  private key: string;
  onDispose: ((object: T) => Promise<void>) | undefined;
  private lazy: boolean = false;

  constructor(key: string, onCreate: () => T, lazy = false, onDispose?: (object: T) => Promise<void>) {
    this.key = key;
    this.onCreate = onCreate;
    if (!lazy) {
      this.instance = onCreate();
    }
    this.lazy = lazy;
    this.onDispose = onDispose;
  }

  public get(): T {
    if (this.instance == null) {
      this.instance = this.onCreate();
    }
    return this.instance;
  }
}

export default SingletonDependency;
