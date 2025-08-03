# Recipe Provider App

A modern, responsive web application that helps users find delicious recipes based on their available ingredients. Users can input ingredients through multiple methods: typing, image upload, or voice input.

## Features

-   **Multi-modal ingredient input**:
    -   Text input with ingredient suggestions
    -   Image upload with drag-and-drop support
    -   Voice input using Web Speech API
-   **Cuisine preference selector** with 12+ popular cuisines
-   **Responsive design** optimized for all device sizes
-   **Accessibility-focused** with ARIA labels and keyboard navigation
-   **Modern UI** with food-inspired design and smooth animations

## Getting Started

### Prerequisites

-   Modern web browser with JavaScript enabled
-   For voice input: Browser supporting Web Speech API (Chrome, Edge, Safari)
-   For image upload: Browser supporting File API

### Installation

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Or serve using a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

### Development

1. Open the project in your preferred code editor
2. Make changes to HTML, CSS, or JavaScript files
3. Refresh the browser to see changes
4. Use browser developer tools for debugging

## Project Structure

```
recipe_provider/
├── index.html                 # Main HTML file
├── src/
│   ├── css/
│   │   ├── styles.css        # Main styles with CSS variables
│   │   ├── components.css    # Component-specific styles
│   │   └── responsive.css    # Responsive design rules
│   ├── js/
│   │   ├── utils.js          # Utility functions
│   │   ├── components.js     # UI component classes
│   │   └── app.js            # Main application logic
│   └── assets/
│       ├── images/           # Image assets
│       └── icons/            # Icon files
├── PLAN.md                   # Development plan
└── README.md                 # This file
```

## Usage

1. **Select Input Method**: Choose how you want to input your ingredients:

    - **Type**: Enter ingredients as text
    - **Upload Photo**: Drag & drop or browse for fridge/pantry photos
    - **Voice Input**: Click the microphone and speak your ingredients

2. **Choose Cuisine**: Select your preferred cuisine style(s) from the grid

3. **Find Recipes**: Click "Find Recipes" to get personalized suggestions

4. **Browse Results**: View recipe cards with cooking time, difficulty, and ingredient matches

## Browser Support

-   **Chrome/Edge**: Full support including voice input
-   **Firefox**: Full support except voice input
-   **Safari**: Full support including voice input
-   **Mobile browsers**: Responsive design with touch optimization

## Technical Details

-   **Frontend-only**: No backend required for this phase
-   **Vanilla JavaScript**: No external frameworks
-   **Modern CSS**: CSS Grid, Flexbox, Custom Properties
-   **Web APIs**: Speech Recognition, File API
-   **Accessibility**: WCAG 2.1 compliant

## Contributing

1. Follow the existing code style
2. Test on multiple browsers and devices
3. Ensure accessibility standards are met
4. Update documentation as needed

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Enhancements

-   Backend integration for real recipe data
-   User accounts and saved recipes
-   Advanced ingredient recognition from images
-   Recipe rating and review system
-   Nutritional information display
-   Shopping list generation
