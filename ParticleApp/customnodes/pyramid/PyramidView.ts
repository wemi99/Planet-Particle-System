import {APolygonElement, ASerializable, A2DSceneNodeView, GetAppState, Mat4, A2DSceneNodeModel} from "src/anigraph";
import {PyramidEnums, PyramidModel} from "./PyramidModel";
import {PyramidController} from "./PyramidController";



@ASerializable("PyramidView")
export class PyramidView extends A2DSceneNodeView<A2DSceneNodeModel>{
    public element!:APolygonElement;
    public controller!:PyramidController;
    public copies:APolygonElement[];
    get model(){
        return this.controller.model as PyramidModel;
    }
    constructor() {
        super();
        const self = this;
        this.copies = [];


        // You could use unsubscribe() like below to remove the subscription
        // this.unsubscribe("colorshift")
    }

    initGraphics() {
        super.initGraphics();
        this.element = new APolygonElement(this.model.verts, this.model.color);
        this.addElement(this.element);
        // let newOb = NewObject3D();
        for(let c=0;c<PyramidEnums.maxNCopies;c++){
            let newCopy = new APolygonElement(this.model.verts, this.model.color);
            this.copies.push(newCopy);
            // newOb.add(newCopy.threejs);
            this.addElement(newCopy);
        }
        // this.threejs.add(newOb);

        const self=this;
        this.controller.subscribe(GetAppState().addClockListener((t:number)=>{
                self.element.setColor(self.model.color.Spun(self.model.colorSpeed*t/(2*Math.PI*100)));
                this.updateNonGeometry();
            }),
            "colorshift");

        this.updateNonGeometry();
        // this.controller.subscribe(this.model.addStateListener(()=>{self.updateNonGeometry();}));
    }

    updateNonGeometry(){
        let P = Mat4.Translation2D(this.model.transform.anchor);
        let Pinv = P.getInverse();
        for(let c=0;c<PyramidEnums.maxNCopies;c++){

            if(c<this.model.nCopies){
                this.copies[c].visible=true;
                let alpha = c/(this.model.nCopies);
                Pinv.times(Mat4.Scale2D(Math.pow(this.model.spread,alpha*alpha)))
                    .times(Mat4.Rotation2D( alpha*(this.model.twirl) ))
                    .times(P)
                    .assignTo(this.copies[c].threejs.matrix);
                this.copies[c].setColor(this.element.getColor().Spun(alpha*this.model.colorSpread));
            }else{
                this.copies[c].visible=false;
            }
        }
    }

    _updateGeometry() {
        this.element.setVerts(this.model.verts);
        for(let c=0;c<PyramidEnums.maxNCopies;c++){
            this.copies[c].setVerts(this.model.verts);
        }
        this.updateNonGeometry();
    }


}
