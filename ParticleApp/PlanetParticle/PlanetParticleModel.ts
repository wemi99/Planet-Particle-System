import {
    AObjectState,
    AClock,
    ASerializable,
    Color,
    Vec2,
    VertexArray2D,
    A2DParticlesModel,
    AParticle
} from "src/anigraph";
// import {AParticleEnums} from "../../../anigraph/effects";
import { PlanetParticle } from "./PlanetParticle";
import { Planet } from "./Planet";
import { SunParticle } from "./SunParticle";
import { ExplosionParticle } from "./ExplosionParticle";
import { TrailParticle } from "./TrailParticle";
import { copySync } from "typedoc/dist/lib/utils";

// It's good to put constants associated with a particular particle system in one place.
// you may find it useful to use an enum for this.
export enum PlanetEnums {
    MAX_RADIUS = 200,
    MIN_RADIUS = 10,
    MAX_SPEED = 10,
    MIN_SPEED = 0.5,
    MAX_FRICTION = 1,
    MIN_FRICTION = 0,
}

export enum SunParticleEnums {
    MAX_FREQ = 24,
    MIN_FREQ = 0,
    MIN_LIFESPAN = 0,
    MAX_LIFESPAN = 10,
    MIN_AMP = .1,
    MAX_AMP = 4,
    MIN_SIZE = 0,
    MAX_SIZE = 1,
    MIN_MASS = 10,
    MAX_MASS = 1000,
}

/**
 * Return a random number by taking a convex combination
 * of a uniform random around [0,2] and a constant 1.
 * randomness must be in [0,1]
 */
const random = (randomness: number) => {
    return randomness * (Math.random() * 2) + (1 - randomness) * (1);
}


@ASerializable("PlanetParticleModel")
export class PlanetParticleModel extends A2DParticlesModel {
    // You must declare a particles list of the particle type you intend to use
    public particleList: PlanetParticle[][] = [];
    public planets: Planet[] = [];
    public sunParticles: SunParticle[] = [];

    // explosionParticles is a queue, add elements to end and remove from 0
    public explosionParticles: ExplosionParticle[] = [];
    public trailParticles: TrailParticle[] = [];

    // Stores what indices are available for explosions
    private availableExplosions: number[] = [];

    // App state, define boundaries for particle
    public b_max: Vec2 = new Vec2(200, 300);
    public b_min: Vec2 = new Vec2(-200, -300);
    private height: number;
    private width: number;
    private numExplParts: number = 10;
    private numExplHolders: number = 100;
    private trailLifespan: number = 0.3;

    // Sun properties
    @AObjectState particleSize: number;
    @AObjectState amplitude: number;
    @AObjectState frequency: number;
    @AObjectState randomness: number;
    @AObjectState lifespan: number;
    @AObjectState collisionMode: number;
    @AObjectState hasSun: boolean;
    @AObjectState doesExplode: boolean;
    @AObjectState hasTrail: boolean;
    @AObjectState velocityIsTangent: boolean;
    @AObjectState planetRadius: number;
    @AObjectState planetSpeed: number;
    @AObjectState sunMass: number;
    @AObjectState friction: number;

    // Static properties
    static gravitationalConstant: number = .2;
    static numPlanets: number = 8;

    constructor(max_num_particles?: number) {
        super();
        this.nParticles = 200;
        this.newParticles = 10;
        this.verts = new VertexArray2D();
        const self = this;
        this.color = Color.Random();
        this.particleSize = 0.3;
        this.amplitude = 0.2;
        this.frequency = 0.5;
        this.randomness = 1;

        this.lifespan = 1.0;
        this.collisionMode = 0;
        this.hasSun = true;
        this.doesExplode = true;
        this.hasTrail = true;
        this.velocityIsTangent = false;
        this.planetRadius = 100;
        this.planetSpeed = 1.3;
        this.sunMass = 100;
        this.friction = 0.5

        // Add particle lists
        this.particleList.push(this.sunParticles);
        this.particleList.push(this.explosionParticles);
        this.particleList.push(this.trailParticles);
        this.particleList.push(this.planets);

        this.height = this.b_max.y - this.b_min.y
        this.width = this.b_max.x - this.b_min.x

        // Add planets
        while (this.planets.length < PlanetParticleModel.numPlanets) {
            let newParticle: Planet = this.createNewPlanet(this.time);
            this.planets.push(newParticle);
            this.emit(newParticle, this.time);
        }

        // Initialize hidden explosion particles
        for (let p = 0; p < this.numExplHolders; p++) {
            let newExplosion: ExplosionParticle = this.createNewExplosionParticle(this.time);
            newExplosion.hidden = true;
            this.explosionParticles.push(newExplosion);

            this.availableExplosions.push(p);
        }
    }

