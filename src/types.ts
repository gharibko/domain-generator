/**
 * Shared Type Definitions for Domain Name Generator
 */

export type DomainStyle = 'all' | 'modern' | 'brandable' | 'tech' | 'creative' | 'arabic-flavor' | 'short';

export interface GeneratorConfig {
  keywords: string;
  description: string;
  selectedTlds: string[];
  style: DomainStyle;
  maxLength: number;
}

export interface DomainSuggestion {
  name: string;          // Full domain, e.g., "techflow.net"
  sld: string;           // Second-level domain, e.g., "techflow"
  tld: string;           // Top-level domain, e.g., "net"
  conceptAr: string;     // Idea explanation in Arabic
  conceptEn: string;     // Idea explanation in English
  pronounceability: 'ممتاز' | 'جيد' | 'مقبول'; // Pronounceability rating in Arabic
  score: number;         // Out of 100
  style: string;         // E.g., brandable, modern, tech
  keywords: string[];    // Extracted target tags
  isAvailable?: boolean | null; // Simulated checks
}

export interface SavedDomain {
  domain: DomainSuggestion;
  savedAt: string;
}
