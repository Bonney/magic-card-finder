# Magic Card Finder

> **Note: This project is an exercise in using the Cursor IDE**
> 
> This project was created as a demonstration of using Cursor IDE with its built-in AI capabilities. The vast majority of the code in this repository was generated directly by Cursor using its integrated AI models. This serves as an example of how AI-assisted development can be used to rapidly prototype and build web applications.

A modern web application for searching and exploring Magic: The Gathering cards using the Scryfall API.

![Magic Card Finder](https://raw.githubusercontent.com/Bonney/magic-card-finder/main/public/screenshot.png)

## Overview

Magic Card Finder allows users to search for Magic: The Gathering cards by name, view detailed card information, and explore card artwork. The application provides an intuitive interface for browsing search results and examining individual cards.

## Features

- **Card Search**: Search for Magic cards by name with real-time results
- **Search Results List**: Browse through multiple matching cards with thumbnails and basic info
- **Card Details**: View high-resolution card images and detailed information
- **Random Card**: Discover random Magic cards with a single click
- **Results Filtering**: Filter search results to quickly find specific cards
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Vue.js 3**: Frontend framework with Composition API
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Next-generation frontend build tool
- **Scryfall API**: Comprehensive Magic: The Gathering card database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Bonney/magic-card-finder.git
   cd magic-card-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the development server at `http://localhost:5173` (or another port if 5173 is already in use).

### Building for Production

Build the project for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/components/` - Vue components
  - `SearchBar.vue` - Search input component
  - `SearchResultsList.vue` - Displays search results
  - `CardDisplay.vue` - Displays detailed card information
- `src/services/` - API services
  - `ScryfallService.ts` - Handles API calls to Scryfall
- `src/assets/` - Static assets and styles

## Planned Enhancements

See [ToDo.md](./ToDo.md) for a list of planned features and enhancements.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Scryfall API](https://scryfall.com/docs/api) for providing the Magic: The Gathering card data
- [Vue.js](https://vuejs.org/) for the excellent frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Wizards of the Coast](https://company.wizards.com/) for creating Magic: The Gathering
