// import React from 'react';
// import GeometryObjectControllers from '../../../../Base';
// import polylineController from '../../../../Polyline';

// interface ComponentProps {
//     polylineController: polylineController;
//     addCallback: (result: GeometryObjectControllers[]) => void;
//     removeCallback: (result: GeometryObjectControllers[]) => void;
// }

// export default function PlanStatistics({ polylineController }: ComponentProps): JSX.Element {
//     const statistics = polylineController.planStatistics;

//     if (!statistics) {
//         return (
//             <div style={{
//                 backgroundColor: 'white',
//                 padding: '12px',
//                 borderRadius: '8px',
//                 marginBottom: '8px',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//             }}>
//                 <h4 style={{ 
//                     margin: '0 0 8px 0',
//                     color: '#333',
//                     fontSize: '14px',
//                     fontWeight: '600'
//                 }}>
//                     📊 Planning Statistics
//                 </h4>
//                 <div style={{
//                     fontSize: '12px',
//                     color: '#999',
//                     fontStyle: 'italic',
//                     textAlign: 'center',
//                     padding: '20px'
//                 }}>
//                     Generate a plan to see detailed statistics
//                 </div>
//             </div>
//         );
//     }

//     const getBuildingTypeIcon = (type: string): string => {
//         const iconMap: { [key: string]: string } = {
//             'residential_apartment': '🏢',
//             'residential_house': '🏠',
//             'commercial_office': '🏢',
//             'commercial_retail': '🏪',
//             'commercial_mixed': '🏬',
//             'industrial_light': '🏭',
//             'industrial_heavy': '🏗️'
//         };
//         return iconMap[type] || '🏢';
//     };

//     const getParkTypeIcon = (type: string): string => {
//         const iconMap: { [key: string]: string } = {
//             'park_small': '🌳',
//             'park_football': '⚽',
//             'park_cricket': '🏏',
//             'park_basketball': '🏀'
//         };
//         return iconMap[type] || '🌳';
//     };

//     const formatBuildingTypeName = (type: string): string => {
//         const nameMap: { [key: string]: string } = {
//             'residential_apartment': 'Apartments',
//             'residential_house': 'Houses',
//             'commercial_office': 'Offices',
//             'commercial_retail': 'Retail',
//             'commercial_mixed': 'Mixed Use',
//             'industrial_light': 'Light Industry',
//             'industrial_heavy': 'Heavy Industry'
//         };
//         return nameMap[type] || type;
//     };

//     const formatParkTypeName = (type: string): string => {
//         const nameMap: { [key: string]: string } = {
//             'park_small': 'Small Parks',
//             'park_football': 'Football Fields',
//             'park_cricket': 'Cricket Grounds',
//             'park_basketball': 'Basketball Courts'
//         };
//         return nameMap[type] || type;
//     };

//     return (
//         <div style={{
//             backgroundColor: 'white',
//             padding: '12px',
//             borderRadius: '8px',
//             marginBottom: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//         }}>
//             <h4 style={{ 
//                 margin: '0 0 12px 0',
//                 color: '#333',
//                 fontSize: '14px',
//                 fontWeight: '600'
//             }}>
//                 📊 Planning Statistics
//             </h4>

//             {/* Summary Stats */}
//             <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr 1fr',
//                 gap: '8px',
//                 marginBottom: '16px'
//             }}>
//                 <div style={{
//                     backgroundColor: '#f8f9fa',
//                     padding: '8px',
//                     borderRadius: '4px',
//                     textAlign: 'center'
//                 }}>
//                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196F3' }}>
//                         {statistics.total_buildings}
//                     </div>
//                     <div style={{ fontSize: '10px', color: '#666' }}>Buildings</div>
//                 </div>
//                 <div style={{
//                     backgroundColor: '#f8f9fa',
//                     padding: '8px',
//                     borderRadius: '4px',
//                     textAlign: 'center'
//                 }}>
//                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
//                         {statistics.total_parks}
//                     </div>
//                     <div style={{ fontSize: '10px', color: '#666' }}>Parks</div>
//                 </div>
//                 <div style={{
//                     backgroundColor: '#f8f9fa',
//                     padding: '8px',
//                     borderRadius: '4px',
//                     textAlign: 'center'
//                 }}>
//                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF9800' }}>
//                         {statistics.total_roads}
//                     </div>
//                     <div style={{ fontSize: '10px', color: '#666' }}>Roads</div>
//                 </div>
//             </div>

