import React, { useState, useEffect } from 'react';

export default function FAR({ polylineController, addCallback, removeCallback }) {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.far : 1.0);
    const [changed, setChanged] = useState(false);
    const [geometryInfo, setGeometryInfo] = useState(null);

    useEffect(() => {
        // Get geometry information when component mounts
        const info = polylineController.geometryInfo;
        setGeometryInfo(info);
        
        // Set initial value from parameters
        if (parameters) {
            setValue(parameters.far);
        }
    }, [polylineController, parameters]);

    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        setValue(newValue);
        
        if (parameters) {
            parameters.setFAR(newValue);
        }

        setChanged(true);
    };

    const handleMouseUp = async () => {
        if (parameters && changed && value != null) {
            parameters.far = value;
            
            console.log('FAR changed to:', value);
            console.log('All parameters:', {
                site_type: parameters.site_type,
                density: parameters.density,
                far: parameters.far,
                mix_ratio: parameters.mix_ratio,
                building_style: parameters.building_style,
                orientation: parameters.orientation
            });
            
            polylineController.generatePlan(addCallback, removeCallback);
        }

        setChanged(false);
    };

    const getFARDescription = (far) => {
        if (far < 0.5) return "Very Low";
        if (far < 1.0) return "Low";
        if (far < 2.0) return "Medium";
        if (far < 4.0) return "High";
        return "Very High";
    };

    const getFARColor = (far) => {
        if (far < 0.5) return "#4CAF50"; // Green
        if (far < 1.0) return "#8BC34A"; // Light Green
        if (far < 2.0) return "#FFC107"; // Amber
        if (far < 4.0) return "#FF9800"; // Orange
        return "#F44336"; // Red
    };

    const calculateTotalFloorArea = () => {
        if (!geometryInfo || !geometryInfo.area) return 0;
        return geometryInfo.area * value;
    };

    const estimateAverageFloors = () => {
        if (!parameters) return 0;
        const buildingParams = parameters.getBuildingParameters();
        const buildingFootprint = buildingParams.base_width * buildingParams.base_depth;
        
        if (buildingFootprint === 0) return 1;
        
        const totalFloorArea = calculateTotalFloorArea();
        const estimatedBuildings = Math.max(1, Math.floor(geometryInfo?.area / (buildingFootprint * 2) * parameters.density));
        
        return Math.max(1, Math.floor(totalFloorArea / (estimatedBuildings * buildingFootprint)));
    };

    const formatArea = (area) => {
        if (area >= 10000) {
            return `${(area / 10000).toFixed(2)} ha`;
        } else {
            return `${area.toFixed(0)} m²`;
        }
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
            {/* FAR Control */}
            <div style={{ marginBottom: '15px' }}>
                <h4 style={{ 
                    margin: '0 0 10px 0',
                    color: getFARColor(value),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>FAR: {value.toFixed(2)}</span>
                    <span style={{ 
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: getFARColor(value),
                        color: 'white',
                        borderRadius: '12px'
                    }}>
                        {getFARDescription(value)}
                    </span>
                </h4>
                
                <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={value.toString()}
                    onChange={handleChange}
                    onMouseUp={handleMouseUp}
                    style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right, #4CAF50 0%, #FFC107 40%, #FF9800 70%, #F44336 100%)`,
                        outline: 'none',
                        appearance: 'none'
                    }}
                />
                
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '10px', 
                    color: '#666',
                    marginTop: '4px'
                }}>
                    <span>0.1</span>
                    <span>1.0</span>
                    <span>2.0</span>
                    <span>5.0</span>
                </div>
            </div>

            {/* FAR Information */}
            {geometryInfo && (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#333',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <strong>Site Area:</strong><br />
                            {formatArea(geometryInfo.area || 0)}
                        </div>
                        <div>
                            <strong>Total Floor Area:</strong><br />
                            {formatArea(calculateTotalFloorArea())}
                        </div>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                        <div>
                            <strong>Est. Avg Floors:</strong> {estimateAverageFloors()} floors
                        </div>
                    </div>
                </div>
            )}

            {/* FAR Guidelines */}
            <div style={{ 
                fontSize: '11px', 
                color: '#666',
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '10px'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>FAR Guidelines:</div>
                <div>• 0.1-0.5: Low-rise suburban</div>
                <div>• 0.5-1.0: Medium density residential</div>
                <div>• 1.0-2.0: Mixed-use urban</div>
                <div>• 2.0-4.0: High density commercial</div>
                <div>• 4.0+: Dense urban core</div>
            </div>

            {/* Warnings */}
            {value > 4.0 && (
                <div style={{
                    fontSize: '11px',
                    color: '#F44336',
                    backgroundColor: '#ffebee',
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #ffcdd2'
                }}>
                    ⚠️ Very high FAR may result in very tall buildings
                </div>
            )}

            {value < 0.3 && geometryInfo && geometryInfo.area > 5000 && (
                <div style={{
                    fontSize: '11px',
                    color: '#2196F3',
                    backgroundColor: '#e3f2fd',
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #90caf9'
                }}>
                    ℹ️ Low FAR on large site - consider increasing for better space utilization
                </div>
            )}
        </div>
    );
}