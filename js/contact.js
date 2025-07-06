/*!
 * Contact Section Enhancement Script
 * Compatible with existing theme system (alternate stylesheets + dark class)
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
        textArea.setSelectionRange(0, 99999);
        
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
                charCount.style.color = '#e74c3c';
                this.value = this.value.substring(0, maxLength);
                charCount.textContent = maxLength;
            } else if (currentLength > maxLength * 0.8) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#666';
            }
        });
        
        console.log('Character counter initialized');
    }

    // ====================================
    // FORM VALIDATION
    // ====================================
    
    function initializeFormValidation() {
        const formInputs = document.querySelectorAll('#contactForm .form-input, #contactForm .form-select, #contactForm .form-textarea');
        
        if (formInputs.length === 0) {
            console.log('No form inputs found for validation');
            return;
        }
        
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateSingleField(this);
            });
            
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
                if (value) {
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
        
        if (isValid) {
            field.style.borderColor = '#27ae60';
            hideFieldError(field);
        } else {
            field.style.borderColor = '#e74c3c';
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
    // THEME INTEGRATION (COMPATIBLE WITH YOUR SYSTEM)
    // ====================================
    
    function initializeThemeIntegration() {
        // Monitor dark/light mode changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateContactTheme();
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Monitor theme color changes (alternate stylesheets)
        const stylesheetObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                    updateContactTheme();
                }
            });
        });
        
        // Observe all alternate stylesheets
        const alternateStyles = document.querySelectorAll('.alternate-style');
        alternateStyles.forEach(style => {
            stylesheetObserver.observe(style, {
                attributes: true,
                attributeFilter: ['disabled']
            });
        });
        
        // Initial theme application
        updateContactTheme();
        
        console.log('Theme integration initialized');
    }
    
    function updateContactTheme() {
        const contactSection = document.querySelector('.contact-section');
        if (!contactSection) return;
        
        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark') || document.body.className === 'dark';
        
        // Get active color theme from alternate stylesheets
        const activeColorTheme = getActiveColorTheme();
        
        // Apply theme classes to contact section
        contactSection.className = contactSection.className.replace(/\btheme-\w+\b/g, '').replace(/\bdark\b/g, '');
        
        if (isDarkMode) {
            contactSection.classList.add('dark');
        }
        
        if (activeColorTheme) {
            contactSection.classList.add(`theme-${activeColorTheme}`);
        }
        
        console.log(`Theme updated - Dark: ${isDarkMode}, Color: ${activeColorTheme}`);
    }
    
    function getActiveColorTheme() {
        const alternateStyles = document.querySelectorAll('.alternate-style');
        for (let style of alternateStyles) {
            if (!style.hasAttribute('disabled')) {
                return style.getAttribute('title');
            }
        }
        return null;
    }

    // ====================================
    // UTILITY FUNCTIONS
    // ====================================
    
    function showToast(message, type = 'success') {
        const existingToasts = document.querySelectorAll('.copy-toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `copy-toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
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
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        
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

    // ====================================
    // PUBLIC API
    // ====================================
    
    window.ContactEnhancements = {
        updateTheme: updateContactTheme,
        showToast: showToast,
        validateField: validateSingleField
    };

})();
