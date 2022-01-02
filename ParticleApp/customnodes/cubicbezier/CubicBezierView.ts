import {
    A2DLineSegmentsElement,
    A2DLinesElement,
    A2DSceneNodeView,
    ABasic2DElement, AHandleElement,
    APolygonElement,
    Color, Mat4,
    Vec2,
    VertexArray2D
} from "src/anigraph";
import {CubicBezierController} from "./CubicBezierController";
import {CubicBezierModel} from "./CubicBezierModel";


enum StrokeRatios{
    Main=1,
    Control=0.25,
    Ref=0.5

}

// static GetSplineValueForAlpha(alpha, p0, p1, p2, p3){
//     var a = ((p0*-1)+(p1*3)+(p2*-3)+p3)*alpha*alpha*alpha;
//     var b =((p0*3)+(p1*-6)+(p2*3))*alpha*alpha;
//     var c =((p0*-3)+(p1*3))*alpha;
//     var d = p0;
//     return a+b+c+d;
// }



function GetSplineValueForAlpha(alpha:number, p0:Vec2, p1:Vec2, p2:Vec2, p3:Vec2){
    var a = p0.times(-1)
        .plus(p1.times(3))
        .plus(p2.times(-3))
        .plus(p3)
        .times(alpha*alpha*alpha);
    var b =p0.times(3)
        .plus(p1.times(-6))
        .plus(p2.times(3))
        .times(alpha*alpha);
    var c =p0.times(-3)
        .plus(p1.times(3))
        .times(alpha);
    var d = p0;
    return a
        .plus(b)
        .plus(c)
        .plus(d);
}


export class CubicBezierView extends A2DSceneNodeView<CubicBezierModel>{
    controller!:CubicBezierController;
    public fillElement!:ABasic2DElement;
    public strokeElement!:A2DLinesElement;
    public frameElement!:A2DLinesElement;
    // let's give the EditVertsView an array of handle elements...
    public vertexHandles: AHandleElement[];
    public handleLines:A2DLinesElement[];
    public handleLine!:A2DLineSegmentsElement;

    constructor() {
        super();
        this.vertexHandles = [];
        this.handleLines = [];
    }

    _updateGeometry(){

        let handleVerts = new VertexArray2D();

        let splineVerts = new VertexArray2D();
        if(this.model.verts.length>3) {
            // GetSplineValueForAlpha

            for(let k=0;k<this.model.verts.length;k+=3){
                let p0=this.model.verts.getPoint2DAt(k);
                let p1=this.model.verts.getPoint2DAt(k+1);
                let p2=this.model.verts.getPoint2DAt(k+2);
                let p3=this.model.verts.getPoint2DAt(k+3);
                for(let s=0;s<this.model.nSubdivisions;s++){
                    splineVerts.addVertex(GetSplineValueForAlpha(s/(this.model.nSubdivisions-1),p0,p1,p2,p3));
                }
                handleVerts.addVertex(p0);
                handleVerts.addVertex(p1);
                handleVerts.addVertex(p2);
                handleVerts.addVertex(p3);


            }
            this.handleLine.setVerts(handleVerts);
            // splineVerts.addVertex(this.model.verts.getPoint2DAt(0));
            // splineVerts.addVertex(this.model.verts.getPoint2DAt(1));
            // for (let v = 1; v < this.model.verts.length; v++) {
            //     splineVerts.addVertex(this.model.verts.getPoint2DAt(v - 1).plus(this.model.verts.getPoint2DAt(v)).times(0.5));
            //     splineVerts.addVertex(this.model.verts.getPoint2DAt(v));
            // }
        }else{
            splineVerts=this.model.verts;
        }


        this.fillElement.setVerts(splineVerts);
        this.strokeElement.setVerts(splineVerts);


        // if(splineVerts.length>2 && this.model.nSubdivisions>0) {
        //     let newVerts = new VertexArray2D();
        //     let step = 1 / this.model.nSubdivisions;
        //     for (let v = 0; v < splineVerts.length-2; v+=2) {
        //         let pa = splineVerts.getPoint2DAt(v);
        //         let pb = splineVerts.getPoint2DAt((v + 1) % splineVerts.length);
        //         let pc = splineVerts.getPoint2DAt((v + 2) % splineVerts.length)
        //         for (let s = 0; s < this.model.nSubdivisions+1; s++) {
        //             let alpha = s * step;
        //             let newvert = alpha_along_ab(alpha_along_ab(pa, pb, alpha), alpha_along_ab(pb, pc, alpha), alpha);
        //             newVerts.addVertex(newvert);
        //         }
        //     }
        //     this.fillElement.setVerts(newVerts);
        //     this.strokeElement.setVerts(newVerts);
        // }else{
        //     this.fillElement.setVerts(splineVerts);
        //     this.strokeElement.setVerts(splineVerts);
        // }

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



    get model() {
        return this.controller.model as CubicBezierModel;
    }

    initGraphics() {
        super.initGraphics();
        const self = this;
        const model = self.model;

        this.fillElement = new APolygonElement(this.model.verts, this.model.color);
        this.addElement(this.fillElement);

        this.strokeElement = new A2DLinesElement(this.model.verts, this.model.strokeColor, this.model.strokeWidth);
        this.addElement(this.strokeElement);

        this.handleLine = new A2DLineSegmentsElement(this.model.verts, this.model.strokeColor, 0.002);
        this.handleLine.setColor(Color.FromString("#5588ff"))
        this.addElement(this.handleLine);

        // let firsthandle = new AHandleElement();
        // this.addElement(firsthandle);
        // this.handles = [];
        // this.handles.push(firsthandle);

        this.controller.subscribe(
            this.model.addStateKeyListener('color', ()=>{
                self.fillElement.setColor(model.color);
            }),
            'model.color'
        );
        this.controller.subscribe(
            this.model.addStateKeyListener('verts', ()=>{
                this._updateGeometry();
            }),
            'model.verts'
        );

        this.controller.subscribe(
            this.model.addStateKeyListener('strokeColor', ()=>{
                this.strokeElement.setColor(model.strokeColor);
            }),
            'model.strokeColor'
        );

        this.controller.subscribe(
            this.model.addStateKeyListener('strokeWidth', ()=>{
                this.strokeElement.material.linewidth=model.strokeWidth;
                this.strokeElement.setColor(model.strokeColor);
            }),
            'model.strokeWidth'
        );
        this.controller.subscribe(
            this.model.addStateKeyListener('nSubdivisions', ()=>{
                this._updateGeometry();
            }),
            'model.nSubdivisions'
        );

        this.fillElement.visible=false;
    }
}


