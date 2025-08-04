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

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        $, $$, createElement, addEvent, removeEvent,
        toggleClass, addClass, removeClass, hasClass,
        debounce, throttle, storage, validators,
        animations, handleError, loading,
        ValidationSystem, ProgressSystem, LoadingOverlay,
        TooltipSystem, NotificationSystem, KeyboardNavigation,
        CharacterCounter
    };
}
