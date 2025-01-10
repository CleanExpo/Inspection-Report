declare namespace k6 {
    const metrics: any;
}

declare module 'k6' {
    export const check: (val: any, sets: { [key: string]: (val: any) => boolean }) => boolean;
    export const sleep: (t: number) => void;
    export const group: (name: string, fn: () => void) => void;
    export const fail: (msg?: string) => void;
}

declare module 'k6/http' {
    export interface Response {
        status: number;
        body: string;
        json: (selector?: string) => any;
        headers: { [key: string]: string };
        timings: {
            duration: number;
            waiting: number;
            connecting: number;
        };
    }

    export interface RequestParams {
        headers?: { [key: string]: string };
        tags?: { [key: string]: string };
    }

    export function post(url: string, body: any, params?: RequestParams): Response;
    export function get(url: string, params?: RequestParams): Response;
    export function put(url: string, body: any, params?: RequestParams): Response;
    export function del(url: string, params?: RequestParams): Response;
}

declare module 'k6/metrics' {
    export class Trend {
        constructor(name: string);
        add(value: number): void;
    }

    export class Rate {
        constructor(name: string);
        add(value: number): void;
    }

    export class Counter {
        constructor(name: string);
        add(value: number): void;
    }
}

declare const __ENV: { [key: string]: string };
