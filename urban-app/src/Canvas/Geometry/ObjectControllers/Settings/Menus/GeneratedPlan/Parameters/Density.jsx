import React, { useState, useEffect } from 'react';
import GeometryService from '../../../../../../Services/GeometryService';

export default function Density({ polylineController, addCallback, removeCallback }) {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [value, setValue] = useState(parameters ? parameters.density : 0.5);
    const [changed, setChanged] = useState(false);
    const [geometryInfo, setGeometryInfo] = useState(null);
    const [validationInfo, setValidationInfo] = useState(null);
    const [estimatedBuildings, setEstimatedBuildings] = useState(0);
    const [geometryQuality, setGeometryQuality] = useState(0);
    const [backendConnected, setBackendConnected] = useState(true);

    useEffect(() => {
        // Get geometry information when component mounts
        const info = polylineController.geometryInfo;
        const validation = polylineController.validationInfo;
        
        setGeometryInfo(info);
        setValidationInfo(validation);
        
        if (validation) {
            const quality = GeometryService.getGeometryQualityScore(validation);
            setGeometryQuality(quality);
        }
        
        if (info && info.area) {
            calculateEstimatedBuildings(info.area, value);
        }

        // Test backend connectivity
        testBackendConnection();
    }, [value, polylineController]);

    const testBackendConnection = async () => {
        try {
            const connectionStatus = await GeometryService.testConnection();
            setBackendConnected(connectionStatus.connected);
        } catch (error) {
            setBackendConnected(false);
        }
    };

    const calculateEstimatedBuildings = (area, density) => {
        // Enhanced building estimation based on site type and parameters
        const buildingParams = parameters?.getBuildingParameters() || {
            base_width: 20,
            base_depth: 15,
            min_spacing: 5
        };

        const buildingFootprint = buildingParams.base_width * buildingParams.base_depth;
        const totalBuildingSpace = buildingFootprint + (buildingParams.min_spacing * buildingParams.min_spacing);
        const maxBuildings = Math.floor(area / totalBuildingSpace);
        const estimated = Math.max(1, Math.floor(maxBuildings * density));
        
        setEstimatedBuildings(Math.min(estimated, 20)); // Cap at reasonable number
    };

    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        setValue(newValue);
        
        if (parameters) {
            parameters.setDensity(newValue);
        }

        // Update estimated buildings
        if (geometryInfo && geometryInfo.area) {
            calculateEstimatedBuildings(geometryInfo.area, newValue);
        }

        setChanged(true);
    };

    const handleMouseUp = async () => {
        if (parameters && changed && value != null) {
            parameters.density = value;
            
            // Refresh geometry analysis if validation is enabled
            if (parameters.validate_geometry) {
                await polylineController.refreshGeometryAnalysis();
                const updatedValidation = polylineController.validationInfo;
                setValidationInfo(updatedValidation);
                
                if (updatedValidation) {
                    const quality = GeometryService.getGeometryQualityScore(updatedValidation);
                    setGeometryQuality(quality);
                }
            }
            
            polylineController.generatePlan(addCallback, removeCallback);
        }

        setChanged(false);
    };

    const getDensityDescription = (density) => {
        if (density < 0.2) return "Very Low";
        if (density < 0.4) return "Low";
        if (density < 0.6) return "Medium";
        if (density < 0.8) return "High";
        return "Very High";
    };

    const getDensityColor = (density) => {
        if (density < 0.2) return "#4CAF50"; // Green
        if (density < 0.4) return "#8BC34A"; // Light Green
        if (density < 0.6) return "#FFC107"; // Amber
        if (density < 0.8) return "#FF9800"; // Orange
        return "#F44336"; // Red
    };

    const getQualityColor = (quality) => {
        if (quality >= 90) return "#4CAF50"; // Green
        if (quality >= 75) return "#8BC34A"; // Light Green
        if (quality >= 60) return "#FFC107"; // Amber
        if (quality >= 40) return "#FF9800"; // Orange
        return "#F44336"; // Red
    };

    const formatArea = (area) => {
        return GeometryService.formatArea(area);
    };

    const formatDistance = (distance) => {
        return GeometryService.formatDistance(distance);
    };

    const refreshGeometry = async () => {
        try {
            await polylineController.refreshGeometryAnalysis();
            const updatedInfo = polylineController.geometryInfo;
            const updatedValidation = polylineController.validationInfo;
            
            setGeometryInfo(updatedInfo);
            setValidationInfo(updatedValidation);
            
            if (updatedValidation) {
                const quality = GeometryService.getGeometryQualityScore(updatedValidation);
                setGeometryQuality(quality);
            }
            
            if (updatedInfo && updatedInfo.area) {
                calculateEstimatedBuildings(updatedInfo.area, value);
            }
        } catch (error) {
            console.error('Failed to refresh geometry:', error);
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
            {/* Backend Connection Status */}
            {!backendConnected && (
                <div style={{
                    fontSize: '11px',
                    color: '#F44336',
                    backgroundColor: '#ffebee',
                    padding: '6px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    border: '1px solid #ffcdd2',
                    textAlign: 'center'
                }}>
                    ⚠️ Backend disconnected - geometry features unavailable
                </div>
            )}

            {/* Density Control */}
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

            {/* Geometry Quality Indicator */}
            {validationInfo && backendConnected && (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#333',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <strong>Geometry Quality:</strong><br />
                        <span style={{ color: getQualityColor(geometryQuality) }}>
                            {geometryQuality}% - {GeometryService.getGeometryStatusDescription(validationInfo)}
                        </span>
                    </div>
                    <button
                        onClick={refreshGeometry}
                        style={{
                            fontSize: '10px',
                            padding: '4px 8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Refresh
                    </button>
                </div>
            )}

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
                            {formatDistance(geometryInfo.perimeter || 0)}
                        </div>
                    </div>
                    {geometryInfo.centroid && (
                        <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
                            <strong>Centroid:</strong> ({geometryInfo.centroid.x?.toFixed(1)}, {geometryInfo.centroid.y?.toFixed(1)})
                        </div>
                    )}
                </div>
            )}

            {/* Building Estimates */}
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
                        <strong>Est. Buildings:</strong><br />
                        <span style={{ color: getDensityColor(value), fontWeight: 'bold' }}>
                            {estimatedBuildings}
                        </span>
                    </div>
                    <div>
                        <strong>Building Size:</strong><br />
                        {parameters ? 
                            `${parameters.getBuildingParameters().base_width.toFixed(0)}×${parameters.getBuildingParameters().base_depth.toFixed(0)}m` 
                            : '20×15m'
                        }
                    </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                    <div>
                        <strong>Min. Spacing:</strong> {parameters ? parameters.min_building_spacing.toFixed(1) : '5.0'} m
                    </div>
                </div>
            </div>

            {/* Validation Warnings and Errors */}
            {validationInfo && backendConnected && (
                <>
                    {validationInfo.errors && validationInfo.errors.length > 0 && (
                        <div style={{
                            fontSize: '11px',
                            color: '#F44336',
                            backgroundColor: '#ffebee',
                            padding: '6px',
                            borderRadius: '4px',
                            marginTop: '8px',
                            border: '1px solid #ffcdd2'
                        }}>
                            <strong>❌ Errors:</strong><br />
                            {validationInfo.errors.map((error, index) => (
                                <div key={index}>• {error}</div>
                            ))}
                        </div>
                    )}

                    {validationInfo.warnings && validationInfo.warnings.length > 0 && (
                        <div style={{
                            fontSize: '11px',
                            color: '#FF9800',
                            backgroundColor: '#fff3e0',
                            padding: '6px',
                            borderRadius: '4px',
                            marginTop: '8px',
                            border: '1px solid #ffcc02'
                        }}>
                            <strong>⚠️ Warnings:</strong><br />
                            {validationInfo.warnings.map((warning, index) => (
                                <div key={index}>• {warning}</div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Density-specific Warnings */}
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

            {value < 0.2 && geometryInfo && geometryInfo.area > 10000 && (
                <div style={{
                    fontSize: '11px',
                    color: '#2196F3',
                    backgroundColor: '#e3f2fd',
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    border: '1px solid #90caf9'
                }}>
                    ℹ️ Low density on large site - consider increasing for better land use
                </div>
            )}
        </div>
    );
}