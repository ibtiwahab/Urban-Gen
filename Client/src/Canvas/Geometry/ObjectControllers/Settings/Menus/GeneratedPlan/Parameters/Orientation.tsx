import React, { useState } from 'react';
import GeometryObjectControllers from '../../../../Base';
import polylineController from '../../../../Polyline';

interface ComponentProps {
    polylineController: polylineController;
    addCallback: (result: GeometryObjectControllers[]) => void;
    removeCallback: (result: GeometryObjectControllers[]) => void
}

export default function Orientation({ polylineController, addCallback, removeCallback }: ComponentProps): JSX.Element {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.orientation : null);
    const [changed, setChanged] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parameters) {
            let eventValue = parseFloat(event.target.value);
            if (eventValue == 180.0) eventValue = 0.0;
            setValue(eventValue);
        }

        setChanged(true);
    };

    const handleMouseUp = () => {
        if (parameters && changed && value != null) {
            parameters.orientation = value;
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
            <h4>Orientation: {value ?? "Not generated"}</h4>
            <input
                type="range"
                min="0"
                max="180.0"
                step="0.1"
                value={value ? value.toString() : "0"}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}