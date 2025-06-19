import React, { useRef } from 'react';
import CanvasComponent from './Canvas/Component';
import OptionSelectorComponent from './OptionSelector/Component';
import DefaultOption from './Options/Default';
import "./App.css";

function App() {
    const selectedOptionRef = useRef(new DefaultOption());

    return (
        <div className="app">
            <OptionSelectorComponent selectedOptionRef={selectedOptionRef} />
            <CanvasComponent selectedOptionRef={selectedOptionRef} />
        </div>
    );
}

export default App;