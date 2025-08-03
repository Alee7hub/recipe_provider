// ===========================
// RECIPE PROVIDER - MAIN APP
// ===========================

/**
 * Main application controller for Recipe Provider
 */

class RecipeProviderApp {
    constructor() {
        this.currentInputMethod = 'text';
        this.inputComponents = {};
        this.cuisineSelector = null;
        this.isInitialized = false;
        
        // Bind methods
        this.handleInputMethodChange = this.handleInputMethodChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        
        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            addEvent(document, 'DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        try {
            this.createAppStructure();
            this.initializeComponents();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Recipe Provider App initialized successfully');
        } catch (error) {
            handleError(error, 'Failed to initialize the application');
        }
    }
    
    createAppStructure() {
        const mainContent = $('.main-content .container');
        
        // Create welcome section
        const welcomeSection = createElement('section', 'welcome-section');
        welcomeSection.innerHTML = `
            <div class="welcome-content">
                <h2>Find Delicious Recipes with Your Ingredients</h2>
                <p>Tell us what ingredients you have, and we'll suggest amazing recipes you can make!</p>
            </div>
        `;
        
        // Create input section
        const inputSection = createElement('section', 'input-section');
        inputSection.innerHTML = `
            <h3>What ingredients do you have?</h3>
            <div id="input-method-selector"></div>
            <div id="input-container"></div>
        `;
        
        // Create cuisine section
        const cuisineSection = createElement('section', 'cuisine-section');
        cuisineSection.innerHTML = `<div id="cuisine-container"></div>`;
        
        // Create submit section
        const submitSection = createElement('section', 'submit-section');
        submitSection.innerHTML = `
            <button id="find-recipes-btn" class="btn btn-primary">
                🔍 Find Recipes
            </button>
        `;
        
        // Create results section (initially hidden)
        const resultsSection = createElement('section', 'recipe-results hidden');
        resultsSection.innerHTML = `
            <h3>Recipe Suggestions</h3>
            <div id="results-container"></div>
        `;
        
        // Create error container
        const errorContainer = createElement('div', 'error-container hidden');
        errorContainer.id = 'error-container';
        errorContainer.style.cssText = `
            background-color: #f8d7da;
            color: #721c24;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border: 1px solid #f5c6cb;
            display: none;
        `;
        
        // Append all sections
        mainContent.appendChild(errorContainer);
        mainContent.appendChild(welcomeSection);
        mainContent.appendChild(inputSection);
        mainContent.appendChild(cuisineSection);
        mainContent.appendChild(submitSection);
        mainContent.appendChild(resultsSection);
    }
    
    initializeComponents() {
        // Initialize input method selector
        const selectorContainer = $('#input-method-selector');
        this.inputMethodSelector = new InputMethodSelector(selectorContainer, this.handleInputMethodChange);
        
        // Initialize input components
        const inputContainer = $('#input-container');
        this.inputComponents = {
            text: new TextInputComponent(inputContainer),
            image: new ImageUploadComponent(inputContainer),
            voice: new VoiceInputComponent(inputContainer)
        };
        
        // Initialize cuisine selector
        const cuisineContainer = $('#cuisine-container');
        this.cuisineSelector = new CuisineSelector(cuisineContainer);
        
        // Show initial input method
        this.showInputMethod('text');
    }
    
