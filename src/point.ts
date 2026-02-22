import type Vector from "./vector";

export class Point {
  selected = false;
  pos: Vector;
  is_constrol_point = false;
  color = "#0096FF";
  selected_color = "white";
  radius = 5;
  selected_radius = 2 * this.radius;
  constructor(pos: Vector) {
    this.pos = pos;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.selected) {
      ctx.fillStyle = this.selected_color;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.selected_radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