    /**
     * Function to create a new particle when the number of particles increases
     * @param t Current time
     */
    createNewPlanet(t: number): Planet {
        let newParticle = new Planet(this.planets.length, this, undefined, undefined, undefined,
            new Vec2(Math.random() * this.width + this.b_min.x, Math.random() * this.height + this.b_min.y));
        newParticle.t0 = t;
        newParticle.velocity = new Vec2(1, 1);
        newParticle.lifespan = this.lifespan;
        return newParticle;
    }

    /**
     * Function to create a new sun particle
     */

    createNewSunParticle(t: number): SunParticle {
        let newParticle = new SunParticle(this.sunParticles.length, this);
        newParticle.t0 = t;
        newParticle.lifespan = Math.random() * this.lifespan;
        return newParticle;
    }

    /**
     * Function to create a new trail particle
     */
    createNewTrailParticle(t: number, p: number, pos: Vec2): TrailParticle {
        let newParticle = new TrailParticle(t, this, t, this.trailLifespan, .1, pos);
        newParticle.t0 = t;
        newParticle.lifespan = 1;
        newParticle.planet = p;
        return newParticle;
    }

    /**
     * Function to create a new explosion particle
     */
    createNewExplosionParticle(t: number): ExplosionParticle {
        let newParticle = new ExplosionParticle(this.explosionParticles.length, this, new Vec2(0, 0), t,
            0.5 * random(this.randomness), 10 * random(this.randomness),
            new Vec2(0, 0), Color.FromString("#ff0000"));
        return newParticle;
    }

