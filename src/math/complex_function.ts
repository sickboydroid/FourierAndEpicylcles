import { lowerBound, vectorLerp2 as lerp } from "../utils/utils";
import { precisions } from "../utils/state";
import Complex from "./complex_number";
import { Phasor } from "./phasor";

export default class ComplexFunction {
  input: number[];
  output: Complex[];
  phasors: Phasor[];

  constructor() {
    this.input = [];
    this.output = [];
    this.phasors = [];
  }

  addMapping(input: number, output: Complex) {
    this.input.push(input);
    this.output.push(output);
  }

  computePhasors(from: number, to: number) {
    if (this.output.length == 0) return;
    if (!this.output[0].equals(this.output.at(-1)!)) {
      console.warn(
        "Function.computePhasors(...): Function is not closed, prefer it closing",
      );
      // this.output[this.output.length - 1] = this.output[0];
    }
    this.phasors = [];
    for (let i = from; i <= to; i++) {
      const constant = this.integrateWithPhasor(0, 1, new Phasor(1, -i, 0));
      const phasor = new Phasor(constant.amplitude, i, constant.phase);
      this.phasors.push(phasor);
    }
  }

  getValueAt(input: number) {
    if (this.input.length === 0) throw Error("Empty function");

    const pos = lowerBound(this.input, input);

    if (pos <= 0) return this.output[0];
    if (pos >= this.input.length - 1)
      return this.output[this.output.length - 1];
    return this.output[pos];
  }

  integrateWithPhasor(
    from = 0,
    to = 1,
    factor: Phasor,
    step = precisions.integration_precision,
  ): Complex {
    let integral: Complex = new Complex(0, 0);
    for (let t = from; t <= to; t += step) {
      integral = integral.add(
        factor.getValueAt(t).mul(this.getValueAt(t)).scale(step),
      );
    }
    return integral;
  }

  static fromBezierCurvePoints(points: [number, number][]): ComplexFunction {
    const func = new ComplexFunction();
    const whole: [number, number][] = [];
    for (let i = 0; true; i++) {
      const curve = this.getBezierCurveAt(i, points);
      if (!curve) break;
      whole.push(...this.bezierCurveToPoints(...curve));
    }
    const n = whole.length;
    const fact = 1 / (n - 1);
    for (let i = 0; i < n; i++) {
      func.addMapping(
        i * fact,
        Complex.fromCartesian(whole[i][0], whole[i][1]),
      );
    }

    return func;
  }

  /**
   * Gets the four points comprising the i-th Bezier curve.
   */
  static getBezierCurveAt<T>(i: number, points: T[]): [T, T, T, T] | null {
    if (i < 0) return null;

    let startIdx, cp1Idx, cp2Idx, endIdx;

    if (i === 0) {
      startIdx = 0;
      cp1Idx = 1;
      cp2Idx = 3;
      endIdx = 2;
    } else {
      startIdx = 3 * i - 1;
      cp1Idx = startIdx + 2;
      cp2Idx = startIdx + 4;
      endIdx = startIdx + 3;
    }

    // Check if we have enough points in the array for this curve
    // The highest index needed is always cp2Idx
    if (cp2Idx >= points.length) {
      return null;
    }

    return [
      points[startIdx], // Start point
      points[cp1Idx], // Control point 1
      points[cp2Idx], // Control point 2
      points[endIdx], // End point
    ];
  }

  static bezierCurveToPoints(
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    p4: [number, number],
  ): [number, number][] {
    const curve: [number, number][] = [];
    for (let t = 0; t <= 1; t += precisions.curve_sampling_precision) {
      const a = lerp(p1, p2, t);
      const b = lerp(p2, p3, t);
      const c = lerp(p3, p4, t);
      const d = lerp(a, b, t);
      const e = lerp(b, c, t);
      const f = lerp(d, e, t);
      curve.push(f);
    }
    return curve;
  }
}
