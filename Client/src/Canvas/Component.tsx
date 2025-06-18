import { useEffect, useRef } from 'react';  
import Controller from './Controller';  
import Options from '../Options/Base';  
import PopupComponent from './Popup/Component';
import GeometrySettingsComponent from './Geometry/ObjectControllers/Settings/Component';

interface ComponentProps {  
    selectedOptionRef: { current: Options };  
}

export default function Component({ selectedOptionRef }: ComponentProps): JSX.Element {  
    const mountRef: { current: HTMLDivElement | null } = useRef(null);
    const geometrySettingsComponentRef: { current: HTMLDivElement | null } = useRef(null);
    const popupComponentRef: { current: HTMLDivElement | null } = useRef(null);

    useEffect(() => {
        if (mountRef.current && popupComponentRef.current) {
            const controller = new Controller(mountRef.current, popupComponentRef.current, geometrySettingsComponentRef.current, selectedOptionRef);  
            controller.initialize();  

            return () => {
                controller.dispose();  
            };  
        }  
    }, []);  

    return (
        <div style={{ position: 'absolute', left: '20%', top: '0%', width: '80%', height: '100%', overflow: 'hidden' }}>  
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <GeometrySettingsComponent ref={geometrySettingsComponentRef} />
            <PopupComponent ref={popupComponentRef} />
        </div>  
    );  
}