    /**
     * Update all the particle systems
     * @param t the time for the update
     */
    update(t: number) {
        // Add new sun particles if necessary
        if (this.nParticles > this.sunParticles.length) {
            for (let p = 0; p < this.nParticles; p++) {
                if (p > (this.sunParticles.length - 1)) {
                    let newParticle = this.createNewSunParticle(t);
                    this.sunParticles.push(newParticle);
                }
            }
        }

        // Create trail particles 
        if (this.trailParticles.length <= 30 * this.planets.length) {
            for (let p = 0; p < this.planets.length; p++) {
                let currParticle: Planet = this.planets[p];
                let pos = currParticle.position
                let newTrailParticle = this.createNewTrailParticle(t, p, pos);
                this.trailParticles.push(newTrailParticle);
                // if (this.trailParticles.length = 4) { console.log("four"); }
            }
        }

        // Update sun particles
        for (let p = 0; p < this.sunParticles.length; p++) {
            if (p < this.nParticles) {
                this.sunParticles[p].hidden = false;
                if (this.sunParticles[p].age > this.sunParticles[p].lifespan) {
                    this.emitSunParticle(this.sunParticles[p], t);
                } else {
                    this.sunParticles[p].update(t, this);
                }
            } else {
                this.sunParticles[p].hidden = true;
            }
            if (!this.hasSun) {
                this.sunParticles[p].hidden = true;
            }
        }

        // Update trail particles
        for (let p = 0; p < this.trailParticles.length; p++) {
            if (this.trailParticles[p].age > this.trailParticles[p].lifespan) {
                this.emitTrailParticle(this.trailParticles[p], t);
            } else {
                this.trailParticles[p].update(t, this);
            }
        }

        // Update all of the planets
        for (let p = 0; p < this.planets.length; p++) {
            let currParticle: Planet = this.planets[p];
            if (!currParticle.hidden) {

                // Calculate forces
                let newForces: Vec2 = new Vec2(0, 0);
                for (let innerP = 0; innerP < this.planets.length; innerP++) {
                    let innerParticle: Planet = this.planets[innerP]
                    if (!innerParticle.hidden) {

                        if (currParticle.id !== innerParticle.id) {
                            // Collide particles
                            if (this.collisionDetection(currParticle, innerParticle)) {
                                if (this.collisionMode == 1) {
                                    // Collide by combining
                                    this.collide(currParticle, innerParticle);
                                    this.particleCollisionPushBack(currParticle);
                                } else if (this.collisionMode == 2) {
                                    // Collide by bouncing
                                    let bounceForce: Vec2 | undefined = this.bounce(currParticle, innerParticle, t);
                                    if (bounceForce) newForces = newForces.plus(bounceForce);
                                }
                                if (this.doesExplode) {
                                    // Add an explosion at the collision site (between the two planets)
                                    this.explode(currParticle.position.plus(innerParticle.position).times(1 / 2));
                                }
                            }
                            else {
                                // Add planet-planet gravity
                                newForces = newForces.plus(this.calculateForce(currParticle, innerParticle));
                            }
                        }
                    }
                }

                // See if planets are within the boundary, if not then bounce.
                this.boundaryDetection(currParticle, this.b_max, this.b_min);
                this.addRemoveTrail(!this.hasTrail);
                this.cleanTrail();

                if (this.hasSun) {
                    // Add sun-planet gravity
                    newForces = newForces.plus(this.calculateForce(currParticle, 0));

                    // Add sun explosions when planets collide (modified methods)
                    let mag = currParticle.position.minus(this.transform.position).L2();
                    if (mag < 5) {
                        currParticle.hidden = true;
                        this.explode(this.transform.position, 1.2, 25, "ff0000", 20)
                    }

                }

                // Update forces
                currParticle.force = newForces;
                currParticle.update(t, this);

                // Add friction
                currParticle.velocity = currParticle.velocity.times(1 - this.friction ** 20);
            }
        }

        // Update explosion particles
        for (let p = 0; p < this.explosionParticles.length; p++) {
            let currExplosion = this.explosionParticles[p];
            currExplosion.update(t, this);

            // Remove particle if dead
            if (currExplosion.age > currExplosion.lifespan) {
                currExplosion.hidden = true;
                currExplosion.isShown = false;
                this.availableExplosions.push(currExplosion.id);
            }
        }
    }

    /**
     * See if [currParticle] is within the boundaries of the program.
     * If not, then bounce it off so that it stays within view.
     * @param currParticle the particle to check.
     * @param b_max The maximum point on the view.
     * @param b_min The minimum point on the view.
     */
    boundaryDetection(currParticle: Planet, b_max: Vec2, b_min: Vec2) {
        if (b_max !== undefined && b_min !== undefined) {
            if (currParticle.position.x > b_max.x) {
                currParticle.velocity.x = currParticle.velocity.x * -1;
                currParticle.position.x = b_max.x - 3;
            } else if (currParticle.position.x < b_min.x) {
                currParticle.velocity.x = currParticle.velocity.x * -1;
                currParticle.position.x = b_min.x + 3;
            }

            if (currParticle.position.y > b_max.y) {
                currParticle.velocity.y = currParticle.velocity.y * -1;
                currParticle.position.y = b_max.y - 3;
            } else if (currParticle.position.y < b_min.y) {
                currParticle.velocity.y = currParticle.velocity.y * -1;
                currParticle.position.y = b_min.y + 3;
            }

        }
    }

    /**
     * Helper function to calculate all distances from a planet during a collision.
     * @param collisionParticle The particle to calculate distances from.
     */
    collisionSumDistances(collisionParticle: Planet): number {
        let sum_distances = 0;
        for (let i = 0; i < this.planets.length; i++) {
            if (collisionParticle.id !== this.planets[i].id) {
                let inc_sum = Math.sqrt(((this.planets[i].position.x - collisionParticle.position.x) ** 2) + ((this.planets[i].position.y - collisionParticle.position.y) ** 2));
                inc_sum = inc_sum ? inc_sum : 0

                if (inc_sum !== NaN) {
                    sum_distances += inc_sum;
                }
            }
        }
        return sum_distances;
    }

