import React, { useState, useEffect } from 'react';
import GeometryService from '../../../Services/GeometryService';

export default function GeometryValidation({ polylineController, addCallback, removeCallback }) {
    const parameters = polylineController.generatedPlanController?.parameters;
    const [validationInfo, setValidationInfo] = useState(null);
    const [geometryInfo, setGeometryInfo] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [autoValidate, setAutoValidate] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Validation settings
    const [tolerance, setTolerance] = useState(1e-6);
    const [checkClosure, setCheckClosure] = useState(true);
    const [checkSelfIntersection, setCheckSelfIntersection] = useState(true);
    const [checkPlanarity, setCheckPlanarity] = useState(true);

    useEffect(() => {
        // Get current validation info
        const validation = polylineController.validationInfo;
        const geometry = polylineController.geometryInfo;
        
        setValidationInfo(validation);
        setGeometryInfo(geometry);

        // Set validation settings from parameters
        if (parameters) {
            const geomParams = parameters.getGeometryParameters();
            setTolerance(geomParams.tolerance);
            setCheckClosure(geomParams.check_closure);
            setCheckSelfIntersection(geomParams.check_self_intersection);
            setCheckPlanarity(geomParams.check_planarity);
            setAutoValidate(geomParams.validate_geometry);
        }
    }, [polylineController, parameters]);

    const runValidation = async () => {
        setIsValidating(true);
        
        try {
            const flattenedVertices = polylineController.getFlattenedVertices();
            
            if (flattenedVertices.length < 9) {
                setValidationInfo({
                    is_valid: false,
                    errors: ['Insufficient vertices for validation (minimum 3 points required)'],
                    warnings: [],
                    polygon_area: 0,
                    polygon_perimeter: 0,
                    is_closed: false,
                    is_planar: false,
                    self_intersects: false
                });
                setIsValidating(false);
                return;
            }

            // Run validation with current settings
            const result = await GeometryService.validateGeometry(flattenedVertices, {
                tolerance,
                check_closure: checkClosure,
                check_self_intersection: checkSelfIntersection,
                check_planarity: checkPlanarity
            });

            setValidationInfo(result);
            
            // Also get geometry analysis
            const geoResult = await GeometryService.analyzeGeometry(flattenedVertices, 'analyze');
            setGeometryInfo(geoResult);
            
            // Update polyline visual feedback
            polylineController.updateVisualFeedback(result);
            
        } catch (error) {
            console.error('Validation failed:', error);
            setValidationInfo({
                is_valid: false,
                errors: [error.message],
                warnings: [],
                polygon_area: 0,
                polygon_perimeter: 0,
                is_closed: false,
                is_planar: false,
                self_intersects: false
            });
        }
        
        setIsValidating(false);
    };

    const createOffset = async (distance, type = 'inward') => {
        try {
            const offsetLine = await polylineController.createOffset(distance, type);
            if (offsetLine && addCallback) {
                // Add offset line to scene
                addCallback([{ objects: [offsetLine], built: true }]);
            }
        } catch (error) {
            console.error('Failed to create offset:', error);
            alert(`Failed to create offset: ${error.message}`);
        }
    };

    const triangulatePolygon = async () => {
        try {
            const triangles = await polylineController.triangulate();
            if (triangles && triangles.length > 0 && addCallback) {
                // Add triangles to scene
                const triangleObjects = triangles.map(triangle => ({ objects: [triangle], built: true }));
                addCallback(triangleObjects);
            }
        } catch (error) {
            console.error('Failed to triangulate:', error);
            alert(`Failed to triangulate: ${error.message}`);
        }
    };

    const getQualityScore = () => {
        if (!validationInfo) return 0;
        return GeometryService.getGeometryQualityScore(validationInfo);
    };

    const getQualityColor = (score) => {
        if (score >= 90) return "#4CAF50"; // Green
        if (score >= 75) return "#8BC34A"; // Light Green
        if (score >= 60) return "#FFC107"; // Amber
        if (score >= 40) return "#FF9800"; // Orange
        return "#F44336"; // Red
    };

    const qualityScore = getQualityScore();

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
                    color: '#333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Geometry Validation</span>
                    {validationInfo && (
                        <span style={{ 
                            fontSize: '12px',
                            padding: '2px 8px',
                            backgroundColor: getQualityColor(qualityScore),
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            {qualityScore}%
                        </span>
                    )}
                </h4>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={runValidation}
                        disabled={isValidating}
                        style={{
                            fontSize: '12px',
                            padding: '6px 12px',
                            backgroundColor: isValidating ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isValidating ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isValidating ? 'Validating...' : 'Validate'}
                    </button>
                    
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                            type="checkbox"
                            checked={autoValidate}
                            onChange={(e) => setAutoValidate(e.target.checked)}
                        />
                        Auto-validate
                    </label>
                    
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            fontSize: '10px',
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            color: '#007bff',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {showAdvanced ? 'Hide' : 'Advanced'}
                    </button>
                </div>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '11px'
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        <label>Tolerance: </label>
                        <input
                            type="number"
                            value={tolerance}
                            onChange={(e) => setTolerance(parseFloat(e.target.value))}
                            step="1e-7"
                            min="1e-10"
                            max="1e-3"
                            style={{ width: '80px', fontSize: '10px' }}
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="checkbox"
                                checked={checkClosure}
                                onChange={(e) => setCheckClosure(e.target.checked)}
                            />
                            Check Closure
                        </label>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="checkbox"
                                checked={checkSelfIntersection}
                                onChange={(e) => setCheckSelfIntersection(e.target.checked)}
                            />
                            Self-Intersection
                        </label>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="checkbox"
                                checked={checkPlanarity}
                                onChange={(e) => setCheckPlanarity(e.target.checked)}
                            />
                            Check Planarity
                        </label>
                    </div>
                </div>
            )}

            {/* Validation Results */}
            {validationInfo && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                        <div>
                            <strong>Status:</strong><br />
                            <span style={{ color: validationInfo.is_valid ? '#4CAF50' : '#F44336' }}>
                                {validationInfo.is_valid ? '✓ Valid' : '✗ Invalid'}
                            </span>
                        </div>
                        <div>
                            <strong>Closed:</strong><br />
                            <span style={{ color: validationInfo.is_closed ? '#4CAF50' : '#FF9800' }}>
                                {validationInfo.is_closed ? '✓ Yes' : '⚠ No'}
                            </span>
                        </div>
                        <div>
                            <strong>Planar:</strong><br />
                            <span style={{ color: validationInfo.is_planar ? '#4CAF50' : '#FF9800' }}>
                                {validationInfo.is_planar ? '✓ Yes' : '⚠ No'}
                            </span>
                        </div>
                        <div>
                            <strong>Self-Intersects:</strong><br />
                            <span style={{ color: validationInfo.self_intersects ? '#F44336' : '#4CAF50' }}>
                                {validationInfo.self_intersects ? '✗ Yes' : '✓ No'}
                            </span>
                        </div>
                    </div>
                    
                    {geometryInfo && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                    <strong>Area:</strong> {GeometryService.formatArea(validationInfo.polygon_area || 0)}
                                </div>
                                <div>
                                    <strong>Perimeter:</strong> {GeometryService.formatDistance(validationInfo.polygon_perimeter || 0)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Errors */}
            {validationInfo && validationInfo.errors && validationInfo.errors.length > 0 && (
                <div style={{
                    fontSize: '11px',
                    color: '#F44336',
                    backgroundColor: '#ffebee',
                    padding: '6px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    border: '1px solid #ffcdd2'
                }}>
                    <strong>❌ Errors:</strong><br />
                    {validationInfo.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                    ))}
                </div>
            )}

            {/* Warnings */}
            {validationInfo && validationInfo.warnings && validationInfo.warnings.length > 0 && (
                <div style={{
                    fontSize: '11px',
                    color: '#FF9800',
                    backgroundColor: '#fff3e0',
                    padding: '6px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    border: '1px solid #ffcc02'
                }}>
                    <strong>⚠️ Warnings:</strong><br />
                    {validationInfo.warnings.map((warning, index) => (
                        <div key={index}>• {warning}</div>
                    ))}
                </div>
            )}

            {/* Geometry Operations */}
            {validationInfo && validationInfo.is_valid && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '8px'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Geometry Operations:
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <button
                            onClick={() => createOffset(5, 'inward')}
                            style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Offset In (5m)
                        </button>
                        
                        <button
                            onClick={() => createOffset(3, 'outward')}
                            style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                backgroundColor: '#6f42c1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Offset Out (3m)
                        </button>
                        
                        <button
                            onClick={triangulatePolygon}
                            style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Triangulate
                        </button>
                        
                        <button
                            onClick={() => polylineController.cleanupOffsetLines()}
                            style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear Offsets
                        </button>
                    </div>
                </div>
            )}

            {/* Quality Recommendations */}
            {validationInfo && qualityScore < 80 && (
                <div style={{
                    fontSize: '11px',
                    color: '#0066cc',
                    backgroundColor: '#e6f3ff',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #b3d9ff'
                }}>
                    <strong>💡 Recommendations:</strong><br />
                    {!validationInfo.is_closed && <div>• Close the polygon by connecting the endpoints</div>}
                    {validationInfo.self_intersects && <div>• Remove self-intersections by redrawing crossing segments</div>}
                    {!validationInfo.is_planar && <div>• Ensure all points lie in the same plane</div>}
                    {validationInfo.polygon_area < 100 && <div>• Consider increasing polygon size for better building placement</div>}
                </div>
            )}
        </div>
    );
}