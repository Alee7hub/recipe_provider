// ===========================
// RECIPE PROVIDER - UTILITIES
// ===========================

/**
 * Utility functions for the Recipe Provider app
 */

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Element creation helper
const createElement = (tag, className = '', textContent = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
};

// Add event listener helper
const addEvent = (element, event, handler) => {
    if (element) {
        element.addEventListener(event, handler);
    }
};

// Remove event listener helper
const removeEvent = (element, event, handler) => {
    if (element) {
        element.removeEventListener(event, handler);
    }
};

// Toggle class utility
const toggleClass = (element, className) => {
    if (element) {
        element.classList.toggle(className);
    }
};

// Add class utility
const addClass = (element, className) => {
    if (element) {
        element.classList.add(className);
    }
};

// Remove class utility
const removeClass = (element, className) => {
    if (element) {
        element.classList.remove(className);
    }
};

// Check if element has class
const hasClass = (element, className) => {
    return element ? element.classList.contains(className) : false;
};

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for performance optimization
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Local storage utilities
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('Error parsing localStorage item:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Error removing localStorage item:', e);
        }
    }
};

// Validation utilities
const validators = {
    isEmpty: (value) => !value || value.trim().length === 0,
    
    isValidImageFile: (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return file && validTypes.includes(file.type);
    },
    
    isValidImageSize: (file, maxSizeMB = 5) => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file && file.size <= maxSizeBytes;
    }
};

// Animation utilities
const animations = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = performance.now();
        
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    fadeOut: (element, duration = 300) => {
        let start = performance.now();
        
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Error handling utility
const handleError = (error, userMessage = 'An error occurred') => {
    console.error('Application Error:', error);
    
    // Show user-friendly error message
    const errorContainer = $('#error-container');
    if (errorContainer) {
        errorContainer.textContent = userMessage;
        errorContainer.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
};

// Loading state utility
const loading = {
    show: (element) => {
        if (element) {
            addClass(element, 'loading');
        }
    },
    
    hide: (element) => {
        if (element) {
            removeClass(element, 'loading');
        }
    }
};

// ===========================
// TASK 7: ENHANCED UTILITIES
// ===========================

// Validation System
const ValidationSystem = {
    // Validation rules
    rules: {
        required: (value) => ({
            isValid: !validators.isEmpty(value),
            message: 'This field is required'
        }),
        
        minLength: (min) => (value) => ({
            isValid: !value || value.length >= min,
            message: `Must be at least ${min} characters long`
        }),
        
        maxLength: (max) => (value) => ({
            isValid: !value || value.length <= max,
            message: `Must be no more than ${max} characters long`
        }),
        
        ingredientList: (value) => {
            if (validators.isEmpty(value)) {
                return { isValid: false, message: 'Please add some ingredients' };
            }
            
            const ingredients = value.split(/[,\n]/).filter(item => item.trim());
            if (ingredients.length === 0) {
                return { isValid: false, message: 'Please add at least one ingredient' };
            }
            
            if (ingredients.length > 20) {
                return { isValid: false, message: 'Please limit to 20 ingredients maximum' };
            }
            
            return { isValid: true, message: `${ingredients.length} ingredients added` };
        },
        
        imageFile: (file) => {
            if (!file) {
                return { isValid: false, message: 'Please select an image file' };
            }
            
            if (!validators.isValidImageFile(file)) {
                return { isValid: false, message: 'Please select a valid image file (JPG, PNG, GIF, WebP)' };
            }
            
            if (!validators.isValidImageSize(file)) {
                return { isValid: false, message: 'Image size must be less than 5MB' };
            }
            
            return { isValid: true, message: 'Image is valid and ready to upload' };
        }
    },
    
    // Validate a field
    validateField: (element, rules, value = null) => {
        const fieldValue = value !== null ? value : (element.value || element.textContent || '');
        const results = [];
        
        for (const rule of rules) {
            const result = rule(fieldValue);
            results.push(result);
            if (!result.isValid) break; // Stop at first error
        }
        
        const finalResult = results[results.length - 1];
        ValidationSystem.showValidationState(element, finalResult);
        
        return finalResult;
    },
    
    // Show validation state on element
    showValidationState: (element, result) => {
        const formField = element.closest('.form-field') || element.parentElement;
        const existingMessage = formField.querySelector('.validation-message');
        
        // Remove existing state classes
        removeClass(formField, 'has-error', 'has-success', 'has-warning');
        
        // Remove existing validation message
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (result.isValid) {
            addClass(formField, 'has-success');
            ValidationSystem.showValidationMessage(formField, result.message, 'success');
            ValidationSystem.showSuccessIndicator(formField);
        } else {
            addClass(formField, 'has-error');
            ValidationSystem.showValidationMessage(formField, result.message, 'error');
        }
    },
    
    // Show validation message
    showValidationMessage: (container, message, type = 'error') => {
        const messageElement = createElement('div', `validation-message ${type}`);
        messageElement.innerHTML = `
            <span class="validation-icon">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span class="validation-text">${message}</span>
        `;
        
        container.appendChild(messageElement);
        
        // Fade in animation
        animations.fadeIn(messageElement, 200);
    },
    
    // Show success indicator
    showSuccessIndicator: (container) => {
        const existing = container.querySelector('.success-indicator');
        if (existing) existing.remove();
        
        const indicator = createElement('div', 'success-indicator');
        indicator.innerHTML = '✓';
        container.appendChild(indicator);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (indicator.parentElement) {
                animations.fadeOut(indicator, 200);
                setTimeout(() => indicator.remove(), 200);
            }
        }, 3000);
    }
};