    /**
     * Helper function to calculate the distance between two particles..
     * @param collisionParticle The particle to calculate distance from.
     * @param impactedParticle The impacted particle.
     */
    collisionParticleDistance(collisionParticle: Planet, impactedParticle: Planet): number {
        let dis = Math.sqrt(((collisionParticle.position.x - impactedParticle.position.x) ** 2) + ((collisionParticle.position.y - impactedParticle.position.y) ** 2));
        if (isNaN(dis)) {
            return 1;
        }
        return Math.sqrt(((collisionParticle.position.x - impactedParticle.position.x) ** 2) + ((collisionParticle.position.y - impactedParticle.position.y) ** 2));
    }

    /**
     * Helper function to calculate the angle between two particles..
     * @param collisionParticle The particle to calculate angle from.
     * @param impactedParticle The impacted particle.
     */
    collisionParticleAngle(collisionParticle: Planet, impactedParticle: Planet): number {
        let angle = Math.tan((collisionParticle.position.y - impactedParticle.position.y) / (collisionParticle.position.x - impactedParticle.position.x));
        if (isNaN(angle)) {
            return 45;
        }
        return Math.tan((collisionParticle.position.y - impactedParticle.position.y) / (collisionParticle.position.x - impactedParticle.position.x));
    }


    /**
     * When a collision occurs, push back all other particles with some
     * force resulting from the collision.
     * @param collisionParticle The particle that has experienced a collision.
     */
    particleCollisionPushBack(currParticle: Planet) {
        for (let i = 0; i < this.planets.length; i++) {
            if (this.planets[i].id !== currParticle.id) {
                let distance_scalar = 100 / this.collisionParticleDistance(currParticle, this.planets[i]);
                let theta: number = this.collisionParticleAngle(currParticle, this.planets[i])
                let vec_x = (distance_scalar) * Math.cos(theta);
                let vec_y = (distance_scalar) * Math.sin(theta);
                let f = new Vec2(-1 * vec_x, -1 * vec_y);
                this.planets[i].velocity = this.planets[i].velocity.plus(f);
            }
        }
    }

    /**
     * Bounce the two planets off of each other
     * @param planet1 A planet to be bounced
     * @param planet2 A planet to be bounced
     * @param t The current time
     * @return Force for planet1
     */
    bounce(planet1: Planet, planet2: Planet, t: number): Vec2 | undefined {
        let timeSinceBounce1: number = t - planet1.t0;
        let pos1: Vec2 = planet1.position;
        let pos2: Vec2 = planet2.position;
        if (timeSinceBounce1 > 0.4 && (pos1.x !== pos2.x || pos1.y !== pos2.y)) {
            let planet1Vec: Vec2 = pos1.minus(pos2);
            planet1Vec.normalize();

            planet1Vec = planet1Vec.times(planet2.mass * planet2.velocity.L2()).times(1 / 20);

            planet1.lastBounce = t;

            return planet1Vec;
        }
        return undefined;
    }

    /**
     * Calculate the force of gravity between two particles.
     * @param particle First of two particles.
     * @param innerParticle Second of two particles.
     */
    calculateForce(particle: Planet, innerParticle: Planet | number): Vec2 {
        // Assuming innerParticle is the sun
        let innerPos: Vec2 = this.transform.position;
        let innerMass: number = this.sunMass;

        if (innerParticle instanceof Planet) {
            // Assuming innerParticle is another planet
            innerPos = innerParticle.position;
            innerMass = innerParticle.mass;
        }

        // Calculate the force between two particles
        let distanceVec: Vec2 = innerPos.minus(particle.position);
        let theta: number = Math.atan2(distanceVec.y, distanceVec.x);
        let distance: number = Math.max(distanceVec.L2(), 10);
        let gravity: number = PlanetParticleModel.gravitationalConstant * particle.mass
            * innerMass / (distance ** 2 + 1e-2);
        let forceVec: Vec2 = new Vec2(gravity * Math.cos(theta), gravity * Math.sin(theta));
        return forceVec;
    }

