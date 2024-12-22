/* eslint-disable @typescript-eslint/no-explicit-any */
"use strict";

import {Dependency, FactoryDependency, SingletonDependency} from "./Dependency";

/**
 * Service locator class.
 */
export class ServiceLocator {
  private static instance?: ServiceLocator | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dependencies: { [key: string]: Dependency<any> } = {};
  /**
   * Prevents reassigment of dependencies unless reset is called.
   */
  allowReassignment = false;


  /**
   * Private constructor to prevent instantiation.
   * @private
   */
  private constructor() {
    // Do nothing
  }

  // eslint-disable-next-line require-jsdoc
  public static getInstance(): ServiceLocator {
    if (ServiceLocator.instance == null) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  /**
   * Registers a singleton dependency.
   * @param{string} dependencyName
   * @param{Function} dependency
   * @param{boolean} lazy
   * @param{Function} onDispose
   * @throws {Error} - If the dependency is already registered.
   * @template T
   */
  public register<T>(
    dependencyName: string,
    dependency: () => T,
    lazy = false,
    onDispose?: (object: T) => Promise<void>,
  ): void {
    if (this.dependencies[dependencyName] != null &&
      !this.allowReassignment) {
      throw new Error(`Dependency already registered: ${dependencyName}`);
    }
    this.dependencies[dependencyName] = new SingletonDependency<T>(
      dependencyName,
      dependency,
      lazy,
      onDispose,
    );
  }

  /**
   * Registers a factory dependency.
   * @param{string} dependencyName
   * @param{Function} dependency
   * @param{Function} onDispose
   * @throws {Error} - If the dependency is already registered.
   * @template T
   */
  public registerFactory<T>(
    dependencyName: string,
    dependency: (args: any) => T,
    onDispose?: (object: T) => Promise<void>,
  ): void {
    if (this.dependencies[dependencyName] != null &&
      !this.allowReassignment) {
      throw new Error(`Dependency already registered: ${dependencyName}`);
    }
    this.dependencies[dependencyName] = new FactoryDependency<T>(
      dependencyName,
      dependency,
      onDispose,
    );
  }

  /**
   * Resolve a dependency.
   * @param{string} dependencyName
   * @param{any} args
   * @return {object} - The resolved dependency.
   */
  public resolve<T>(dependencyName: string, args?: any): T {
    const dependency = this.dependencies[dependencyName];
    if (dependency == null) {
      throw new Error(`Dependency not found: ${dependencyName}`);
    }

    return dependency.get(args);
  }

  /**
   * Reset the service locator.
   */
  public async reset(): Promise<void> {
    for (const dependency of Object.values(this.dependencies).reverse()) {
      if (dependency.onDispose != null) {
        await dependency.onDispose(dependency.get());
      }
    }
    this.dependencies = {};
    ServiceLocator.instance = null;
  }
}