// Progress System
const ProgressSystem = {
    create: (container, options = {}) => {
        const progressContainer = createElement('div', 'progress-container');
        const progressBar = createElement('div', 'progress-bar');
        
        if (options.indeterminate) {
            addClass(progressBar, 'indeterminate');
        }
        
        progressContainer.appendChild(progressBar);
        container.appendChild(progressContainer);
        
        return {
            element: progressContainer,
            bar: progressBar,
            setProgress: (percent) => {
                removeClass(progressBar, 'indeterminate');
                progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            },
            setIndeterminate: () => {
                addClass(progressBar, 'indeterminate');
            },
            remove: () => {
                if (progressContainer.parentElement) {
                    animations.fadeOut(progressContainer, 200);
                    setTimeout(() => progressContainer.remove(), 200);
                }
            }
        };
    }
};

// Loading Overlay System
const LoadingOverlay = {
    show: (element, message = 'Loading...') => {
        const existing = element.querySelector('.loading-overlay');
        if (existing) return existing;
        
        const overlay = createElement('div', 'loading-overlay');
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        element.style.position = 'relative';
        element.appendChild(overlay);
        animations.fadeIn(overlay, 200);
        
        return overlay;
    },
    
    hide: (element) => {
        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            animations.fadeOut(overlay, 200);
            setTimeout(() => overlay.remove(), 200);
        }
    },
    
    updateMessage: (element, message) => {
        const overlay = element.querySelector('.loading-overlay');
        const textElement = overlay?.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = message;
        }
    }
};

// Tooltip System
const TooltipSystem = {
    create: (element, content, options = {}) => {
        const container = createElement('div', 'tooltip-container');
        const tooltip = createElement('div', 'tooltip');
        tooltip.textContent = content;
        
        // Wrap element in container
        element.parentNode.insertBefore(container, element);
        container.appendChild(element);
        container.appendChild(tooltip);
        
        return {
            show: () => addClass(tooltip, 'show'),
            hide: () => removeClass(tooltip, 'show'),
            updateContent: (newContent) => tooltip.textContent = newContent,
            destroy: () => {
                container.parentNode.insertBefore(element, container);
                container.remove();
            }
        };
    },
    
    showTemporary: (element, content, duration = 2000) => {
        const tooltip = TooltipSystem.create(element, content);
        tooltip.show();
        
        setTimeout(() => {
            tooltip.hide();
            setTimeout(() => tooltip.destroy(), 200);
        }, duration);
        
        return tooltip;
    }
};

