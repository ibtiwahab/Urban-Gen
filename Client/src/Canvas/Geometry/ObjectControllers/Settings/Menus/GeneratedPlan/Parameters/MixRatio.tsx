import React, { useState } from 'react';
import GeometryObjectControllers from '../../../../Base';
import polylineController from '../../../../Polyline';

interface ComponentProps {
    polylineController: polylineController;
    addCallback: (result: GeometryObjectControllers[]) => void;
    removeCallback: (result: GeometryObjectControllers[]) => void
}

export default function MixRatio({ polylineController, addCallback, removeCallback }: ComponentProps): JSX.Element {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.mix_ratio : null);
    const [changed, setChanged] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (parameters) {
            setValue(parseFloat(event.target.value));
        }

        setChanged(true);
    };

    const handleMouseUp = () => {
        if (parameters && changed && value != null) {
            parameters.mix_ratio = value;
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
            <h4>MixRatio: {value ?? "Not generated"}</h4>
            <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={value ? value.toString() : "0"}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}