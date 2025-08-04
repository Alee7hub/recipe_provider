// ===========================
// RECIPE PROVIDER - COMPONENTS
// ===========================

/**
 * Component classes for the Recipe Provider app
 */

// Base Component class
class Component {
    constructor(container) {
        this.container = container;
        this.element = null;
    }
    
    render() {
        throw new Error('render() method must be implemented');
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Input Method Selector Component
class InputMethodSelector extends Component {
    constructor(container, onMethodChange) {
        super(container);
        this.onMethodChange = onMethodChange;
        this.activeMethod = 'text';
        this.isTransitioning = false;
        this.render();
    }
    
    render() {
        this.element = createElement('div', 'input-method-selector');
        
        // Create tab container
        const tabContainer = createElement('div', 'input-tabs');
        
        const methods = [
            { 
                id: 'text', 
                label: 'Type Ingredients', 
                icon: '📝',
                description: 'Type your ingredients manually',
                shortcut: 'Ctrl+1'
            },
            { 
                id: 'image', 
                label: 'Upload Photo', 
                icon: '📷',
                description: 'Upload an image of your ingredients',
                shortcut: 'Ctrl+2'
            },
            { 
                id: 'voice', 
                label: 'Voice Input', 
                icon: '🎤',
                description: 'Speak your ingredients aloud',
                shortcut: 'Ctrl+3'
            }
        ];
        
        methods.forEach((method, index) => {
            const tab = createElement('button', 'input-tab');
            if (method.id === this.activeMethod) {
                addClass(tab, 'active');
            }
            
            tab.innerHTML = `
                <span class="tab-icon">${method.icon}</span>
                <span class="tab-content">
                    <span class="tab-label">${method.label}</span>
                    <span class="tab-description">${method.description}</span>
                </span>
                <span class="tab-shortcut">${method.shortcut}</span>
            `;
            
            tab.setAttribute('data-method', method.id);
            tab.setAttribute('aria-label', `${method.label}: ${method.description}`);
            tab.setAttribute('title', `${method.label} (${method.shortcut})`);
            tab.setAttribute('role', 'tab');
            tab.setAttribute('tabindex', method.id === this.activeMethod ? '0' : '-1');
            
            addEvent(tab, 'click', () => this.selectMethod(method.id));
            addEvent(tab, 'keydown', (e) => this.handleKeyDown(e, method.id, index));
            
            tabContainer.appendChild(tab);
        });
        
        // Add visual indicator bar
        const indicator = createElement('div', 'tab-indicator');
        tabContainer.appendChild(indicator);
        
        // Create info section
        const infoSection = createElement('div', 'input-method-info');
        infoSection.innerHTML = `
            <div class="method-info-content">
                <p class="current-method-description">
                    Select an input method above to get started
                </p>
                <div class="method-shortcuts">
                    <span class="shortcut-hint">💡 Use keyboard shortcuts: Ctrl+1 (Text), Ctrl+2 (Image), Ctrl+3 (Voice)</span>
                </div>
            </div>
        `;
        
        this.element.appendChild(tabContainer);
        this.element.appendChild(infoSection);
        this.container.appendChild(this.element);
        
        // Store references
        this.tabContainer = tabContainer;
        this.indicator = indicator;
        this.infoContent = infoSection.querySelector('.current-method-description');
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize indicator position
        this.updateIndicator();
        this.updateInfo(this.activeMethod);
    }
    
    setupKeyboardShortcuts() {
        addEvent(document, 'keydown', (e) => {
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.selectMethod('text');
                        break;
                    case '2':
                        e.preventDefault();
                        this.selectMethod('image');
                        break;
                    case '3':
                        e.preventDefault();
                        this.selectMethod('voice');
                        break;
                }
            }
        });
    }
    
    handleKeyDown(e, methodId, index) {
        const tabs = $$('.input-tab');
        let newIndex = index;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = index > 0 ? index - 1 : tabs.length - 1;
                tabs[newIndex].focus();
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = index < tabs.length - 1 ? index + 1 : 0;
                tabs[newIndex].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectMethod(methodId);
                break;
            case 'Home':
                e.preventDefault();
                tabs[0].focus();
                break;
            case 'End':
                e.preventDefault();
                tabs[tabs.length - 1].focus();
                break;
        }
    }
    
    selectMethod(methodId) {
        if (this.isTransitioning || methodId === this.activeMethod) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Add transition class to container
        addClass(this.element, 'transitioning');
        
        // Update tabs
        const previousTab = $(`.input-tab[data-method="${this.activeMethod}"]`);
        const newTab = $(`.input-tab[data-method="${methodId}"]`);
        
        if (previousTab) {
            removeClass(previousTab, 'active');
            previousTab.setAttribute('tabindex', '-1');
        }
        
        if (newTab) {
            addClass(newTab, 'active');
            newTab.setAttribute('tabindex', '0');
            newTab.focus();
        }
        
        this.activeMethod = methodId;
        
        // Update indicator and info
        this.updateIndicator();
        this.updateInfo(methodId);
        
        // Trigger callback with animation
        setTimeout(() => {
            if (this.onMethodChange) {
                this.onMethodChange(methodId);
            }
            
            // Remove transition class
            setTimeout(() => {
                removeClass(this.element, 'transitioning');
                this.isTransitioning = false;
            }, 300);
        }, 150);
    }
    
    updateIndicator() {
        if (!this.indicator) return;
        
        const activeTab = $(`.input-tab[data-method="${this.activeMethod}"]`);
        if (!activeTab) return;
        
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = this.tabContainer.getBoundingClientRect();
        
        const leftPosition = tabRect.left - containerRect.left;
        const width = tabRect.width;
        
        this.indicator.style.transform = `translateX(${leftPosition}px)`;
        this.indicator.style.width = `${width}px`;
    }
    
    updateInfo(methodId) {
        if (!this.infoContent) return;
        
        const methodInfo = {
            text: 'Type or paste your ingredients separated by commas. Perfect for when you know exactly what you have.',
            image: 'Upload a photo of your ingredients and let our system identify them automatically.',
            voice: 'Speak your ingredients naturally and our voice recognition will capture them for you.'
        };
        
        // Fade out current content
        addClass(this.infoContent, 'fade-out');
        
        setTimeout(() => {
            this.infoContent.textContent = methodInfo[methodId] || 'Select an input method to continue';
            removeClass(this.infoContent, 'fade-out');
        }, 150);
    }
    
    getValue() {
        return this.activeMethod;
    }
    
    setMethod(methodId) {
        this.selectMethod(methodId);
    }
    
    destroy() {
        // Clean up event listeners
        this.isTransitioning = false;
        super.destroy();
    }
}

