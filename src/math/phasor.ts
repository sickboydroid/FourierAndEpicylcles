import Complex from "./complex";

export class Phasor {
  amplitude: number;
  initial_phase: number;
  index: number;
  constructor(amplitude: number, index: number, inital_phase: number) {
    this.amplitude = amplitude;
    this.initial_phase = inital_phase;
    this.index = index;
  }

  getValueAt(t: number) {
    return new Complex(
      this.amplitude,
      this.index * 2 * Math.PI * t + this.initial_phase,
    );
  }
}
