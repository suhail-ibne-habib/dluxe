'use strict';

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    
    try {
      // Only add if no packages are specified
      if (!data.Available_Packages || data.Available_Packages.length === 0) {
        const packages = await strapi.documents('api::package.package').findMany({
          fields: ['documentId', 'price'],
          status: 'published',
          filters: { isAvailable: true }
        });
        
        if (packages && packages.length > 0) {
          data.Available_Packages = packages.map(pkg => ({
            package: pkg.documentId,
            Updated_Price: Number(pkg.price) || 0
          }));
          
          console.log(`[LIFECYCLE] Added ${packages.length} packages to new airport`);
        }
      }
    } catch (error) {
      console.error('[ERROR] Failed to add packages:', error.message);
    }
  },
  
  // ✅ Only update if explicitly requested
  async beforeUpdate(event) {
    const { data, where } = event.params;
    
    // Check if Available_Packages is being updated
    if (data.Available_Packages !== undefined) {
      console.log('[INFO] Available_Packages being updated manually');
      // Don't override - let the manual update happen
      return;
    }
    
    // Optionally, you could add logic here to auto-add missing packages
    // But better to let admins manage manually
  }
};