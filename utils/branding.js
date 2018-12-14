function mapBranding(val) {
	switch (val) {
		case 'ACPaaS': return {cdn: 'acpaas_branding_scss', npm: ['@a-ui/core', '@a-ui/acpaas'], version: '3.0.3', type: 'acpaas' };
		case 'Digipolis': return {cdn: 'digipolis_branding_scss', npm: ['@a-ui/core', '@a-ui/digipolis'], version: '3.0.2', type: 'digipolis' };
		default: return {cdn: 'core_branding_scss', npm: ['@a-ui/core'], version: '3.0.3', type: 'core' };
	}
}

module.exports.mapBranding = mapBranding;
