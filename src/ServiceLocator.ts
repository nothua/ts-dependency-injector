'use strict';
import SingletonDependency from './Dependency';

class ServiceLocator {
  private static instance: ServiceLocator;
  private dependencies: { [key: string]: SingletonDependency<any> } = {};

  private constructor() {}

  public static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  public register<T>(
    dependencyName: string,
    dependency: () => T,
    lazy = false,
    onDispose?: (object: T) => Promise<void>,
  ): void {
    this.dependencies[dependencyName] = new SingletonDependency<any>(dependencyName, dependency, lazy, onDispose);
  }

  public resolve<T>(dependencyName: string): T {
    const dependency = this.dependencies[dependencyName];
    if (dependency == null) {
      throw new Error(`Dependency not found: ${dependencyName}`);
    }

    return dependency.get();
  }

  public async reset(): Promise<void> {
    for (const dependency of Object.values(this.dependencies)) {
      if (dependency.onDispose != null) {
        await dependency.onDispose(dependency.get());
      }
    }
    this.dependencies = {};
  }
}

export default ServiceLocator;
