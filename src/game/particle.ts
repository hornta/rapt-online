// Particles are statically allocated in a big array so that creating a
// new particle doesn't need to allocate any memory (for speed reasons).
// To create one, call Particle(), which will return one of the elements
// in that array with all values reset to defaults.  To change a property
// use the function with the name of that property.  Some property functions
// can take two values, which will pick a random number between those numbers.
// Example:
//
// Particle().position(center).color(0.9, 0, 0, 0.5).mixColor(1, 0, 0, 1).gravity(1).triangle()
// Particle().position(center).velocity(velocity).color(0, 0, 0, 1).gravity(0.4, 0.6).circle()

import { drawMinX, drawMinY, drawMaxX, drawMaxY } from "./gameState.js";
import { randInRange, lerp } from "./math.js";
import { Vector } from "./vector.js";

// enum ParticleType
const PARTICLE_CIRCLE = 0;
const PARTICLE_TRIANGLE = 1;
const PARTICLE_LINE = 2;
const PARTICLE_CUSTOM = 3;

function randOrTakeFirst(min: number, max: number) {
	return typeof max !== "undefined" ? randInRange(min, max) : min;
}

function cssRGBA(r: number, g: number, b: number, a: number) {
	return (
		"rgba(" +
		Math.round(r * 255) +
		", " +
		Math.round(g * 255) +
		", " +
		Math.round(b * 255) +
		", " +
		a +
		")"
	);
}

class ParticleInstance {
	m_bounces: number;
	m_type: number;
	m_red: number;
	m_green: number;
	m_blue: number;
	m_alpha: number;
	m_radius: number;
	m_gravity: number;
	m_elasticity: number;
	m_decay: number;
	m_expand: number;
	m_position: Vector;
	m_velocity: Vector;
	m_angle: number;
	m_angularVelocity: number;
	m_drawFunc: null | ((c: CanvasRenderingContext2D) => void);

	init() {
		this.m_bounces = 0;
		this.m_type = 0;
		this.m_red = 0;
		this.m_green = 0;
		this.m_blue = 0;
		this.m_alpha = 0;
		this.m_radius = 0;
		this.m_gravity = 0;
		this.m_elasticity = 0;
		this.m_decay = 1;
		this.m_expand = 1;
		this.m_position = new Vector(0, 0);
		this.m_velocity = new Vector(0, 0);
		this.m_angle = 0;
		this.m_angularVelocity = 0;
		this.m_drawFunc = null;
	}

	tick(seconds: number) {
		if (this.m_bounces < 0) {
			return false;
		}
		this.m_alpha *= Math.pow(this.m_decay, seconds);
		this.m_radius *= Math.pow(this.m_expand, seconds);
		this.m_velocity.y -= this.m_gravity * seconds;
		this.m_position = this.m_position.add(this.m_velocity.mul(seconds));
		this.m_angle += this.m_angularVelocity * seconds;
		if (this.m_alpha < 0.05) {
			this.m_bounces = -1;
		}
		return this.m_bounces >= 0;
	}

	draw(c: CanvasRenderingContext2D) {
		switch (this.m_type) {
			case PARTICLE_CIRCLE:
				c.fillStyle = cssRGBA(
					this.m_red,
					this.m_green,
					this.m_blue,
					this.m_alpha
				);
				c.beginPath();
				c.arc(
					this.m_position.x,
					this.m_position.y,
					this.m_radius,
					0,
					2 * Math.PI,
					false
				);
				c.fill();
				break;

			case PARTICLE_TRIANGLE: {
				const v1 = this.m_position.add(this.m_velocity.mul(0.04));
				const v2 = this.m_position.sub(this.m_velocity.flip().mul(0.01));
				const v3 = this.m_position.add(this.m_velocity.flip().mul(0.01));
				c.fillStyle = cssRGBA(
					this.m_red,
					this.m_green,
					this.m_blue,
					this.m_alpha
				);
				c.beginPath();
				c.moveTo(v1.x, v1.y);
				c.lineTo(v2.x, v2.y);
				c.lineTo(v3.x, v3.y);
				c.closePath();
				c.fill();
				break;
			}

			case PARTICLE_LINE: {
				const dx = Math.cos(this.m_angle) * this.m_radius;
				const dy = Math.sin(this.m_angle) * this.m_radius;
				c.strokeStyle = cssRGBA(
					this.m_red,
					this.m_green,
					this.m_blue,
					this.m_alpha
				);
				c.beginPath();
				c.moveTo(this.m_position.x - dx, this.m_position.y - dy);
				c.lineTo(this.m_position.x + dx, this.m_position.y + dy);
				c.stroke();
				break;
			}

			case PARTICLE_CUSTOM:
				c.fillStyle = cssRGBA(
					this.m_red,
					this.m_green,
					this.m_blue,
					this.m_alpha
				);
				c.save();
				c.translate(this.m_position.x, this.m_position.y);
				c.rotate(this.m_angle);
				this.m_drawFunc!(c);
				c.restore();
				break;
		}
	}