//             {/* Coverage Ratios */}
//             <div style={{ marginBottom: '16px' }}>
//                 <h5 style={{ 
//                     margin: '0 0 8px 0',
//                     fontSize: '12px',
//                     fontWeight: '600',
//                     color: '#555'
//                 }}>
//                     Coverage Analysis
//                 </h5>
//                 <div style={{ fontSize: '11px' }}>
//                     <div style={{ 
//                         display: 'flex', 
//                         justifyContent: 'space-between',
//                         marginBottom: '4px'
//                     }}>
//                         <span>Building Coverage:</span>
//                         <span style={{ fontWeight: 'bold', color: '#2196F3' }}>
//                             {(statistics.coverage_ratios.building_coverage * 100).toFixed(1)}%
//                         </span>
//                     </div>
//                     <div style={{ 
//                         display: 'flex', 
//                         justifyContent: 'space-between',
//                         marginBottom: '4px'
//                     }}>
//                         <span>Park Coverage:</span>
//                         <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>
//                             {(statistics.coverage_ratios.park_coverage * 100).toFixed(1)}%
//                         </span>
//                     </div>
//                     <div style={{ 
//                         display: 'flex', 
//                         justifyContent: 'space-between'
//                     }}>
//                         <span>Open Space Ratio:</span>
//                         <span style={{ fontWeight: 'bold', color: '#8BC34A' }}>
//                             {(statistics.coverage_ratios.open_space_ratio * 100).toFixed(1)}%
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* Building Types Breakdown */}
//             {Object.keys(statistics.building_types).length > 0 && (
//                 <div style={{ marginBottom: '16px' }}>
//                     <h5 style={{ 
//                         margin: '0 0 8px 0',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#555'
//                     }}>
//                         Building Types
//                     </h5>
//                     <div style={{ fontSize: '11px' }}>
//                         {Object.entries(statistics.building_types).map(([type, count]) => (
//                             <div key={type} style={{ 
//                                 display: 'flex', 
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                                 marginBottom: '4px'
//                             }}>
//                                 <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//                                     <span style={{ fontSize: '12px' }}>
//                                         {getBuildingTypeIcon(type)}
//                                     </span>
//                                     {formatBuildingTypeName(type)}
//                                 </span>
//                                 <span style={{ fontWeight: 'bold' }}>{count}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Park Types Breakdown */}
//             {Object.keys(statistics.park_types).length > 0 && (
//                 <div style={{ marginBottom: '16px' }}>
//                     <h5 style={{ 
//                         margin: '0 0 8px 0',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#555'
//                     }}>
//                         Recreation Facilities
//                     </h5>
//                     <div style={{ fontSize: '11px' }}>
//                         {Object.entries(statistics.park_types).map(([type, count]) => (
//                             <div key={type} style={{ 
//                                 display: 'flex', 
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                                 marginBottom: '4px'
//                             }}>
//                                 <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//                                     <span style={{ fontSize: '12px' }}>
//                                         {getParkTypeIcon(type)}
//                                     </span>
//                                     {formatParkTypeName(type)}
//                                 </span>
//                                 <span style={{ fontWeight: 'bold' }}>{count}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Planning Quality Indicators */}
//             <div style={{
//                 backgroundColor: '#f8f9fa',
//                 padding: '8px',
//                 borderRadius: '4px',
//                 fontSize: '11px'
//             }}>
//                 <h5 style={{ 
//                     margin: '0 0 6px 0',
//                     fontSize: '12px',
//                     fontWeight: '600',
//                     color: '#555'
//                 }}>
//                     Planning Quality
//                 </h5>
                
//                 {/* Green space indicator */}
//                 <div style={{ 
//                     display: 'flex', 
//                     justifyContent: 'space-between',
//                     marginBottom: '4px'
//                 }}>
//                     <span>Green Space Quality:</span>
//                     <span style={{ 
//                         fontWeight: 'bold',
//                         color: statistics.coverage_ratios.park_coverage >= 0.15 ? '#4CAF50' : 
//                               statistics.coverage_ratios.park_coverage >= 0.10 ? '#FF9800' : '#F44336'
//                     }}>
//                         {statistics.coverage_ratios.park_coverage >= 0.15 ? '🟢 Excellent' : 
//                          statistics.coverage_ratios.park_coverage >= 0.10 ? '🟡 Good' : '🔴 Needs Improvement'}
//                     </span>
//                 </div>

//                 {/* Building density indicator */}
//                 <div style={{ 
//                     display: 'flex', 
//                     justifyContent: 'space-between'
//                 }}>
//                     <span>Building Density:</span>
//                     <span style={{ 
//                         fontWeight: 'bold',
//                         color: statistics.coverage_ratios.building_coverage <= 0.4 ? '#4CAF50' : 
//                               statistics.coverage_ratios.building_coverage <= 0.6 ? '#FF9800' : '#F44336'
//                     }}>
//                         {statistics.coverage_ratios.building_coverage <= 0.4 ? '🟢 Optimal' : 
//                          statistics.coverage_ratios.building_coverage <= 0.6 ? '🟡 Moderate' : '🔴 High'}
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }