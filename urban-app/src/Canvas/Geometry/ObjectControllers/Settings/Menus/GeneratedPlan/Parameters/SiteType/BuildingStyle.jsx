import React, { useState, useEffect } from 'react';

export default function BuildingStyle({ polylineController, addCallback, removeCallback }) {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.building_style : 0);
    const [changed, setChanged] = useState(false);

    // Building style options
    const buildingStyles = [
        { id: 0, name: 'Residential', description: '3.0m floors, family housing', color: '#4CAF50' },
        { id: 1, name: 'Office', description: '3.5m floors, workspace', color: '#2196F3' },
        { id: 2, name: 'Commercial', description: '4.0m floors, retail/shops', color: '#FF9800' },
        { id: 3, name: 'Mixed Use', description: '3.2m floors, multi-purpose', color: '#9C27B0' }
    ];

    useEffect(() => {
        if (parameters) {
            setValue(parameters.building_style);
        }
    }, [parameters]);

    // Determine available styles based on site type
    const getAvailableStyles = () => {
        if (!parameters) return buildingStyles;
        
        const siteType = parameters.site_type;
        
        switch (siteType) {
            case 0: // Residential site
                return buildingStyles.filter(style => [0, 3].includes(style.id)); // Residential, Mixed
            case 1: // Commercial site
                return buildingStyles.filter(style => [1, 2, 3].includes(style.id)); // Office, Commercial, Mixed
            case 2: // Office site
                return buildingStyles.filter(style => [1, 3].includes(style.id)); // Office, Mixed
            case 3: // Mixed Use site
                return buildingStyles; // All styles available
            case 4: // Industrial site
                return buildingStyles.filter(style => [1, 2].includes(style.id)); // Office, Commercial
            default:
                return buildingStyles;
        }
    };

    const availableStyles = getAvailableStyles();
    const currentStyle = buildingStyles.find(style => style.id === value) || buildingStyles[0];

    // Ensure current value is available for current site type
    useEffect(() => {
        if (parameters && !availableStyles.some(style => style.id === value)) {
            const newValue = availableStyles[0]?.id || 0;
            setValue(newValue);
            parameters.building_style = newValue;
        }
    }, [parameters?.site_type, availableStyles, value]);

    const handleChange = (event) => {
        const newValue = Number(event.target.value);
        setValue(newValue);
        
        if (parameters) {
            parameters.setBuildingStyle(newValue);
        }

        setChanged(true);
    };

    const handleMouseUp = async () => {
        if (parameters && changed && value != null) {
            parameters.building_style = value;
            
            console.log('Building style changed to:', value);
            console.log('Available styles for site type', parameters.site_type, ':', availableStyles.map(s => s.name));
            
            polylineController.generatePlan(addCallback, removeCallback);
        }

        setChanged(false);
    };

    const handleStyleSelect = (styleId) => {
        setValue(styleId);
        
        if (parameters) {
            parameters.setBuildingStyle(styleId);
            parameters.building_style = styleId;
            
            console.log('Building style selected:', styleId);
            polylineController.generatePlan(addCallback, removeCallback);
        }
    };

    const getFloorHeight = (styleId) => {
        const heights = { 0: 3.0, 1: 3.5, 2: 4.0, 3: 3.2 };
        return heights[styleId] || 3.0;
    };

    const getBuildingCharacteristics = (styleId) => {
        const characteristics = {
            0: { spacing: '8-12m', density: 'Low-Medium', parking: 'Required' },
            1: { spacing: '6-10m', density: 'Medium-High', parking: 'Underground' },
            2: { spacing: '5-8m', density: 'High', parking: 'Minimal' },
            3: { spacing: '5-10m', density: 'Variable', parking: 'Mixed' }
        };
        return characteristics[styleId] || characteristics[0];
    };

    return (
        <div
            style={{
                position: 'static',
                display: 'grid',
                gridTemplateColumns: '1fr',
                width: '100%',
                height: 'auto',
                border: 'none',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '10px'
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '15px' }}>
                <h4 style={{ 
                    margin: '0 0 10px 0',
                    color: currentStyle.color,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Building Style</span>
                    <span style={{ 
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: currentStyle.color,
                        color: 'white',
                        borderRadius: '12px'
                    }}>
                        {currentStyle.name}
                    </span>
                </h4>
                
                {/* Slider for compatible mode */}
                <input
                    type="range"
                    min="0"
                    max={Math.max(...availableStyles.map(s => s.id))}
                    step="1"
                    value={value.toString()}
                    onChange={handleChange}
                    onMouseUp={handleMouseUp}
                    style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right, ${availableStyles.map(s => s.color).join(', ')})`,
                        outline: 'none',
                        appearance: 'none',
                        marginBottom: '10px'
                    }}
                />
            </div>

            {/* Style Selection Buttons */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: availableStyles.length > 2 ? '1fr 1fr' : '1fr',
                gap: '8px',
                marginBottom: '15px'
            }}>
                {availableStyles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => handleStyleSelect(style.id)}
                        style={{
                            padding: '8px',
                            fontSize: '11px',
                            backgroundColor: value === style.id ? style.color : 'white',
                            color: value === style.id ? 'white' : style.color,
                            border: `2px solid ${style.color}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontWeight: value === style.id ? 'bold' : 'normal',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ fontWeight: 'bold' }}>{style.name}</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>
                            {getFloorHeight(style.id)}m floors
                        </div>
                    </button>
                ))}
            </div>

            {/* Current Style Details */}
            <div style={{ 
                fontSize: '12px', 
                color: '#333',
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '10px',
                border: `2px solid ${currentStyle.color}`
            }}>
                <div style={{ fontWeight: 'bold', color: currentStyle.color, marginBottom: '6px' }}>
                    {currentStyle.name} Characteristics:
                </div>
                
                <div style={{ fontSize: '11px', color: '#666' }}>
                    <div>{currentStyle.description}</div>
                </div>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px',
                    marginTop: '8px',
                    fontSize: '10px'
                }}>
                    <div>
                        <strong>Floor Height:</strong><br />
                        {getFloorHeight(value)}m
                    </div>
                    <div>
                        <strong>Typical Spacing:</strong><br />
                        {getBuildingCharacteristics(value).spacing}
                    </div>
                    <div>
                        <strong>Density:</strong><br />
                        {getBuildingCharacteristics(value).density}
                    </div>
                    <div>
                        <strong>Parking:</strong><br />
                        {getBuildingCharacteristics(value).parking}
                    </div>
                </div>
            </div>

            {/* Site Type Constraint Info */}
            {parameters && (
                <div style={{
                    fontSize: '11px',
                    color: '#666',
                    backgroundColor: '#e8f4fd',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #b3d9ff'
                }}>
                    <strong>Available for {['Residential', 'Commercial', 'Office', 'Mixed Use', 'Industrial'][parameters.site_type]} sites:</strong><br />
                    {availableStyles.map(s => s.name).join(', ')}
                </div>
            )}

            {/* Usage Tips */}
            <div style={{
                fontSize: '10px',
                color: '#888',
                backgroundColor: 'white',
                padding: '6px',
                borderRadius: '4px',
                marginTop: '8px'
            }}>
                <strong>💡 Tips:</strong><br />
                • Residential: Best for housing developments<br />
                • Office: Suitable for business districts<br />
                • Commercial: Ideal for shopping areas<br />
                • Mixed Use: Flexible for diverse developments
            </div>
        </div>
    );
}