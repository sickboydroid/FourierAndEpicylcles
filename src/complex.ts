import Vector from "./vector";

export default class Complex {
  phase: number;
  amplitude: number;

  constructor(amplitude: number, phase: number) {
    this.phase = phase;
    this.amplitude = amplitude;
  }

  mul(other: Complex) {
    return new Complex(
      this.amplitude * other.amplitude,
      this.phase + other.phase,
    );
  }

  add(other: Complex) {
    return Complex.fromCartesian(
      this.getReal() + other.getReal(),
      this.getImag() + other.getImag(),
    );
  }

  subtract(other: Complex) {
    return Complex.fromCartesian(
      this.getReal() - other.getReal(),
      this.getImag() - other.getImag(),
    );
  }

  equals(other: Complex) {
    return this.phase == other.phase && this.amplitude == other.amplitude;
  }

  getReal() {
    return this.amplitude * Math.cos(this.phase);
  }

  getImag() {
    return this.amplitude * Math.sin(this.phase);
  }

  scale(scaler: number) {
    if (scaler < 0)
      console.warn("Complex.scale(...): Scaler cannot be negative");
    return new Complex(scaler * this.amplitude, this.phase);
  }

  toVector() {
    return new Vector(this.getReal(), this.getImag());
  }

  static fromCartesian(real: number, imag: number) {
    const amp = Math.sqrt(real * real + imag * imag);
    const phase = Math.atan2(imag, real);
    return new Complex(amp, phase);
  }

  toString() {
    const real = this.getReal();
    const imag = this.getImag();
    return `${real.toFixed(2)} ${imag < 0 ? "-" : "+"} i${Math.abs(imag).toFixed(2)}`;
  }
}