    /**
     * Detects collisions between two particles. If two particles collide,
     * returns true. Otherwise, returns false.
     * @param parParticle The parent particle, will merge with other particle.
     * @param impactedParticle The second particle.
     */
    collisionDetection(parParticle: Planet, innerParticle: Planet) {
        // Only collide visible particles.
        if (parParticle.hidden == false && innerParticle.hidden == false) {
            let squareDistance = (parParticle.position.x - innerParticle.position.x) ** 2 + (parParticle.position.y - innerParticle.position.y) ** 2;
            let detected = squareDistance <= ((parParticle.radius + innerParticle.radius) ** 2) / 3;
            return detected;
        } else {
            return false;
        }
    }

    /**
     * Collide two particles and determine the new mass and velocity.
     * @param parParticle The parent particle, will merge with other particle.
     * @param innerParticle The second particle.
     */
    collide(parParticle: Planet, innerParticle: Planet) {
        // Momentum before
        let before_mom_par_x = parParticle.mass * parParticle.velocity.x;
        let before_mom_par_y = parParticle.mass * parParticle.velocity.y;
        let before_mom_inner_x = innerParticle.mass * innerParticle.velocity.x;
        let before_mom_inner_y = innerParticle.mass * innerParticle.velocity.y;

        // New collision attributes
        let new_mass = parParticle.mass + innerParticle.mass;
        let new_vel = new Vec2((before_mom_inner_x + before_mom_par_x) / new_mass, (before_mom_inner_y + before_mom_par_y) / new_mass);
        let new_lifespan = parParticle.lifespan + innerParticle.lifespan;
        parParticle.radius = (innerParticle.radius + parParticle.radius) / 10;
        parParticle.mass = new_mass;
        parParticle.lifespan = new_lifespan;
        parParticle.velocity = new_vel;

        // Hide inner particle
        parParticle.hidden = false;
        innerParticle.hidden = true;

        return parParticle;
    }

    /**
     * Explodes at a position.
     * @param pos The position to explode.
     */
    explode(pos: Vec2, lifespan?: number, radius?: number, col?: string, numExplParts: number = 10): void {
        // Spawn an explosion at pos
        for (let p = 0; p < numExplParts; p++) {
            let theta: number = (2 * Math.PI) * (p / this.numExplParts);
            let r: number = 0.4;
            let dir: Vec2 = new Vec2(Math.cos(theta), Math.sin(theta)).times(r);
            this.emitExplosionParticle(pos, dir, this.time, lifespan, radius, col);
        }
    }

    /**
     * Emits the sun particle.
     * @param parParticle The Sun.
     * @param t Time to emit.
     */
    emitSunParticle(particle: SunParticle, t: number) {
        // Might be good to get a rough scale factor from the bounds of the object
        let corners = this.getBounds().corners;
        let scaleFactor = corners[0].minus(corners[1]).L2();
        let startPosition = this.getBounds().randomTransformedPoint();
        let red: Color = Color.FromString("#ff0000");
        let startColor = red.Spun(Math.random() * this.randomness);
        let particleSize = this.particleSize * scaleFactor * (1 + this.randomness);
        let amplitude = scaleFactor * this.amplitude * random(this.randomness);
        let direction = Math.random() > 0.5 ? -1 : 1;
        let frequency = this.frequency * random(this.randomness) * direction;
        let lifespan = this.lifespan;
        particle.reset(this,
            t,
            lifespan,
            particleSize,
            startPosition,
            startColor,
            frequency,
            amplitude,
        )
    }

