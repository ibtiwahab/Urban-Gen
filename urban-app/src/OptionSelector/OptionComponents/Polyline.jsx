import React from 'react';
import PolylineOption from "../../Options/Polyline";

export default function Polyline({ selectedOptionRef, setReRenderer }) {
    const active = selectedOptionRef.current instanceof PolylineOption;

    const handleClick = () => {
        if (active) return;
        selectedOptionRef.current.dispose();
        selectedOptionRef.current = new PolylineOption();
        setReRenderer('polyline');
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
            Polyline
        </div>
    );
}