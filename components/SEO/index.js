/**
 * SEO Components Export
 * Centralized export for all SEO-related components
 */

// E-E-A-T Components
import AuthorBioComponent from './AuthorBio';
import TrustSignalsComponent from './TrustSignals';
import TestimonialsComponent from './Testimonials';

// Featured Snippet Components
import {
    DirectAnswer as DirectAnswerComponent,
    ListSnippet as ListSnippetComponent,
    TableSnippet as TableSnippetComponent,
    DefinitionSnippet as DefinitionSnippetComponent
} from './FeaturedSnippet';

// Re-export all
export const AuthorBio = AuthorBioComponent;
export const TrustSignals = TrustSignalsComponent;
export const Testimonials = TestimonialsComponent;
export const DirectAnswer = DirectAnswerComponent;
export const ListSnippet = ListSnippetComponent;
export const TableSnippet = TableSnippetComponent;
export const DefinitionSnippet = DefinitionSnippetComponent;

