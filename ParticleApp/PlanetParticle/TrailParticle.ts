import { Color, V2, Vec2, AParticle } from "src/anigraph";
import { PlanetParticleModel } from "./PlanetParticleModel";
import { PlanetParticle } from "./PlanetParticle";

export class TrailParticle extends PlanetParticle {
    // Represents one particle of a trail

    public velocity!: Vec2;
    public planet!: number;
    //public pos!:Vec2;

    constructor(
        id: number,
        model: PlanetParticleModel,
        t0?: number,
        lifespan?: number,
        radius: number = 1,
        position?: Vec2,
        color?: Color,
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
        this.radius = .1;
        this.t0 = t0;
        this.lifespan = lifespan;
        this.startPosition = V2();
        this.startRadius = radius;
        this.startPosition = position ? position.clone() : new Vec2(0, 0);
        if (color) { this.startColor = color; }
        else {
            this.startColor = new Color(0, 32, 255);
        }
        this.velocity = V2(0, 0);
        this._position = this.startPosition.clone();
        this.update(t0, model);
    }

    update(t: number, model: PlanetParticleModel): void {
        this.lastUpdate = t;
        this._radius = this.startRadius;
        this._color = this.startColor;
        this.hidden = false
    }
}
