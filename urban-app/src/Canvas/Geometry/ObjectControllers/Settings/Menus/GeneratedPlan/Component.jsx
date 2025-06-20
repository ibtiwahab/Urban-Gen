import React, { useState, useEffect } from 'react';
import SiteType from './Parameters/SiteType/Component';
import Density from './Parameters/Density';
import FAR from './Parameters/FAR';
import MixRatio from './Parameters/MixRatio';
import Orientation from './Parameters/Orientation';
import GeometryValidation from '../../../GeneratedPlan/GeometryValidation';
import GeometryService from '../../../../../Services/GeometryService';

export default function Component({ polylineController, addCallback, removeCallback }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [backendStatus, setBackendStatus] = useState(null);
    const [geometryInfo, setGeometryInfo] = useState(null);

    useEffect(() => {
        // Test backend connection on component mount
        testBackendConnection();
        
        // Get geometry info
        const info = polylineController.geometryInfo;
        setGeometryInfo(info);
    }, [polylineController]);

    const testBackendConnection = async () => {
        try {
            const status = await GeometryService.testConnection();
            setBackendStatus(status);
            console.log('Backend status:', status);
        } catch (error) {
            setBackendStatus({ connected: false, error: error.message });
        }
    };

    const refreshGeometry = async () => {
        try {
            await polylineController.refreshGeometryAnalysis();
            const updatedInfo = polylineController.geometryInfo;
            setGeometryInfo(updatedInfo);
        } catch (error) {
            console.error('Failed to refresh geometry:', error);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic', icon: '🏗️' },
        { id: 'geometry', label: 'Geometry', icon: '📐' },
        { id: 'advanced', label: 'Advanced', icon: '⚙️' }
    ];

    const getTabStyle = (tabId) => ({
        padding: '8px 12px',
        backgroundColor: activeTab === tabId ? '#007bff' : 'transparent',
        color: activeTab === tabId ? 'white' : '#007bff',
        border: '1px solid #007bff',
        borderRadius: '4px 4px 0 0',
        cursor: 'pointer',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    });

    return (
        <div
            style={{
                position: 'static',
                display: 'grid',
                gridTemplateColumns: '1fr',
                width: '100%',
                height: 'auto',
                border: 'none',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        >
            {/* Backend Status Banner */}
            {backendStatus && (
                <div style={{
                    padding: '8px',
                    backgroundColor: backendStatus.connected ? '#d4edda' : '#f8d7da',
                    color: backendStatus.connected ? '#155724' : '#721c24',
                    fontSize: '11px',
                    textAlign: 'center',
                    borderBottom: '1px solid #dee2e6'
                }}>
                    {backendStatus.connected ? (
                        <span>
                            ✅ {backendStatus.engine} v{backendStatus.version} - {backendStatus.capabilities?.length || 0} features
                        </span>
                    ) : (
                        <span>
                            ❌ Backend disconnected: {backendStatus.error}
                        </span>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                backgroundColor: '#e9ecef',
                borderBottom: '1px solid #dee2e6'
            }}>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        style={getTabStyle(tab.id)}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </div>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '10px' }}>
                {activeTab === 'basic' && (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <SiteType 
                            polylineController={polylineController} 
                            addCallback={addCallback} 
                            removeCallback={removeCallback} 
                        />
                        <Density 
                            polylineController={polylineController} 
                            addCallback={addCallback} 
                            removeCallback={removeCallback} 
                        />
                        <FAR 
                            polylineController={polylineController} 
                            addCallback={addCallback} 
                            removeCallback={removeCallback} 
                        />
                        <MixRatio 
                            polylineController={polylineController} 
                            addCallback={addCallback} 
                            removeCallback={removeCallback} 
                        />
                    </div>
                )}

                {activeTab === 'geometry' && backendStatus?.connected && (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <GeometryValidation 
                            polylineController={polylineController} 
                            addCallback={addCallback} 
                            removeCallback={removeCallback} 
                        />
                        
                        {/* Quick Geometry Info */}
                        {geometryInfo && (
                            <div style={{
                                backgroundColor: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '11px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <strong>Quick Geometry Info</strong>
                                    <button
                                        onClick={refreshGeometry}
                                        style={{
                                            fontSize: '9px',
                                            padding: '2px 6px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Refresh
                                    </button>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <div>Area: {GeometryService.formatArea(geometryInfo.area || 0)}</div>
                                    <div>Perimeter: {GeometryService.formatDistance(geometryInfo.perimeter || 0)}</div>
                                    <div>Closed: {geometryInfo.is_closed ? '✓' : '✗'}</div>
                                    <div>Valid: {geometryInfo.is_valid ? '✓' : '✗'}</div>
                                </div>
                                
                                {geometryInfo.centroid && (
                                    <div style={{ marginTop: '6px', fontSize: '10px', color: '#666' }}>
                                        Centroid: ({geometryInfo.centroid.x?.toFixed(1)}, {geometryInfo.centroid.y?.toFixed(1)})
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'geometry' && !backendStatus?.connected && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '15px',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', marginBottom: '8px' }}>⚠️ Geometry Features Unavailable</div>
                        <div style={{ fontSize: '11px' }}>
                            The Django backend is not connected. Geometry validation, offsetting, and advanced analysis features are disabled.
                        </div>
                        <button
                            onClick={testBackendConnection}
                            style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                padding: '4px 8px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <Orientation 
                            polylineController={polylineController} 
                            addCallback={addCallback} 
                            removeCallback={removeCallback} 
                        />
                        
                        {/* Advanced Parameters */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '8px',
                            borderRadius: '4px'
                        }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Advanced Settings</h5>
                            
                            <div style={{ fontSize: '11px', display: 'grid', gap: '6px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input type="checkbox" defaultChecked />
                                    <span>Respect site constraints</span>
                                </label>
                                
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input type="checkbox" />
                                    <span>Use grid layout</span>
                                </label>
                                
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input type="checkbox" defaultChecked />
                                    <span>Adaptive orientation</span>
                                </label>
                                
                                <div style={{ marginTop: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px' }}>
                                        Min building spacing: 
                                    </label>
                                    <input 
                                        type="range" 
                                        min="3" 
                                        max="20" 
                                        defaultValue="5"
                                        style={{ width: '100%' }}
                                    />
                                    <div style={{ fontSize: '10px', color: '#666' }}>3m - 20m</div>
                                </div>
                                
                                <div style={{ marginTop: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px' }}>
                                        Setback distance: 
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="15" 
                                        defaultValue="3"
                                        style={{ width: '100%' }}
                                    />
                                    <div style={{ fontSize: '10px', color: '#666' }}>0m - 15m</div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Settings */}
                        {backendStatus?.connected && (
                            <div style={{
                                backgroundColor: 'white',
                                padding: '8px',
                                borderRadius: '4px'
                            }}>
                                <h5 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Performance</h5>
                                
                                <div style={{ fontSize: '11px', display: 'grid', gap: '6px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input type="checkbox" defaultChecked />
                                        <span>Auto-validate geometry</span>
                                    </label>
                                    
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input type="checkbox" />
                                        <span>Auto-fix intersections</span>
                                    </label>
                                    
                                    <div style={{ marginTop: '8px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px' }}>
                                            Geometry tolerance: 
                                        </label>
                                        <select style={{ width: '100%', fontSize: '10px' }}>
                                            <option value="1e-3">Coarse (1e-3)</option>
                                            <option value="1e-6" selected>Normal (1e-6)</option>
                                            <option value="1e-9">Fine (1e-9)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Debug Info */}
                        {backendStatus?.connected && (
                            <div style={{
                                backgroundColor: '#e9ecef',
                                padding: '6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#495057'
                            }}>
                                <strong>Debug Info:</strong><br />
                                Backend: {backendStatus.engine}<br />
                                Version: {backendStatus.version}<br />
                                Features: {backendStatus.capabilities?.join(', ') || 'None'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}