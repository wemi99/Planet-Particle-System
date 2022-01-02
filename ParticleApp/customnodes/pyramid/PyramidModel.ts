import {A2DSceneNodeModel, AObjectState, ASerializable, Color, GetAppState, VertexArray2D} from "src/anigraph";
import {A2DPolygonModel} from "../../../anigraph";
import {BoundingBox2D} from "../../../anigraph/amath/BoundingBox2D";

export enum PyramidEnums{
    maxNCopies=300
}

@ASerializable("PyramidModel")
export class PyramidModel extends A2DPolygonModel{
    // @AObjectState verts!:VertexArray2D;
    // @AObjectState color!:Color;
    @AObjectState colorSpeed:number;
    @AObjectState spread:number;
    @AObjectState twirl:number;
    @AObjectState nCopies:number;
    @AObjectState colorSpread:number;
    constructor() {
        super();
        this.colorSpeed=0;
        this.spread = 0.1;
        this.twirl = 0;
        this.nCopies=50;
        this.colorSpread=Math.PI;
    }

    getModelGUIControlSpec(){
        const self = this;
        const customSpec = {
            ModelName: {
                value:self.name,
                onChange:(v:string)=>{
                    self.name = v;
                }
            },
            colorSpeed: {
                value: self.colorSpeed,
                min: 0,
                max: 10,
                onChange: (v: number) => {
                    self.colorSpeed = v;
                }
            },
            spread:{
                value:self.spread,
                min:0,
                max:4,
                step:0.01,
                onChange:(v:number)=>{
                    self.spread = v;
                }
            },
            twirl:{
                value:self.twirl,
                min:-2*Math.PI,
                max:10*Math.PI,
                step:0.01,
                onChange:(v:number)=>{
                    self.twirl = v;
                }
            },
            nCopies:{
                value:self.nCopies,
                min:0,
                max:PyramidEnums.maxNCopies,
                step:1,
                onChange:(v:number)=>{
                    self.nCopies = v;
                }
            },
            colorSpread:{
                value:self.colorSpread,
                min:-5*Math.PI,
                max:5*Math.PI,
                step:0.01,
                onChange:(v:number)=>{
                    self.colorSpread = v;
                }
            },
        }
        return {...customSpec, ...super.getModelGUIControlSpec()}
    }

}
