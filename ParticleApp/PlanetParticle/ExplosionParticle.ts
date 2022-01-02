import { Color, V2, Vec2, AParticle } from "src/anigraph";
import { PlanetParticleModel } from "./PlanetParticleModel";
import { PlanetParticle } from "./PlanetParticle";

export class ExplosionParticle extends PlanetParticle{
    // Represents one particle of an explosion

    // Direction of explosion
    public dir:Vec2;

    // Whether the explosion is visible (active) or not
    public isShown:boolean = false;

    constructor(
        id: number,
        model: PlanetParticleModel,
        dir: Vec2,
        t0?: number,
        lifespan?: number,
        radius: number = 1,
        position?: Vec2,
        color?: Color,
    ) {
        super(id, model, t0, lifespan, radius, position, color);
        this.dir = dir;
        this.id = id;
        this.reset(
            model,
            t0 ? t0 : 0,
            lifespan ? lifespan : 0,
            radius,
            position,
            color,
        );

        this.hidden=true;
    }

    reset(
        model: PlanetParticleModel,
        t0: number,
        lifespan: number,
        radius: number = 1,
        position?: Vec2,
        color?: Color,
    ) {
        this.t0 = t0;
        this.lifespan = lifespan;
        this.startPosition = V2();
        this.startRadius = radius;
        this.startPosition = position ? position.clone() : new Vec2(0, 0);
        this._position = position ? position.clone() : this.startPosition.clone();
        this.startColor = color ? color : model.color;
        this.update(t0, model);
    }

    update(t: number, model: PlanetParticleModel): void {
        this.lastUpdate = t;

        this.hidden = !this.isShown;

        // Update the particle's position in direction dir
        let dir = this.dir?this.dir:new Vec2(0,0);
      
        this._position = this._position.plus(dir);

        let radi = this.startRadius;
        this._radius = radi;
        this._color = this.startColor;
    }
}
