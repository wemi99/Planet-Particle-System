import {
    A2DLinesElement, A2DSceneNodeModel, A2DSceneNodeView,
    APolygonElement, ASerializable, Color, GetAppState, Mat4,
    V2,
    VertexArray2D
} from "../../../anigraph";
import {EyeController} from "./EyeController";
import {EyeModel} from "./EyeModel";
import {NewObject3D} from "../../../anigraph/arender/ThreeJSWrappers";

function CircleVArray(size:number, nverts:number=25){
    let verts=new VertexArray2D();
    for(let v=0;v<nverts;v++){
        let phase = v*(2*Math.PI)/nverts;
        verts.addVertex(V2(Math.cos(phase)*size, Math.sin(phase)*size));
    }
    return verts;
}


@ASerializable("EyeView")
export class EyeView extends A2DSceneNodeView<A2DSceneNodeModel>{
    public controller!:EyeController;
    public outline!:A2DLinesElement;
    public iris!:APolygonElement;
    public pupil!:APolygonElement;
    public height=70;
    public width = 100
    public whitespace = 0.2;
    public eyeObject!:THREE.Object3D;

    get model(){
        return this.controller.model as EyeModel;
    }

    initGraphics() {
        super.initGraphics();
        this.outline = new A2DLinesElement();
        this.iris = new APolygonElement();
        this.pupil = new APolygonElement();

        this.outline.setVerts(CircleVArray(this.width, 100));
        this.outline.setColor(Color.FromString("#000"))
        this.outline.setLineWidth(0.01);
        this.iris.init(CircleVArray(this.height*(1-this.whitespace), 100), this.model.color)
        this.pupil.init(CircleVArray(this.height*(1-this.whitespace)), Color.FromString("#000"))

        Mat4.Scale2D([1,this.height/this.width]).assignTo(this.outline.threejs.matrix);
        Mat4.Scale2D([this.model.dilation,this.model.dilation]).assignTo(this.pupil.threejs.matrix);

        this.eyeObject = NewObject3D();
        this.eyeObject.add(this.iris.threejs);
        this.iris.threejs.add(this.pupil.threejs);
        this.eyeObject.add(this.outline.threejs);
        this.threejs.add(this.eyeObject);

        const self=this;

        // let's make our eye stay still by transforming by the inverse of the node's transform
        this.subscribe(this.model.addStateKeyListener('transform', ()=>{
            let minv = self.model.transform.getMatrix().getInverse();
            if(minv){
                Mat4.FromMat3(minv).assignTo(self.eyeObject.matrix);
            }
        }));

        this.subscribe(this.model.addStateKeyListener('targetPoint', ()=>{
            self.targetResponse();
        }));
        this.subscribe(this.model.addStateKeyListener('dilation', ()=>{
            Mat4.Scale2D([self.model.dilation,self.model.dilation]).assignTo(self.pupil.threejs.matrix);
        }));
        this.subscribe(this.model.addStateKeyListener('color',()=>{
            self.iris.setColor(self.model.color);
        }));

        this.subscribe(this.model.addEventListener("triggerBlink", ()=>{
            self.blink();
        }))
    }

    /**
     * We're going to make the eye blink. To do this, we will create a time subscription that is programmed to remove
     * itself when the blink is finished.
     * @param {number} duration
     */
    blink(){
        const self = this;

        //first, let's get the time when the blink starts
        const startTime = GetAppState().time;
        self.subscribe(GetAppState().addClockListener((t:number)=>{
            //calculate how much time has passed since the start of the blink.
            let timePassed = (GetAppState().time-startTime)*0.001;

            // Get the inverse of the object matrix to keep the eye fixed.
            // I'm mostly doing this to avoid anything that depends on stuff you have to implement in the core portion
            // of the assignment. An eye that can move and look around would probably be cooler. *shrug*
            let minv = self.model.transform.getMatrix().getInverse();
            // return if the current transform isn't invertible. This shouldn't happen, but if we don't check then
            // Typescript will complain
            if(minv===null){return;}

            // Check to see if the duration of the blink has passed
            if(timePassed>self.model.blinkDuration){
                // blink is over, let's unsubscribe, reset the transform, and return.
                self.unsubscribe("blinking");
                Mat4.FromMat3(minv).assignTo(self.eyeObject.matrix);
                return;
            }
            // mid-blink... let's scale the eye down to 0 in the y dimension and then back again.
            let scaleY = Mat4.Scale2D([1.0, Math.abs(-0.5+(timePassed/self.model.blinkDuration))*2]);
            // we will assign our scale to the eyeObject Object3D that we created...
            scaleY.assignTo(self.eyeObject.matrix);
        }), "blinking")
    }

    targetResponse() {
        Mat4.Translation2D(this.model.targetPoint.times(1/this.model.targetRange)).assignTo(this.iris.threejs.matrix);
    }
}


