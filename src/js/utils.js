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

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        $, $$, createElement, addEvent, removeEvent,
        toggleClass, addClass, removeClass, hasClass,
        debounce, throttle, storage, validators,
        animations, handleError, loading
    };
}
