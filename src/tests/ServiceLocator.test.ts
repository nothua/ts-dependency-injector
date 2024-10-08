import { ServiceLocator } from '../ServiceLocator';

class DependencyA {
  constructor(description?: string) {
    this.description = description;
  }

  public name = 'DependencyA';
  public description: string| undefined;
}

// tslint:disable-next-line:max-classes-per-file
class DependencyB {
  constructor(public dependencyA: DependencyA) {}

  public name = 'DependencyB';
}

// tslint:disable-next-line:max-classes-per-file
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


  it('should register and resolve new instances factory dependencies', () => {
    ServiceLocator.getInstance().registerFactory('DependencyA', (params: any) => new DependencyA(params));

    const dependencyA1 = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA', "Dependency 1");
    const dependencyA2 = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA', "Dependency 2");

    expect(dependencyA1).toBeInstanceOf(DependencyA);
    expect(dependencyA2).toBeInstanceOf(DependencyA);
    expect(dependencyA1).not.toBe(dependencyA2);
    expect(dependencyA1.description).toBe("Dependency 1");
    expect(dependencyA2.description).toBe("Dependency 2");
  });

  it('should register and resolve lazy dependencies', () => {
    ServiceLocator.getInstance().register(
      'DependencyA',
      () => new DependencyA(),
      true,
      async (object: any) => {
        // Do nothing
      },
    );

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

  it('should dispose the dependencies successfully in reversed order ', async () => {
    let currentDisposeIndex = 0;
    let aDisposeIndex : number | undefined;
    let bDisposeIndex : number | undefined;
    let cDisposeIndex : number | undefined;


    ServiceLocator.getInstance().register(
      'DependencyA',
      () => new DependencyA(),
      false,
      async () => {
        aDisposeIndex = currentDisposeIndex;
        currentDisposeIndex++;
      },
    );
    ServiceLocator.getInstance().register(
      'DependencyB',
      () => new DependencyB(ServiceLocator.getInstance().resolve<DependencyA>("DependencyA")),
      false,
      async () => {
        bDisposeIndex = currentDisposeIndex;
        currentDisposeIndex++;
      },
    );
    ServiceLocator.getInstance().register(
      'DependencyC',
      () => new DependencyC(ServiceLocator.getInstance().resolve<DependencyB>("DependencyB")),
      false,
      async () => {
        cDisposeIndex = currentDisposeIndex;
        currentDisposeIndex++;
      },
    );

    const dependencyA = ServiceLocator.getInstance().resolve<DependencyA>('DependencyA');
    expect(aDisposeIndex).toBeUndefined();
    expect(dependencyA).not.toBeNull();
    expect(dependencyA).toBeInstanceOf(DependencyA);

    const dependencyB = ServiceLocator.getInstance().resolve<DependencyB>('DependencyB');
    expect(bDisposeIndex).toBeUndefined();
    expect(dependencyB).not.toBeNull();
    expect(dependencyB).toBeInstanceOf(DependencyB);

    const dependencyC = ServiceLocator.getInstance().resolve<DependencyC>('DependencyC');
    expect(cDisposeIndex).toBeUndefined();
    expect(dependencyC).not.toBeNull();
    expect(dependencyC).toBeInstanceOf(DependencyC);

    await ServiceLocator.getInstance().reset();
    expect(aDisposeIndex).toBe(2);
    expect(bDisposeIndex).toBe(1);
    expect(cDisposeIndex).toBe(0);

    expect(() => ServiceLocator.getInstance().resolve('DependencyA')).toThrow();
    expect(() => ServiceLocator.getInstance().resolve('DependencyB')).toThrow();
    expect(() => ServiceLocator.getInstance().resolve('DependencyC')).toThrow();
  });
});