// Notification System
const NotificationSystem = {
    show: (message, type = 'info', options = {}) => {
        const { title = '', duration = 5000, actions = [] } = options;
        
        const notification = createElement('div', 'notification');
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || icons.info}</div>
                <div class="notification-text">
                    ${title ? `<div class="notification-title">${title}</div>` : ''}
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => addClass(notification, 'show'), 10);
        
        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        const closeNotification = () => {
            removeClass(notification, 'show');
            setTimeout(() => notification.remove(), 300);
        };
        
        addEvent(closeBtn, 'click', closeNotification);
        
        // Auto-close after duration
        if (duration > 0) {
            setTimeout(closeNotification, duration);
        }
        
        return { close: closeNotification };
    },
    
    success: (message, options = {}) => NotificationSystem.show(message, 'success', options),
    error: (message, options = {}) => NotificationSystem.show(message, 'error', options),
    warning: (message, options = {}) => NotificationSystem.show(message, 'warning', options),
    info: (message, options = {}) => NotificationSystem.show(message, 'info', options)
};

// Keyboard Navigation System
const KeyboardNavigation = {
    init: () => {
        // Add keyboard shortcuts
        addEvent(document, 'keydown', KeyboardNavigation.handleGlobalKeydown);
        
        // Enhance focus management
        KeyboardNavigation.enhanceFocusManagement();
    },
    
    handleGlobalKeydown: (e) => {
        // Ctrl+1,2,3 for input method switching
        if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
            e.preventDefault();
            const methods = ['text', 'image', 'voice'];
            const methodIndex = parseInt(e.key) - 1;
            
            if (window.recipeApp && methodIndex < methods.length) {
                window.recipeApp.handleInputMethodChange(methods[methodIndex]);
            }
        }
        
        // Ctrl+Enter to submit
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            const submitBtn = $('#find-recipes-btn');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
        
        // Escape to close modals/notifications
        if (e.key === 'Escape') {
            const notifications = document.querySelectorAll('.notification');
            notifications.forEach(n => {
                const closeBtn = n.querySelector('.notification-close');
                if (closeBtn) closeBtn.click();
            });
        }
    },
    
    enhanceFocusManagement: () => {
        // Add visible focus indicators
        addEvent(document, 'keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        addEvent(document, 'mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Focus trap for modals/overlays
        addEvent(document, 'keydown', (e) => {
            if (e.key === 'Tab') {
                const overlay = document.querySelector('.loading-overlay:not([style*="display: none"])');
                if (overlay) {
                    e.preventDefault(); // Prevent tabbing when loading
                }
            }
        });
    }
};

// Character Counter Utility
const CharacterCounter = {
    create: (inputElement, maxLength, options = {}) => {
        const { warningThreshold = 0.8, showAlways = false } = options;
        
        const counter = createElement('div', 'character-counter');
        inputElement.parentElement.appendChild(counter);
        
        const updateCounter = () => {
            const length = inputElement.value.length;
            const remaining = maxLength - length;
            
            counter.textContent = `${length}/${maxLength}`;
            
            // Remove existing state classes
            removeClass(counter, 'warning', 'error');
            
            // Add appropriate state class
            if (length > maxLength) {
                addClass(counter, 'error');
            } else if (length >= maxLength * warningThreshold) {
                addClass(counter, 'warning');
            }
            
            // Show/hide based on options
            if (showAlways || length > 0) {
                counter.style.display = 'block';
            } else {
                counter.style.display = 'none';
            }
        };
        
        addEvent(inputElement, 'input', updateCounter);
        addEvent(inputElement, 'keyup', updateCounter);
        
        // Initial update
        updateCounter();
        
        return {
            update: updateCounter,
            destroy: () => counter.remove()
        };
    }
};

