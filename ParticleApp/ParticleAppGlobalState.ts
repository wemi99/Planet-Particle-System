import {Basic2DAppState} from "../anigraph/apps/Base2DApp/Base2DAppAppState";
import {A2DSceneModel, A2DSceneNodeModel, Color, SetAppState} from "../anigraph";
import {button, folder} from "leva";
import {Base2DAppSceneModel} from "../anigraph/apps/Base2DApp/models/Base2DAppSceneModel";

export abstract class ParticleAppGlobalStateBase<NodeModelType extends A2DSceneNodeModel, SceneModelType extends A2DSceneModel<NodeModelType>> extends Basic2DAppState<NodeModelType, SceneModelType> {
    getModelControlSpecs(){
        return (this.modelSelection.length>0)?this.selectedModels[0].getModelGUIControlSpec():{};
    }
}

export class ParticleAppGlobalState extends ParticleAppGlobalStateBase<A2DSceneNodeModel, A2DSceneModel<A2DSceneNodeModel>>{
    // @ts-ignore
    NewSceneModel(){
        return new Base2DAppSceneModel();
    }

    getControlPanelStandardSpec(): {} {
        const self = this;
        return {
            ...super.getControlPanelStandardSpec(),
            addDefaultScene: button(()=> {
                // @ts-ignore
                self.sceneModel.addDefaultScene();
            }),
            // addNewPlanetToScene: button(()=> {
            //     // create new particle
            //     if (self.sceneModel.name=="PlanetParticleModel"){
            //         this.addNewParticleToScene();
            //         addNewParticleToScene();
            //     }
            // }),
            color: {
                value: this.selectedColor.toHexString(),
                onChange: (v: string) => {
                    let selectedColor = Color.FromString(v);
                    if (self.selectionModel.nSelectedModels==1) {
                        // appState.selectionModel.updateColor();
                        for(let m of self.modelSelection){
                            // @ts-ignore
                            m.color = selectedColor;
                        }

                    }
                    // @ts-ignore
                    self.selectedColor = selectedColor;
                },
            }
        };
    }


    static SetAppState(){
        const newappState = new this();
        SetAppState(newappState);
        return newappState;
    }
}