// Text Input Component
class TextInputComponent extends Component {
    constructor(container) {
        super(container);
        this.value = '';
        this.maxLength = 500;
        this.render();
    }
    
    render() {
        this.element = createElement('div', 'text-input-container');
        
        // Create header with instructions
        const header = createElement('div', 'input-header');
        header.innerHTML = `
            <h4>📝 Type Your Ingredients</h4>
            <p>Enter the ingredients you have available, separated by commas</p>
        `;
        
        // Create main textarea
        const textarea = createElement('textarea', 'text-input-area');
        textarea.placeholder = 'Enter your available ingredients (e.g., tomatoes, cheese, pasta, chicken, onions, garlic...)';
        textarea.rows = 6;
        textarea.maxLength = this.maxLength;
        textarea.setAttribute('aria-label', 'Enter your available ingredients');
        
        // Create helpful hints section
        const hintsSection = createElement('div', 'input-hints');
        hintsSection.innerHTML = `
            <div class="hints-title">💡 Helpful Tips:</div>
            <ul class="hints-list">
                <li>Separate ingredients with commas</li>
                <li>Be specific (e.g., "fresh basil" instead of just "herbs")</li>
                <li>Include quantities if you prefer (e.g., "2 tomatoes")</li>
                <li>Don't worry about exact spelling - we'll understand!</li>
            </ul>
        `;
        
        // Create character counter
        const counterSection = createElement('div', 'input-counter');
        counterSection.innerHTML = `
            <span class="char-count">0</span>/<span class="char-limit">${this.maxLength}</span> characters
        `;
        
        // Create suggestions section
        const suggestionsSection = createElement('div', 'input-suggestions');
        suggestionsSection.innerHTML = `
            <div class="suggestions-title">🔤 Quick Add:</div>
            <div class="suggestions-tags" role="list" aria-label="Common ingredient suggestions">
                ${this.getCommonIngredients().map(ingredient => 
                    `<button class="suggestion-tag" type="button" data-ingredient="${ingredient}" aria-label="Add ${ingredient}">${ingredient}</button>`
                ).join('')}
            </div>
        `;
        
        // Event listeners
        addEvent(textarea, 'input', (e) => {
            this.value = e.target.value;
            this.updateCharacterCount();
            this.validateInput();
        });
        
        addEvent(textarea, 'paste', (e) => {
            // Small delay to let paste complete
            setTimeout(() => {
                this.value = textarea.value;
                this.updateCharacterCount();
                this.validateInput();
            }, 10);
        });
        
        // Add suggestion tag click handlers
        addEvent(suggestionsSection, 'click', (e) => {
            if (e.target.classList.contains('suggestion-tag')) {
                const ingredient = e.target.getAttribute('data-ingredient');
                this.addIngredient(ingredient);
            }
        });
        
        // Store references
        this.textarea = textarea;
        this.counterElement = counterSection.querySelector('.char-count');
        
        // Append all elements
        this.element.appendChild(header);
        this.element.appendChild(textarea);
        this.element.appendChild(counterSection);
        this.element.appendChild(hintsSection);
        this.element.appendChild(suggestionsSection);
        
        this.container.appendChild(this.element);
    }
    
    getCommonIngredients() {
        return [
            'tomatoes', 'onions', 'garlic', 'cheese', 'chicken', 'pasta', 
            'rice', 'eggs', 'milk', 'bread', 'potatoes', 'carrots',
            'bell peppers', 'mushrooms', 'spinach', 'ground beef'
        ];
    }
    
    addIngredient(ingredient) {
        const currentValue = this.textarea.value.trim();
        const ingredients = currentValue ? currentValue.split(',').map(i => i.trim()) : [];
        
        // Check if ingredient already exists
        const normalizedIngredients = ingredients.map(i => i.toLowerCase());
        if (!normalizedIngredients.includes(ingredient.toLowerCase())) {
            ingredients.push(ingredient);
            this.textarea.value = ingredients.join(', ');
            this.value = this.textarea.value;
            this.updateCharacterCount();
            this.validateInput();
            
            // Focus back to textarea
            this.textarea.focus();
        }
    }
    
    updateCharacterCount() {
        const length = this.textarea.value.length;
        this.counterElement.textContent = length;
        
        // Update counter color based on usage
        const counterSection = this.counterElement.parentElement;
        removeClass(counterSection, 'warning danger');
        
        if (length > this.maxLength * 0.9) {
            addClass(counterSection, 'danger');
        } else if (length > this.maxLength * 0.75) {
            addClass(counterSection, 'warning');
        }
    }
    
    validateInput() {
        const value = this.textarea.value.trim();
        const isValid = value.length > 0 && value.length <= this.maxLength;
        
        // Update textarea styling
        removeClass(this.textarea, 'invalid valid');
        if (value.length > 0) {
            addClass(this.textarea, isValid ? 'valid' : 'invalid');
        }
        
        return isValid;
    }
    
    getValue() {
        return this.value.trim();
    }
    
    getIngredientsArray() {
        const value = this.getValue();
        return value ? value.split(',').map(ingredient => ingredient.trim()).filter(ingredient => ingredient.length > 0) : [];
    }
    
    clear() {
        if (this.textarea) {
            this.textarea.value = '';
            this.value = '';
            this.updateCharacterCount();
            removeClass(this.textarea, 'invalid valid');
        }
    }
}

// Image Upload Component
class ImageUploadComponent extends Component {
    constructor(container) {
        super(container);
        this.uploadedFiles = [];
        this.maxFiles = 5;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.isUploading = false;
        this.render();
    }
    
