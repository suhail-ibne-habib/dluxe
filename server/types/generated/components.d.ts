import type { Schema, Struct } from '@strapi/strapi';

export interface PricingPackagePriceOverride extends Struct.ComponentSchema {
  collectionName: 'components_pricing_package_price_overrides';
  info: {
    displayName: 'Package Price Override';
    icon: 'question';
  };
  attributes: {
    isEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    package: Schema.Attribute.Relation<'oneToOne', 'api::package.package'>;
    Updated_Price: Schema.Attribute.Decimal;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'pricing.package-price-override': PricingPackagePriceOverride;
    }
  }
}
