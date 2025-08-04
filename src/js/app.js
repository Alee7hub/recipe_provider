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
    
    // Task 8: Enhanced mock recipe generation with comprehensive data
    generateMockRecipes(ingredients, cuisines) {
        // Comprehensive mock recipe database
        const recipeDatabase = [
            {
                id: 1,
                title: 'Mediterranean Pasta Salad',
                image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
                cookTime: '20 min',
                prepTime: '15 min',
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Mediterranean',
                description: 'Fresh and healthy pasta salad with vegetables, herbs, and a tangy olive oil dressing.',
                rating: 4.5,
                reviewCount: 127,
                calories: 340,
                tags: ['Healthy', 'Vegetarian', 'Quick', 'Cold Dish'],
                ingredients: [
                    '2 cups penne pasta',
                    '1 cup cherry tomatoes, halved',
                    '1/2 cup black olives',
                    '1/2 cup feta cheese, crumbled',
                    '1/4 cup red onion, diced',
                    '2 tbsp olive oil',
                    '1 tbsp balsamic vinegar',
                    'Fresh basil leaves'
                ],
                instructions: [
                    'Cook pasta according to package directions',
                    'Mix vegetables and cheese in large bowl',
                    'Whisk olive oil and vinegar for dressing',
                    'Combine pasta with vegetables and dressing',
                    'Garnish with fresh basil and serve chilled'
                ],
                matchingIngredients: 3,
                nutrition: {
                    protein: '12g',
                    carbs: '45g',
                    fat: '14g',
                    fiber: '3g'
                },
                author: 'Chef Maria',
                dateAdded: '2025-07-20'
            },
            {
                id: 2,
                title: 'Asian Chicken Stir Fry',
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
                cookTime: '15 min',
                prepTime: '10 min',
                servings: 3,
                difficulty: 'Medium',
                cuisine: 'Asian',
                description: 'Quick and flavorful stir fry with tender chicken, crisp vegetables, and savory sauce.',
                rating: 4.7,
                reviewCount: 89,
                calories: 285,
                tags: ['Protein Rich', 'Quick', 'Low Carb', 'Gluten Free'],
                ingredients: [
                    '1 lb chicken breast, sliced',
                    '2 cups mixed vegetables',
                    '2 tbsp soy sauce',
                    '1 tbsp sesame oil',
                    '2 cloves garlic, minced',
                    '1 tsp ginger, grated',
                    '1 tbsp cornstarch',
                    'Green onions for garnish'
                ],
                instructions: [
                    'Marinate chicken with soy sauce and cornstarch',
                    'Heat oil in wok or large skillet',
                    'Stir-fry chicken until golden brown',
                    'Add vegetables and aromatics',
                    'Toss everything together and serve hot'
                ],
                matchingIngredients: 4,
                nutrition: {
                    protein: '28g',
                    carbs: '12g',
                    fat: '8g',
                    fiber: '4g'
                },
                author: 'Chef Li',
                dateAdded: '2025-07-18'
            },
            {
                id: 3,
                title: 'Creamy Tomato Basil Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
                cookTime: '25 min',
                prepTime: '15 min',
                servings: 6,
                difficulty: 'Easy',
                cuisine: 'Italian',
                description: 'Rich and creamy tomato soup with fresh basil, perfect for a cozy meal.',
                rating: 4.3,
                reviewCount: 156,
                calories: 180,
                tags: ['Comfort Food', 'Vegetarian', 'Soup', 'Winter'],
                ingredients: [
                    '2 lbs fresh tomatoes',
                    '1 cup heavy cream',
                    '1/4 cup fresh basil',
                    '2 cloves garlic',
                    '1 onion, diced',
                    '2 tbsp olive oil',
                    'Salt and pepper to taste',
                    'Croutons for serving'
                ],
                instructions: [
                    'Sauté onion and garlic in olive oil',
                    'Add tomatoes and simmer 15 minutes',
                    'Blend until smooth with immersion blender',
                    'Stir in cream and fresh basil',
                    'Season to taste and serve with croutons'
                ],
                matchingIngredients: 2,
                nutrition: {
                    protein: '4g',
                    carbs: '18g',
                    fat: '12g',
                    fiber: '3g'
                },
                author: 'Chef Antonio',
                dateAdded: '2025-07-15'
            },
            {
                id: 4,
                title: 'Traditional Greek Salad',
                image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
                cookTime: '0 min',
                prepTime: '15 min',
                servings: 4,
                difficulty: 'Easy',
                cuisine: 'Greek',
                description: 'Authentic Greek salad with fresh vegetables, feta cheese, and olive oil dressing.',
                rating: 4.6,
                reviewCount: 203,
                calories: 220,
                tags: ['Healthy', 'Vegetarian', 'No Cook', 'Mediterranean'],
                ingredients: [
                    '4 large tomatoes, wedged',
                    '1 cucumber, sliced',
                    '1 red onion, sliced',
                    '1/2 cup kalamata olives',
                    '200g feta cheese, cubed',
                    '1/4 cup olive oil',
                    '2 tbsp red wine vinegar',
                    'Fresh oregano'
                ],
                instructions: [
                    'Cut all vegetables into bite-sized pieces',
                    'Arrange in large serving bowl',
                    'Add feta cheese and olives',
                    'Whisk olive oil and vinegar',
                    'Drizzle dressing and sprinkle oregano'
                ],
                matchingIngredients: 5,
                nutrition: {
                    protein: '8g',
                    carbs: '14g',
                    fat: '18g',
                    fiber: '4g'
                },
                author: 'Chef Yiannis',
                dateAdded: '2025-07-22'
            },
            {
                id: 5,
                title: 'Spicy Thai Green Curry',
                image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop',
                cookTime: '25 min',
                prepTime: '20 min',
                servings: 4,
                difficulty: 'Hard',
                cuisine: 'Thai',
                description: 'Authentic Thai green curry with coconut milk, vegetables, and aromatic herbs.',
                rating: 4.8,
                reviewCount: 94,
                calories: 320,
                tags: ['Spicy', 'Thai', 'Coconut', 'Vegan Option'],
                ingredients: [
                    '2 tbsp green curry paste',
                    '400ml coconut milk',
                    '300g mixed vegetables',
                    '2 kaffir lime leaves',
                    '1 tbsp fish sauce',
                    '1 tbsp palm sugar',
                    'Thai basil leaves',
                    'Jasmine rice for serving'
                ],
                instructions: [
                    'Heat curry paste in pan until fragrant',
                    'Add thick coconut milk, stir well',
                    'Add vegetables and seasonings',
                    'Simmer until vegetables are tender',
                    'Garnish with basil and serve with rice'
                ],
                matchingIngredients: 2,
                nutrition: {
                    protein: '6g',
                    carbs: '25g',
                    fat: '24g',
                    fiber: '5g'
                },
                author: 'Chef Somchai',
                dateAdded: '2025-07-10'
            },
            {
                id: 6,
                title: 'Classic Margherita Pizza',
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
                cookTime: '12 min',
                prepTime: '30 min',
                servings: 2,
                difficulty: 'Medium',
                cuisine: 'Italian',
                description: 'Traditional Neapolitan pizza with fresh mozzarella, tomatoes, and basil.',
                rating: 4.9,
                reviewCount: 267,
                calories: 380,
                tags: ['Classic', 'Italian', 'Vegetarian', 'Pizza'],
                ingredients: [
                    '1 pizza dough ball',
                    '1/2 cup pizza sauce',
                    '200g fresh mozzarella',
                    '2 large tomatoes, sliced',
                    'Fresh basil leaves',
                    '2 tbsp olive oil',
                    'Salt and pepper',
                    'Parmesan cheese (optional)'
                ],
                instructions: [
                    'Preheat oven to 500°F (260°C)',
                    'Roll out pizza dough on floured surface',
                    'Spread sauce evenly over dough',
                    'Add mozzarella and tomato slices',
                    'Bake 10-12 minutes until golden, add basil'
                ],
                matchingIngredients: 3,
                nutrition: {
                    protein: '18g',
                    carbs: '42g',
                    fat: '16g',
                    fiber: '2g'
                },
                author: 'Chef Giuseppe',
                dateAdded: '2025-07-25'
            },
            {
                id: 7,
                title: 'Mexican Street Tacos',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
                cookTime: '15 min',
                prepTime: '20 min',
                servings: 6,
                difficulty: 'Medium',
                cuisine: 'Mexican',
                description: 'Authentic street-style tacos with seasoned meat, fresh toppings, and corn tortillas.',
                rating: 4.4,
                reviewCount: 178,
                calories: 290,
                tags: ['Mexican', 'Street Food', 'Spicy', 'Quick'],
                ingredients: [
                    '1 lb ground beef or chicken',
                    '12 corn tortillas',
                    '1 onion, diced',
                    '2 limes, quartered',
                    'Fresh cilantro',
                    '2 tsp cumin',
                    '1 tsp chili powder',
                    'Salsa and hot sauce'
                ],
                instructions: [
                    'Season and cook meat with spices',
                    'Warm tortillas on griddle',
                    'Fill tortillas with meat',
                    'Top with onion and cilantro',
                    'Serve with lime wedges and salsa'
                ],
                matchingIngredients: 4,
                nutrition: {
                    protein: '22g',
                    carbs: '24g',
                    fat: '12g',
                    fiber: '3g'
                },
                author: 'Chef Rosa',
                dateAdded: '2025-07-12'
            },
            {
                id: 8,
                title: 'Japanese Ramen Bowl',
                image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
                cookTime: '45 min',
                prepTime: '25 min',
                servings: 2,
                difficulty: 'Hard',
                cuisine: 'Japanese',
                description: 'Rich and flavorful ramen with tender pork, soft-boiled eggs, and fresh vegetables.',
                rating: 4.7,
                reviewCount: 145,
                calories: 520,
                tags: ['Japanese', 'Comfort Food', 'Soup', 'Complex'],
                ingredients: [
                    '2 portions ramen noodles',
                    '4 cups chicken broth',
                    '200g pork belly',
                    '2 soft-boiled eggs',
                    '2 green onions, sliced',
                    '1 sheet nori seaweed',
                    '2 tbsp miso paste',
                    'Corn kernels and bamboo shoots'
                ],
                instructions: [
                    'Prepare soft-boiled eggs and set aside',
                    'Cook pork belly until tender, slice',
                    'Heat broth and whisk in miso paste',
                    'Cook ramen noodles according to package',
                    'Assemble bowls with noodles, broth, and toppings'
                ],
                matchingIngredients: 1,
                nutrition: {
                    protein: '28g',
                    carbs: '58g',
                    fat: '18g',
                    fiber: '4g'
                },
                author: 'Chef Hiroshi',
                dateAdded: '2025-07-08'
            }
        ];
        
        // Apply filtering based on selected cuisines
        let filteredRecipes = recipeDatabase;
        
        if (cuisines.length > 0) {
            filteredRecipes = recipeDatabase.filter(recipe => 
                cuisines.some(cuisine => 
                    recipe.cuisine.toLowerCase().includes(cuisine.toLowerCase()) ||
                    cuisine.toLowerCase().includes(recipe.cuisine.toLowerCase())
                )
            );
        }
        
        // Simulate ingredient matching based on input
        if (ingredients) {
            const ingredientWords = typeof ingredients === 'string' 
                ? ingredients.toLowerCase().split(/[,\n\s]+/).filter(word => word.length > 2)
                : [];
            
            // Update matching ingredients count based on actual input
            filteredRecipes = filteredRecipes.map(recipe => {
                let matchCount = 0;
                recipe.ingredients.forEach(ingredient => {
                    ingredientWords.forEach(word => {
                        if (ingredient.toLowerCase().includes(word)) {
                            matchCount++;
                        }
                    });
                });
                
                return {
                    ...recipe,
                    matchingIngredients: Math.max(1, matchCount),
                    matchPercentage: Math.min(100, Math.round((matchCount / recipe.ingredients.length) * 100))
                };
            });
            
            // Sort by matching ingredients (descending)
            filteredRecipes.sort((a, b) => b.matchingIngredients - a.matchingIngredients);
        }
        
        return filteredRecipes;
    }
    
    // Task 8: Enhanced recipe display with filters and sorting
    displayRecipes(recipes) {
        const resultsSection = $('.recipe-results');
        const resultsContainer = $('#results-container');
        
        removeClass(resultsSection, 'hidden');
        resultsContainer.innerHTML = '';
        
        if (recipes.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h4>No recipes found</h4>
                    <p>Try different ingredients or cuisine preferences.</p>
                    <div class="no-results-suggestions">
                        <h5>Suggestions:</h5>
                        <ul>
                            <li>Check your spelling</li>
                            <li>Try more common ingredients</li>
                            <li>Remove cuisine filters</li>
                            <li>Use fewer, more basic ingredients</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }
        
        // Create results header with count and controls
        const resultsHeader = this.createResultsHeader(recipes.length);
        resultsContainer.appendChild(resultsHeader);
        
        // Create filter and sort controls
        const controlsSection = this.createRecipeControls(recipes);
        resultsContainer.appendChild(controlsSection);
        
        // Create recipe grid
        const grid = createElement('div', 'recipe-grid');
        grid.id = 'recipe-grid';
        
        // Store original recipes for filtering/sorting
        this.currentRecipes = recipes;
        this.renderRecipeGrid(recipes, grid);
        
        resultsContainer.appendChild(grid);
        
        // Scroll to results with smooth animation
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        // Show success notification
        NotificationSystem.success(
            `Found ${recipes.length} delicious recipe${recipes.length > 1 ? 's' : ''} matching your ingredients!`,
            {
                title: 'Recipes Found',
                duration: 4000
            }
        );
    }
    
    // Task 8: Create results header with count and view options
    createResultsHeader(count) {
        const header = createElement('div', 'results-header');
        header.innerHTML = `
            <div class="results-info">
                <h3>Recipe Results</h3>
                <p class="results-count">Found <strong>${count}</strong> recipe${count > 1 ? 's' : ''} for you</p>
            </div>
            <div class="view-options">
                <button class="view-btn active" data-view="grid" title="Grid View" aria-label="Switch to grid view">
                    <span class="view-icon">⊞</span>
                    <span class="view-label">Grid</span>
                </button>
                <button class="view-btn" data-view="list" title="List View" aria-label="Switch to list view">
                    <span class="view-icon">☰</span>
                    <span class="view-label">List</span>
                </button>
            </div>
        `;
        
        // Add view switching functionality
        addEvent(header, 'click', (e) => {
            if (e.target.closest('.view-btn')) {
                const viewBtn = e.target.closest('.view-btn');
                const view = viewBtn.getAttribute('data-view');
                this.switchView(view);
                
                // Update active state
                header.querySelectorAll('.view-btn').forEach(btn => removeClass(btn, 'active'));
                addClass(viewBtn, 'active');
            }
        });
        
        return header;
    }
    
    // Task 8: Create filter and sort controls
    createRecipeControls(recipes) {
        const controls = createElement('div', 'recipe-controls');
        controls.innerHTML = `
            <div class="filter-section">
                <div class="filter-group">
                    <label for="difficulty-filter">Difficulty:</label>
                    <select id="difficulty-filter" class="filter-select">
                        <option value="">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="time-filter">Cook Time:</label>
                    <select id="time-filter" class="filter-select">
                        <option value="">Any Time</option>
                        <option value="0-15">Under 15 min</option>
                        <option value="15-30">15-30 min</option>
                        <option value="30-60">30-60 min</option>
                        <option value="60+">Over 1 hour</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="rating-filter">Rating:</label>
                    <select id="rating-filter" class="filter-select">
                        <option value="">Any Rating</option>
                        <option value="4.5+">4.5+ Stars</option>
                        <option value="4.0+">4.0+ Stars</option>
                        <option value="3.5+">3.5+ Stars</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="tags-filter">Tags:</label>
                    <select id="tags-filter" class="filter-select">
                        <option value="">All Tags</option>
                        <option value="Healthy">Healthy</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Quick">Quick</option>
                        <option value="Comfort Food">Comfort Food</option>
                        <option value="Spicy">Spicy</option>
                    </select>
                </div>
            </div>
            
            <div class="sort-section">
                <div class="sort-group">
                    <label for="sort-select">Sort by:</label>
                    <select id="sort-select" class="sort-select">
                        <option value="relevance">Best Match</option>
                        <option value="rating">Highest Rated</option>
                        <option value="time-asc">Quickest First</option>
                        <option value="time-desc">Longest First</option>
                        <option value="difficulty">Easiest First</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
                
                <button class="clear-filters-btn" type="button" title="Clear all filters">
                    <span class="clear-icon">✕</span>
                    <span class="clear-text">Clear Filters</span>
                </button>
            </div>
        `;
        
        // Add event listeners for filtering and sorting
        this.setupRecipeControls(controls);
        
        return controls;
    }
    
    // Task 8: Setup event listeners for recipe controls
    setupRecipeControls(controls) {
        // Filter controls
        const filterSelects = controls.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            addEvent(select, 'change', () => this.applyFiltersAndSort());
        });
        
        // Sort control
        const sortSelect = controls.querySelector('.sort-select');
        addEvent(sortSelect, 'change', () => this.applyFiltersAndSort());
        
        // Clear filters button
        const clearBtn = controls.querySelector('.clear-filters-btn');
        addEvent(clearBtn, 'click', () => {
            filterSelects.forEach(select => select.value = '');
            sortSelect.value = 'relevance';
            this.applyFiltersAndSort();
            NotificationSystem.info('Filters cleared', { duration: 2000 });
        });
    }
    
    // Task 8: Apply filters and sorting
    applyFiltersAndSort() {
        if (!this.currentRecipes) return;
        
        let filteredRecipes = [...this.currentRecipes];
        
        // Apply filters
        const difficultyFilter = $('#difficulty-filter')?.value;
        const timeFilter = $('#time-filter')?.value;
        const ratingFilter = $('#rating-filter')?.value;
        const tagsFilter = $('#tags-filter')?.value;
        
        if (difficultyFilter) {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.difficulty === difficultyFilter
            );
        }
        
        if (timeFilter) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                const cookTimeMinutes = parseInt(recipe.cookTime);
                switch (timeFilter) {
                    case '0-15': return cookTimeMinutes <= 15;
                    case '15-30': return cookTimeMinutes > 15 && cookTimeMinutes <= 30;
                    case '30-60': return cookTimeMinutes > 30 && cookTimeMinutes <= 60;
                    case '60+': return cookTimeMinutes > 60;
                    default: return true;
                }
            });
        }
        
        if (ratingFilter) {
            const minRating = parseFloat(ratingFilter.replace('+', ''));
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.rating >= minRating
            );
        }
        
        if (tagsFilter) {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.tags.includes(tagsFilter)
            );
        }
        
        // Apply sorting
        const sortBy = $('#sort-select')?.value || 'relevance';
        filteredRecipes = this.sortRecipes(filteredRecipes, sortBy);
        
        // Re-render grid
        const grid = $('#recipe-grid');
        if (grid) {
            this.renderRecipeGrid(filteredRecipes, grid);
        }
        
        // Update results count
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            resultsCount.innerHTML = `Showing <strong>${filteredRecipes.length}</strong> of <strong>${this.currentRecipes.length}</strong> recipe${filteredRecipes.length !== 1 ? 's' : ''}`;
        }
    }
    
    // Task 8: Sort recipes by different criteria
    sortRecipes(recipes, sortBy) {
        switch (sortBy) {
            case 'rating':
                return recipes.sort((a, b) => b.rating - a.rating);
            case 'time-asc':
                return recipes.sort((a, b) => parseInt(a.cookTime) - parseInt(b.cookTime));
            case 'time-desc':
                return recipes.sort((a, b) => parseInt(b.cookTime) - parseInt(a.cookTime));
            case 'difficulty':
                const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return recipes.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
            case 'newest':
                return recipes.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            case 'relevance':
            default:
                return recipes.sort((a, b) => b.matchingIngredients - a.matchingIngredients);
        }
    }
    
    // Task 8: Render recipe grid with enhanced cards
    renderRecipeGrid(recipes, container) {
        container.innerHTML = '';
        
        if (recipes.length === 0) {
            container.innerHTML = `
                <div class="no-filtered-results">
                    <p>No recipes match your current filters.</p>
                    <button class="btn btn-secondary" onclick="document.querySelector('.clear-filters-btn').click()">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }
        
        recipes.forEach((recipe, index) => {
            const card = this.createRecipeCard(recipe, index);
            container.appendChild(card);
        });
        
        // Add staggered animation
        const cards = container.querySelectorAll('.recipe-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            addClass(card, 'fade-in-up');
        });
    }
    
    // Task 8: Create enhanced recipe card
    createRecipeCard(recipe, index) {
        const card = createElement('div', 'recipe-card interactive-element');
        card.setAttribute('data-recipe-id', recipe.id);
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Recipe: ${recipe.title}`);
        
        const stars = this.generateStarRating(recipe.rating);
        const difficultyColor = this.getDifficultyColor(recipe.difficulty);
        
        card.innerHTML = `
            <div class="recipe-image-container">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" loading="lazy">
                <div class="recipe-overlay">
                    <div class="recipe-quick-actions">
                        <button class="quick-action-btn favorite-btn" title="Save to favorites" aria-label="Save ${recipe.title} to favorites">
                            <span class="action-icon">♡</span>
                        </button>
                        <button class="quick-action-btn share-btn" title="Share recipe" aria-label="Share ${recipe.title}">
                            <span class="action-icon">↗</span>
                        </button>
                    </div>
                    <div class="recipe-badges">
                        <span class="difficulty-badge" style="background-color: ${difficultyColor}">${recipe.difficulty}</span>
                        ${recipe.tags.slice(0, 2).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="match-indicator">
                    <span class="match-percentage">${recipe.matchPercentage || 75}%</span>
                    <span class="match-label">Match</span>
                </div>
            </div>
            
            <div class="recipe-content">
                <div class="recipe-header">
                    <h4 class="recipe-title">${recipe.title}</h4>
                    <div class="recipe-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-text">${recipe.rating}</span>
                        <span class="review-count">(${recipe.reviewCount})</span>
                    </div>
                </div>
                
                <div class="recipe-meta">
                    <div class="meta-item">
                        <span class="meta-icon">⏱️</span>
                        <span class="meta-text">${recipe.cookTime}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">👥</span>
                        <span class="meta-text">${recipe.servings} servings</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🔥</span>
                        <span class="meta-text">${recipe.calories} cal</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🎯</span>
                        <span class="meta-text">${recipe.matchingIngredients} matches</span>
                    </div>
                </div>
                
                <p class="recipe-description">${recipe.description}</p>
                
                <div class="recipe-details">
                    <div class="prep-info">
                        <span class="prep-label">Prep:</span>
                        <span class="prep-time">${recipe.prepTime}</span>
                    </div>
                    <div class="cuisine-info">
                        <span class="cuisine-label">Cuisine:</span>
                        <span class="cuisine-type">${recipe.cuisine}</span>
                    </div>
                </div>
                
                <div class="recipe-actions">
                    <button class="btn btn-primary view-recipe-btn" data-recipe-id="${recipe.id}">
                        <span class="btn-icon">👁️</span>
                        <span class="btn-text">View Recipe</span>
                    </button>
                    <button class="btn btn-secondary add-to-meal-plan-btn" data-recipe-id="${recipe.id}">
                        <span class="btn-icon">📅</span>
                        <span class="btn-text">Add to Plan</span>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupRecipeCardEvents(card, recipe);
        
        return card;
    }
    
    // Task 8: Setup recipe card event listeners
    setupRecipeCardEvents(card, recipe) {
        // View recipe button
        const viewBtn = card.querySelector('.view-recipe-btn');
        addEvent(viewBtn, 'click', (e) => {
            e.stopPropagation();
            this.showRecipeDetails(recipe);
        });
        
        // Add to meal plan button
        const mealPlanBtn = card.querySelector('.add-to-meal-plan-btn');
        addEvent(mealPlanBtn, 'click', (e) => {
            e.stopPropagation();
            this.addToMealPlan(recipe);
        });
        
        // Favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        addEvent(favoriteBtn, 'click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(recipe, favoriteBtn);
        });
        
        // Share button
        const shareBtn = card.querySelector('.share-btn');
        addEvent(shareBtn, 'click', (e) => {
            e.stopPropagation();
            this.shareRecipe(recipe);
        });
        
        // Card click to view details
        addEvent(card, 'click', () => {
            this.showRecipeDetails(recipe);
        });
        
        // Keyboard support
        addEvent(card, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showRecipeDetails(recipe);
            }
        });
    }
    
    // Task 8: Switch between grid and list view
    switchView(view) {
        const grid = $('#recipe-grid');
        if (grid) {
            removeClass(grid, 'grid-view', 'list-view');
            addClass(grid, `${view}-view`);
        }
        
        NotificationSystem.info(`Switched to ${view} view`, { duration: 2000 });
    }
    
    // Task 8: Helper functions
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }
    
    getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'Easy': return '#27ae60';
            case 'Medium': return '#f39c12';
            case 'Hard': return '#e74c3c';
            default: return '#95a5a6';
        }
    }
    
    // Task 8: Recipe interaction methods
    showRecipeDetails(recipe) {
        // Create and show detailed recipe modal/view
        const modal = this.createRecipeModal(recipe);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => addClass(modal, 'show'), 10);
        
        // Track view
        console.log(`Viewing recipe: ${recipe.title}`);
    }
    
    addToMealPlan(recipe) {
        // Simulate adding to meal plan
        NotificationSystem.success(`"${recipe.title}" added to your meal plan!`, {
            title: 'Added to Meal Plan',
            duration: 3000
        });
        
        console.log(`Added to meal plan: ${recipe.title}`);
    }
    
    toggleFavorite(recipe, button) {
        const icon = button.querySelector('.action-icon');
        const isFavorited = icon.textContent === '♥';
        
        if (isFavorited) {
            icon.textContent = '♡';
            NotificationSystem.info(`Removed "${recipe.title}" from favorites`, {
                duration: 2000
            });
        } else {
            icon.textContent = '♥';
            addClass(button, 'favorited');
            NotificationSystem.success(`Added "${recipe.title}" to favorites!`, {
                duration: 2000
            });
        }
        
        console.log(`${isFavorited ? 'Removed from' : 'Added to'} favorites: ${recipe.title}`);
    }
    
    shareRecipe(recipe) {
        // Simulate sharing functionality
        if (navigator.share) {
            navigator.share({
                title: recipe.title,
                text: recipe.description,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const shareText = `Check out this recipe: ${recipe.title} - ${recipe.description}`;
            navigator.clipboard.writeText(shareText).then(() => {
                NotificationSystem.success('Recipe link copied to clipboard!', {
                    duration: 3000
                });
            });
        }
        
        console.log(`Shared recipe: ${recipe.title}`);
    }
    
    // Task 8: Create detailed recipe modal
    createRecipeModal(recipe) {
        const modal = createElement('div', 'recipe-modal');
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${recipe.title}</h2>
                    <button class="modal-close" aria-label="Close recipe details">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="recipe-hero">
                        <img src="${recipe.image}" alt="${recipe.title}" class="hero-image">
                        <div class="recipe-summary">
                            <div class="rating-section">
                                <div class="stars large">${this.generateStarRating(recipe.rating)}</div>
                                <span class="rating-value">${recipe.rating}/5</span>
                                <span class="review-count">(${recipe.reviewCount} reviews)</span>
                            </div>
                            
                            <div class="recipe-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Prep Time</span>
                                    <span class="stat-value">${recipe.prepTime}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Cook Time</span>
                                    <span class="stat-value">${recipe.cookTime}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Servings</span>
                                    <span class="stat-value">${recipe.servings}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Difficulty</span>
                                    <span class="stat-value">${recipe.difficulty}</span>
                                </div>
                            </div>
                            
                            <div class="nutrition-info">
                                <h4>Nutrition per serving</h4>
                                <div class="nutrition-grid">
                                    <div class="nutrition-item">
                                        <span class="nutrition-label">Calories</span>
                                        <span class="nutrition-value">${recipe.calories}</span>
                                    </div>
                                    <div class="nutrition-item">
                                        <span class="nutrition-label">Protein</span>
                                        <span class="nutrition-value">${recipe.nutrition.protein}</span>
                                    </div>
                                    <div class="nutrition-item">
                                        <span class="nutrition-label">Carbs</span>
                                        <span class="nutrition-value">${recipe.nutrition.carbs}</span>
                                    </div>
                                    <div class="nutrition-item">
                                        <span class="nutrition-label">Fat</span>
                                        <span class="nutrition-value">${recipe.nutrition.fat}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="recipe-tags">
                                ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="recipe-details-content">
                        <div class="ingredients-section">
                            <h3>Ingredients</h3>
                            <ul class="ingredients-list">
                                ${recipe.ingredients.map(ingredient => `
                                    <li class="ingredient-item">
                                        <input type="checkbox" class="ingredient-checkbox" id="ingredient-${recipe.id}-${recipe.ingredients.indexOf(ingredient)}">
                                        <label for="ingredient-${recipe.id}-${recipe.ingredients.indexOf(ingredient)}" class="ingredient-label">${ingredient}</label>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="instructions-section">
                            <h3>Instructions</h3>
                            <ol class="instructions-list">
                                ${recipe.instructions.map((instruction, index) => `
                                    <li class="instruction-item">
                                        <div class="step-number">${index + 1}</div>
                                        <div class="step-content">${instruction}</div>
                                    </li>
                                `).join('')}
                            </ol>
                        </div>
                    </div>
                    
                    <div class="recipe-footer">
                        <div class="recipe-author">
                            <span class="author-label">Recipe by:</span>
                            <span class="author-name">${recipe.author}</span>
                        </div>
                        
                        <div class="recipe-actions-modal">
                            <button class="btn btn-primary start-cooking-btn">
                                <span class="btn-icon">👨‍🍳</span>
                                <span class="btn-text">Start Cooking</span>
                            </button>
                            <button class="btn btn-secondary save-recipe-btn">
                                <span class="btn-icon">💾</span>
                                <span class="btn-text">Save Recipe</span>
                            </button>
                            <button class="btn btn-secondary print-recipe-btn">
                                <span class="btn-icon">🖨️</span>
                                <span class="btn-text">Print</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup modal event listeners
        this.setupModalEvents(modal, recipe);
        
        return modal;
    }
    
    // Task 8: Setup modal event listeners
    setupModalEvents(modal, recipe) {
        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => {
            removeClass(modal, 'show');
            setTimeout(() => modal.remove(), 300);
        };
        
        addEvent(closeBtn, 'click', closeModal);
        addEvent(backdrop, 'click', closeModal);
        
        // Escape key to close
        addEvent(document, 'keydown', (e) => {
            if (e.key === 'Escape' && modal.parentElement) {
                closeModal();
            }
        });
        
        // Modal action buttons
        const startCookingBtn = modal.querySelector('.start-cooking-btn');
        addEvent(startCookingBtn, 'click', () => {
            this.startCookingMode(recipe);
            closeModal();
        });
        
        const saveBtn = modal.querySelector('.save-recipe-btn');
        addEvent(saveBtn, 'click', () => {
            this.saveRecipe(recipe);
        });
        
        const printBtn = modal.querySelector('.print-recipe-btn');
        addEvent(printBtn, 'click', () => {
            this.printRecipe(recipe);
        });
        
        // Ingredient checkboxes
        const checkboxes = modal.querySelectorAll('.ingredient-checkbox');
        checkboxes.forEach(checkbox => {
            addEvent(checkbox, 'change', (e) => {
                const label = e.target.nextElementSibling;
                if (e.target.checked) {
                    addClass(label, 'checked');
                } else {
                    removeClass(label, 'checked');
                }
            });
        });
    }
    
    // Task 8: Recipe interaction methods for modal
    startCookingMode(recipe) {
        NotificationSystem.success(`Started cooking mode for "${recipe.title}"!`, {
            title: 'Cooking Mode',
            duration: 4000
        });
        console.log(`Started cooking: ${recipe.title}`);
    }
    
    saveRecipe(recipe) {
        NotificationSystem.success(`"${recipe.title}" saved to your recipe collection!`, {
            title: 'Recipe Saved',
            duration: 3000
        });
        console.log(`Saved recipe: ${recipe.title}`);
    }
    
    printRecipe(recipe) {
        // Create printable version
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${recipe.title} - Recipe</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #e67e22; }
                        .meta { background: #f8f9fa; padding: 15px; margin: 15px 0; }
                        .ingredients, .instructions { margin: 20px 0; }
                        li { margin: 8px 0; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <h1>${recipe.title}</h1>
                    <div class="meta">
                        <p><strong>Prep Time:</strong> ${recipe.prepTime} | <strong>Cook Time:</strong> ${recipe.cookTime} | <strong>Servings:</strong> ${recipe.servings}</p>
                        <p><strong>Difficulty:</strong> ${recipe.difficulty} | <strong>Cuisine:</strong> ${recipe.cuisine}</p>
                    </div>
                    <p>${recipe.description}</p>
                    <div class="ingredients">
                        <h2>Ingredients</h2>
                        <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
                    </div>
                    <div class="instructions">
                        <h2>Instructions</h2>
                        <ol>${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}</ol>
                    </div>
                    <p><em>Recipe by ${recipe.author}</em></p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        NotificationSystem.info('Print dialog opened', { duration: 2000 });
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
