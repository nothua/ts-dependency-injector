/**
 * Represents one unit of dependency to be declared in {ServiceLocator}.
 */
export abstract class Dependency<T> {
  abstract get(args?: any): T;

  abstract onDispose: ((object: T) => Promise<void>) | undefined;
}

/**
 * Declares singleton dependency class.
 */
// tslint:disable-next-line:max-classes-per-file
export class SingletonDependency<T> implements Dependency<T> {
  private instance?: T;
  readonly onCreate: () => T;
  onDispose: ((object: T) => Promise<void>) | undefined;

  /**
   * Constructor.
   * @param{string} key
   * @param{()} onCreate
   * @param{boolean} lazy
   * @param{function} onDispose
   */
  constructor(key: string, onCreate: () => T, lazy: boolean, onDispose?: (object: T) => Promise<void>) {
    this.onCreate = onCreate;
    if (!lazy) {
      this.instance = onCreate();
    }
    this.onDispose = onDispose;
  }

  /**
   * Get the instance.
   * @return {object}
   */
  get(): T {
    if (this.instance == null) {
      this.instance = this.onCreate();
    }
    return this.instance;
  }
}

/**
 * Creates new instance every time it is resolved
 */
// tslint:disable-next-line:max-classes-per-file
export class FactoryDependency<T> implements Dependency<T> {
  readonly onCreate: (args: any) => T;
  private disposables: T[] = [];
  onDispose: (() => Promise<void>) | undefined;

  /**
   * Constructor.
   * @param{string} key
   * @param{()} onCreate
   * @param{function} onDispose
   */
  constructor(key: string, onCreate: (args: any) => T, onDispose?: (object: T) => Promise<void>) {
    this.onCreate = (args) => {
      const createdObject = onCreate(args);
      this.disposables.push(createdObject);
      return createdObject;
    };
    this.onDispose = async () => {
      for (const disposable of this.disposables) {
        if (onDispose) {
          await onDispose(disposable);
        }
      }
    };
  }

  /**
   * Get the instance.
   * @return {object}
   */
  get(args?: any): T {
    return this.onCreate(args);
  }
}
