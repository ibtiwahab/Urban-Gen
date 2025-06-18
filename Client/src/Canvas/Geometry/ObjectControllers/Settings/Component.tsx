import * as React from 'react';

const Component = React.forwardRef((_, ref) => {
    const [menus, setMenus] = React.useState<React.ReactNode[]>([]);

    React.useImperativeHandle(ref, () => ({
        setMenus: (value: any) => setMenus(value),
    }));

    const onClose = () => {
        setMenus([]);
    };

    return (
        <div
            style={{
                position: 'absolute',
                display: menus.length > 0 ? 'grid' : 'none',
                gridTemplateColumns: '1fr',
                gridTemplateRows: '10% auto',
                top: '20%',
                left: '75%',
                width: '25%',
                height: '60%',
                backgroundColor: 'black',
                overflow: 'auto',
                color: 'white'
            }}
        >
            <div
                style={{
                    position: 'static',
                    display: 'grid',
                    gridTemplateColumns: '90% 10%',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
            >
                <div
                    style={{
                        position: 'static',
                        width: '100%',
                        height: '100%',
                        border: 'none'
                    }}
                ></div>
                <button
                    onClick={onClose}
                    style={{
                        position: 'static',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'black',
                        color: 'white',
                        border: 'none',
                        fontSize: '10px',
                        textAlign: 'center'
                    }}
                >
                    ✖
                </button>
            </div>
            {
                menus.map((menu, index) =>
                    <React.Fragment key={index}>
                        {menu}
                    </React.Fragment>
                )
            }
        </div>
    );
});

export default Component;
