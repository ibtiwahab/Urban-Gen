import React, { forwardRef, useState, useImperativeHandle } from 'react';

const Component = forwardRef((_, ref) => {
    const [xPosition, setXPosition] = useState(0);
    const [yPosition, setYPosition] = useState(0);
    const [options, setOptions] = useState([]);

    useImperativeHandle(ref, () => {
        return {
            getXPosition() {
                return xPosition;
            },
            setXPosition(value) {
                setXPosition(value);
            },
            getYPosition() {
                return yPosition;
            },
            setYPosition(value) {
                setYPosition(value);
            },
            getOptions() {
                return options;
            },
            setOptions(value) {
                setOptions(value);
            }
        };
    });

    return (
        <div style={{
            position: 'absolute',
            left: `${xPosition}px`,
            top: `${yPosition}px`,
            backgroundColor: 'white',
            display: (options.length > 0) ? 'grid' : 'none',
            gridTemplateColumns: '1fr'
        }}>
            {options.map((option, index) => (
                <div
                    key={`canvas-popup-options-${index}`}
                    style={{
                        position: 'static',
                        width: '100%',  
                        height: '100%',  
                        display: 'grid',  
                        placeItems: 'center',
                    }}  
                    onClick={option.onClickWrapper}
                >
                    {option.name}
                </div>
            ))}
        </div>
    );
});

export default Component;