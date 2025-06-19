import React, { useState } from 'react';
import './Component.css';
import DefaultOptionComponent from './OptionComponents/Default';
import PolylineOptionComponent from './OptionComponents/Polyline';

export default function Component({ selectedOptionRef }) {
    const [_, setReRenderer] = useState('default');

    return (
        <div className="option-selector">
            <DefaultOptionComponent selectedOptionRef={selectedOptionRef} setReRenderer={setReRenderer} />
            <PolylineOptionComponent selectedOptionRef={selectedOptionRef} setReRenderer={setReRenderer} />
        </div>
    );
}