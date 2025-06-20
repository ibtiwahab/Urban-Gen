import React, { useState } from 'react';

export default function FAR({ polylineController, addCallback, removeCallback }) {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.far : null);
    const [changed, setChanged] = useState(false);

    const handleChange = (event) => {
        if (parameters) {
            setValue(parseFloat(event.target.value));
        }

        setChanged(true);
    };

    const handleMouseUp = () => {
        if (parameters && changed && value != null) {
            parameters.far = value;
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
            <h4>FAR: {value ?? "Not generated"}</h4>
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