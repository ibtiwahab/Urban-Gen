import React, { useState } from 'react';
import GeometryObjectControllers from '../../../../../Base';
import polylineController from '../../../../../Polyline';

interface ComponentProps {
    polylineController: polylineController;
    addCallback: (result: GeometryObjectControllers[]) => void;
    removeCallback: (result: GeometryObjectControllers[]) => void
}

export default function BuildingStyle({ polylineController, addCallback, removeCallback }: ComponentProps): JSX.Element {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.building_style : null);
    const [changed, setChanged] = useState(false);

    let max = 2;

    if (parameters) {
        if (parameters.site_type == 0 || parameters.site_type == 3 || parameters.site_type == 4) {
            max = 3;
        } else if (value == 3) {
            setValue(0);
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parameters) {
            setValue(Number(event.target.value));
        }

        setChanged(true);
    };

    const handleMouseUp = () => {
        if (parameters && changed && value != null) {
            parameters.building_style = value;
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
            <h4>Building style: {value ?? "Not generated"}</h4>
            <input
                type="range"
                min="0"
                max={max.toString()}
                value={value ? value.toString() : "0"}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}