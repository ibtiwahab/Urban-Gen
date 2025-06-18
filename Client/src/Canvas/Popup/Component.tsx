import * as React from 'react';

interface Options {
    name: string;
    onClickWrapper: () => void;
}

const Component = React.forwardRef((_, ref) => {
    const [xPosition, setXPosition] = React.useState(0);
    const [yPosition, setYPosition] = React.useState(0);
    const [options, setOptions] = React.useState<Options[]>([]);

    React.useImperativeHandle(ref, () => {
        return {
            getXPosition() {
                return xPosition;
            },
            setXPosition(value: number) {
                setXPosition(value);
            },
            getYPosition() {
                return yPosition;
            },
            setYPosition(value: number) {
                setYPosition(value);
            },
            getOptions() {
                return options;
            },
            setOptions(value: Options[]) {
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
                    key={ `canvas-popup-options-${index}` }
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
})

export default Component;