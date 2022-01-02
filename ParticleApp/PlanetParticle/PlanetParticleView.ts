import {
    AParticlesView,
    Color,
    Mat3,
    Mat4,
    ASerializable,
    ASceneNodeController,
    APolygonElement,
    ARenderGroup,
    NewObject3D, AParticleInstancesElement, AParticle, Vec2
} from "src/anigraph";

import { PlanetParticleModel } from "./PlanetParticleModel";
import { PlanetParticleInstancesElementPlanet } from "./PlanetParticleInstancesElementPlanet";
import { PlanetParticleInstancesElementSun } from "./PlanetParticleInstancesElementSun";
import { PlanetParticle } from "./PlanetParticle";
import { PlanetParticleInstancesElementExplosion } from "./PlanetParticleInstancesElementExplosion";
import { PlanetParticleInstancesElementTrail } from "./PlanetParticleInstancesElementTrail";

@ASerializable("PlanetParticleView")
export class PlanetParticleView extends AParticlesView<PlanetParticleModel>{
    element!: APolygonElement;
    public controller!: ASceneNodeController<PlanetParticleModel>;
    protected _particlesElementList: AParticleInstancesElement[] = [];
    protected _particlesElementPlanet!: PlanetParticleInstancesElementPlanet;
    protected _particlesElementSun!: PlanetParticleInstancesElementSun;
    protected _particlesElementExplosion!: PlanetParticleInstancesElementExplosion;
    protected _particlesElementTrail!: PlanetParticleInstancesElementTrail;

    public particleGroup!: ARenderGroup;


    //##################//--polygon--\\##################
    //<editor-fold desc="polygon">

    constructor() {
        super();
        this.threejs = NewObject3D();
    }

    init() {
        super.init();
    }

    _updateGeometry() {
        //this.element.setVerts(this.model.verts);
    }

    onWindowResize():void {
        // Resize the bounds of the model
        let container = this.controller.sceneController.container;
        let width:number = container.clientWidth;
        let height:number = container.clientHeight;
        let b_min:Vec2 = new Vec2(- width / 2, - height / 2);
        let b_max:Vec2 = new Vec2(width / 2, height / 2);
        this.model.b_min = b_min;
        this.model.b_max = b_max;
    }

    initGraphics() {
        super.initGraphics();
        const self = this;
        const model = self.model;
        this.particleGroup = new ARenderGroup();

        this._particlesElementPlanet = new PlanetParticleInstancesElementPlanet();
        this._particlesElementSun = new PlanetParticleInstancesElementSun();
        this._particlesElementExplosion = new PlanetParticleInstancesElementExplosion();
        this._particlesElementTrail = new PlanetParticleInstancesElementTrail();


        this._particlesElementList.push(this._particlesElementSun);
        this._particlesElementList.push(this._particlesElementExplosion);
        this._particlesElementList.push(this._particlesElementTrail);
        this._particlesElementList.push(this._particlesElementPlanet);


        for (let i = 0; i < this.particlesElementList.length; i++) {
            let currParticleElement: AParticleInstancesElement = this.particlesElementList[i];
            currParticleElement.visible = true;
            currParticleElement.setMatrixAt(0, new Mat4());
            currParticleElement.setColorAt(0, Color.Random());
            this.particleGroup.add(currParticleElement);
        }

        this.addElement(this.particleGroup);

        // Find the bounds of the view
        this.onWindowResize();

        this.controller.subscribe(
            this.model.addStateKeyListener('color', () => {
                //self.element.setColor(model.color);
            }),
            'model.color'
        );
        this.controller.subscribe(
            self.model.addStateKeyListener('verts', () => {
                self._updateGeometry();
            }),
            'model.verts'
        );
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener("resize", this.onWindowResize);

        this.initParticleGraphics();

        /**
         * You can set the particle group's transformation to be the inverse of the model's transformation
         * so that the particles move on their own once emitted.
         * Also make sure the anchor can't move.
         */
        this.subscribe(
            this.model.addStateKeyListener('transform', () => {
                self.particleGroup.setTransform(self.model.transform.getMatrix().getInverse() as Mat3);
                self.model.transform.anchor.x = 0;
                self.model.transform.anchor.y = 0;
            }),
            'particlesToWorld'
        )
    }
}