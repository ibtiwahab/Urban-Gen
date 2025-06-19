import React, { useEffect, useRef } from 'react';  
import Controller from './Controller';  
import PopupComponent from './Popup/Component';
import GeometrySettingsComponent from './Geometry/ObjectControllers/Settings/Component';

export default function Component({ selectedOptionRef }) {  
    const mountRef = useRef(null);
    const geometrySettingsComponentRef = useRef(null);
    const popupComponentRef = useRef(null);

    useEffect(() => {
        if (mountRef.current && popupComponentRef.current) {
            const controller = new Controller(mountRef.current, popupComponentRef.current, geometrySettingsComponentRef.current, selectedOptionRef);  
            controller.initialize();  

            return () => {
                controller.dispose();  
            };  
        }  
    }, [selectedOptionRef]);  

    return (
        <div style={{ position: 'absolute', left: '20%', top: '0%', width: '80%', height: '100%', overflow: 'hidden' }}>  
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <GeometrySettingsComponent ref={geometrySettingsComponentRef} />
            <PopupComponent ref={popupComponentRef} />
        </div>  
    );  
}