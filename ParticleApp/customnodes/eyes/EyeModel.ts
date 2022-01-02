import {A2DPolygonModel, AObjectState, ASerializable, GetAppState, V2, Vec2} from "../../../anigraph";

@ASerializable("EyeModel")
export class EyeModel extends A2DPolygonModel{
    @AObjectState targetRange:number;
    @AObjectState dilation:number;
    @AObjectState targetPoint:Vec2;
    @AObjectState blinkDuration:number;

    constructor(){
        super();
        this.dilation = 0.5;
        this.targetRange=25;
        this.targetPoint = V2(0,0);
        this.blinkDuration = 0.1;
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
            dilation: {
                value: self.dilation,
                min: 0,
                max: 1,
                step:0.01,
                onChange: (v: number) => {
                    self.dilation = v;
                }
            },
            blinkDuration: {
                value: self.blinkDuration,
                min: 0,
                max: 1,
                step:0.01,
                onChange: (v: number) => {
                    self.blinkDuration = v;
                }
            }
        }
        return {...customSpec, ...super.getModelGUIControlSpec()}
    }


}