// ===========================
// TASK 10: ADVANCED UI FEATURES
// ===========================

// Browser Compatibility Detection
const BrowserCompatibility = {
    // Feature detection
    features: {
        webSpeech: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        fileAPI: typeof window !== 'undefined' && 'FileReader' in window,
        dragDrop: typeof window !== 'undefined' && 'draggable' in document.createElement('div'),
        localStorage: typeof window !== 'undefined' && 'localStorage' in window,
        requestAnimationFrame: typeof window !== 'undefined' && 'requestAnimationFrame' in window,
        intersectionObserver: typeof window !== 'undefined' && 'IntersectionObserver' in window,
        webGL: (() => {
            if (typeof window === 'undefined') return false;
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            } catch (e) {
                return false;
            }
        })()
    },
    
    // Check if browser supports modern features
    isModernBrowser: () => {
        const requiredFeatures = ['fileAPI', 'localStorage', 'requestAnimationFrame'];
        return requiredFeatures.every(feature => BrowserCompatibility.features[feature]);
    },
    
    // Get browser info
    getBrowserInfo: () => {
        if (typeof window === 'undefined') return { name: 'unknown', version: 'unknown' };
        
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        
        if (userAgent.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
            browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
            browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.indexOf('Safari') > -1) {
            browserName = 'Safari';
            browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.indexOf('Edge') > -1) {
            browserName = 'Edge';
            browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        }
        
        return { name: browserName, version: browserVersion };
    },
    
    // Show compatibility warnings
    showCompatibilityWarnings: () => {
        const warnings = [];
        
        if (!BrowserCompatibility.features.webSpeech) {
            warnings.push('Voice input is not supported in this browser. Please use text or image input instead.');
        }
        
        if (!BrowserCompatibility.features.fileAPI) {
            warnings.push('File upload is not supported in this browser. Please use text or voice input instead.');
        }
        
        if (!BrowserCompatibility.isModernBrowser()) {
            warnings.push('Some features may not work properly in this browser. Please consider updating to a modern browser.');
        }
        
        warnings.forEach(warning => {
            NotificationSystem.warning(warning, {
                title: 'Browser Compatibility',
                duration: 8000
            });
        });
        
        return warnings;
    }
};

