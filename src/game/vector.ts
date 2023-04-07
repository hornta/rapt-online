export class Vector {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	neg() {
		return new Vector(-this.x, -this.y);
	}

	add(v: Vector) {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	sub(v: Vector) {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	mul(f: number) {
		return new Vector(this.x * f, this.y * f);
	}

	div(f: number) {
		return new Vector(this.x / f, this.y / f);
	}

	eq(v: Vector) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) < 0.001;
	}

	inplaceNeg() {
		this.x = -this.x;
		this.y = -this.y;
	}

	inplaceAdd(v: Vector) {
		this.x += v.x;
		this.y += v.y;
	}

	inplaceSub(v: Vector) {
		this.x -= v.x;
		this.y -= v.y;
	}

	inplaceMul(f: number) {
		this.x *= f;
		this.y *= f;
	}

	inplaceDiv(f: number) {
		this.x /= f;
		this.y /= f;
	}

	// turns 90 degrees right
	inplaceFlip() {
		const t = this.x;
		this.x = this.y;
		this.y = -t;
	}

	clone() {
		return new Vector(this.x, this.y);
	}

	dot(v: Vector) {
		return this.x * v.x + this.y * v.y;
	}

	lengthSquared() {
		return this.dot(this);
	}

	length() {
		return Math.sqrt(this.lengthSquared());
	}

	unit() {
		return this.div(this.length());
	}

	normalize() {
		const len = this.length();
		this.x /= len;
		this.y /= len;
	}

	flip() {
		return new Vector(this.y, -this.x);
	} // turns 90 degrees right

	atan2() {
		return Math.atan2(this.y, this.x);
	}

	angleBetween(v: Vector) {
		return this.atan2() - v.atan2();
	}

	rotate(theta: number) {
		const s = Math.sin(theta);
		const c = Math.cos(theta);
		return new Vector(this.x * c - this.y * s, this.x * s + this.y * c);
	}

	minComponents(v: Vector) {
		return new Vector(Math.min(this.x, v.x), Math.min(this.y, v.y));
	}

	maxComponents(v: Vector) {
		return new Vector(Math.max(this.x, v.x), Math.max(this.y, v.y));
	}

	projectOntoAUnitVector(v: Vector) {
		return v.mul(this.dot(v));
	}

	toString() {
		return "(" + this.x.toFixed(3) + ", " + this.y.toFixed(3) + ")";
	}

	adjustTowardsTarget(target: Vector, maxDistance: number) {
		const v =
			target.sub(this).lengthSquared() < maxDistance * maxDistance
				? target
				: this.add(target.sub(this).unit().mul(maxDistance));
		this.x = v.x;
		this.y = v.y;
	}

	static fromAngle(theta: number) {
		return new Vector(Math.cos(theta), Math.sin(theta));
	}

	static lerp(a: Vector, b: Vector, percent: number) {
		return a.add(b.sub(a).mul(percent));
	}

	static fromTuple([a, b]: [number, number]) {
		return new Vector(a, b);
	}
}
