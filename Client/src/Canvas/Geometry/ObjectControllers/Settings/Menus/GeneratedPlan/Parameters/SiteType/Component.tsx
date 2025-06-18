import React, { useState } from 'react';
import GeometryObjectControllers from '../../../../../Base';
import polylineController from '../../../../../Polyline';
import BuildingStyle from './BuildingStyle';

interface ComponentProps {
    polylineController: polylineController;
    addCallback: (result: GeometryObjectControllers[]) => void;
    removeCallback: (result: GeometryObjectControllers[]) => void
}

export default function Component({ polylineController, addCallback, removeCallback }: ComponentProps): JSX.Element {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.site_type : null);
    const [changed, setChanged] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parameters) {
            setValue(Number(event.target.value));
        }

        setChanged(true);
    };

    const handleMouseUp = () => {
        if (parameters && changed && value != null) {
            parameters.site_type = value;

            if (parameters.building_style == 3 && value != 0 && value != 3 && value != 4) {
                parameters.building_style = 0;
            }

            polylineController.generatePlan(addCallback, removeCallback);
        }

        setChanged(false);
    };

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
            <h4>SiteType: { value ?? "Not generated" }</h4>
            <input 
                type="range" 
                min="0" 
                max="4" 
                value={value ? value.toString() : "0"}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
            />
            <BuildingStyle polylineController={polylineController} addCallback={addCallback} removeCallback={removeCallback} />
        </div>
    );
}