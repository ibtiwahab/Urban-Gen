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

    updateDefaultsForSiteType() {
        switch (this.site_type) {
            case 0: // Residential
                this.density = 0.3;
                this.far = 0.8;
                this.building_style = 0;
                this.min_building_spacing = 8.0;
                this.setback_distance = 5.0;
                break;
            case 1: // Commercial
                this.density = 0.6;
                this.far = 2.0;
                this.building_style = 2;
                this.min_building_spacing = 5.0;
                this.setback_distance = 3.0;
                break;
            case 2: // Office
                this.density = 0.5;
                this.far = 3.0;
                this.building_style = 1;
                this.min_building_spacing = 6.0;
                this.setback_distance = 4.0;
                break;
            case 3: // Mixed Use
                this.density = 0.7;
                this.far = 2.5;
                this.building_style = 3;
                this.min_building_spacing = 5.0;
                this.setback_distance = 3.5;
                break;
            case 4: // Industrial
                this.density = 0.4;
                this.far = 1.2;
                this.building_style = 1;
                this.min_building_spacing = 15.0;
                this.setback_distance = 8.0;
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
            this.setback_distance >= 0
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
            min_polygon_area: this.min_polygon_area
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
}