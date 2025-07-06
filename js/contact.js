/*!
 * Contact Form and Theme Integration
 * Handles form validation, submission, copy-to-clipboard, and theme switching
 */

(function() {
    'use strict';

    // ====================================
    // INITIALIZATION
    // ====================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeContactForm();
        initializeCopyToClipboard();
        initializeThemeIntegration();
    });

    // ====================================
    // CONTACT FORM FUNCTIONALITY
    // ====================================
    
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const formMessages = document.getElementById('formMessages');
        const messageTextarea = document.getElementById('contactMessage');
        const charCount = document.getElementById('charCount');
        
        if (!contactForm) return;
        
        // Initialize character counter
        initializeCharacterCounter(messageTextarea, charCount);
        
        // Initialize form validation
        initializeFormValidation();
        
        // Handle form submission
        contactForm.addEventListener('submit', handleFormSubmission);
    }
    
    function initializeCharacterCounter(textarea, counter) {
        if (!textarea || !counter) return;
        
        textarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            const maxLength = 500;
            
            counter.textContent = currentLength;
            
            if (currentLength > maxLength) {
                counter.style.color = 'var(--error-color, #e74c3c)';
                this.value = this.value.substring(0, maxLength);
                counter.textContent = maxLength;
            } else if (currentLength > maxLength * 0.8) {
                counter.style.color = 'var(--warning-color, #f39c12)';
            } else {
                counter.style.color = 'var(--form-helper-color, #666)';
            }
        });
    }
    
    // ====================================
    // FORM VALIDATION
    // ====================================
    
    function initializeFormValidation() {
        const validators = {
            name: {
                element: document.getElementById('contactName'),
                error: document.getElementById('nameError'),
                validate: function(value) {
                    if (!value.trim()) {
                        return 'Name is required';
                    }
                    if (value.trim().length < 2) {
                        return 'Name must be at least 2 characters long';
                    }
                    if (!/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(value.trim())) {
                        return 'Name can only contain letters and spaces';
                    }
                    if (value.trim().length > 50) {
                        return 'Name cannot exceed 50 characters';
                    }
                    return null;
                }
            },
            email: {
                element: document.getElementById('contactEmail'),
                error: document.getElementById('emailError'),
                validate: function(value) {
                    if (!value.trim()) {
                        return 'Email is required';
                    }
                    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    if (!emailRegex.test(value.trim())) {
                        return 'Please enter a valid email address';
                    }
                    if (value.length > 254) {
                        return 'Email address is too long';
                    }
                    return null;
                }
            },
            phone: {
                element: document.getElementById('contactPhone'),
                error: null, // Optional field
                validate: function(value) {
                    if (!value.trim()) return null; // Optional field
                    
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    const cleanPhone = value.replace(/[\s\-\(\)\.]/g, '');
                    
                    if (!phoneRegex.test(cleanPhone)) {
                        return 'Please enter a valid phone number';
                    }
                    return null;
                }
            },
            subject: {
                element: document.getElementById('contactSubject'),
                error: document.getElementById('subjectError'),
                validate: function(value) {
                    if (!value.trim()) {
                        return 'Please select a subject';
                    }
                    return null;
                }
            },
            message: {
                element: document.getElementById('contactMessage'),
                error: document.getElementById('messageError'),
                validate: function(value) {
                    if (!value.trim()) {
                        return 'Message is required';
                    }
                    if (value.trim().length < 10) {
                        return 'Message must be at least 10 characters long';
                    }
                    if (value.length > 500) {
                        return 'Message cannot exceed 500 characters';
                    }
                    return null;
                }
            }
        };
        
        // Add real-time validation listeners
        Object.keys(validators).forEach(field => {
            const validator = validators[field];
            if (!validator.element) return;
            
            validator.element.addEventListener('blur', function() {
                validateField(field, validators);
            });
            
            validator.element.addEventListener('input', debounce(function() {
                if (validator.error && validator.error.style.display === 'block') {
                    validateField(field, validators);
                }
            }, 300));
        });
        
        // Store validators for global access
        window.contactValidators = validators;
    }
    
    function validateField(fieldName, validators) {
        const validator = validators[fieldName];
        if (!validator.element) return true;
        
        const value = validator.element.value;
        const error = validator.validate(value);
        
        if (error) {
            if (validator.error) {
                validator.error.textContent = error;
                validator.error.style.display = 'block';
            }
            validator.element.style.borderColor = 'var(--error-color, #e74c3c)';
            validator.element.setAttribute('aria-invalid', 'true');
            return false;
        } else {
            if (validator.error) {
                validator.error.style.display = 'none';
            }
            validator.element.style.borderColor = 'var(--success-color, #27ae60)';
            validator.element.removeAttribute('aria-invalid');
            return true;
        }
    }
    
    function validateForm() {
        const validators = window.contactValidators;
        if (!validators) return false;
        
        let isValid = true;
        let firstInvalidField = null;
        
        Object.keys(validators).forEach(field => {
            if (!validateField(field, validators)) {
                isValid = false;
                if (!firstInvalidField && validators[field].element) {
                    firstInvalidField = validators[field].element;
                }
            }
        });
        
        // Focus first invalid field
        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
        }
        
        return isValid;
    }
    
    // ====================================
    // FORM SUBMISSION
    // ====================================
    
    async function handleFormSubmission(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const formMessages = document.getElementById('formMessages');
        const contactForm = document.getElementById('contactForm');
        
        if (!validateForm()) {
            showMessage('Please fix the errors above before submitting.', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(submitBtn, true);
        
        try {
            const formData = new FormData(contactForm);
            
            // Add timestamp and user agent for tracking
            formData.append('timestamp', new Date().toISOString());
            formData.append('user_agent', navigator.userAgent);
            
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                handleFormSuccess(contactForm);
            } else {
                throw new Error(data.message || 'Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage(
                'Oops! There was an error sending your message. Please try again or contact me directly at mirjan.personal@gmail.com', 
                'error'
            );
        } finally {
            setLoadingState(submitBtn, false);
        }
    }
    
    function setLoadingState(button, isLoading) {
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (isLoading) {
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
        } else {
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
    
    function handleFormSuccess(form) {
        showMessage(
            'Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 
            'success'
        );
        
        // Reset form
        form.reset();
        
        // Reset character counter
        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = '0';
        
        // Reset field styles
        const validators = window.contactValidators;
        if (validators) {
            Object.keys(validators).forEach(field => {
                const element = validators[field].element;
                if (element) {
                    element.style.borderColor = 'var(--form-input-border, #e1e5e9)';
                    element.removeAttribute('aria-invalid');
                }
            });
        }
        
        // Track successful submission (if analytics available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'contact',
                event_label: 'contact_form_success'
            });
        }
    }
    
    // ====================================
    // COPY TO CLIPBOARD FUNCTIONALITY
    // ====================================
    
    function initializeCopyToClipboard() {
        const copyItems = document.querySelectorAll('.contact-copy');
        
        copyItems.forEach(item => {
            item.addEventListener('click', handleCopyClick);
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCopyClick.call(this, e);
                }
            });
        });
    }
    
    async function handleCopyClick(e) {
        e.preventDefault();
        
        const textToCopy = this.getAttribute('data-copy-text');
        const copyIndicator = this.querySelector('.copy-indicator i');
        
        if (!textToCopy) return;
        
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
            indicator.className = 'fas fa-check';
        }
        
        showToast('Email address copied to clipboard!', 'success');
        
        // Reset after 2 seconds
        setTimeout(() => {
            element.classList.remove('copied');
            if (indicator) {
                indicator.className = 'fas fa-copy';
            }
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
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
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
    // THEME INTEGRATION
    // ====================================
    
    function initializeThemeIntegration() {
        // Listen for theme changes if your theme system uses custom events
        document.addEventListener('themeChanged', handleThemeChange);
        
        // Observe theme attribute changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'data-theme' || 
                     mutation.attributeName === 'class')) {
                    updateContactTheme();
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });
    }
    
    function handleThemeChange(event) {
        const { colorTheme, mode } = event.detail || {};
        updateContactTheme(colorTheme, mode);
    }
    
    function updateContactTheme(colorTheme, mode) {
        const contactSection = document.querySelector('.contact-section');
        if (!contactSection) return;
        
        // Get current theme from document or body
        const currentTheme = document.documentElement.getAttribute('data-theme') || 
                           document.body.getAttribute('data-theme') ||
                           getThemeFromClasses();
        
        if (currentTheme) {
            contactSection.setAttribute('data-theme', currentTheme);
        }
        
        // Also copy classes for compatibility
        const themeClasses = Array.from(document.body.classList)
            .filter(cls => cls.startsWith('theme-') || cls.includes('mode'));
        
        // Remove existing theme classes
        contactSection.className = contactSection.className
            .replace(/\btheme-\w+(-\w+)?\b/g, '')
            .replace(/\b\w*-mode\b/g, '');
        
        // Add new theme classes
        themeClasses.forEach(cls => {
            contactSection.classList.add(cls);
        });
    }
    
    function getThemeFromClasses() {
        const body = document.body;
        const classes = Array.from(body.classList);
        
        // Look for theme classes
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
        
        document.body.appendChild(toast);
        
        // Trigger reflow and show
        toast.offsetHeight;
        toast.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    function showMessage(message, type) {
        const formMessages = document.getElementById('formMessages');
        if (!formMessages) return;
        
        formMessages.textContent = message;
        formMessages.className = `form-messages ${type}`;
        formMessages.style.display = 'block';
        formMessages.setAttribute('role', 'alert');
        formMessages.setAttribute('aria-live', 'polite');
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                formMessages.style.display = 'none';
            }, 5000);
        }
        
        // Smooth scroll to message
        formMessages.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
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
    window.ContactForm = {
        updateTheme: updateContactTheme,
        validateForm: validateForm,
        showToast: showToast,
        showMessage: showMessage
    };

})();
