/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mockImplementation(fn: (...args: Y) => T): this;
    mockReturnValue(value: T): this;
    mockReset(): void;
    mockClear(): void;
    getMockName(): string;
    mock: {
      calls: Y[];
      instances: T[];
      contexts: any[];
      results: { type: 'return' | 'throw'; value: T }[];
    };
  }
}

declare global {
  namespace jest {
    interface Matchers<R, T = {}> {
      toBeInTheDocument(): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(expected: number): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeDefined(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(expected: any): R;
      toHaveLength(expected: number): R;
      toHaveProperty(path: string, value?: any): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
    }
  }

  const jest: {
    fn<T = any>(): jest.Mock<T>;
    spyOn(object: any, method: string): jest.Mock;
    mock(moduleName: string, factory?: any): any;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    setTimeout(timeout: number): void;
  };

  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  
  const expect: {
    (value: any): jest.Matchers<void, {}>;
    extend(matchers: { [name: string]: any }): void;
  };
}

export {};
