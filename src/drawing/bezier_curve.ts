import { Point } from "./bezier_point";
import Vector from "../math/vector";

export class BezierCurve {
  private _points: Point[] = [];

  // Expose points for rendering, but strictly as read-only references
  get points(): ReadonlyArray<Point> {
    return this._points;
  }

  get length(): number {
    return this._points.length;
  }

  getPoint(index: number): Point | undefined {
    return this._points[index];
  }

  clear() {
    this._points = [];
  }

  getCount() {
    return this._points.length;
  }

  /**
   * Adds a new point and its associated control points to the curve.
   */
  addPoint(at: Vector, controlPointDist = 60) {
    if (this._points.length > 0) {
      const lastPoint = this._points[this._points.length - 1];
      let lastControlPointVector = new Vector(
        lastPoint.pos.x,
        lastPoint.pos.y - controlPointDist,
      );

      if (lastPoint.isControlPoint) {
        const secondLastPoint = this._points[this._points.length - 2];
        const dir = secondLastPoint.pos.subtract(lastPoint.pos);
        lastControlPointVector = lastPoint.pos
          .add(dir)
          .add(dir.normalize().scale(controlPointDist));
      }

      const point = new Point(at);
      const controlPointLast = new Point(lastControlPointVector);
      const controlPointCur = new Point(
        new Vector(at.x, at.y + controlPointDist),
      );

      controlPointLast.isControlPoint = true;
      controlPointCur.isControlPoint = true;

      this._points.push(controlPointLast, point, controlPointCur);
    } else {
      this._points.push(new Point(new Vector(at.x, at.y)));
    }
  }

  /**
   * Deletes a point and its associated control points.
   */
  deletePoint(index: number) {
    if (index < 0 || index >= this._points.length) return;

    const point = this._points[index];
    if (this._points.length === 1) {
      this.clear();
      return;
    }

    // Prevent deleting a control point directly
    if (point.isControlPoint) return;

    if (index === 0) {
      this._points.splice(0, 2);
      this._points.splice(1, 1);
    } else if (index === this._points.length - 2) {
      this._points.splice(index - 1, 3);
    } else {
      this._points.splice(index, 3);
    }
  }

  /**
   * Moves a point to a new position, updating control points to maintain tangents.
   */
  movePoint(pointIdx: number, newPos: Vector) {
    if (pointIdx < 0 || pointIdx >= this._points.length) return;

    const targetPoint = this._points[pointIdx];
    const change = newPos.subtract(targetPoint.pos);
    targetPoint.pos = targetPoint.pos.add(change);

    if (targetPoint.isControlPoint) {
      // Move paired control point to maintain C1 continuity
      let otherControlPoint: Point | null = null;
      let mainPoint: Point | null = null;

      if (
        pointIdx + 1 < this._points.length &&
        this._points[pointIdx + 1].isControlPoint
      ) {
        mainPoint = this._points[pointIdx - 1];
        otherControlPoint = this._points[pointIdx + 1];
      } else if (
        pointIdx - 1 >= 0 &&
        this._points[pointIdx - 1].isControlPoint
      ) {
        mainPoint = this._points[pointIdx - 2];
        otherControlPoint = this._points[pointIdx - 1];
      }

      if (otherControlPoint && mainPoint) {
        const otherControlPointNewPos = mainPoint.pos
          .subtract(targetPoint.pos)
          .normalize()
          .scale(otherControlPoint.pos.subtract(mainPoint.pos).magnitude())
          .add(mainPoint.pos);
        otherControlPoint.pos = otherControlPointNewPos;
      }
    } else {
      // Move both connected control points alongside the main point
      if (pointIdx + 1 < this._points.length) {
        this._points[pointIdx + 1].pos =
          this._points[pointIdx + 1].pos.add(change);
      }
      if (pointIdx !== 0 && pointIdx + 2 < this._points.length) {
        this._points[pointIdx + 2].pos =
          this._points[pointIdx + 2].pos.add(change);
      }
    }
  }

  /**
   * Aligns the end control point to the start control point when closing a loop.
   */
  alignLoopEnds(startIdx: number, endIdx: number) {
    if (startIdx < 0 || endIdx < 0 || endIdx + 1 >= this._points.length) return;

    const startPoint = this._points[startIdx];
    const startCP = this._points[startIdx + 1];
    const endPoint = this._points[endIdx];
    const endCP = this._points[endIdx + 1];

    endCP.pos = endPoint.pos.add(
      startPoint.pos
        .subtract(startCP.pos)
        .normalize()
        .scale(endCP.pos.subtract(endPoint.pos).magnitude()),
    );
  }

  /**
   * Finds the closest point to a given vector.
   */
  getClosestPointIndex(
    to: Vector,
    threshold: number = 20,
    exceptIndex: number = -1,
  ): number {
    let closestPointIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < this._points.length; i++) {
      if (i === exceptIndex) continue;
      const distSqr = this._points[i].pos.distSq(to);
      if (distSqr < closestDist) {
        closestPointIdx = i;
        closestDist = distSqr;
      }
    }

    if (closestDist < threshold * threshold) return closestPointIdx;
    return -1;
  }

  selectPoint(index: number) {
    const point = this.getPoint(index);
    if (point) point.selected = true;
  }

  deselectPoint(index: number) {
    const point = this.getPoint(index);
    if (point) point.selected = false;
  }

  deselectAll() {
    this._points.forEach((p) => (p.selected = false));
  }

  getPointPos(index: number) {
    const point = this.getPoint(index);
    return point!.pos;
  }

  // --- Serialization / Deserialization ---

  toSimpleArray(): [number, number][] {
    return this._points.map((p) => [p.pos.x, p.pos.y]);
  }

  loadFromSimpleArray(coords: [number, number][]) {
    this.clear();
    for (const [x, y] of coords) {
      this._points.push(new Point(new Vector(x, y)));
    }

    if (this._points.length >= 2) this._points[1].isControlPoint = true;
    for (let i = 3; i < this._points.length; i += 3) {
      this._points[i].isControlPoint = true;
      if (i + 1 < this._points.length) {
        this._points[i + 1].isControlPoint = true;
      }
    }
  }
}
