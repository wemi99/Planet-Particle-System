import {A2DPolygonModel, A2DSceneNodeModel} from "../../../anigraph";
import {AObjectState, ASerializable, Color, GetAppState} from "../../../anigraph";
import {BoundingBox2D} from "../../../anigraph/amath/BoundingBox2D";


@ASerializable("FancyModel")
export class FancyModel extends A2DPolygonModel{
    @AObjectState colorSpeed:number;

    constructor() {
        super();
        this.colorSpeed=1;
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
            }
        }
        return {...customSpec, ...super.getModelGUIControlSpec()}
    }

}
