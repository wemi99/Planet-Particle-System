import {Color, V2, Vec2, AParticle} from "src/anigraph";
import {PlanetParticleModel} from "./PlanetParticleModel";
import {PlanetParticle} from "./PlanetParticle";

export class SunParticle extends PlanetParticle{
    // Represents one particle of the sun
    
    public frequency!:number;
    public amplitude!:number;

    constructor(
            id:number,
            model:PlanetParticleModel,
            t0?:number,
            lifespan?:number,
            radius:number=1,
            position?:Vec2,
            color?:Color,
            frequency:number=1,
            amplitude:number=1,
        ) {
        super(id, model, t0, lifespan, radius, position, color);
        this.reset(
            model,
            t0?t0:0,
            lifespan?lifespan:0,
            radius,
            position,
            color,
            frequency,
            amplitude,
        );
        this.hidden=false;
    }

    reset(model:PlanetParticleModel,
          t0:number,
          lifespan:number,
          radius:number=1,
          position?:Vec2,
          color?:Color,
          frequency:number=1,
          amplitude:number=1,
    ){
        super.reset(model, t0, lifespan, radius, position, color);
        this.frequency = frequency;
        this.amplitude = amplitude;
        this.startColor = color?color.clone():model.color.clone();
        this.update(t0, model);
    }

    update(t:number, model:PlanetParticleModel){
        this.lastUpdate=t;

        // Spin in a circle
        this._position =this.startPosition.plus(
            V2(
                Math.cos(this.frequency*2*Math.PI*t),
                Math.sin(this.frequency*2*Math.PI*t)
            ).times(this.amplitude)
        );

        this._radius = this.startRadius;
        this._color = this.startColor;
    }
}
