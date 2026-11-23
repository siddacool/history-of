declare module 'd3-scale' {
  export interface ScaleLinear {
    domain(): [number, number];
    domain(domain: [number, number]): this;
    range(): [number, number];
    range(range: [number, number]): this;
    nice(): this;
    (value: number): number;
  }
  export function scaleLinear(): ScaleLinear;
}

declare module 'd3-zoom' {
  export function zoom(): unknown;
}
