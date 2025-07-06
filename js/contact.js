/*!
 * Contact Section Enhancement Script
 * Handles copy-to-clipboard, validation, theme integration (NO form submission)
 * Compatible with existing Google Apps Script form handler
 */

(function() {
    'use strict';

    // ====================================
    // INITIALIZATION
    // ====================================
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Contact enhancements loading...');
        initializeCopyToClipboard();
        initializeFormValidation();
        initializeCharacterCounter();
        initializeThemeIntegration();
        console.log('Contact enhancements loaded successfully');
    });

    // ====================================
    // COPY TO CLIPBOARD FUNCTIONALITY
    // ====================================
    
    function initializeCopyToClipboard() {
        const copyItems = document.querySelectorAll('.contact-copy');
        
        if (copyItems.length === 0) {
            console.log('No copy items found');
            return;
        }
        
        copyItems.forEach(item => {
            item.addEventListener('click', handleCopyClick);
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCopyClick.call(this, e);
                }
            });
        });
        
        console.log(`Initialized copy functionality for ${copyItems.length} items`);
    }
    
    async function handleCopyClick(e) {
        e.preventDefault();
        
        const textToCopy = this.getAttribute('data-copy-text');
        const copyIndicator = this.querySelector('.copy-indicator i');
        
        if (!textToCopy) {
            console.error('No copy text found');
            return;
        }
        
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
                showCopySuccess(this, copyIndicator);
            } else {
                fallbackCopyTextToClipboard(textToCopy, this, copyIndicator);
            }
        } catch (err) {
            console.error('Copy failed:', err);
            fallbackCopyTextToClipboard(textToCopy, this, copyIndicator);
        }
    }
    
    function showCopySuccess(element, indicator) {
        element.classList.add('copied');
        
        if (indicator) {
            const originalClass = indicator.className;
            indicator.className = 'fas fa-check';
            
            // Reset after 2 seconds
            setTimeout(() => {
                indicator.className = originalClass;
            }, 2000);
        }
        
        showToast('Email address copied to clipboard!', 'success');
        
        // Reset element state
        setTimeout(() => {
            element.classList.remove('copied');
        }, 2000);
        
        // Track copy event (if analytics available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'copy_email', {
                event_category: 'contact',
                event_label: 'email_copied'
            });
        }
    }
    
    function fallbackCopyTextToClipboard(text, element, indicator) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            opacity: 0;
        `;
        textArea.setAttribute('readonly', '');
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess(element, indicator);
            } else {
                showToast('Failed to copy email address', 'error');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            showToast('Failed to copy email address. Please copy manually: ' + text, 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    // ====================================
    // CHARACTER COUNTER
    // ====================================
    
    function initializeCharacterCounter() {
        const messageTextarea = document.getElementById('contactMessage');
        const charCount = document.getElementById('charCount');
        
        if (!messageTextarea || !charCount) {
            console.log('Character counter elements not found');
            return;
        }
        
        messageTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            const maxLength = 500;
            
            charCount.textContent = currentLength;
            
            if (currentLength > maxLength) {
                charCount.style.color = 'var(--error-color, #e74c3c)';
                this.value = this.value.substring(0, maxLength);
                charCount.textContent = maxLength;
            } else if (currentLength > maxLength * 0.8) {
                charCount.style.color = 'var(--warning-color, #f39c12)';
            } else {
                charCount.style.color = 'var(--form-helper-color, #666)';
            }
        });
        
        console.log('Character counter initialized');
    }

    // ====================================
    // FORM VALIDATION (NON-INTRUSIVE)
    // ====================================
    
    function initializeFormValidation() {
        const formInputs = document.querySelectorAll('#contactForm .form-input, #contactForm .form-select, #contactForm .form-textarea');
        
        if (formInputs.length === 0) {
            console.log('No form inputs found for validation');
            return;
        }
        
        formInputs.forEach(input => {
            // Add visual feedback on blur
            input.addEventListener('blur', function() {
                validateSingleField(this);
            });
            
            // Remove error styling on focus
            input.addEventListener('focus', function() {
                this.style.borderColor = '';
                hideFieldError(this);
            });
        });
        
        console.log(`Form validation initialized for ${formInputs.length} fields`);
    }
    
    function validateSingleField(field) {
        const value = field.value.trim();
        const fieldType = field.type || field.tagName.toLowerCase();
        let isValid = true;
        let errorMessage = '';
        
        // Skip validation if field is not required and empty
        if (!field.hasAttribute('required') && !value) {
            return true;
        }
        
        switch (fieldType) {
            case 'text':
                if (field.id === 'contactName') {
                    if (!value) {
                        errorMessage = 'Name is required';
                        isValid = false;
                    } else if (value.length < 2) {
                        errorMessage = 'Name must be at least 2 characters long';
                        isValid = false;
                    } else if (!/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(value)) {
                        errorMessage = 'Name can only contain letters and spaces';
                        isValid = false;
                    }
                }
                break;
                
            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else {
                    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    if (!emailRegex.test(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    }
                }
                break;
                
            case 'tel':
                if (value) { // Optional field
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    const cleanPhone = value.replace(/[\s\-\(\)\.]/g, '');
                    if (!phoneRegex.test(cleanPhone)) {
                        errorMessage = 'Please enter a valid phone number';
                        isValid = false;
                    }
                }
                break;
                
            case 'select':
                if (field.hasAttribute('required') && !value) {
                    errorMessage = 'Please select an option';
                    isValid = false;
                }
                break;
                
            case 'textarea':
                if (!value) {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters long';
                    isValid = false;
                } else if (value.length > 500) {
                    errorMessage = 'Message cannot exceed 500 characters';
                    isValid = false;
                }
                break;
        }
        
        // Apply visual feedback
        if (isValid) {
            field.style.borderColor = 'var(--success-color, #27ae60)';
            hideFieldError(field);
        } else {
            field.style.borderColor = 'var(--error-color, #e74c3c)';
            showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showFieldError(field, message) {
        const errorElement = document.getElementById(field.id.replace('contact', '') + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function hideFieldError(field) {
        const errorElement = document.getElementById(field.id.replace('contact', '') + 'Error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // ====================================
    // THEME INTEGRATION
    // ====================================
    
    function initializeThemeIntegration() {
        // Listen for custom theme change events
        document.addEventListener('themeChanged', handleThemeChange);
        
        // Observe theme changes via mutations
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'data-theme' || 
                     mutation.attributeName === 'class')) {
                    updateContactTheme();
                }
            });
        });
        
        // Observe document element and body for theme changes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });
        
        // Initial theme application
        updateContactTheme();
        
        console.log('Theme integration initialized');
    }
    
    function handleThemeChange(event) {
        const { colorTheme, mode } = event.detail || {};
        updateContactTheme(colorTheme, mode);
    }
    
    function updateContactTheme(colorTheme, mode) {
        const contactSection = document.querySelector('.contact-section');
        if (!contactSection) return;
        
        // Get current theme from various sources
        const currentTheme = document.documentElement.getAttribute('data-theme') || 
                           document.body.getAttribute('data-theme') ||
                           getThemeFromClasses();
        
        if (currentTheme) {
            contactSection.setAttribute('data-theme', currentTheme);
        }
        
        // Copy theme classes from body
        const themeClasses = Array.from(document.body.classList)
            .filter(cls => cls.startsWith('theme-') || cls.includes('mode') || cls.includes('color'));
        
        // Remove existing theme classes from contact section
        contactSection.className = contactSection.className
            .replace(/\btheme-[\w-]+\b/g, '')
            .replace(/\b[\w-]*mode[\w-]*\b/g, '')
            .replace(/\b[\w-]*color[\w-]*\b/g, '');
        
        // Add new theme classes
        themeClasses.forEach(cls => {
            contactSection.classList.add(cls);
        });
    }
    
    function getThemeFromClasses() {
        const body = document.body;
        const classes = Array.from(body.classList);
        
        // Look for theme-related classes
        const colorTheme = classes.find(cls => cls.startsWith('theme-') && !cls.includes('mode'));
        const modeTheme = classes.find(cls => cls.includes('mode'));
        
        if (colorTheme && modeTheme) {
            return `${colorTheme.replace('theme-', '')}-${modeTheme.replace('-mode', '')}`;
        }
        
        return colorTheme || modeTheme || null;
    }

    // ====================================
    // UTILITY FUNCTIONS
    // ====================================
    
    function showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.copy-toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `copy-toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Apply styles directly for better compatibility
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--toast-success-bg, #2ecc71)' : 'var(--toast-error-bg, #e74c3c)'};
            color: ${type === 'success' ? 'var(--toast-success-color, white)' : 'var(--toast-error-color, white)'};
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ====================================
    // PUBLIC API
    // ====================================
    
    // Expose functions for external use
    window.ContactEnhancements = {
        updateTheme: updateContactTheme,
        showToast: showToast,
        validateField: validateSingleField
    };

    // ====================================
    // MOBILE OPTIMIZATIONS
    // ====================================
    
    // Handle mobile-specific interactions
    if ('ontouchstart' in window) {
        document.addEventListener('DOMContentLoaded', function() {
            const copyItems = document.querySelectorAll('.contact-copy');
            copyItems.forEach(item => {
                item.style.cursor = 'pointer';
                item.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                });
                item.addEventListener('touchend', function() {
                    this.style.transform = '';
                });
            });
        });
    }

})();
