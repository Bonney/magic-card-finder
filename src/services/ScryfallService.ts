/**
 * Service for interacting with the Scryfall API
 * Documentation: https://scryfall.com/docs/api
 */

const API_BASE_URL = 'https://api.scryfall.com';

export interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  oracle_text?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name?: string;
    type_line?: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
  }>;
  scryfall_uri: string;
  layout?: string;
  rarity?: string;
  set_name?: string;
  mana_cost?: string;
}

export interface SearchResponse {
  data: ScryfallCard[];
  total_cards: number;
  has_more: boolean;
  next_page?: string;
}

export class ScryfallService {
  /**
   * Search for a card by name (exact match)
   * @param query The search query
   * @returns Promise with the card data
   */
  static async searchCard(query: string): Promise<ScryfallCard> {
    try {
      console.log(`Searching for card: ${query}`);
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`${API_BASE_URL}/cards/named?fuzzy=${encodedQuery}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Scryfall API error:', errorData);
        throw new Error(errorData.details || 'Failed to fetch card data');
      }
      
      const cardData = await response.json();
      console.log('Card data received:', cardData);
      
      // Validate that we have image data
      if (!cardData.image_uris && (!cardData.card_faces || !cardData.card_faces[0].image_uris)) {
        throw new Error('No image data available for this card');
      }
      
      return cardData;
    } catch (error) {
      console.error('Error searching for card:', error);
      throw error;
    }
  }

  /**
   * Search for cards by name (returns multiple results)
   * @param query The search query
   * @param page The page number to fetch (default: 1)
   * @returns Promise with search results
   */
  static async searchCards(query: string, page = 1): Promise<SearchResponse> {
    try {
      console.log(`Searching for cards with query: ${query}, page: ${page}`);
      const encodedQuery = encodeURIComponent(`name:/${query}/`);
      const url = page === 1 
        ? `${API_BASE_URL}/cards/search?q=${encodedQuery}&order=name&dir=asc` 
        : `${API_BASE_URL}/cards/search?q=${encodedQuery}&order=name&dir=asc&page=${page}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Scryfall API error:', errorData);
        throw new Error(errorData.details || 'Failed to fetch search results');
      }
      
      const searchData = await response.json();
      console.log('Search results received:', searchData);
      
      return {
        data: searchData.data,
        total_cards: searchData.total_cards,
        has_more: searchData.has_more,
        next_page: searchData.next_page
      };
    } catch (error) {
      console.error('Error searching for cards:', error);
      throw error;
    }
  }

  /**
   * Get a random card
   * @returns Promise with random card data
   */
  static async getRandomCard(): Promise<ScryfallCard> {
    try {
      console.log('Fetching random card');
      const response = await fetch(`${API_BASE_URL}/cards/random`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Scryfall API error:', errorData);
        throw new Error(errorData.details || 'Failed to fetch random card');
      }
      
      const cardData = await response.json();
      console.log('Random card data received:', cardData);
      
      // Validate that we have image data
      if (!cardData.image_uris && (!cardData.card_faces || !cardData.card_faces[0].image_uris)) {
        // Try again if no image data (some special cards don't have images)
        console.log('No image data, trying again...');
        return this.getRandomCard();
      }
      
      return cardData;
    } catch (error) {
      console.error('Error getting random card:', error);
      throw error;
    }
  }

  /**
   * Get a specific card by ID
   * @param id The Scryfall card ID
   * @returns Promise with card data
   */
  static async getCard(id: string): Promise<ScryfallCard> {
    try {
      console.log(`Fetching card with ID: ${id}`);
      const response = await fetch(`${API_BASE_URL}/cards/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Scryfall API error:', errorData);
        throw new Error(errorData.details || 'Card not found');
      }
      
      const cardData = await response.json();
      console.log('Card data received:', cardData);
      
      // Validate that we have image data
      if (!cardData.image_uris && (!cardData.card_faces || !cardData.card_faces[0].image_uris)) {
        throw new Error('No image data available for this card');
      }
      
      return cardData;
    } catch (error) {
      console.error('Error fetching card:', error);
      throw error;
    }
  }
} 