	// all of these functions support chaining to fix constructor with 200 arguments
	bounces(min: number, max: number) {
		this.m_bounces = Math.round(randOrTakeFirst(min, max));
		return this;
	}

	circle() {
		this.m_type = PARTICLE_CIRCLE;
		return this;
	}

	triangle() {
		this.m_type = PARTICLE_TRIANGLE;
		return this;
	}

	line() {
		this.m_type = PARTICLE_LINE;
		return this;
	}

	custom(drawFunc: (c: CanvasRenderingContext2D) => void) {
		this.m_type = PARTICLE_CUSTOM;
		this.m_drawFunc = drawFunc;
		return this;
	}

	color(r: number, g: number, b: number, a: number) {
		this.m_red = r;
		this.m_green = g;
		this.m_blue = b;
		this.m_alpha = a;
		return this;
	}

	mixColor(r: number, g: number, b: number, a: number) {
		const percent = Math.random();
		this.m_red = lerp(this.m_red, r, percent);
		this.m_green = lerp(this.m_green, g, percent);
		this.m_blue = lerp(this.m_blue, b, percent);
		this.m_alpha = lerp(this.m_alpha, a, percent);
		return this;
	}

	radius(min: number, max: number) {
		this.m_radius = randOrTakeFirst(min, max);
		return this;
	}

	gravity(min: number, max: number) {
		this.m_gravity = randOrTakeFirst(min, max);
		return this;
	}

	elasticity(min: number, max: number) {
		this.m_elasticity = randOrTakeFirst(min, max);
		return this;
	}

	decay(min: number, max: number) {
		this.m_decay = randOrTakeFirst(min, max);
		return this;
	}

	expand(min: number, max: number) {
		this.m_expand = randOrTakeFirst(min, max);
		return this;
	}

	angle(min: number, max: number) {
		this.m_angle = randOrTakeFirst(min, max);
		return this;
	}

	angularVelocity(min: number, max: number) {
		this.m_angularVelocity = randOrTakeFirst(min, max);
		return this;
	}

	position(position: Vector) {
		this.m_position = position;
		return this;
	}

	velocity(velocity: Vector) {
		this.m_velocity = velocity;
		return this;
	}
}

// wrap in anonymous function for private variables
export const Particle = (function () {
	// particles is an array of ParticleInstances where the first count are in use
	const particles = new Array(3000);
	const maxCount = particles.length;
	let count = 0;

	for (let i = 0; i < particles.length; i++) {
		particles[i] = new ParticleInstance();
	}

	function Particle() {
		const particle =
			count < maxCount ? particles[count++] : particles[maxCount - 1];
		particle.init();
		return particle;
	}

	Particle.reset = function () {
		count = 0;
	};

	Particle.tick = function (seconds: number) {
		for (let i = 0; i < count; i++) {
			const isAlive = particles[i].tick(seconds);
			if (!isAlive) {
				// swap the current particle with the last active particle (this will swap with itself if this is the last active particle)
				const temp = particles[i];
				particles[i] = particles[count - 1];
				particles[count - 1] = temp;

				// forget about the dead particle that we just moved to the end of the active particle list
				count--;

				// don't skip the particle that we just swapped in
				i--;
			}
		}
	};

	Particle.draw = function (c: CanvasRenderingContext2D) {
		for (let i = 0; i < count; i++) {
			const particle = particles[i];
			const pos = particle.m_position;
			if (
				pos.x >= drawMinX &&
				pos.y >= drawMinY &&
				pos.x <= drawMaxX &&
				pos.y <= drawMaxY
			) {
				particle.draw(c);
			}
		}
	};

	return Particle;
})();
