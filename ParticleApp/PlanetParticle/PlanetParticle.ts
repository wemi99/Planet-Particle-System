import { Color, V2, Vec2, AParticle } from "src/anigraph";
import { PlanetParticleModel } from "./PlanetParticleModel";

export abstract class PlanetParticle extends AParticle {
    // Parent class each particle class in our project will extend

    protected _position!: Vec2;
    protected _color!: Color;
    protected _radius!: number;
    public startPosition!: Vec2;
    public startRadius!: number;
    public startColor!: Color;
    public id: number;
    public rotation: number = 0;
    public material!: string;

    get position() {
        return this._position;
    }
    get color() {
        return this._color;
    }

    set color(new_color) {
        this._color = new_color;
    }

    get radius() {
        return this._radius;
    }

    set radius(new_radius) {
        this._radius = new_radius;
    }

    constructor(
        id: number,
        model: PlanetParticleModel,
        t0?: number,
        lifespan?: number,
        radius: number = 1,
        position?: Vec2,
        color?: Color,
    ) {
        super();
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
        this.t0 = t0;
        this.lifespan = lifespan;
        this.startPosition = V2();
        this.startRadius = radius;
        this.startPosition = position?position.clone():V2();
        this.startColor = color?color.clone():model.color.clone();
        this._position = this.startPosition;
        this.update(t0, model);
    }

    abstract update(t: number, model: PlanetParticleModel): void;
}
