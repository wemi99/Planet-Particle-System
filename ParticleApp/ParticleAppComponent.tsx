import {useSnapshot} from "valtio";
import {ParticleAppGlobalState} from "./ParticleAppGlobalState";
import {
    ControlPanel,
    A2DPolygonView,
    A2DSceneModel,
    A2DSceneNodeModel,
    NewAMVCNodeClassSpec, A2DPolygonModel, A2DSceneNodeController
} from "../anigraph";
import "./ParticleApp.css"
import {Base2DAppNodeController, Base2DAppSceneController} from "../anigraph/apps/Base2DApp";
import {PlanetParticleModel} from "./PlanetParticle/PlanetParticleModel";
import {PlanetParticleView} from "./PlanetParticle/PlanetParticleView";
import {PlanetParticleController} from "./PlanetParticle/PlanetParticleController";


const appState = ParticleAppGlobalState.SetAppState();


    // ParticleAppGlobalState.SetAppState();

export enum AppSubComponents{
    ModelScene='ModelScene',
    ViewScene = 'ViewScene'
}

class AppSceneController extends Base2DAppSceneController<A2DSceneNodeModel, A2DSceneModel<A2DSceneNodeModel>>{
}

class ViewAppSceneController extends Base2DAppSceneController<A2DSceneNodeModel, A2DSceneModel<A2DSceneNodeModel>>{
    initSelectionController() {
        super.initSelectionController();
        this.selectionController.view.showSelectionBox=false;
    }
}

class A2DPolygonController extends A2DSceneNodeController<A2DPolygonModel>{
}

// // let appState = AAppState.GetAppState();
const ParticleAppModelSceneComponent = appState.AppComponent(
    AppSceneController,
    AppSubComponents.ModelScene,
    [
        NewAMVCNodeClassSpec(PlanetParticleModel, PlanetParticleView, PlanetParticleController),
    ]
);

const ParticleAppViewSceneComponent = appState.AppComponent(
    ViewAppSceneController,
    AppSubComponents.ViewScene,
    [
        NewAMVCNodeClassSpec(PlanetParticleModel, PlanetParticleView, PlanetParticleController),
    ]
);


export function ParticleAppComponent() {
    const state = useSnapshot(appState.state);
    const selectionModel = state.selectionModel;
    return (
        <div>
            <ControlPanel modelControlSpecs={selectionModel.getModelGUIControlSpecs()}/>
            <div className={"container-fluid"}>
                <div className={"row"}>
                    <div className={"Base2DApp-explanation"}>
                        <h1 className={"App-title"}>Nebula Collapse in a box</h1>
                        <p className={"credit-text"}>Cornell Intro to Graphics, Fall 2021.</p>
                        <br/>
                    </div>
                </div>
                <div className={"row"}>
                    <div className={"col-5"}>
                        <div className={"row"}>
                            <h2 className={"Base2DApp-label"}>Viewing World Space:</h2>
                        </div>
                        <div className={"row"}>
                            <ParticleAppModelSceneComponent/>
                        </div>
                    </div>
                    <div className={"col-5"}>
                        <div className={"row"}>
                            <h2 className={"Base2DApp-label"}>Viewing Object Space:</h2>
                        </div>
                        <div className={"row"}>
                            <ParticleAppViewSceneComponent/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
