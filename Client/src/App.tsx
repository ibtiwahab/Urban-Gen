import CanvasComponent from './Canvas/Component.tsx';
import OptionSelectorComponent from './OptionSelector/Component.tsx';
import { useRef } from 'react';
import "./App.css";
import Options from './Options/Base.ts';
import DefaultOption from './Options/Default.ts';

function App() {
    const selectedOptionRef: { current: Options } = useRef(new DefaultOption());

    return (
        <div className="app">
            <OptionSelectorComponent selectedOptionRef={selectedOptionRef} />
            <CanvasComponent selectedOptionRef={selectedOptionRef} />
        </div>
    );
}

export default App;