    setupEventListeners() {
        const submitButton = $('#find-recipes-btn');
        addEvent(submitButton, 'click', this.handleSubmit);
        
        // Add keyboard shortcuts
        addEvent(document, 'keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.handleSubmit();
            }
        });
    }
    
    handleInputMethodChange(methodId) {
        this.currentInputMethod = methodId;
        this.showInputMethod(methodId);
    }
    
    showInputMethod(methodId) {
        const inputContainer = $('#input-container');
        
        // Add transition class
        addClass(inputContainer, 'method-transition');
        
        // Fade out current component
        Object.values(this.inputComponents).forEach(component => {
            if (component.element && component.element.style.display !== 'none') {
                addClass(component.element, 'fade-out');
            }
        });
        
        // After fade out animation
        setTimeout(() => {
            // Hide all components
            Object.values(this.inputComponents).forEach(component => {
                if (component.element) {
                    component.element.style.display = 'none';
                    removeClass(component.element, 'fade-out');
                    removeClass(component.element, 'fade-in');
                }
            });
            
            // Show and fade in the selected component
            const activeComponent = this.inputComponents[methodId];
            if (activeComponent && activeComponent.element) {
                activeComponent.element.style.display = 'block';
                addClass(activeComponent.element, 'fade-in');
                
                // Focus the main input element if available
                this.focusActiveInput(activeComponent);
                
                // Remove transition classes after animation
                setTimeout(() => {
                    removeClass(inputContainer, 'method-transition');
                    removeClass(activeComponent.element, 'fade-in');
                }, 300);
            }
        }, 150);
    }
    
    focusActiveInput(component) {
        try {
            setTimeout(() => {
                if (component.element) {
                    // Focus different elements based on component type
                    const focusTargets = [
                        '.text-input-area', // Text input
                        '.upload-area', // Image upload
                        '.mic-button' // Voice input
                    ];
                    
                    for (const selector of focusTargets) {
                        const element = component.element.querySelector(selector);
                        if (element && typeof element.focus === 'function') {
                            element.focus();
                            break;
                        }
                    }
                }
            }, 200);
        } catch (error) {
            console.log('Could not focus input element:', error);
        }
    }
    
    handleSubmit() {
        try {
            const ingredients = this.getIngredients();
            const cuisines = this.cuisineSelector.getValue();
            
            if (this.validateInput(ingredients, cuisines)) {
                this.processRecipeSearch(ingredients, cuisines);
            }
        } catch (error) {
            handleError(error, 'Error processing your request');
        }
    }
    
    getIngredients() {
        const activeComponent = this.inputComponents[this.currentInputMethod];
        return activeComponent ? activeComponent.getValue() : null;
    }
    
    validateInput(ingredients, cuisines) {
        // Check if ingredients are provided
        if (this.currentInputMethod === 'text' && validators.isEmpty(ingredients)) {
            handleError(null, 'Please enter some ingredients');
            return false;
        }
        
        if (this.currentInputMethod === 'image' && (!ingredients || ingredients.length === 0)) {
            handleError(null, 'Please upload at least one image');
            return false;
        }
        
        if (this.currentInputMethod === 'voice' && validators.isEmpty(ingredients)) {
            handleError(null, 'Please speak some ingredients using voice input');
            return false;
        }
        
        // Cuisine selection is optional, but show warning if none selected
        if (cuisines.length === 0) {
            console.log('No cuisine selected - will show all cuisine types');
        }
        
        return true;
    }
    
    processRecipeSearch(ingredients, cuisines) {
        const submitButton = $('#find-recipes-btn');
        loading.show(submitButton);
        submitButton.textContent = '🔍 Searching...';
        
        // Simulate API call with timeout
        setTimeout(() => {
            const mockRecipes = this.generateMockRecipes(ingredients, cuisines);
            this.displayRecipes(mockRecipes);
            
            loading.hide(submitButton);
            submitButton.innerHTML = '🔍 Find Recipes';
        }, 1500);
    }
    
    generateMockRecipes(ingredients, cuisines) {
        // Mock recipe data based on input
        const mockRecipes = [
            {
                id: 1,
                title: 'Mediterranean Pasta Salad',
                image: 'https://via.placeholder.com/300x200/e67e22/ffffff?text=Pasta+Salad',
                cookTime: '20 min',
                difficulty: 'Easy',
                cuisine: 'Mediterranean',
                description: 'Fresh and healthy pasta salad with vegetables and herbs.',
                matchingIngredients: 3
            },
            {
                id: 2,
                title: 'Chicken Stir Fry',
                image: 'https://via.placeholder.com/300x200/27ae60/ffffff?text=Stir+Fry',
                cookTime: '15 min',
                difficulty: 'Medium',
                cuisine: 'Asian',
                description: 'Quick and delicious stir fry with fresh vegetables.',
                matchingIngredients: 4
            },
            {
                id: 3,
                title: 'Tomato Basil Soup',
                image: 'https://via.placeholder.com/300x200/e74c3c/ffffff?text=Tomato+Soup',
                cookTime: '30 min',
                difficulty: 'Easy',
                cuisine: 'Italian',
                description: 'Creamy tomato soup with fresh basil and herbs.',
                matchingIngredients: 2
            },
            {
                id: 4,
                title: 'Greek Style Salad',
                image: 'https://via.placeholder.com/300x200/3498db/ffffff?text=Greek+Salad',
                cookTime: '10 min',
                difficulty: 'Easy',
                cuisine: 'Greek',
                description: 'Traditional Greek salad with feta cheese and olives.',
                matchingIngredients: 5
            }
        ];
        
        // Filter by selected cuisines if any
        if (cuisines.length > 0) {
            return mockRecipes.filter(recipe => 
                cuisines.some(cuisine => 
                    recipe.cuisine.toLowerCase().includes(cuisine) ||
                    cuisine.includes(recipe.cuisine.toLowerCase())
                )
            );
        }
        
        return mockRecipes;
    }
    
    displayRecipes(recipes) {
        const resultsSection = $('.recipe-results');
        const resultsContainer = $('#results-container');
        
        removeClass(resultsSection, 'hidden');
        resultsContainer.innerHTML = '';
        
        if (recipes.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h4>No recipes found</h4>
                    <p>Try different ingredients or cuisine preferences.</p>
                </div>
            `;
            return;
        }
        
        const grid = createElement('div', 'recipe-grid');
        
        recipes.forEach(recipe => {
            const card = createElement('div', 'recipe-card');
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h4 class="recipe-title">${recipe.title}</h4>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.cookTime}</span>
                        <span>👨‍🍳 ${recipe.difficulty}</span>
                        <span>🎯 ${recipe.matchingIngredients} matches</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-actions">
                        <button class="btn btn-primary">View Recipe</button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        resultsContainer.appendChild(grid);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Public methods for external access
    clearAll() {
        Object.values(this.inputComponents).forEach(component => {
            if (component.clear) component.clear();
        });
        
        if (this.cuisineSelector && this.cuisineSelector.clear) {
            this.cuisineSelector.clear();
        }
        
        // Hide results
        const resultsSection = $('.recipe-results');
        addClass(resultsSection, 'hidden');
    }
    
    reset() {
        this.clearAll();
        this.currentInputMethod = 'text';
        this.showInputMethod('text');
        this.inputMethodSelector.selectMethod('text');
    }
}

// Initialize the app
let app;

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    app = new RecipeProviderApp();
    
    // Expose app globally for debugging
    window.RecipeProviderApp = app;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeProviderApp;
}