    /**
     * Emits particles with a trail.
     * @param parParticle The particle with a trail.
     * @param t Time to emit.
     */
    emitTrailParticle(particle: TrailParticle, t: number) {
        let corners = this.getBounds().corners;
        let scaleFactor = corners[0].minus(corners[1]).L2();
        let startPosition = this.planets[particle.planet].position;
        let red: Color = Color.FromString("#ff0000");
        let blue: Color = new Color(0, 32, 255);
        let yellow = Color.FromString("#ffcc00");
        let startColor = red.Spun(Math.random() * this.randomness);
        if (this.planets[particle.planet].mass > 101) {
            startColor = yellow.Spun(Math.random() * this.randomness);
        }
        if (this.planets[particle.planet].mass > 401) {
            startColor = blue.Spun(Math.random() * this.randomness);
        }
        //let particleSize = this.particleSize * scaleFactor * (1 + this.randomness);
        let particleSize = 6 * (this.planets[particle.planet].mass / 201) ** (1 / 2);
        let lifespan = this.trailLifespan;
        particle.reset(this,
            t,
            lifespan,
            particleSize,
            startPosition,
            startColor,
        )
    }

    /**
     * Displays the particle.
     * @param parParticle The particle.
     * @param t Time to emit.
     */
    emit(particle: Planet, t: number) {
        // Emit a planet
        let lifespan: number = this.lifespan * Math.random();
        let size: number = this.particleSize;
        let color: Color = this.color;

        if (this.velocityIsTangent) {
            // Place the planets in a circle around the sun with tangent velocities
            let theta = (2 * Math.PI) * (particle.id / this.planets.length);
            theta += ((random(this.randomness) - 1) / 10);
            let position = new Vec2(Math.cos(theta), Math.sin(theta)).times(this.planetRadius);
            let velTheta = theta + (Math.PI / 2);
            let velocity = new Vec2(Math.cos(velTheta), Math.sin(velTheta)).times(this.planetSpeed);
            particle.reset(this,
                t,
                lifespan,
                size,
                position,
                color,
            );
            particle.velocity = velocity;
        } else {
            // Place the planets randomly in the screen
            let position = new Vec2(Math.random() * this.width + this.b_min.x, Math.random() * this.height + this.b_min.y);
            particle.reset(this,
                t,
                lifespan,
                size,
                position,
                color,
            );
            particle.velocity = new Vec2(0, 0);
        }
        particle.mass = particle.startingMass;
    }

    /**
     * Emits an exploding particle.
     * @param pos The position of the explosion.
     * @param dir Direction to explode.
     * @param t Time to explode.
     */
    emitExplosionParticle(pos: Vec2, dir: Vec2, t: number, lifespan: number = .3, radius: number = 5, col: string = "#ffd300"): void {
        let nextPart: number | undefined = this.availableExplosions.pop();
        if (nextPart) {
            let particle: ExplosionParticle = this.explosionParticles[nextPart];
            particle.reset(this, t, lifespan * random(this.randomness),
                radius * random(this.randomness), pos,
                Color.FromString(col).Spun(Math.random() * this.randomness));
            particle.dir = dir;
            particle.isShown = true;
            particle.hidden = false;
        }
    }

    /**
     * Either hide or make visible the particles of the sun
     * @param isRemove Whether to remove or make visible particles
     */
    addRemoveSun(isRemove: boolean): void {
        for (let i = 0; i < this.sunParticles.length; i++) {
            this.sunParticles[i].hidden = isRemove;
        }
    }

    addRemoveTrail(isRemove: boolean): void {
        for (let i = 0; i < this.trailParticles.length; i++) {
            this.trailParticles[i].hidden = isRemove;
        }
    }

    cleanTrail(): void {
        // cleans up trail particles
        for (let i = 0; i < this.trailParticles.length; i++) {
            if (this.planets[this.trailParticles[i].planet].hidden == true) {
                this.trailParticles[i].hidden = true;
            }

        }
    }

    /**
     * Reset all the planets to initial positions
     */
    resetPlanets(): void {
        for (let p = 0; p < this.planets.length; p++) {
            let currPlanet: Planet = this.planets[p];
            this.emit(currPlanet, this.time);
        }
    }

    waitNSeconds(seconds_to_wait: number): void {
        let final_time = this.time + seconds_to_wait;
        let i = 0;
        while (this.time !== final_time) {
            //do something arbitrary
            i++;
        }
    }

    /**
     * UI elements displayed on the right panel.
     */
    getModelGUIControlSpec() {
        const self = this;
        const customSpec = {
            ModelName: {
                value: self.name,
                onChange: (v: string) => {
                    self.name = v;
                }
            },

            // Buttons
            velocityIsTangent: {
                value: self.velocityIsTangent,
                onChange: (v: boolean) => {
                    this.velocityIsTangent = v;
                    this.resetPlanets();
                }
            },

            // Planet controls
            planetRadius: {
                value: self.planetRadius,
                min: PlanetEnums.MIN_RADIUS,
                max: PlanetEnums.MAX_RADIUS,
                step: 1,
                onChange: (v: number) => {
                    self.planetRadius = v;
                }
            },

            planetSpeed: {
                value: self.planetSpeed,
                min: PlanetEnums.MIN_SPEED,
                max: PlanetEnums.MAX_SPEED,
                step: 0.1,
                onChange: (v: number) => {
                    self.planetSpeed = v;
                }
            },

            collisionMode: {
                value: self.collisionMode,
                min: 0,
                max: 2,
                step: 1,
                onChange: (v: number) => {
                    this.collisionMode = v;
                }
            },

            doesExplode: {
                value: self.doesExplode,
                onChange: (v: boolean) => {
                    this.doesExplode = v;
                }
            },

            friction: {
                value: self.friction,
                min: PlanetEnums.MIN_FRICTION,
                max: PlanetEnums.MAX_FRICTION,
                step: 0.01,
                onChange: (v: number) => {
                    this.friction = v;
                }
            },

            // Trail controls
            hasTrail: {
                value: self.hasTrail,
                onChange: (v: boolean) => {
                    this.hasTrail = v;
                    this.addRemoveTrail(!v);
                }
            },

            // Sun controls
            hasSun: {
                value: self.hasSun,
                onChange: (v: boolean) => {
                    this.hasSun = v;
                    this.addRemoveSun(!v);
                }
            },

            nParticles: {
                value: self.nParticles,
                min: 1,
                max: 200,
                step: 1,
                onChange: (v: number) => {
                    self.nParticles = v;
                }
            },

            sunMass: {
                value: self.sunMass,
                min: SunParticleEnums.MIN_MASS,
                max: SunParticleEnums.MAX_MASS,
                step: 10,
                onChange: (v: number) => {
                    self.sunMass = v;
                }
            },

            addParticle: {
                value: self.newParticles,
                min: 0,
                max: 10,
                step: 1,
                onChange: (v: number) => {
                    for (let i = 0; i < v; i++) {
                        this.createNewPlanet(this.time);
                        // this.waitNSeconds(1);
                    }
                }
            },

            randomness: {
                value: self.randomness,
                min: 0,
                max: 1,
                step: 0.01,
                onChange: (v: number) => {
                    self.randomness = v;
                }
            },

            sunAmplitude: {
                value: self.amplitude,
                min: SunParticleEnums.MIN_AMP,
                max: SunParticleEnums.MAX_AMP,
                step: SunParticleEnums.MAX_AMP / 200,
                onChange: (v: number) => {
                    self.amplitude = v;
                }
            },

            sunFrequency: {
                value: self.frequency,
                min: SunParticleEnums.MIN_FREQ,
                max: SunParticleEnums.MAX_FREQ,
                step: 0.01,
                onChange: (v: number) => {
                    self.frequency = v;
                }
            },
            sunParticleSize: {
                value: self.particleSize,
                min: 0,
                max: SunParticleEnums.MAX_SIZE,
                step: SunParticleEnums.MAX_SIZE / 200,
                onChange: (v: number) => {
                    self.particleSize = v;
                }
            },
            sunLifespan: {
                value: self.lifespan,
                min: SunParticleEnums.MIN_LIFESPAN,
                max: SunParticleEnums.MAX_LIFESPAN,
                step: 0.01,
                onChange: (v: number) => {
                    self.lifespan = v;
                }
            },

            playing: {
                value: self.playing,
                onChange: (v: boolean) => {
                    if (v) {
                        this.play();
                    } else {
                        this.pause();
                    }
                }
            },
        }
        return { ...customSpec }
    }

}
