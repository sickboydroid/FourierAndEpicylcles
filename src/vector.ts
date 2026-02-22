/**
 * This class is immutable; operations return new Vector instances.
 */
export default class Vector {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  // ==========================
  // Basic Arithmetic
  // ==========================

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  scale(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector {
    if (scalar === 0) throw new Error("Cannot divide vector by zero");
    return new Vector(this.x / scalar, this.y / scalar);
  }

  /**
   * Inverts the vector (x becomes -x, y becomes -y).
   */
  negate(): Vector {
    return new Vector(-this.x, -this.y);
  }

  // ==========================
  // Products & Geometry
  // ==========================

  /**
   * Calculates the dot product (scalar product).
   * Useful for checking angles: >0 means same direction, <0 means opposite.
   * Formula: $$A \cdot B = A_x B_x + A_y B_y$$
   */
  dot(other: Vector): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Calculates the 2D cross product (wedge product).
   * Returns a scalar representing the signed area of the parallelogram.
   */
  cross(other: Vector): number {
    return this.x * other.y - this.y * other.x;
  }

  /**
   * Projects this vector onto another vector (the axis).
   * @param axis The vector to project onto (does not need to be normalized).
   */
  project(axis: Vector): Vector {
    const axisMagSq = axis.magSq();
    if (axisMagSq === 0) return Vector.zero();
    const scalar = this.dot(axis) / axisMagSq;
    return axis.scale(scalar);
  }

  /**
   * Decomposes the vector into two components relative to an axis:
   * 1. parallel: The component running along the axis.
   * 2. perp: The component running perpendicular to the axis.
   */
  resolve(axis: Vector): { perp: Vector; parallel: Vector } {
    const parallel = this.project(axis);
    const perp = this.subtract(parallel);
    return { parallel, perp };
  }

  /**
   * Reflects the vector off a normal (e.g., bouncing off a wall).
   * Formula: $$R = V - 2(V \cdot N)N$$
   * @param normal The normal vector of the surface (must be normalized).
   */
  reflect(normal: Vector): Vector {
    return this.subtract(normal.scale(2 * this.dot(normal)));
  }

  // ==========================
  // Magnitude & Normalization
  // ==========================

  magnitude(): number {
    return Math.sqrt(this.magSq());
  }

  /**
   * Returns the squared magnitude.
   * Prefer this over magnitude() for comparisons to avoid slow Math.sqrt().
   */
  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Returns a normalized unit vector (length of 1).
   */
  normalize(): Vector {
    const mag = this.magnitude();
    return mag === 0 ? Vector.zero() : this.divide(mag);
  }

  /**
   * Limits the vector's magnitude to a maximum value.
   */
  limit(max: number): Vector {
    if (this.magSq() > max * max) {
      return this.normalize().scale(max);
    }
    return this;
  }

  // ==========================
  // Angles & Rotation
  // ==========================

  /**
   * Rotates the vector by a specific angle (in radians).
   */
  rotate(angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  /**
   * Returns the angle of the vector in radians (-PI to PI).
   */
  heading(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Returns the angle between this vector and another vector.
   */
  angleBetween(other: Vector): number {
    return Math.acos(this.dot(other) / (this.magnitude() * other.magnitude()));
  }

  // ==========================
  // Utility & Static
  // ==========================

  distance(other: Vector): number {
    return Math.sqrt(this.distSq(other));
  }

  distSq(other: Vector): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  /**
   * Linear Interpolation. Returns a vector between this and target.
   * @param t Interpolation factor (0.0 to 1.0).
   */
  lerp(target: Vector, t: number): Vector {
    return this.add(target.subtract(this).scale(t));
  }

  /**
   * Checks equality with a small tolerance for floating point errors.
   */
  equals(other: Vector, epsilon: number = 0.000001): boolean {
    if (this === other) return true;
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon
    );
  }

  toString(): string {
    return `Vector(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  copy(): Vector {
    return new Vector(this.x, this.y);
  }

  // Static Factory Methods

  static zero() {
    return new Vector(0, 0);
  }
  static one() {
    return new Vector(1, 1);
  }
  static up() {
    return new Vector(0, -1);
  } // Assumes up to be negative
  static right() {
    return new Vector(1, 0);
  }

  /** Create a vector from an angle (radians) and optional length */
  static fromAngle(angle: number, length: number = 1): Vector {
    return new Vector(length * Math.cos(angle), length * Math.sin(angle));
  }

  static random(minScale: number = 0, maxScale: number = 1): Vector {
    const angle = Math.random() * Math.PI * 2;
    const scale = Math.random() * (maxScale - minScale) + minScale;
    return Vector.fromAngle(angle, scale);
  }
}
