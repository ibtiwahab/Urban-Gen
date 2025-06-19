import React, { useState, useEffect } from 'react';
import GeometryObjectControllers from '../../../../Base';
import polylineController from '../../../../Polyline';

interface ComponentProps {
    polylineController: polylineController;
    addCallback: (result: GeometryObjectControllers[]) => void;
    removeCallback: (result: GeometryObjectControllers[]) => void;
}

export default function Density({ polylineController, addCallback, removeCallback }: ComponentProps): JSX.Element {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.density : 0.5);
    const [changed, setChanged] = useState(false);
    const [geometryInfo, setGeometryInfo] = useState<any>(null);
    const [estimatedBuildings, setEstimatedBuildings] = useState(0);

    useEffect(() => {
        // Get geometry information when component mounts
        const info = polylineController.geometryInfo;
        setGeometryInfo(info);
        
        if (info && info.area) {
            // Estimate number of buildings based on density and area
            const buildingFootprint = 300; // Base building area
            const maxBuildings = Math.floor(info.area / (buildingFootprint * 2));
            const estimated = Math.max(1, Math.floor(maxBuildings * value));
            setEstimatedBuildings(estimated);
        }
    }, [value, polylineController]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.target.value);
        setValue(newValue);
        
        if (parameters) {
            parameters.setDensity(newValue);
        }

        // Update estimated buildings
        if (geometryInfo && geometryInfo.area) {
            const buildingFootprint = 300;
            const maxBuildings = Math.floor(geometryInfo.area / (buildingFootprint * 2));
            const estimated = Math.max(1, Math.floor(maxBuildings * newValue));
            setEstimatedBuildings(estimated);
        }

        setChanged(true);
    };

    const handleMouseUp = () => {
        if (parameters && changed && value != null) {
            parameters.density = value;
            polylineController.generatePlan(addCallback, removeCallback);
        }

        setChanged(false);
    };

    const getDensityDescription = (density: number): string => {
        if (density < 0.2) return "Very Low";
        if (density < 0.4) return "Low";
        if (density < 0.6) return "Medium";
        if (density < 0.8) return "High";
        return "Very High";
    };

    const getDensityColor = (density: number): string => {
        if (density < 0.2) return "#4CAF50"; // Green
        if (density < 0.4) return "#8BC34A"; // Light Green
        if (density < 0.6) return "#FFC107"; // Amber
        if (density < 0.8) return "#FF9800"; // Orange
        return "#F44336"; // Red
    };

    const formatArea = (area: number): string => {
        if (area > 10000) {
            return `${(area / 10000).toFixed(1)} ha`;
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
            <div style={{ marginBottom: '15px' }}>
                <h4 style={{ 
                    margin: '0 0 10px 0',
                    color: getDensityColor(value),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Density: {(value * 100).toFixed(0)}%</span>
                    <span style={{ 
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: getDensityColor(value),
                        color: 'white',
                        borderRadius: '12px'
                    }}>
                        {getDensityDescription(value)}
                    </span>
                </h4>
                
                <input
                    type="range"
                    min="0.1"
                    max="0.99"
                    step="0.01"
                    value={value.toString()}
                    onChange={handleChange}
                    onMouseUp={handleMouseUp}
                    style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right, #4CAF50 0%, #FFC107 50%, #F44336 100%)`,
                        outline: 'none',
                        appearance: 'none'
                    }}
                />
            </div>

            {/* Geometry Information */}
            {geometryInfo && (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
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
                            <strong>Perimeter:</strong><br />
                            {(geometryInfo.perimeter || 0).toFixed(0)} m
                        </div>
                    </div>
                </div>
            )}

            {/* Building Estimates */}
            <div style={{ 
                fontSize: '12px', 
                color: '#333',
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '4px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <strong>Est. Buildings:</strong><br />
                        <span style={{ color: getDensityColor(value), fontWeight: 'bold' }}>
                            {estimatedBuildings}
                        </span>
                    </div>
                    <div>
                        <strong>Spacing:</strong><br />
                        {parameters ? parameters.min_building_spacing.toFixed(1) : '5.0'} m
                    </div>
                </div>
            </div>

            {/* Warnings */}
            {value > 0.8 && (
                <div style={{
                    fontSize: '11px',
                    color: '#F44336',
                    backgroundColor: '#ffebee',
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #ffcdd2'
                }}>
                    ⚠️ Very high density may result in overlapping buildings
                </div>
            )}

            {geometryInfo && !geometryInfo.is_closed && (
                <div style={{
                    fontSize: '11px',
                    color: '#FF9800',
                    backgroundColor: '#fff3e0',
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #ffcc02'
                }}>
                    ⚠️ Polygon is not closed - results may be unexpected
                </div>
            )}

            {geometryInfo && geometryInfo.self_intersects && (
                <div style={{
                    fontSize: '11px',
                    color: '#F44336',
                    backgroundColor: '#ffebee',
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #ffcdd2'
                }}>
                    ❌ Polygon self-intersects - please fix geometry first
                </div>
            )}
        </div>
    );
}