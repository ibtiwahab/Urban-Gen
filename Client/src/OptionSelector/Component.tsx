import './Component.css';
import Options from "../Options/Base.ts"
import DefaultOptionComponent from './OptionComponents/Default.tsx';
import PolylineOptionComponent from './OptionComponents/Polyline.tsx';
import { useState } from 'react';

interface ComponentProps {
    selectedOptionRef: { current: Options };
}

export default function Component({ selectedOptionRef }: ComponentProps) {
    const [_, setReRenderer] = useState('default');

    return (
        <div className="option-selector">
            <DefaultOptionComponent selectedOptionRef={selectedOptionRef} setReRenderer={setReRenderer} />
            <PolylineOptionComponent selectedOptionRef={selectedOptionRef} setReRenderer={setReRenderer} />
        </div>
    );
}
