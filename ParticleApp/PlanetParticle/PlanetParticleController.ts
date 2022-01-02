import {
    A2DSceneNodeController,
    A2DSceneNodeModel,
    AClickInteraction,
    AInteractionEvent,
    ASerializable
} from "src/anigraph";

@ASerializable("PlanetParticleController")
export class PlanetParticleController extends A2DSceneNodeController<A2DSceneNodeModel>{
    initInteractions() {
        super.initInteractions();
    }

}
