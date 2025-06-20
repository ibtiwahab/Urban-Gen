export default class Parameters {
    constructor() {
        this.site_type = 0;
        this.density = 0.5;
        this.far = 0.5;
        this.mix_ratio = 0.5;
        this.building_style = 0;
        this.orientation = 0.0;
        
        // Enhanced parameters for geometry-aware planning
        this.min_building_spacing = 5.0;
        this.setback_distance = 3.0;
        this.use_grid_layout = false;
        this.adaptive_orientation = true;
        this.respect_site_constraints = true;

        // Validation parameters
        this.validate_geometry = true;
        this.auto_fix_intersections = false;
        this.min_polygon_area = 100.0;

        // New geometry-specific parameters
        this.geometry_tolerance = 1e-6;
        this.check_self_intersection = true;
        this.check_closure = true;
        this.check_planarity = true;
        this.offset_type = 'inward';
        this.corner_style = 'sharp';

        // Set default values based on site type
        this.updateDefaultsForSiteType();
    }

    setSiteType(siteType) {
        this.site_type = Math.max(0, Math.min(4, siteType));
        this.updateDefaultsForSiteType();
    }

    setDensity(density) {
        this.density = Math.max(0, Math.min(0.99, density));
        this.updateDependentParameters();
    }

    setFAR(far) {
        this.far = Math.max(0, Math.min(10.0, far));
        this.updateDependentParameters();
    }

    setMixRatio(mixRatio) {
        this.mix_ratio = Math.max(0, Math.min(0.99, mixRatio));
    }

    setBuildingStyle(style) {
        this.building_style = Math.max(0, Math.min(3, style));
        this.updateDefaultsForBuildingStyle();
    }

    setOrientation(orientation) {
        // Normalize orientation to 0-180 range
        while (orientation < 0) orientation += 180;
        while (orientation >= 180) orientation -= 180;
        this.orientation = orientation;
    }

    // Enhanced geometry validation settings
    setGeometryValidation(validate) {
        this.validate_geometry = validate;
    }

    setAutoFixIntersections(autoFix) {
        this.auto_fix_intersections = autoFix;
    }

    setGeometryTolerance(tolerance) {
        this.geometry_tolerance = Math.max(1e-10, Math.min(1e-3, tolerance));
    }

    updateDefaultsForSiteType() {
        switch (this.site_type) {
            case 0: // Residential
                this.density = 0.3;
                this.far = 0.8;
                this.building_style = 0;
                this.min_building_spacing = 8.0;
                this.setback_distance = 5.0;
                this.geometry_tolerance = 1e-6;
                break;
            case 1: // Commercial
                this.density = 0.6;
                this.far = 2.0;
                this.building_style = 2;
                this.min_building_spacing = 5.0;
                this.setback_distance = 3.0;
                this.geometry_tolerance = 1e-6;
                break;
            case 2: // Office
                this.density = 0.5;
                this.far = 3.0;
                this.building_style = 1;
                this.min_building_spacing = 6.0;
                this.setback_distance = 4.0;
                this.geometry_tolerance = 5e-7;
                break;
            case 3: // Mixed Use
                this.density = 0.7;
                this.far = 2.5;
                this.building_style = 3;
                this.min_building_spacing = 5.0;
                this.setback_distance = 3.5;
                this.geometry_tolerance = 1e-6;
                break;
            case 4: // Industrial
                this.density = 0.4;
                this.far = 1.2;
                this.building_style = 1;
                this.min_building_spacing = 15.0;
                this.setback_distance = 8.0;
                this.geometry_tolerance = 1e-5;
                break;
        }
    }

    updateDefaultsForBuildingStyle() {
        switch (this.building_style) {
            case 0: // Residential
                this.min_building_spacing = Math.max(this.min_building_spacing, 8.0);
                break;
            case 1: // Office
                this.min_building_spacing = Math.max(this.min_building_spacing, 6.0);
                break;
            case 2: // Commercial
                this.min_building_spacing = Math.max(this.min_building_spacing, 5.0);
                break;
            case 3: // Mixed
                this.min_building_spacing = Math.max(this.min_building_spacing, 5.0);
                break;
        }
    }

    updateDependentParameters() {
        // Adjust spacing based on density
        if (this.density > 0.7) {
            this.min_building_spacing = Math.max(3.0, this.min_building_spacing * 0.8);
        } else if (this.density < 0.3) {
            this.min_building_spacing = this.min_building_spacing * 1.5;
        }

        // Adjust setback based on FAR
        if (this.far > 2.0) {
            this.setback_distance = Math.max(this.setback_distance, 4.0);
        }

        // Adjust tolerance based on site scale
        const siteScale = this.min_building_spacing * 10; // Approximate site scale
        if (siteScale > 1000) {
            this.geometry_tolerance = 1e-5;
        } else if (siteScale < 100) {
            this.geometry_tolerance = 1e-7;
        }
    }

    getLayoutStrategy() {
        if (this.density < 0.3) {
            return 'scattered';
        } else if (this.density > 0.7 || this.use_grid_layout) {
            return 'grid';
        } else {
            return 'organic';
        }
    }

    getBuildingParameters() {
        return {
            base_width: 15.0 + (this.density * 10.0),
            base_depth: 12.0 + (this.density * 8.0),
            floor_height: this.getFloorHeight(),
            min_spacing: this.min_building_spacing,
            setback: this.setback_distance
        };
    }

    getGeometryParameters() {
        return {
            tolerance: this.geometry_tolerance,
            validate_geometry: this.validate_geometry,
            check_self_intersection: this.check_self_intersection,
            check_closure: this.check_closure,
            check_planarity: this.check_planarity,
            auto_fix_intersections: this.auto_fix_intersections,
            min_polygon_area: this.min_polygon_area
        };
    }

    getFloorHeight() {
        const heights = {
            0: 3.0,   // Residential
            1: 3.5,   // Office
            2: 4.0,   // Commercial
            3: 3.2    // Mixed
        };
        return heights[this.building_style] || 3.0;
    }

    isValid() {
        return (
            this.site_type >= 0 && this.site_type <= 4 &&
            this.density >= 0 && this.density <= 0.99 &&
            this.far >= 0 && this.far <= 10.0 &&
            this.mix_ratio >= 0 && this.mix_ratio <= 0.99 &&
            this.building_style >= 0 && this.building_style <= 3 &&
            this.orientation >= 0 && this.orientation < 180 &&
            this.min_building_spacing > 0 &&
            this.setback_distance >= 0 &&
            this.geometry_tolerance > 0 &&
            this.min_polygon_area >= 0
        );
    }

    toJSON() {
        return {
            site_type: this.site_type,
            density: this.density,
            far: this.far,
            mix_ratio: this.mix_ratio,
            building_style: this.building_style,
            orientation: this.orientation,
            min_building_spacing: this.min_building_spacing,
            setback_distance: this.setback_distance,
            use_grid_layout: this.use_grid_layout,
            adaptive_orientation: this.adaptive_orientation,
            respect_site_constraints: this.respect_site_constraints,
            validate_geometry: this.validate_geometry,
            auto_fix_intersections: this.auto_fix_intersections,
            min_polygon_area: this.min_polygon_area,
            geometry_tolerance: this.geometry_tolerance,
            check_self_intersection: this.check_self_intersection,
            check_closure: this.check_closure,
            check_planarity: this.check_planarity,
            offset_type: this.offset_type,
            corner_style: this.corner_style
        };
    }

    fromJSON(data) {
        if (data.site_type !== undefined) this.setSiteType(data.site_type);
        if (data.density !== undefined) this.setDensity(data.density);
        if (data.far !== undefined) this.setFAR(data.far);
        if (data.mix_ratio !== undefined) this.setMixRatio(data.mix_ratio);
        if (data.building_style !== undefined) this.setBuildingStyle(data.building_style);
        if (data.orientation !== undefined) this.setOrientation(data.orientation);
        
        if (data.min_building_spacing !== undefined) {
            this.min_building_spacing = Math.max(0, data.min_building_spacing);
        }
        if (data.setback_distance !== undefined) {
            this.setback_distance = Math.max(0, data.setback_distance);
        }
        if (data.use_grid_layout !== undefined) {
            this.use_grid_layout = Boolean(data.use_grid_layout);
        }
        if (data.adaptive_orientation !== undefined) {
            this.adaptive_orientation = Boolean(data.adaptive_orientation);
        }
        if (data.respect_site_constraints !== undefined) {
            this.respect_site_constraints = Boolean(data.respect_site_constraints);
        }
        if (data.validate_geometry !== undefined) {
            this.validate_geometry = Boolean(data.validate_geometry);
        }
        if (data.auto_fix_intersections !== undefined) {
            this.auto_fix_intersections = Boolean(data.auto_fix_intersections);
        }
        if (data.min_polygon_area !== undefined) {
            this.min_polygon_area = Math.max(0, data.min_polygon_area);
        }
        if (data.geometry_tolerance !== undefined) {
            this.geometry_tolerance = Math.max(1e-10, Math.min(1e-3, data.geometry_tolerance));
        }
        if (data.check_self_intersection !== undefined) {
            this.check_self_intersection = Boolean(data.check_self_intersection);
        }
        if (data.check_closure !== undefined) {
            this.check_closure = Boolean(data.check_closure);
        }
        if (data.check_planarity !== undefined) {
            this.check_planarity = Boolean(data.check_planarity);
        }
        if (data.offset_type !== undefined) {
            this.offset_type = data.offset_type;
        }
        if (data.corner_style !== undefined) {
            this.corner_style = data.corner_style;
        }
    }

    clone() {
        const cloned = new Parameters();
        cloned.fromJSON(this.toJSON());
        return cloned;
    }

    getDescription() {
        const siteTypes = ['Residential', 'Commercial', 'Office', 'Mixed Use', 'Industrial'];
        const buildingStyles = ['Residential', 'Office', 'Commercial', 'Mixed'];
        
        return `${siteTypes[this.site_type]} site with ${buildingStyles[this.building_style]} buildings, ` +
               `${(this.density * 100).toFixed(0)}% density, FAR ${this.far.toFixed(1)}`;
    }

    getGeometryStatus() {
        const validationItems = [];
        if (this.validate_geometry) validationItems.push('Validation');
        if (this.check_self_intersection) validationItems.push('Self-intersection check');
        if (this.check_closure) validationItems.push('Closure check');
        if (this.check_planarity) validationItems.push('Planarity check');
        if (this.auto_fix_intersections) validationItems.push('Auto-fix');
        
        return validationItems.length > 0 ? validationItems.join(', ') : 'No validation';
    }
}