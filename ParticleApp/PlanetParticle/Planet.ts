import { Color, V2, Vec2, AParticle } from "src/anigraph";
import { PlanetParticleModel } from "./PlanetParticleModel";
import { PlanetParticle } from "./PlanetParticle";

export class Planet extends PlanetParticle {
    // Represents one planet

    public velocity!:Vec2;
    public mass:number=100;
    public force:Vec2;
    public startingMass:number;
    public lastBounce:number;

    constructor(
        id: number,
        model: PlanetParticleModel,
        t0?: number,
        lifespan?: number,
        radius: number = 1,
        position?: Vec2,
        color?: Color,
        mass?: number,
    ) {
        super(id, model, t0, lifespan, radius, position, color);
        this.id = id;
        this.reset(
            model,
            t0 ? t0 : 0,
            lifespan ? lifespan : 0,
            radius,
            position,
            color,
        );
        this.hidden = false;
        if (mass) this.mass = mass;
        this.startingMass = this.mass;
        this.force = new Vec2(0,0);
        this.lastBounce = this.t0;
        this.material = "images/earth.jfif"
    }

    reset(
        model: PlanetParticleModel,
        t0: number,
        lifespan: number,
        radius: number = 1,
        position?: Vec2,
        color?: Color,
    ) {
        this.hidden = false;
        this.t0 = t0;
        this.lifespan = lifespan;
        this.startPosition = V2();
        this.startRadius = radius;
        this.startPosition = position ? position.clone() : new Vec2(0, 0);
        this.startColor = model.color.clone();
        this.velocity = V2(0, 0);
        this._position = this.startPosition.clone();
        this.force = new Vec2(0, 0);
        this.update(t0, model);
    }

    update(t: number, model: PlanetParticleModel): void {
        this.lastUpdate = t;

        // Update position based on velocity
        this._position = this._position.plus(this.velocity);

        // Update velocity based on force
        let acceleration: Vec2 = new Vec2(this.force.x / this.mass, this.force.y / this.mass);
        this.velocity = this.velocity.plus(acceleration);

        let radi = this.startRadius;
        let col = this.startColor;
        let mat = this.material;
        radi = Math.pow(100 * this.mass, 1 / 3);
        if (this.mass < 101) {
            col = new Color(0, 32, 255);
            mat = "images/earth.jfif"
        }
        else if (this.mass < 201) {
            col = new Color(75, 139, 59);
            mat = "images/moon.jfif"
        }
        else if (this.mass < 401) {
            col = new Color(194, 24, 7);
            mat = "images/jupiter.jfif"
        }

        this._radius = radi;
        this._color = col;
        this.material = mat;
    }
}
