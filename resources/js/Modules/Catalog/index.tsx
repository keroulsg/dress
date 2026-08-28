/**
 * Catalog module — public surface.
 */

export { CatalogBrowser } from './CatalogBrowser';
export type { CatalogBrowserProps } from './CatalogBrowser';

export { DressCard, dressConditionLabel, dressStatusTone } from './DressCard';
export type { DressCardDress, DressCardProps } from './DressCard';

export { DressFilterSidebar } from './DressFilterSidebar';
export type {
    DressFilterSidebarFacets,
    DressFilterSidebarFilters,
    DressFilterSidebarProps,
} from './DressFilterSidebar';

export { DressGrid } from './DressGrid';
export type { DressGridProps } from './DressGrid';

export { DressDetailsView } from './DressDetailsView';
export type { DressDetailsViewProps } from './DressDetailsView';

export { ImageGallery } from './ImageGallery';
export type { ImageGalleryImage, ImageGalleryProps } from './ImageGallery';

export { SizeGuideModal } from './SizeGuideModal';
export type { SizeGuideModalProps, SizeGuideSize } from './SizeGuideModal';