    render() {
        this.element = createElement('div', 'image-upload-container');
        
        // Create header with instructions
        const header = createElement('div', 'input-header');
        header.innerHTML = `
            <h4>📷 Upload Photos</h4>
            <p>Share photos of your fridge, pantry, or ingredients</p>
        `;
        
        // Create upload area
        const uploadArea = createElement('div', 'image-upload-area');
        uploadArea.setAttribute('role', 'button');
        uploadArea.setAttribute('tabindex', '0');
        uploadArea.setAttribute('aria-label', 'Upload images by clicking or dragging files here');
        uploadArea.innerHTML = `
            <div class="upload-content">
                <div class="upload-icon">📷</div>
                <div class="upload-text">Drag & drop photos here</div>
                <div class="upload-subtext">or click to browse</div>
                <div class="upload-formats">JPG, PNG, GIF up to 5MB each</div>
                <div class="upload-limit">Maximum ${this.maxFiles} photos</div>
            </div>
        `;
        
        // Create hidden file input
        const fileInput = createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
        fileInput.style.display = 'none';
        fileInput.setAttribute('aria-label', 'Select image files');
        
        // Create upload tips
        const tipsSection = createElement('div', 'upload-tips');
        tipsSection.innerHTML = `
            <div class="tips-title">📸 Photo Tips:</div>
            <ul class="tips-list">
                <li>Take clear, well-lit photos</li>
                <li>Show ingredient labels clearly</li>
                <li>Include multiple angles if helpful</li>
                <li>Don't worry about organization - we'll identify everything!</li>
            </ul>
        `;
        
        // Create progress indicator
        const progressSection = createElement('div', 'upload-progress hidden');
        progressSection.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Uploading...</div>
        `;
        
        // Event listeners
        addEvent(uploadArea, 'click', () => {
            if (!this.isUploading && this.uploadedFiles.length < this.maxFiles) {
                fileInput.click();
            }
        });
        
        addEvent(uploadArea, 'keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !this.isUploading && this.uploadedFiles.length < this.maxFiles) {
                e.preventDefault();
                fileInput.click();
            }
        });
        
        addEvent(fileInput, 'change', (e) => this.handleFiles(e.target.files));
        
        // Drag and drop events
        addEvent(uploadArea, 'dragover', (e) => {
            e.preventDefault();
            if (!this.isUploading && this.uploadedFiles.length < this.maxFiles) {
                addClass(uploadArea, 'dragover');
            }
        });
        
        addEvent(uploadArea, 'dragleave', (e) => {
            // Only remove dragover if we're actually leaving the upload area
            if (!uploadArea.contains(e.relatedTarget)) {
                removeClass(uploadArea, 'dragover');
            }
        });
        
        addEvent(uploadArea, 'drop', (e) => {
            e.preventDefault();
            removeClass(uploadArea, 'dragover');
            if (!this.isUploading && this.uploadedFiles.length < this.maxFiles) {
                this.handleFiles(e.dataTransfer.files);
            }
        });
        
        // Store references
        this.uploadArea = uploadArea;
        this.fileInput = fileInput;
        this.progressSection = progressSection;
        
        // Append elements
        this.element.appendChild(header);
        this.element.appendChild(uploadArea);
        this.element.appendChild(progressSection);
        this.element.appendChild(tipsSection);
        this.element.appendChild(fileInput);
        
        this.container.appendChild(this.element);
    }
    
    handleFiles(files) {
        if (this.isUploading) return;
        
        const remainingSlots = this.maxFiles - this.uploadedFiles.length;
        if (remainingSlots <= 0) {
            handleError(null, `Maximum ${this.maxFiles} photos allowed`);
            return;
        }
        
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        const validFiles = [];
        
        for (const file of filesToProcess) {
            if (!validators.isValidImageFile(file)) {
                handleError(null, `${file.name} is not a valid image file`);
                continue;
            }
            if (file.size > this.maxFileSize) {
                handleError(null, `${file.name} is too large (max 5MB)`);
                continue;
            }
            validFiles.push(file);
        }
        
        if (validFiles.length > 0) {
            this.uploadFiles(validFiles);
        }
        
        // Clear file input
        this.fileInput.value = '';
    }
    
    async uploadFiles(files) {
        this.isUploading = true;
        this.showProgress();
        
        try {
            // Simulate upload progress
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Update progress
                const progress = ((i + 1) / files.length) * 100;
                this.updateProgress(progress, `Uploading ${file.name}...`);
                
                // Simulate upload delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Add file to uploaded files
                this.uploadedFiles.push(file);
            }
            
            this.hideProgress();
            this.displayUploadedFiles();
            this.updateUploadAreaState();
            
        } catch (error) {
            handleError(error, 'Failed to upload files');
            this.hideProgress();
        } finally {
            this.isUploading = false;
        }
    }
    
    showProgress() {
        removeClass(this.progressSection, 'hidden');
        addClass(this.uploadArea, 'uploading');
    }
    
    hideProgress() {
        addClass(this.progressSection, 'hidden');
        removeClass(this.uploadArea, 'uploading');
    }
    
    updateProgress(percentage, text) {
        const progressFill = this.progressSection.querySelector('.progress-fill');
        const progressText = this.progressSection.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = text;
        }
    }
    
    updateUploadAreaState() {
        const isMaxFiles = this.uploadedFiles.length >= this.maxFiles;
        const hasFiles = this.uploadedFiles.length > 0;
        
        // Update upload area content
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        if (isMaxFiles) {
            uploadContent.innerHTML = `
                <div class="upload-icon">✅</div>
                <div class="upload-text">Maximum photos uploaded</div>
                <div class="upload-subtext">Remove photos to add more</div>
            `;
            addClass(this.uploadArea, 'disabled');
        } else if (hasFiles) {
            uploadContent.innerHTML = `
                <div class="upload-icon">📷</div>
                <div class="upload-text">Add more photos</div>
                <div class="upload-subtext">Click or drag to add more</div>
                <div class="upload-formats">${this.maxFiles - this.uploadedFiles.length} more allowed</div>
            `;
            removeClass(this.uploadArea, 'disabled');
        }
    }
    
    displayUploadedFiles() {
        let previewContainer = this.element.querySelector('.preview-container');
        
        if (!previewContainer && this.uploadedFiles.length > 0) {
            previewContainer = createElement('div', 'preview-container');
            // Insert after upload area
            this.uploadArea.parentNode.insertBefore(previewContainer, this.uploadArea.nextSibling);
        }
        
        if (!previewContainer) return;
        
        previewContainer.innerHTML = '';
        
        if (this.uploadedFiles.length === 0) {
            previewContainer.remove();
            return;
        }
        
        // Add container header
        const header = createElement('div', 'preview-header');
        header.innerHTML = `
            <h5>📋 Uploaded Photos (${this.uploadedFiles.length}/${this.maxFiles})</h5>
            <button class="clear-all-btn" type="button" aria-label="Remove all photos">Clear All</button>
        `;
        
        addEvent(header.querySelector('.clear-all-btn'), 'click', () => this.clearAll());
        previewContainer.appendChild(header);
        
        // Add file previews
        const previewGrid = createElement('div', 'preview-grid');
        
        this.uploadedFiles.forEach((file, index) => {
            const preview = createElement('div', 'file-preview');
            preview.innerHTML = `
                <div class="preview-image-container">
                    <img src="${URL.createObjectURL(file)}" alt="Uploaded image ${index + 1}" class="preview-image">
                    <button class="remove-file" data-index="${index}" type="button" aria-label="Remove ${file.name}">×</button>
                </div>
                <div class="preview-info">
                    <span class="file-name" title="${file.name}">${this.truncateFileName(file.name)}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                </div>
            `;
            
            const removeBtn = preview.querySelector('.remove-file');
            addEvent(removeBtn, 'click', (e) => {
                e.stopPropagation();
                this.removeFile(index);
            });
            
            previewGrid.appendChild(preview);
        });
        
        previewContainer.appendChild(previewGrid);
    }
    
    truncateFileName(fileName, maxLength = 15) {
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.split('.').pop();
        const name = fileName.substring(0, fileName.lastIndexOf('.'));
        const truncatedName = name.substring(0, maxLength - extension.length - 4) + '...';
        return `${truncatedName}.${extension}`;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    removeFile(index) {
        if (index >= 0 && index < this.uploadedFiles.length) {
            // Revoke object URL to prevent memory leaks
            const file = this.uploadedFiles[index];
            URL.revokeObjectURL(URL.createObjectURL(file));
            
            this.uploadedFiles.splice(index, 1);
            this.displayUploadedFiles();
            this.updateUploadAreaState();
        }
    }
    
    clearAll() {
        // Revoke all object URLs
        this.uploadedFiles.forEach(file => {
            URL.revokeObjectURL(URL.createObjectURL(file));
        });
        
        this.uploadedFiles = [];
        this.displayUploadedFiles();
        this.updateUploadAreaState();
        
        // Reset upload area to original state
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        uploadContent.innerHTML = `
            <div class="upload-icon">📷</div>
            <div class="upload-text">Drag & drop photos here</div>
            <div class="upload-subtext">or click to browse</div>
            <div class="upload-formats">JPG, PNG, GIF up to 5MB each</div>
            <div class="upload-limit">Maximum ${this.maxFiles} photos</div>
        `;
        removeClass(this.uploadArea, 'disabled');
    }
    
    getValue() {
        return this.uploadedFiles;
    }
    
    clear() {
        this.clearAll();
    }
}

// Voice Input Component
class VoiceInputComponent extends Component {
    constructor(container) {
        super(container);
        this.recognition = null;
        this.isRecording = false;
        this.isSupported = false;
        this.transcript = '';
        this.finalTranscript = '';
        this.confidence = 0;
        this.recordingTimeout = null;
        this.initSpeechRecognition();
        this.render();
    }
    
    initSpeechRecognition() {
        // Enhanced browser compatibility check
        this.isSupported = this.checkBrowserSupport();
        
        if (this.isSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Enhanced configuration
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;
            
            this.setupEventHandlers();
        }
    }
    
    checkBrowserSupport() {
        const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        if (!isSupported) {
            console.warn('Web Speech API not supported in this browser');
        }
        
        return isSupported;
    }
    
    setupEventHandlers() {
        this.recognition.onstart = () => {
            this.updateStatus('Listening... Speak now', 'listening');
            this.startVisualFeedback();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            let maxConfidence = 0;
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                const confidence = result[0].confidence || 0;
                
                if (result.isFinal) {
                    finalTranscript += transcript;
                    maxConfidence = Math.max(maxConfidence, confidence);
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.finalTranscript += finalTranscript;
                this.confidence = maxConfidence;
                this.updateStatus(`Confidence: ${Math.round(maxConfidence * 100)}%`, 'confident');
            }
            
            this.transcript = this.finalTranscript + interimTranscript;
            this.updateTranscript(this.transcript, interimTranscript);
            
            // Auto-stop after period of silence
            this.resetRecordingTimeout();
        };
        
        this.recognition.onerror = (event) => {
            const errorMessages = {
                'network': 'Network error occurred. Please check your connection.',
                'not-allowed': 'Microphone access denied. Please allow microphone access.',
                'no-speech': 'No speech detected. Please try again.',
                'audio-capture': 'No microphone found. Please connect a microphone.',
                'service-not-allowed': 'Speech recognition service not allowed.',
                'bad-grammar': 'Grammar error in speech recognition.',
                'language-not-supported': 'Language not supported.'
            };
            
            const errorMessage = errorMessages[event.error] || `Voice recognition error: ${event.error}`;
            this.updateStatus(errorMessage, 'error');
            handleError(event.error, errorMessage);
            this.stopRecording();
        };
        
        this.recognition.onend = () => {
            if (this.isRecording) {
                this.stopRecording();
            }
        };
        
        this.recognition.onsoundstart = () => {
            this.updateStatus('Sound detected...', 'detecting');
        };
        
        this.recognition.onspeechstart = () => {
            this.updateStatus('Speech detected. Keep talking...', 'speaking');
        };
        
        this.recognition.onspeechend = () => {
            this.updateStatus('Speech ended. Processing...', 'processing');
        };
    }
    
    render() {
        this.element = createElement('div', 'voice-input-container');
        
        // Browser support message
        if (!this.isSupported) {
            const unsupportedMsg = createElement('div', 'voice-unsupported');
            unsupportedMsg.innerHTML = `
                <div class="unsupported-icon">🚫</div>
                <div class="unsupported-text">
                    <p>Voice input is not supported in your browser.</p>
                    <p>Try using Chrome, Edge, or Safari for voice features.</p>
                </div>
            `;
            this.element.appendChild(unsupportedMsg);
            this.container.appendChild(this.element);
            return;
        }
        
        // Header section
        const header = createElement('div', 'voice-input-header');
        const title = createElement('h3', 'voice-input-title');
        title.textContent = 'Voice Input';
        
        const helpButton = createElement('button', 'voice-help-button');
        helpButton.innerHTML = '❓';
        helpButton.title = 'Voice input help';
        addEvent(helpButton, 'click', () => this.showHelp());
        
        header.appendChild(title);
        header.appendChild(helpButton);
        
        // Main voice input area
        const voiceArea = createElement('div', 'voice-input-area');
        
        // Microphone button with enhanced visual feedback
        const micContainer = createElement('div', 'mic-container');
        const micButton = createElement('button', 'mic-button');
        micButton.innerHTML = `
            <span class="mic-icon">🎤</span>
            <span class="mic-text">Start Recording</span>
        `;
        micButton.title = 'Click to start/stop voice input';
        micButton.setAttribute('aria-label', 'Voice input microphone button');
        
        // Visual feedback indicators
        const visualFeedback = createElement('div', 'voice-visual-feedback');
        for (let i = 0; i < 5; i++) {
            const bar = createElement('div', 'feedback-bar');
            visualFeedback.appendChild(bar);
        }
        
        micContainer.appendChild(micButton);
        micContainer.appendChild(visualFeedback);
        
        // Status display with enhanced feedback
        const statusContainer = createElement('div', 'voice-status-container');
        const status = createElement('div', 'voice-status');
        status.textContent = 'Click the microphone to start speaking';
        status.setAttribute('aria-live', 'polite');
        
        const confidenceBar = createElement('div', 'confidence-bar-container');
        confidenceBar.innerHTML = `
            <label>Recognition Confidence:</label>
            <div class="confidence-bar">
                <div class="confidence-fill"></div>
            </div>
            <span class="confidence-text">0%</span>
        `;
        
        statusContainer.appendChild(status);
        statusContainer.appendChild(confidenceBar);
        
        // Enhanced transcript display
        const transcriptContainer = createElement('div', 'voice-transcript-container');
        const transcriptLabel = createElement('label', 'transcript-label');
        transcriptLabel.textContent = 'Transcript:';
        
        const transcript = createElement('div', 'voice-transcript');
        transcript.innerHTML = `
            <div class="transcript-final"></div>
            <div class="transcript-interim"></div>
            <div class="transcript-placeholder">Your spoken ingredients will appear here...</div>
        `;
        transcript.setAttribute('aria-live', 'polite');
        
        // Control buttons
        const controls = createElement('div', 'voice-controls');
        const clearButton = createElement('button', 'voice-clear-button');
        clearButton.innerHTML = '🗑️ Clear';
        clearButton.title = 'Clear transcript';
        
        const copyButton = createElement('button', 'voice-copy-button');
        copyButton.innerHTML = '📋 Copy';
        copyButton.title = 'Copy transcript to clipboard';
        
        addEvent(clearButton, 'click', () => this.clear());
        addEvent(copyButton, 'click', () => this.copyToClipboard());
        
        controls.appendChild(clearButton);
        controls.appendChild(copyButton);
        
        transcriptContainer.appendChild(transcriptLabel);
        transcriptContainer.appendChild(transcript);
        transcriptContainer.appendChild(controls);
        
        // Event handlers
        addEvent(micButton, 'click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });
        
        // Keyboard shortcuts
        addEvent(document, 'keydown', (e) => {
            if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                if (this.isRecording) {
                    this.stopRecording();
                } else {
                    this.startRecording();
                }
            }
        });
        
        // Assembly
        voiceArea.appendChild(micContainer);
        voiceArea.appendChild(statusContainer);
        voiceArea.appendChild(transcriptContainer);
        
        this.element.appendChild(header);
        this.element.appendChild(voiceArea);
        this.container.appendChild(this.element);
        
        // Store references for later use
        this.micButton = micButton;
        this.statusElement = status;
        this.transcriptElement = transcript;
        this.visualFeedback = visualFeedback;
        this.confidenceBar = confidenceBar;
        this.finalTranscriptElement = transcript.querySelector('.transcript-final');
        this.interimTranscriptElement = transcript.querySelector('.transcript-interim');
        this.placeholderElement = transcript.querySelector('.transcript-placeholder');
    }
    
    startRecording() {
        if (!this.recognition) {
            this.updateStatus('Voice recognition is not supported in your browser', 'error');
            handleError(null, 'Voice recognition is not supported in your browser');
            return;
        }
        
        if (this.isRecording) {
            return; // Already recording
        }
        
        try {
            this.isRecording = true;
            this.finalTranscript = '';
            this.transcript = '';
            
            // Update UI
            addClass(this.micButton, 'recording');
            this.micButton.innerHTML = `
                <span class="mic-icon">🛑</span>
                <span class="mic-text">Stop Recording</span>
            `;
            this.micButton.setAttribute('aria-label', 'Stop voice recording');
            
            this.updateStatus('Preparing to listen...', 'preparing');
            this.recognition.start();
            
            // Set auto-stop timeout (30 seconds max)
            this.recordingTimeout = setTimeout(() => {
                this.stopRecording();
                this.updateStatus('Recording stopped automatically after 30 seconds', 'info');
            }, 30000);
            
        } catch (error) {
            this.updateStatus('Failed to start recording', 'error');
            handleError(error, 'Failed to start voice recording');
            this.stopRecording();
        }
    }
    
    stopRecording() {
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
        }
        
        if (this.recognition && this.isRecording) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.warn('Error stopping recognition:', error);
            }
        }
        
        this.isRecording = false;
        this.stopVisualFeedback();
        
        // Update UI
        removeClass(this.micButton, 'recording');
        this.micButton.innerHTML = `
            <span class="mic-icon">🎤</span>
            <span class="mic-text">Start Recording</span>
        `;
        this.micButton.setAttribute('aria-label', 'Start voice recording');
        
        if (this.finalTranscript.trim()) {
            this.updateStatus(`Recording complete. ${this.finalTranscript.trim().length} characters captured.`, 'success');
        } else {
            this.updateStatus('Click the microphone to start speaking', 'ready');
        }
    }
    
    updateStatus(message, type = 'info') {
        if (!this.statusElement) return;
        
        this.statusElement.textContent = message;
        this.statusElement.className = `voice-status voice-status-${type}`;
    }
    
    updateTranscript(fullText, interimText = '') {
        if (!this.finalTranscriptElement || !this.interimTranscriptElement || !this.placeholderElement) {
            return;
        }
        
        const finalText = this.finalTranscript.trim();
        const showPlaceholder = !finalText && !interimText.trim();
        
        // Update transcript sections
        this.finalTranscriptElement.textContent = finalText;
        this.interimTranscriptElement.textContent = interimText;
        this.placeholderElement.style.display = showPlaceholder ? 'block' : 'none';
        
        // Update confidence display
        if (this.confidence > 0) {
            this.updateConfidence(this.confidence);
        }
        
        // Auto-scroll to show latest text
        if (this.transcriptElement) {
            this.transcriptElement.scrollTop = this.transcriptElement.scrollHeight;
        }
    }
    
    updateConfidence(confidence) {
        if (!this.confidenceBar) return;
        
        const percentage = Math.round(confidence * 100);
        const fillElement = this.confidenceBar.querySelector('.confidence-fill');
        const textElement = this.confidenceBar.querySelector('.confidence-text');
        
        if (fillElement) {
            fillElement.style.width = `${percentage}%`;
            fillElement.className = `confidence-fill confidence-${this.getConfidenceLevel(confidence)}`;
        }
        
        if (textElement) {
            textElement.textContent = `${percentage}%`;
        }
    }
    
    getConfidenceLevel(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'medium';
        return 'low';
    }
    
    startVisualFeedback() {
        if (!this.visualFeedback) return;
        
        addClass(this.visualFeedback, 'active');
        
        // Simulate audio visualization
        const bars = this.visualFeedback.querySelectorAll('.feedback-bar');
        this.feedbackInterval = setInterval(() => {
            bars.forEach((bar, index) => {
                const height = Math.random() * 100;
                bar.style.height = `${height}%`;
                bar.style.animationDelay = `${index * 50}ms`;
            });
        }, 100);
    }
    
    stopVisualFeedback() {
        if (!this.visualFeedback) return;
        
        removeClass(this.visualFeedback, 'active');
        
        if (this.feedbackInterval) {
            clearInterval(this.feedbackInterval);
            this.feedbackInterval = null;
        }
        
        // Reset bars
        const bars = this.visualFeedback.querySelectorAll('.feedback-bar');
        bars.forEach(bar => {
            bar.style.height = '0%';
        });
    }
    
    resetRecordingTimeout() {
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
        }
        
        // Auto-stop after 3 seconds of silence
        this.recordingTimeout = setTimeout(() => {
            if (this.isRecording) {
                this.stopRecording();
                this.updateStatus('Recording stopped due to silence', 'info');
            }
        }, 3000);
    }
    
    showHelp() {
        const helpText = `
Voice Input Help:

• Click the microphone button to start/stop recording
• Speak clearly and at normal pace
• Say ingredient names separated by commas or "and"
• Examples: "tomatoes, onions, garlic" or "chicken and rice"
• Press Ctrl+Space as a keyboard shortcut
• Recording stops automatically after 30 seconds
• Works best in quiet environments

Browser Support:
• Chrome, Edge, Safari (desktop and mobile)
• Requires microphone permission
• Internet connection needed for processing
        `.trim();
        
        // Simple alert for now - could be enhanced with a modal
        alert(helpText);
    }
    
    copyToClipboard() {
        const text = this.getValue();
        if (!text) {
            this.updateStatus('Nothing to copy', 'info');
            return;
        }
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.updateStatus('Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }
    
    fallbackCopy(text) {
        // Fallback for older browsers
        const textArea = createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.updateStatus('Copied to clipboard!', 'success');
        } catch (error) {
            this.updateStatus('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    getValue() {
        return this.finalTranscript.trim();
    }
    
    clear() {
        this.finalTranscript = '';
        this.transcript = '';
        this.confidence = 0;
        this.stopRecording();
        this.updateTranscript('');
        this.updateConfidence(0);
        this.updateStatus('Transcript cleared', 'info');
    }
    
    destroy() {
        this.stopRecording();
        if (this.feedbackInterval) {
            clearInterval(this.feedbackInterval);
        }
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
        }
        super.destroy();
    }
}

// Cuisine Selector Component
class CuisineSelector extends Component {
    constructor(container) {
        super(container);
        this.selectedCuisines = [];
        this.filteredCuisines = [];
        this.searchTerm = '';
        this.selectedCategory = 'all';
        
        // Comprehensive cuisine data with categories, icons, descriptions, and representative images
        this.cuisines = [
            // European
            { 
                id: 'italian', 
                name: 'Italian', 
                icon: '🍝', 
                category: 'european',
                description: 'Pasta, pizza, risotto',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=100&fit=crop&auto=format',
                keywords: ['pasta', 'pizza', 'lasagna', 'risotto', 'mediterranean']
            },
            { 
                id: 'greek', 
                name: 'Greek', 
                icon: '🫒', 
                category: 'european',
                description: 'Mediterranean flavors, olives, feta',
                image: 'https://images.unsplash.com/photo-1544967882-bc6b9abab333?w=150&h=100&fit=crop&auto=format',
                keywords: ['olive', 'feta', 'gyro', 'mediterranean', 'tzatziki']
            },
            { 
                id: 'french', 
                name: 'French', 
                icon: '🥖', 
                category: 'european',
                description: 'Fine dining, pastries, wine',
                image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=150&h=100&fit=crop&auto=format',
                keywords: ['croissant', 'baguette', 'wine', 'cheese', 'pastry']
            },
            { 
                id: 'spanish', 
                name: 'Spanish', 
                icon: '🥘', 
                category: 'european',
                description: 'Paella, tapas, sangria',
                image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=150&h=100&fit=crop&auto=format',
                keywords: ['paella', 'tapas', 'sangria', 'chorizo', 'mediterranean']
            },
            
            // Asian
            { 
                id: 'chinese', 
                name: 'Chinese', 
                icon: '🥢', 
                category: 'asian',
                description: 'Stir-fry, dim sum, noodles',
                image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=150&h=100&fit=crop&auto=format',
                keywords: ['stir-fry', 'dim sum', 'noodles', 'rice', 'wok']
            },
            { 
                id: 'japanese', 
                name: 'Japanese', 
                icon: '🍱', 
                category: 'asian',
                description: 'Sushi, ramen, tempura',
                image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=150&h=100&fit=crop&auto=format',
                keywords: ['sushi', 'ramen', 'tempura', 'miso', 'sake']
            },
            { 
                id: 'thai', 
                name: 'Thai', 
                icon: '�', 
                category: 'asian',
                description: 'Spicy curries, pad thai',
                image: 'https://images.unsplash.com/photo-1559847844-d7ba546fdafa?w=150&h=100&fit=crop&auto=format',
                keywords: ['curry', 'pad thai', 'coconut', 'lemongrass', 'spicy']
            },
            { 
                id: 'indian', 
                name: 'Indian', 
                icon: '🍛', 
                category: 'asian',
                description: 'Curry, naan, spices',
                image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=150&h=100&fit=crop&auto=format',
                keywords: ['curry', 'naan', 'tandoori', 'biryani', 'spices']
            },
            { 
                id: 'korean', 
                name: 'Korean', 
                icon: '🥘', 
                category: 'asian',
                description: 'BBQ, kimchi, bibimbap',
                image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=150&h=100&fit=crop&auto=format',
                keywords: ['bbq', 'kimchi', 'bibimbap', 'bulgogi', 'fermented']
            },
            
            // Middle Eastern & Persian
            { 
                id: 'persian', 
                name: 'Persian', 
                icon: '🌶️', 
                category: 'middle-eastern',
                description: 'Rice dishes, kebabs, saffron',
                image: 'https://images.unsplash.com/photo-1604906830542-06c4c7e1cae8?w=150&h=100&fit=crop&auto=format',
                keywords: ['kebab', 'rice', 'saffron', 'tahdig', 'pomegranate']
            },
            { 
                id: 'lebanese', 
                name: 'Lebanese', 
                icon: '🧆', 
                category: 'middle-eastern',
                description: 'Hummus, falafel, tabbouleh',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=100&fit=crop&auto=format',
                keywords: ['hummus', 'falafel', 'tabbouleh', 'pita', 'olive oil']
            },
            
            // American
            { 
                id: 'american', 
                name: 'American', 
                icon: '🍔', 
                category: 'american',
                description: 'Burgers, BBQ, comfort food',
                image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=150&h=100&fit=crop&auto=format',
                keywords: ['burger', 'bbq', 'sandwich', 'fries', 'comfort food']
            },
            { 
                id: 'mexican', 
                name: 'Mexican', 
                icon: '🌮', 
                category: 'latin-american',
                description: 'Tacos, salsa, authentic flavors',
                image: 'https://images.unsplash.com/photo-1565299585323-38174c26288d?w=150&h=100&fit=crop&auto=format',
                keywords: ['taco', 'salsa', 'guacamole', 'enchilada', 'chili']
            },
            
            // Mediterranean
            { 
                id: 'mediterranean', 
                name: 'Mediterranean', 
                icon: '🥗', 
                category: 'mediterranean',
                description: 'Healthy, olive oil, fresh herbs',
                image: 'https://images.unsplash.com/photo-1540713434306-58505449dd96?w=150&h=100&fit=crop&auto=format',
                keywords: ['olive oil', 'herbs', 'vegetables', 'healthy', 'fresh']
            }
        ];
        
        this.categories = [
            { id: 'all', name: 'All Cuisines', icon: '🌍' },
            { id: 'european', name: 'European', icon: '🏰' },
            { id: 'asian', name: 'Asian', icon: '🥢' },
            { id: 'middle-eastern', name: 'Middle Eastern', icon: '🕌' },
            { id: 'american', name: 'American', icon: '🗽' },
            { id: 'latin-american', name: 'Latin American', icon: '🌶️' },
            { id: 'mediterranean', name: 'Mediterranean', icon: '🌊' }
        ];
        
        this.filteredCuisines = [...this.cuisines];
        this.render();
    }
    
    render() {
        this.element = createElement('div', 'cuisine-selector');
        
        // Create header section
        const header = createElement('div', 'cuisine-header');
        const title = createElement('h3', 'cuisine-title');
        title.innerHTML = `
            <span class="title-icon">🍽️</span>
            <span>Select Your Preferred Cuisine Styles</span>
        `;
        
        const subtitle = createElement('p', 'cuisine-subtitle');
        subtitle.textContent = 'Choose one or multiple cuisines to personalize your recipe suggestions';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        // Create search and filter section
        const controlsSection = createElement('div', 'cuisine-controls');
        
        // Search input
        const searchContainer = createElement('div', 'search-container');
        const searchInput = createElement('input', 'cuisine-search');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search cuisines...';
        searchInput.setAttribute('aria-label', 'Search cuisines');
        
        const searchIcon = createElement('span', 'search-icon');
        searchIcon.innerHTML = '🔍';
        
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        
        // Category filter
        const categoryContainer = createElement('div', 'category-filter');
        const categoryLabel = createElement('label', 'category-label');
        categoryLabel.textContent = 'Filter by region:';
        
        const categoryButtons = createElement('div', 'category-buttons');
        this.categories.forEach(category => {
            const button = createElement('button', 'category-btn');
            if (category.id === this.selectedCategory) {
                addClass(button, 'active');
            }
            
            button.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
            `;
            button.setAttribute('data-category', category.id);
            button.setAttribute('aria-label', `Filter by ${category.name}`);
            
            addEvent(button, 'click', () => this.filterByCategory(category.id));
            categoryButtons.appendChild(button);
        });
        
        categoryContainer.appendChild(categoryLabel);
        categoryContainer.appendChild(categoryButtons);
        
        // Selected count indicator
        const selectionInfo = createElement('div', 'selection-info');
        const selectedCount = createElement('span', 'selected-count');
        selectedCount.innerHTML = `
            <span class="count-number">${this.selectedCuisines.length}</span> 
            <span class="count-label">cuisines selected</span>
        `;
        
        const clearButton = createElement('button', 'clear-selection-btn');
        clearButton.innerHTML = '✖️ Clear All';
        clearButton.style.display = this.selectedCuisines.length > 0 ? 'inline-flex' : 'none';
        addEvent(clearButton, 'click', () => this.clearSelection());
        
        selectionInfo.appendChild(selectedCount);
        selectionInfo.appendChild(clearButton);
        
        controlsSection.appendChild(searchContainer);
        controlsSection.appendChild(categoryContainer);
        controlsSection.appendChild(selectionInfo);
        
        // Create cuisine grid
        const gridContainer = createElement('div', 'cuisine-grid-container');
        const grid = createElement('div', 'cuisine-grid');
        
        // Add event listeners
        addEvent(searchInput, 'input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.updateCuisineDisplay();
        });
        
        addEvent(searchInput, 'keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.searchTerm = '';
                this.updateCuisineDisplay();
            }
        });
        
        // Store references
        this.grid = grid;
        this.searchInput = searchInput;
        this.selectedCountElement = selectedCount;
        this.clearButton = clearButton;
        this.categoryButtons = categoryButtons;
        
        gridContainer.appendChild(grid);
        
        // Assemble the component
        this.element.appendChild(header);
        this.element.appendChild(controlsSection);
        this.element.appendChild(gridContainer);
        this.container.appendChild(this.element);
        
        // Initial render of cuisines
        this.updateCuisineDisplay();
        
        // Add helpful tips section
        this.addHelpfulTips();
    }
    
    addHelpfulTips() {
        const tipsSection = createElement('div', 'cuisine-tips');
        tipsSection.innerHTML = `
            <div class="tips-header">
                <span class="tips-icon">💡</span>
                <span class="tips-title">Tips</span>
            </div>
            <div class="tips-content">
                <div class="tip-item">
                    <span class="tip-icon">🎯</span>
                    <span>Select multiple cuisines to get diverse recipe suggestions</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">🔍</span>
                    <span>Use the search to quickly find specific cuisine types</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">🌍</span>
                    <span>Filter by region to explore cuisines from specific areas</span>
                </div>
            </div>
        `;
        this.element.appendChild(tipsSection);
    }
    
    updateCuisineDisplay() {
        // Filter cuisines based on search term and category
        this.filteredCuisines = this.cuisines.filter(cuisine => {
            // Category filter
            const categoryMatch = this.selectedCategory === 'all' || cuisine.category === this.selectedCategory;
            
            // Search filter
            const searchMatch = this.searchTerm === '' || 
                cuisine.name.toLowerCase().includes(this.searchTerm) ||
                cuisine.description.toLowerCase().includes(this.searchTerm) ||
                cuisine.keywords.some(keyword => keyword.toLowerCase().includes(this.searchTerm));
            
            return categoryMatch && searchMatch;
        });
        
        // Clear current grid
        this.grid.innerHTML = '';
        
        // Show message if no results
        if (this.filteredCuisines.length === 0) {
            const noResults = createElement('div', 'no-results');
            noResults.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <div class="no-results-message">
                    <h4>No cuisines found</h4>
                    <p>Try adjusting your search terms or category filter</p>
                </div>
            `;
            this.grid.appendChild(noResults);
            return;
        }
        
        // Render filtered cuisines
        this.filteredCuisines.forEach(cuisine => {
            const card = this.createCuisineCard(cuisine);
            this.grid.appendChild(card);
        });
    }
    
    createCuisineCard(cuisine) {
        const card = createElement('div', 'cuisine-card');
        card.setAttribute('data-cuisine', cuisine.id);
        
        if (this.selectedCuisines.includes(cuisine.id)) {
            addClass(card, 'selected');
        }
        
        card.innerHTML = `
            <div class="cuisine-image-container">
                <img src="${cuisine.image}" alt="${cuisine.name} cuisine" class="cuisine-image" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="cuisine-image-fallback" style="display: none;">
                    <span class="cuisine-icon-large">${cuisine.icon}</span>
                </div>
            </div>
            <div class="cuisine-content">
                <div class="cuisine-header">
                    <span class="cuisine-icon">${cuisine.icon}</span>
                    <span class="cuisine-name">${cuisine.name}</span>
                </div>
                <div class="cuisine-description">${cuisine.description}</div>
                <div class="cuisine-category">${this.getCategoryName(cuisine.category)}</div>
            </div>
            <div class="cuisine-hover-overlay">
                <span class="hover-text">Click to ${this.selectedCuisines.includes(cuisine.id) ? 'remove' : 'select'}</span>
            </div>
        `;
        
        // Add click handler
        addEvent(card, 'click', () => this.toggleCuisine(cuisine.id));
        
        // Add keyboard support
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${cuisine.name} cuisine: ${cuisine.description}`);
        
        addEvent(card, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleCuisine(cuisine.id);
            }
        });
        
        return card;
    }
    
    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : '';
    }
    
    filterByCategory(categoryId) {
        this.selectedCategory = categoryId;
        
        // Update active category button
        $$('.category-btn').forEach(btn => {
            removeClass(btn, 'active');
            if (btn.getAttribute('data-category') === categoryId) {
                addClass(btn, 'active');
            }
        });
        
        this.updateCuisineDisplay();
    }
    
    toggleCuisine(cuisineId) {
        const card = $(`.cuisine-card[data-cuisine="${cuisineId}"]`);
        const isSelected = this.selectedCuisines.includes(cuisineId);
        
        if (isSelected) {
            this.selectedCuisines = this.selectedCuisines.filter(id => id !== cuisineId);
            removeClass(card, 'selected');
        } else {
            this.selectedCuisines.push(cuisineId);
            addClass(card, 'selected');
        }
        
        // Update card hover text
        const hoverText = card.querySelector('.hover-text');
        if (hoverText) {
            hoverText.textContent = `Click to ${isSelected ? 'select' : 'remove'}`;
        }
        
        // Update selection info
        this.updateSelectionInfo();
        
        // Add visual feedback
        this.addSelectionFeedback(card, !isSelected);
    }
    
    addSelectionFeedback(card, isSelected) {
        // Add a temporary visual effect
        const feedback = createElement('div', 'selection-feedback');
        feedback.innerHTML = isSelected ? '✓ Added' : '✖️ Removed';
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${isSelected ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-semibold);
            z-index: 10;
            pointer-events: none;
            opacity: 0;
            animation: feedbackPulse 0.6s ease-out;
        `;
        
        card.style.position = 'relative';
        card.appendChild(feedback);
        
        // Remove feedback after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 600);
    }
    
    updateSelectionInfo() {
        if (this.selectedCountElement) {
            this.selectedCountElement.innerHTML = `
                <span class="count-number">${this.selectedCuisines.length}</span> 
                <span class="count-label">cuisine${this.selectedCuisines.length !== 1 ? 's' : ''} selected</span>
            `;
        }
        
        if (this.clearButton) {
            this.clearButton.style.display = this.selectedCuisines.length > 0 ? 'inline-flex' : 'none';
        }
    }
    
    clearSelection() {
        const previousSelection = [...this.selectedCuisines];
        this.selectedCuisines = [];
        
        // Update all cards
        $$('.cuisine-card').forEach(card => {
            removeClass(card, 'selected');
            const hoverText = card.querySelector('.hover-text');
            if (hoverText) {
                hoverText.textContent = 'Click to select';
            }
        });
        
        this.updateSelectionInfo();
        
        // Show confirmation message
        if (previousSelection.length > 0) {
            this.showMessage(`Cleared ${previousSelection.length} cuisine selection${previousSelection.length !== 1 ? 's' : ''}`, 'info');
        }
    }
    
    showMessage(message, type = 'info') {
        const messageEl = createElement('div', `cuisine-message ${type}`);
        messageEl.innerHTML = `
            <span class="message-icon">${type === 'info' ? 'ℹ️' : type === 'success' ? '✅' : '⚠️'}</span>
            <span class="message-text">${message}</span>
        `;
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                addClass(messageEl, 'fade-out');
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.parentNode.removeChild(messageEl);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    getValue() {
        return this.selectedCuisines.map(id => {
            const cuisine = this.cuisines.find(c => c.id === id);
            return cuisine ? cuisine.name.toLowerCase() : id;
        });
    }
    
    getSelectedCuisineObjects() {
        return this.selectedCuisines.map(id => 
            this.cuisines.find(c => c.id === id)
        ).filter(Boolean);
    }
    
    clear() {
        this.clearSelection();
    }
    
    // Method to get cuisine statistics
    getStats() {
        const categoryStats = {};
        this.selectedCuisines.forEach(id => {
            const cuisine = this.cuisines.find(c => c.id === id);
            if (cuisine) {
                categoryStats[cuisine.category] = (categoryStats[cuisine.category] || 0) + 1;
            }
        });
        
        return {
            total: this.selectedCuisines.length,
            categories: categoryStats,
            cuisines: this.getSelectedCuisineObjects()
        };
    }
    
    // Method to programmatically select cuisines
    selectCuisines(cuisineIds) {
        cuisineIds.forEach(id => {
            if (!this.selectedCuisines.includes(id) && this.cuisines.find(c => c.id === id)) {
                this.selectedCuisines.push(id);
            }
        });
        this.updateCuisineDisplay();
        this.updateSelectionInfo();
    }
    
    // Method to get cuisine recommendations based on ingredients
    getRecommendations(ingredients = []) {
        if (!ingredients.length) return [];
        
        const recommendations = [];
        const ingredientKeywords = ingredients.map(ing => ing.toLowerCase());
        
        this.cuisines.forEach(cuisine => {
            const matches = cuisine.keywords.filter(keyword => 
                ingredientKeywords.some(ing => ing.includes(keyword) || keyword.includes(ing))
            );
            
            if (matches.length > 0) {
                recommendations.push({
                    ...cuisine,
                    matchCount: matches.length,
                    matchingKeywords: matches
                });
            }
        });
        
        return recommendations.sort((a, b) => b.matchCount - a.matchCount);
    }
}

// Export components for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Component,
        InputMethodSelector,
        TextInputComponent,
        ImageUploadComponent,
        VoiceInputComponent,
        CuisineSelector
    };
}
