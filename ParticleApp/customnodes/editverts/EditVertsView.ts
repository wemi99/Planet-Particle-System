import {
    A2DSceneNodeView,
    AHandleElement, APolygonElement,
    ASerializable,
    Color,
    Mat4
} from "../../../anigraph";
import {EditVertsModel} from "./EditVertsModel";
import {EditVertsController} from "./EditVertsController";

@ASerializable("EditVertsView")
export class EditVertsView extends A2DSceneNodeView<EditVertsModel> {
    public element!:APolygonElement;
    public controller!:EditVertsController
    // let's give the EditVertsView an array of handle elements...
    public vertexHandles: AHandleElement[];


    initGraphics() {
        super.initGraphics();
        this.element = new APolygonElement(this.model.verts, this.model.color);
        this.addElement(this.element);

        const self = this;
        this.controller.subscribe(
            self.model.addStateKeyListener('verts', ()=>{
                self._updateGeometry();
            }),
            'model.verts'
        );

    }

    get model() {
        return this.controller.model as EditVertsModel;
    }


    constructor() {
        super();
        this.vertexHandles = [];
    }

    _updateGeometry() {
        this.element.setVerts(this.model.verts);

        let handlesEnter = this.model.verts.length - this.vertexHandles.length;
        if (handlesEnter > 0) {
            for (let nh = 0; nh < handlesEnter; nh++) {
                let newHandle = new AHandleElement(8, Color.FromString("#888888"));
                newHandle.index = this.vertexHandles.length;
                this.controller.initHandleInteractions(newHandle);
                this.addElement(newHandle);
                this.vertexHandles.push(newHandle);
            }
        }
        for (let h = 0; h < this.vertexHandles.length; h++) {
            this.vertexHandles[h].threejs.matrix = Mat4.Translation2D(this.model.verts.getPoint2DAt(h)).toTHREE();
        }
    }

}
