'use strict';

class ServiceLocator {
  private static instance: ServiceLocator;
  private dependencies: { [key: string]: () => any } = {};
  private singletons: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  public register<T>(dependencyName: string, dependency: () => T, lazy = false): void {
    this.dependencies[dependencyName] = dependency;
    if (!lazy) {
      this.singletons[dependencyName] = dependency();
    }
  }

  public resolve<T>(dependencyName: string): T {
    if (!this.dependencies[dependencyName]) {
      throw new Error(`Dependency not found: ${dependencyName}`);
    }
    if (!this.singletons[dependencyName]) {
      this.singletons[dependencyName] = this.dependencies[dependencyName]();
    }
    return this.singletons[dependencyName];
  }

  public reset(): void {
    this.dependencies = {};
    this.singletons = {};
  }
}

export default ServiceLocator;
