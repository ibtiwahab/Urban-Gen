import GeometryObjectControllers from '../../../Base';
import polylineController from '../../../Polyline';
import SiteTypeParameterComponent from './Parameters/SiteType/Component';
import DensityParameterComponent from './Parameters/Density';
import FARParameterComponent from './Parameters/FAR';
import MixRatioParameterComponent from './Parameters/MixRatio';
import OrientationParameterComponent from './Parameters/Orientation';


interface ComponentProps {
    polylineController: polylineController;
    addCallback: (result: GeometryObjectControllers[]) => void;
    removeCallback: (result: GeometryObjectControllers[]) => void
}

export default function Component({ polylineController, addCallback, removeCallback }: ComponentProps): JSX.Element {
    return (
        <div
            style={{
                position: 'static',
                display: 'grid',
                gridTemplateColumns: '1fr',
                width: '100%',
                height: 'auto',
                border: 'none',
            }}
        >
            <SiteTypeParameterComponent polylineController={polylineController} addCallback={addCallback} removeCallback={removeCallback} />
            <DensityParameterComponent polylineController={polylineController} addCallback={addCallback} removeCallback={removeCallback} />
            <FARParameterComponent polylineController={polylineController} addCallback={addCallback} removeCallback={removeCallback} />
            <MixRatioParameterComponent polylineController={polylineController} addCallback={addCallback} removeCallback={removeCallback} />
            <OrientationParameterComponent polylineController={polylineController} addCallback={addCallback} removeCallback={removeCallback} />
        </div>
    );
}
