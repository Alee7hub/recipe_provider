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
        
        // Task 7: Enhanced keyboard shortcuts and navigation
        addEvent(document, 'keydown', (e) => {
            // Ctrl+Enter to submit
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.handleSubmit();
            }
            
            // Ctrl+R to reset/clear all
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.reset();
                NotificationSystem.info('All fields cleared', { duration: 2000 });
            }
            
            // Escape to clear error states
            if (e.key === 'Escape') {
                this.clearErrorStates();
            }
        });
        
        // Initialize keyboard navigation system
        KeyboardNavigation.init();
        
        // Add tooltips to important elements
        this.setupTooltips();
        
        // Setup form validation on submit button
        this.setupSubmitButtonState();
    }
    
    // Task 7: Setup helpful tooltips
    setupTooltips() {
        const submitButton = $('#find-recipes-btn');
        if (submitButton) {
            TooltipSystem.create(submitButton, 'Click to find recipes or press Ctrl+Enter');
        }
        
        // Add tooltips to tab shortcuts
        const tabs = document.querySelectorAll('.input-tab');
        tabs.forEach((tab, index) => {
            const method = tab.getAttribute('data-method');
            const shortcut = `Ctrl+${index + 1}`;
            TooltipSystem.create(tab, `Switch to ${method} input (${shortcut})`);
        });
    }
    
    // Task 7: Setup submit button state management
    setupSubmitButtonState() {
        const submitButton = $('#find-recipes-btn');
        
        // Add initial help text
        const helpText = createElement('div', 'help-text');
        helpText.innerHTML = `
            <span class="help-icon">⌨️</span>
            <span>Use <kbd>Ctrl+Enter</kbd> to quickly find recipes, or <kbd>Ctrl+R</kbd> to reset all fields</span>
        `;
        
        submitButton.parentElement.appendChild(helpText);
        
        // Monitor input changes to update button state
        const checkFormCompleteness = debounce(() => {
            const activeComponent = this.inputComponents[this.currentInputMethod];
            let hasInput = false;
            
            if (activeComponent && typeof activeComponent.getValue === 'function') {
                const value = activeComponent.getValue();
                if (this.currentInputMethod === 'text') {
                    hasInput = !validators.isEmpty(value);
                } else if (this.currentInputMethod === 'image') {
                    hasInput = Array.isArray(value) && value.length > 0;
                } else if (this.currentInputMethod === 'voice') {
                    hasInput = !validators.isEmpty(value);
                }
            }
            
            // Update button appearance based on form state
            if (hasInput) {
                removeClass(submitButton, 'btn-secondary');
                addClass(submitButton, 'btn-primary');
                submitButton.innerHTML = '🔍 Find Recipes';
            } else {
                removeClass(submitButton, 'btn-primary');
                addClass(submitButton, 'btn-secondary');
                submitButton.innerHTML = '🔍 Find Recipes';
            }
        }, 300);
        
        // Monitor all input components for changes
        Object.values(this.inputComponents).forEach(component => {
            if (component.element) {
                // Listen for various input events
                addEvent(component.element, 'input', checkFormCompleteness);
                addEvent(component.element, 'change', checkFormCompleteness);
                addEvent(component.element, 'keyup', checkFormCompleteness);
            }
        });
        
        // Initial check
        checkFormCompleteness();
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
            // Clear any existing error states
            this.clearErrorStates();
            
            // Validate all inputs with enhanced feedback
            if (this.validateAllInputs()) {
                const ingredients = this.getIngredients();
                const cuisines = this.cuisineSelector.getValue();
                this.processRecipeSearch(ingredients, cuisines);
            }
        } catch (error) {
            handleError(error, 'Error processing your request');
            NotificationSystem.error('Unable to process your request. Please try again.', {
                title: 'Error'
            });
        }
    }
    
    // Task 7: Enhanced validation with detailed feedback
    validateAllInputs() {
        let isValid = true;
        const validationResults = [];
        
        // Validate current input method
        const activeComponent = this.inputComponents[this.currentInputMethod];
        if (activeComponent && typeof activeComponent.isValid === 'function') {
            const componentValid = activeComponent.isValid();
            if (!componentValid) {
                isValid = false;
                validationResults.push(`Please complete the ${this.currentInputMethod} input`);
            }
        } else {
            // Fallback validation for components without isValid method
            const ingredients = this.getIngredients();
            if (this.currentInputMethod === 'text' && validators.isEmpty(ingredients)) {
                isValid = false;
                validationResults.push('Please enter some ingredients');
            } else if (this.currentInputMethod === 'image' && (!ingredients || ingredients.length === 0)) {
                isValid = false;
                validationResults.push('Please upload at least one image');
            } else if (this.currentInputMethod === 'voice' && validators.isEmpty(ingredients)) {
                isValid = false;
                validationResults.push('Please speak some ingredients using voice input');
            }
        }
        
        // Validate cuisine selection (optional but show guidance)
        const cuisines = this.cuisineSelector.getValue();
        if (cuisines.length === 0) {
            TooltipSystem.showTemporary(
                $('#find-recipes-btn'),
                'Tip: Select cuisine preferences for better results!',
                3000
            );
        }
        
        // Show validation feedback
        if (!isValid) {
            NotificationSystem.error(validationResults.join('<br>'), {
                title: 'Please Complete Required Fields',
                duration: 5000
            });
            
            // Focus the problematic input
            this.focusActiveInput(activeComponent);
        }
        
        return isValid;
    }
    
    // Task 7: Clear error states
    clearErrorStates() {
        // Clear any existing validation messages
        const errorContainer = $('#error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
        // Clear form field error states
        const errorFields = document.querySelectorAll('.form-field.has-error');
        errorFields.forEach(field => {
            removeClass(field, 'has-error');
            const validationMessage = field.querySelector('.validation-message.error');
            if (validationMessage) {
                validationMessage.remove();
            }
        });
    }
    
    getIngredients() {
        const activeComponent = this.inputComponents[this.currentInputMethod];
        return activeComponent ? activeComponent.getValue() : null;
    }
    
    validateInput(ingredients, cuisines) {
        // This method is kept for backward compatibility
        // Use validateAllInputs() for enhanced validation
        return this.validateAllInputs();
    }
    
    // Task 7: Enhanced recipe search with detailed loading states
    processRecipeSearch(ingredients, cuisines) {
        const submitButton = $('#find-recipes-btn');
        const activeComponent = this.inputComponents[this.currentInputMethod];
        
        // Set loading state on submit button
        addClass(submitButton, 'loading');
        submitButton.disabled = true;
        
        // Set loading state on active input component
        if (activeComponent && typeof activeComponent.setLoading === 'function') {
            activeComponent.setLoading(true, 'Analyzing ingredients...');
        }
        
        // Show global loading notification
        const loadingNotification = NotificationSystem.info('Finding perfect recipes for you...', {
            title: 'Searching Recipes',
            duration: 0 // Don't auto-close
        });
        
        // Create progress indicator
        const progressIndicator = ProgressSystem.create(submitButton.parentElement, { 
            indeterminate: true 
        });
        
        // Simulate API call with realistic timing and progress updates
        const steps = [
            { message: 'Analyzing your ingredients...', delay: 800 },
            { message: 'Searching recipe database...', delay: 600 },
            { message: 'Matching with cuisine preferences...', delay: 500 },
            { message: 'Finalizing recommendations...', delay: 400 }
        ];
        
        let currentStep = 0;
        const processStep = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                
                // Update loading message
                if (activeComponent && typeof activeComponent.setLoading === 'function') {
                    activeComponent.setLoading(true, step.message);
                }
                
                currentStep++;
                setTimeout(processStep, step.delay);
            } else {
                // Complete the search
                this.completeRecipeSearch(ingredients, cuisines, {
                    submitButton,
                    activeComponent,
                    loadingNotification,
                    progressIndicator
                });
            }
        };
        
        // Start the process
        setTimeout(processStep, 500);
    }
    
    // Task 7: Complete recipe search with success feedback
    completeRecipeSearch(ingredients, cuisines, loadingElements) {
        const { submitButton, activeComponent, loadingNotification, progressIndicator } = loadingElements;
        
        try {
            const mockRecipes = this.generateMockRecipes(ingredients, cuisines);
            
            // Clean up loading states
            removeClass(submitButton, 'loading');
            submitButton.disabled = false;
            
            if (activeComponent && typeof activeComponent.setLoading === 'function') {
                activeComponent.setLoading(false);
            }
            
            loadingNotification.close();
            progressIndicator.remove();
            
            // Display results
            this.displayRecipes(mockRecipes);
            
            // Show success feedback
            if (mockRecipes.length > 0) {
                NotificationSystem.success(
                    `Found ${mockRecipes.length} delicious recipe${mockRecipes.length > 1 ? 's' : ''} for you!`,
                    {
                        title: 'Recipes Found',
                        duration: 4000
                    }
                );
            } else {
                NotificationSystem.warning(
                    'No recipes found with your current ingredients and preferences. Try different ingredients or cuisine options.',
                    {
                        title: 'No Results',
                        duration: 6000
                    }
                );
            }
            
        } catch (error) {
            // Handle errors gracefully
            this.handleSearchError(error, loadingElements);
        }
    }
    
    // Task 7: Error handling for recipe search
    handleSearchError(error, loadingElements) {
        const { submitButton, activeComponent, loadingNotification, progressIndicator } = loadingElements;
        
        // Clean up loading states
        removeClass(submitButton, 'loading');
        submitButton.disabled = false;
        
        if (activeComponent && typeof activeComponent.setLoading === 'function') {
            activeComponent.setLoading(false);
        }
        
        loadingNotification.close();
        progressIndicator.remove();
        
        // Show error feedback
        NotificationSystem.error(
            'Unable to search recipes at the moment. Please check your input and try again.',
            {
                title: 'Search Failed',
                duration: 5000
            }
        );
        
        handleError(error, 'Recipe search failed');
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
    
    // Expose app globally for debugging and keyboard navigation
    window.recipeApp = app;
    window.RecipeProviderApp = app;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeProviderApp;
}
