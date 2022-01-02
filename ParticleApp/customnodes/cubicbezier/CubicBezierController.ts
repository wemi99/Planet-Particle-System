import {
    A2DSceneController,
    A2DSceneModel,
    A2DSceneNodeController,
    A2DSceneNodeModel, ADragInteraction, AHandleElement, AInteractionEvent,
    AniGraphEnums, GetAppState
} from "../../../anigraph";
import {CubicBezierModel} from "./CubicBezierModel";
import {EditVertsModel} from "../editverts";
import {CubicBezierView} from "./CubicBezierView";

const EditingInteractionModeName = 'editing';

export class CubicBezierController extends A2DSceneNodeController<CubicBezierModel>{
    public view!:CubicBezierView
    constructor() {
        super();
        // let's define an interaction mode called "editing"
        this.defineInteractionMode(EditingInteractionModeName);
    }

    initInteractions() {
        super.initInteractions();

        const self=this;
        const model = this.model as EditVertsModel;
        /***
         * Now every time the inEditMode attribute changes in our model, activate or deactivate edit mode and toggle the
         * visibility of the handles. We will put the handle interactions on this edit mode so that they are only active
         * when we are in edit mode...
         */
        this.subscribe(this.model.addStateKeyListener('inEditMode', ()=> {
                if (model.inEditMode) {
                    self.setCurrentInteractionMode(EditingInteractionModeName);
                    for (let h = 0; h < this.view.vertexHandles.length; h++) {
                        self.view.vertexHandles[h].visible = true;
                    }
                } else {
                    self.setCurrentInteractionMode();
                    for (let h = 0; h < this.view.vertexHandles.length; h++) {
                        self.view.vertexHandles[h].visible = false;
                    }
                }
            })
        );
    }

    initHandleInteractions(handleElement: AHandleElement) {
        const model = this.model;
        // Add the handle's interaction to the editing interaction mode
        this.getInteractionMode(EditingInteractionModeName).addInteraction(ADragInteraction.Create(handleElement.threejs,
                (interaction: ADragInteraction, event: AInteractionEvent) => {
                    //This is basically just casting the interaction's element attribute to an AHandleElement
                    interaction.setInteractionState('startValue', model.verts.position.getPoint2DAt(handleElement.index));
                    interaction.dragStartPosition = event.cursorPosition;
                },
                (interaction: ADragInteraction, event: AInteractionEvent) => {
                    model.verts.position.setAt(handleElement.index,
                        interaction.getInteractionState('startValue').plus(
                            event.cursorPosition.minus(interaction.dragStartPosition)
                        ));
                }
            )
        );
    }

    static CreateShapeInteraction<NodeType extends A2DSceneNodeModel>(sceneController:A2DSceneController<NodeType, A2DSceneModel<NodeType>>, CreateShapeName?:string){
        CreateShapeName=CreateShapeName?CreateShapeName:AniGraphEnums.CreateShapeInteractionName;
        const appState = GetAppState();
        return ADragInteraction.Create(sceneController.backgroundElement,
            (interaction:ADragInteraction, event: AInteractionEvent) => {
            interaction.dragStartPosition = event.cursorPosition;
                if(interaction.getInteractionState("newShape")===undefined){
                    let newShape = sceneController.model.NewNode();
                    newShape.verts.position.push(event.cursorPosition);
                    newShape.verts.position.push(event.cursorPosition);
                    // @ts-ignore
                    newShape.color = appState.selectedColor;
                    sceneController.model.addNode(newShape);
                    sceneController.selectModel(newShape);
                    appState.freezeSelection();
                    interaction.setInteractionState("newShape", newShape);
                    // sceneController.disableDraggingOnSelected();
                }else{
                    let model = (interaction.getInteractionState("newShape") as CubicBezierModel);
                    model.verts.addVertex(event.cursorPosition);
                    model.verts.addVertex(event.cursorPosition);
                    model.verts.addVertex(event.cursorPosition);
                }
            }, (interaction, event)=>{
                let newshape:CubicBezierModel = interaction.getInteractionState("newShape");
                if(newshape) {
                    newshape.verts.position.setAt(newshape.verts.length - 1, event.cursorPosition);
                    newshape.verts.position.setAt(newshape.verts.length - 3, interaction.dragStartPosition.times(2).minus(event.cursorPosition));
                }else{
                    throw new Error("Should not be dragging on create shape without a selected model...");
                }
            }, (interaction, event)=>{
                // interaction.setInteractionState("newShape", undefined);
            },
            CreateShapeName);
    }

}
