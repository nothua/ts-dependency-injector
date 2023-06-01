import ServiceLocator from '../ServiceLocator';

class DependencyA {
  public name = 'DependencyA';
}

class DependencyB {
  constructor(public dependencyA: DependencyA) {}
  public name = 'DependencyB';
}

class DependencyC {
  constructor(public dependencyB: DependencyB) {}
  public name = 'DependencyC';
}

describe('ServiceLocator', () => {
  beforeEach(() => {
    ServiceLocator.getInstance().reset();
  });

  it('should register and resolve non-lazy singletons', () => {
    ServiceLocator.getInstance().register('DependencyA', () => new DependencyA());

    const dependencyA1 = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA');
    const dependencyA2 = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA');

    expect(dependencyA1).toBeInstanceOf(DependencyA);
    expect(dependencyA2).toBeInstanceOf(DependencyA);
    expect(dependencyA1).toBe(dependencyA2);
  });

  it('should register and resolve lazy dependencies', () => {
    ServiceLocator.getInstance().register('DependencyA', () => new DependencyA(), true);

    const dependencyA1 = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA');
    const dependencyA2 = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA');

    expect(dependencyA1).toBeInstanceOf(DependencyA);
    expect(dependencyA2).toBeInstanceOf(DependencyA);
    expect(dependencyA1).toBe(dependencyA2);
  });

  it('should resolve chain dependencies', () => {
    ServiceLocator.getInstance().register('DependencyA', () => new DependencyA());
    ServiceLocator.getInstance().register(
      'DependencyB',
      () => new DependencyB(ServiceLocator.getInstance().resolve<DependencyA>('DependencyA')),
    );
    ServiceLocator.getInstance().register(
      'DependencyC',
      () => new DependencyC(ServiceLocator.getInstance().resolve<DependencyB>('DependencyB')),
    );

    const dependencyC = ServiceLocator.getInstance().resolve<DependencyC>('DependencyC');

    expect(dependencyC).toBeInstanceOf(DependencyC);
    expect(dependencyC.dependencyB).toBeInstanceOf(DependencyB);
    expect(dependencyC.dependencyB.dependencyA).toBeInstanceOf(DependencyA);
  });
});