// Enhanced Fallback System for Task 12
const FallbackSystem = {
    // Initialize fallback options for all features
    init: () => {
        FallbackSystem.initVoiceFallback();
        FallbackSystem.initImageFallback();
        FallbackSystem.initFileAPIFallback();
        FallbackSystem.initLocalStorageFallback();
        console.log('Fallback systems initialized');
    },

    // Voice input fallback options
    initVoiceFallback: () => {
        if (!BrowserCompatibility.features.webSpeech) {
            // Add help text and alternative methods
            FallbackSystem.addVoiceAlternatives();
        }
    },

    // Image upload fallback options
    initImageFallback: () => {
        if (!BrowserCompatibility.features.fileAPI || !BrowserCompatibility.features.dragDrop) {
            FallbackSystem.addImageAlternatives();
        }
    },

    // File API fallback
    initFileAPIFallback: () => {
        if (!BrowserCompatibility.features.fileAPI) {
            FallbackSystem.addFileAPIAlternatives();
        }
    },

    // LocalStorage fallback
    initLocalStorageFallback: () => {
        if (!BrowserCompatibility.features.localStorage) {
            FallbackSystem.addStorageAlternatives();
        }
    },

    // Add voice input alternatives
    addVoiceAlternatives: () => {
        // Create alternative input suggestions when voice is not available
        const alternativeHelp = createElement('div', 'voice-fallback-help');
        alternativeHelp.innerHTML = `
            <div class="fallback-banner">
                <span class="fallback-icon">💡</span>
                <div class="fallback-content">
                    <strong>Voice input not available</strong>
                    <p>Try these alternatives:</p>
                    <ul>
                        <li>Use text input with ingredient suggestions</li>
                        <li>Upload photos of your ingredients</li>
                        <li>Use preset ingredient combinations</li>
                        <li>Type ingredients manually in the text area</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Store for later use when voice component loads
        window.voiceFallbackHelper = alternativeHelp;
    },

    // Add image upload alternatives
    addImageAlternatives: () => {
        const alternativeHelp = createElement('div', 'image-fallback-help');
        alternativeHelp.innerHTML = `
            <div class="fallback-banner">
                <span class="fallback-icon">📝</span>
                <div class="fallback-content">
                    <strong>Image upload not available</strong>
                    <p>Alternative ways to add ingredients:</p>
                    <ul>
                        <li>Type ingredients manually in the text input</li>
                        <li>Use voice input (if supported)</li>
                        <li>Browse preset ingredient combinations</li>
                        <li>Use the ingredient suggestions feature</li>
                    </ul>
                </div>
            </div>
        `;
        
        window.imageFallbackHelper = alternativeHelp;
    },

    // Add File API alternatives
    addFileAPIAlternatives: () => {
        NotificationSystem.warning(
            'File uploads are not supported in this browser. Please use text input or voice input instead.',
            {
                title: 'Feature Not Available',
                duration: 8000
            }
        );
    },

    // Add storage alternatives
    addStorageAlternatives: () => {
        console.warn('LocalStorage not available - using session-only storage');
        
        // Create session-only storage fallback
        window.sessionStorageFallback = {};
        
        // Override storage functions to use session fallback
        const originalStorage = { ...storage };
        
        storage.set = (key, value) => {
            try {
                window.sessionStorageFallback[key] = JSON.stringify(value);
            } catch (e) {
                console.warn('Session storage fallback failed:', e);
            }
        };
        
        storage.get = (key) => {
            try {
                const item = window.sessionStorageFallback[key];
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.warn('Session storage retrieval failed:', e);
                return null;
            }
        };
        
        storage.remove = (key) => {
            try {
                delete window.sessionStorageFallback[key];
            } catch (e) {
                console.warn('Session storage removal failed:', e);
            }
        };
        
        NotificationSystem.info(
            'Your preferences will not be saved between sessions in this browser.',
            {
                title: 'Limited Storage Available',
                duration: 6000
            }
        );
    },

    // Get fallback suggestions for a specific feature
    getSuggestions: (feature) => {
        const suggestions = {
            voice: [
                'Use the text input area to type your ingredients',
                'Upload photos of your ingredients instead',
                'Browse preset ingredient combinations',
                'Use the ingredient autocomplete feature'
            ],
            image: [
                'Type your ingredients in the text area',
                'Use voice input if available',
                'Select from preset ingredient combinations',
                'Use the ingredient suggestions feature'
            ],
            storage: [
                'Your data will only be available during this session',
                'Consider using a modern browser for better experience',
                'Bookmark this page to return easily'
            ]
        };
        
        return suggestions[feature] || [];
    },

    // Show progressive enhancement message
    showProgressiveEnhancement: (missingFeatures) => {
        if (missingFeatures.length === 0) return;
        
        const message = `Some advanced features are not available in your browser: ${missingFeatures.join(', ')}. The app will work with basic functionality.`;
        
        NotificationSystem.info(message, {
            title: 'Enhanced Features Unavailable',
            duration: 10000
        });
    },

    // Create graceful degradation for animations
    disableAnimations: () => {
        const style = createElement('style');
        style.textContent = `
            * {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('Animations disabled for performance/compatibility');
    },

    // Emergency text-only mode
    enableTextOnlyMode: () => {
        document.body.classList.add('text-only-mode');
        
        // Hide complex interactive elements
        const elementsToHide = [
            '.image-upload-container',
            '.voice-input-container',
            '.visual-feedback',
            '.animation-element'
        ];
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
            });
        });
        
        // Show text alternatives
        const textAlternative = createElement('div', 'text-only-banner');
        textAlternative.innerHTML = `
            <div class="emergency-mode-banner">
                <span class="banner-icon">📝</span>
                <div class="banner-content">
                    <strong>Text-Only Mode Active</strong>
                    <p>Using simplified interface for maximum compatibility.</p>
                </div>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(textAlternative, mainContent.firstChild);
        }
        
        NotificationSystem.info(
            'Switched to text-only mode for better compatibility with your browser.',
            {
                title: 'Compatibility Mode',
                duration: 8000
            }
        );
    }
};

// Image Optimization Utilities
const ImageOptimization = {
    // Compress image while maintaining quality
    compressImage: (file, maxWidth = 800, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        }));
                    },
                    file.type,
                    quality
                );
            };
            
            img.src = URL.createObjectURL(file);
        });
    },
    
    // Generate multiple image sizes for responsive loading
    generateResponsiveImages: async (file) => {
        const sizes = [
            { name: 'thumbnail', width: 150 },
            { name: 'small', width: 400 },
            { name: 'medium', width: 800 },
            { name: 'large', width: 1200 }
        ];
        
        const images = {};
        
        for (const size of sizes) {
            images[size.name] = await ImageOptimization.compressImage(file, size.width);
        }
        
        return images;
    },
    
    // Check if image needs optimization
    shouldOptimize: (file, maxSizeMB = 2) => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size > maxSizeBytes;
    }
};

// Performance Monitoring
const PerformanceMonitor = {
    // Track performance metrics
    metrics: {
        loadTime: 0,
        renderTime: 0,
        interactionTime: 0,
        memoryUsage: 0
    },
    
    // Start performance monitoring
    start: () => {
        if (typeof performance === 'undefined') return;
        
        PerformanceMonitor.metrics.loadTime = performance.now();
        
        // Monitor memory usage if available
        if (performance.memory) {
            PerformanceMonitor.metrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
        
        // Track first interaction
        const trackFirstInteraction = () => {
            PerformanceMonitor.metrics.interactionTime = performance.now() - PerformanceMonitor.metrics.loadTime;
            document.removeEventListener('click', trackFirstInteraction);
            document.removeEventListener('keydown', trackFirstInteraction);
        };
        
        document.addEventListener('click', trackFirstInteraction);
        document.addEventListener('keydown', trackFirstInteraction);
    },
    
    // Mark when app is ready
    markReady: () => {
        if (typeof performance === 'undefined') return;
        
        PerformanceMonitor.metrics.renderTime = performance.now() - PerformanceMonitor.metrics.loadTime;
        
        // Log performance metrics
        console.log('Performance Metrics:', PerformanceMonitor.metrics);
        
        // Show warning if performance is poor
        if (PerformanceMonitor.metrics.renderTime > 3000) {
            NotificationSystem.warning('The app took longer than expected to load. Consider refreshing if you experience issues.', {
                title: 'Performance Notice',
                duration: 5000
            });
        }
    },
    
    // Monitor resource usage
    monitorResources: () => {
        if (typeof performance === 'undefined' || !performance.getEntriesByType) return;
        
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 1000);
        
        if (slowResources.length > 0) {
            console.warn('Slow loading resources detected:', slowResources);
        }
        
        return {
            total: resources.length,
            slow: slowResources.length,
            resources: resources
        };
    }
};

// Lazy Loading System
const LazyLoading = {
    // Initialize intersection observer for lazy loading
    init: () => {
        if (!BrowserCompatibility.features.intersectionObserver) {
            // Fallback for browsers without IntersectionObserver
            LazyLoading.fallbackLazyLoad();
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        addClass(img, 'loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        // Observe all images with data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => observer.observe(img));
        
        return observer;
    },
    
    // Fallback lazy loading for older browsers
    fallbackLazyLoad: () => {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const loadImage = (img) => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                addClass(img, 'loaded');
            }
        };
        
        // Load images when they come into view
        const checkImages = throttle(() => {
            lazyImages.forEach(img => {
                if (img.getAttribute('data-src')) {
                    const rect = img.getBoundingClientRect();
                    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                    
                    if (rect.top < windowHeight + 50 && rect.bottom > -50) {
                        loadImage(img);
                    }
                }
            });
        }, 100);
        
        addEvent(window, 'scroll', checkImages);
        addEvent(window, 'resize', checkImages);
        
        // Initial check
        checkImages();
    }
};

// Accessibility Enhancements
const AccessibilityEnhancer = {
    // Initialize accessibility enhancements
    init: () => {
        AccessibilityEnhancer.addSkipLinks();
        AccessibilityEnhancer.enhanceFormAccessibility();
        AccessibilityEnhancer.addAriaLiveRegions();
        AccessibilityEnhancer.improveColorContrast();
        AccessibilityEnhancer.addReducedMotionSupport();
    },
    
    // Add skip links for screen readers
    addSkipLinks: () => {
        const skipLinks = createElement('div', 'skip-links');
        skipLinks.setAttribute('aria-label', 'Skip navigation links');
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#input-section" class="skip-link">Skip to ingredient input</a>
            <a href="#results-section" class="skip-link">Skip to recipe results</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add IDs to target sections
        const mainContent = $('.main-content');
        const inputSection = $('.input-section');
        const resultsSection = $('.recipe-results');
        
        if (mainContent) mainContent.id = 'main-content';
        if (inputSection) inputSection.id = 'input-section';
        if (resultsSection) resultsSection.id = 'results-section';
    },
    
    // Enhance form accessibility
    enhanceFormAccessibility: () => {
        // Add fieldsets and legends where appropriate
        const inputContainer = $('#input-container');
        if (inputContainer) {
            inputContainer.setAttribute('role', 'group');
            inputContainer.setAttribute('aria-labelledby', 'input-section-heading');
        }
        
        // Enhance error announcements
        const announcer = createElement('div', 'screen-reader-announcer');
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);
        
        window.announceToScreenReader = (message) => {
            announcer.textContent = message;
            setTimeout(() => announcer.textContent = '', 1000);
        };
    },
    
    // Add ARIA live regions for dynamic content
    addAriaLiveRegions: () => {
        const statusRegion = createElement('div', 'status-region');
        statusRegion.setAttribute('aria-live', 'polite');
        statusRegion.setAttribute('aria-atomic', 'false');
        statusRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(statusRegion);
        
        window.announceStatus = (message) => {
            statusRegion.textContent = message;
        };
    },
    
    // Improve color contrast
    improveColorContrast: () => {
        // Add high contrast mode detection
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Monitor contrast preference changes
        if (window.matchMedia) {
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addListener(e => {
                if (e.matches) {
                    document.body.classList.add('high-contrast');
                } else {
                    document.body.classList.remove('high-contrast');
                }
            });
        }
    },
    
    // Add reduced motion support
    addReducedMotionSupport: () => {
        // Respect user's motion preferences
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // Monitor motion preference changes
        if (window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addListener(e => {
                if (e.matches) {
                    document.body.classList.add('reduced-motion');
                } else {
                    document.body.classList.remove('reduced-motion');
                }
            });
        }
    }
};

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        $, $$, createElement, addEvent, removeEvent,
        toggleClass, addClass, removeClass, hasClass,
        debounce, throttle, storage, validators,
        animations, handleError, loading,
        ValidationSystem, ProgressSystem, LoadingOverlay,
        TooltipSystem, NotificationSystem, KeyboardNavigation,
        CharacterCounter, BrowserCompatibility, FallbackSystem, ImageOptimization,
        PerformanceMonitor, LazyLoading, AccessibilityEnhancer
    };
}
