import {
    A2DSceneNodeController,
    A2DSceneNodeView,
    APolygonElement,
    ASerializable,
    GetAppState
} from "../../../anigraph";
import {FancyModel} from "./FancyModel";

@ASerializable("FancyView")
export class FancyView extends A2DSceneNodeView<FancyModel>{
    public controller!:A2DSceneNodeController<FancyModel>;
    public element!:APolygonElement;
    get model(){
        return this.controller.model as FancyModel;
    }



    constructor() {
        super();
        const self = this;
        this.subscribe(GetAppState().addClockListener((t:number)=>{
            self.element.setColor(this.model.color.Spun(this.model.colorSpeed*t/(2*Math.PI*100)));
        }),
            "colorshift");

        // You could use unsubscribe() like below to remove the subscription
        // this.unsubscribe("colorshift")
    }

    initGraphics() {
        super.initGraphics();
        this.element = new APolygonElement(this.model.verts, this.model.color);
        this.addElement(this.element);
    }

}
