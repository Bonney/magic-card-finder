/**
 * Service for interacting with the Scryfall API
 * Documentation: https://scryfall.com/docs/api
 */

const API_BASE_URL = 'https://api.scryfall.com';

interface ScryfallError {
  details: string;
  status: number;
  code: string;
}

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
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json() as ScryfallError;
      console.error('Scryfall API error:', errorData);
      throw new Error(errorData.details || 'API request failed');
    }
    return response.json() as Promise<T>;
  }

  private static validateCardImageData(cardData: ScryfallCard): void {
    if (!cardData.image_uris && (!cardData.card_faces?.[0]?.image_uris)) {
      throw new Error('No image data available for this card');
    }
  }

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
      const cardData = await this.handleResponse<ScryfallCard>(response);
      
      console.log('Card data received:', cardData);
      this.validateCardImageData(cardData);
      
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
      const searchData = await this.handleResponse<SearchResponse>(response);
      
      console.log('Search results received:', searchData);
      return searchData;
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
      const cardData = await this.handleResponse<ScryfallCard>(response);
      
      console.log('Random card data received:', cardData);
      
      // Try again if no image data (some special cards don't have images)
      try {
        this.validateCardImageData(cardData);
      } catch {
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
      const cardData = await this.handleResponse<ScryfallCard>(response);
      
      console.log('Card data received:', cardData);
      this.validateCardImageData(cardData);
      
      return cardData;
    } catch (error) {
      console.error('Error fetching card:', error);
      throw error;
    }
  }
} 