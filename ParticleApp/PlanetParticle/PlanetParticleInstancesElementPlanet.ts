import { Color, Mat4, V2, AParticleInstancesElement } from "src/anigraph";
import * as THREE from "three";
import { PlanetParticle } from "./PlanetParticle";
import { Planet } from "./Planet";

export class PlanetParticleInstancesElementPlanet extends AParticleInstancesElement {
    get particleTexture() { return "images/moon.jfif" }

    /**
     * You can set the particle's color with setColorAt and it's matrix with setMatrixAt
     * @param index
     * @param particle
     */
    setParticle(index: number, particle: PlanetParticle) {
        this.setColorAt(index,
            particle.color
        )
        if (!particle.hidden) {
            this.setColorAt(index,
                particle.color
            );
            this.setMatrixAt(index,
                Mat4.Rotation2D(particle.rotation).times(Mat4.Scale2D(particle.radius)).times(Mat4.Translation3D(particle.position.x, particle.position.y, 0))
            );


        } else {
            this.setMatrixAt(index,
                Mat4.Translation2D(particle.position).times(Mat4.Scale2D(0))
            );
        }

    }
}
