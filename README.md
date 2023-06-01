# TS Service Locator

The `ts-service-locator` package provides a lightweight dependency injection container that allows you to register and resolve dependencies in your application. It supports both lazy and non-lazy dependencies, as well as resolving chain dependencies.

## Features

- **Dependency Registration**: Register both lazy and non-lazy dependencies using the register method.
- **Singleton Support**: Register and resolve non-lazy singletons using the registerSingleton method.
- **Chain Dependency Resolution**: Resolve dependencies that have chain dependencies by registering them in the correct order.
- **Lazy Loading**: Register lazy dependencies using the register method with the lazy parameter set to true.
- **Generic Support**: Use generics to specify the type of the resolved dependency when calling the resolve method.
- **Dependency Reset**: Reset all registered dependencies using the reset method.

## Installation

You can install the `ts-service-locator` package using a package manager like npm or yarn. Open your terminal and run the following command:

```bash
npm install ts-service-locator
```

or

```bash
yarn add ts-service-locator
```

## Usage

To use the `ts-service-locator` package in your application, follow these steps:

### 1. Import the ServiceLocator class

Import the `ServiceLocator` class into your file:

```ts
import { ServiceLocator } from 'ts-service-locator';
```

### 2. Register Dependencies

To register a dependency, use the `register` method of the `ServiceLocator` instance. You can register both lazy and non-lazy dependencies.

```ts
ServiceLocator.getInstance().registerSingleton('DependencyA', () => new DependencyA());
```

For lazy dependencies, set the `lazy` parameter to `true`:

```ts
ServiceLocator.getInstance().register('DependencyB', () => new DependencyB(), true);
```

### 3. Resolve Dependencies

To resolve a dependency, use the `resolve` method of the `ServiceLocator` instance. Specify the key or name of the dependency, and the method will return the resolved instance.

```ts
const dependencyA = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA');
```

### 4. Resolve Chain Dependencies

The `ts-service-locator` package supports resolving chain dependencies. Register the dependencies in the correct order.

```ts
ServiceLocator.getInstance().registerSingleton('DependencyA', () => new DependencyA());
ServiceLocator.getInstance().register(
  'DependencyB',
  () => new DependencyB(ServiceLocator.getInstance().resolve<DependencyA>('DependencyA')),
);
```

### 5. Reset Dependencies

Reset all registered dependencies using the `reset` method.

```ts
ServiceLocator.getInstance().reset();
```

## Example

Here's an example showcasing the usage of `ts-service-locator`:

```ts
import { ServiceLocator } from 'ts-service-locator';

class DependencyA {
  public name = 'DependencyA';
}

class DependencyB {
  constructor(public dependencyA: DependencyA) {}
  public name = 'DependencyB';
}

const serviceLocator = ServiceLocator.getInstance();

serviceLocator.registerSingleton('DependencyA', () => new DependencyA());
serviceLocator.register('DependencyB', () => new DependencyB(serviceLocator.resolve<DependencyA>('DependencyA')));

const dependencyB = serviceLocator.resolve<DependencyB>('DependencyB');
console.log(dependencyB.name); // Output: DependencyB
console.log(dependencyB.dependencyA.name); // Output: DependencyA
```
