import {EyeModel} from "./EyeModel";
import {
    A2DSceneNodeController, A2DSceneNodeModel,
    AClickInteraction,
    ADragInteraction,
    AInteractionEvent,
    ASerializable,
    V2
} from "../../../anigraph";
import {EyeView} from "./EyeView";

@ASerializable("EyeController")
export class EyeController extends A2DSceneNodeController<A2DSceneNodeModel>{
    get model():EyeModel{
        return this._model as EyeModel;
    }


    initInteractions() {
        super.initInteractions();
        let view = this.view as unknown as EyeView;
        const self = this;


        /***
         * The arguments to interaction Create() functions are always first a threejs object and then the callbacks
         * associated with that interaction. Here we are adding a drag interaction that will trigger whenever the user
         * clicks and drags on the pupils of the eye. Any movement of the mouse will cause us to set the `target`
         * AObjectState of the eye model. The view listens for changes to the target and will update the transformation
         * of the iris to look at the target.
         */

        this.addInteraction(ADragInteraction.Create(view.pupil.threejs,
            (interaction:ADragInteraction, event:AInteractionEvent)=>{
                self.model.targetPoint = event.cursorPosition;
            },
            (interaction:ADragInteraction, event:AInteractionEvent)=>{
                self.model.targetPoint = event.cursorPosition;
            },
            (interaction:ADragInteraction, event?:AInteractionEvent)=>{
                self.model.targetPoint = V2(0,0);
            },
        ));


        this.addInteraction(AClickInteraction.Create(view.iris.threejs,
            (event:AInteractionEvent)=> {
            self.model.signalEvent("triggerBlink")
        }))
    }
}
