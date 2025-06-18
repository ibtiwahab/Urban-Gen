import Options from "../../Options/Base.ts"
import DefaultOption from "../../Options/Default.ts"

interface ComponentProps {
    selectedOptionRef: { current: Options };
    setReRenderer: any;
}

export default function Default({ selectedOptionRef, setReRenderer }: ComponentProps) {
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