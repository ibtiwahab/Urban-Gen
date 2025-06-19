import React from 'react';
import DefaultOption from "../../Options/Default";

export default function Default({ selectedOptionRef, setReRenderer }) {
    const active = selectedOptionRef.current instanceof DefaultOption;

    const handleClick = () => {
        if (active) return;
        selectedOptionRef.current.dispose();
        selectedOptionRef.current = new DefaultOption();
        setReRenderer('default');
    };

    const handleMouseEnter = () => {
        document.body.style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
        document.body.style.cursor = "default";
    };

    return (
        <div
            style={{
                position: "static",
                width: "100%",
                height: "100%",
                backgroundColor: active ? "blue" : "gray",
                color: active ? "white" : "black",
                display: "grid",
                placeItems: "center"
            }}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            Default
        </div>
    );
}