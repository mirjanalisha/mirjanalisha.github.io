// Contact Form and Copy Functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessages = document.getElementById('formMessages');
    const messageTextarea = document.getElementById('contactMessage');
    const charCount = document.getElementById('charCount');
    const copyItems = document.querySelectorAll('.contact-copy');
    
    // Initialize character counter
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > 500) {
                charCount.style.color = '#e74c3c';
                this.value = this.value.substring(0, 500);
                charCount.textContent = '500';
            } else {
                charCount.style.color = '#666';
            }
        });
    }
    
    // Copy to clipboard functionality
    copyItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const textToCopy = this.getAttribute('data-copy-text');
            const copyIndicator = this.querySelector('.copy-indicator i');
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showCopySuccess(this, copyIndicator);
                }).catch(err => {
                    fallbackCopyTextToClipboard(textToCopy, this, copyIndicator);
                });
            } else {
                fallbackCopyTextToClipboard(textToCopy, this, copyIndicator);
            }
        });
    });
    
    // Form validation
    const validators = {
        name: {
            element: document.getElementById('contactName'),
            error: document.getElementById('nameError'),
            validate: function(value) {
                if (value.length < 2) {
                    return 'Name must be at least 2 characters long';
                }
                if (!/^[a-zA-Z\s]+$/.test(value)) {
                    return 'Name can only contain letters and spaces';
                }
                return null;
            }
        },
        email: {
            element: document.getElementById('contactEmail'),
            error: document.getElementById('emailError'),
            validate: function(value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return 'Please enter a valid email address';
                }
                return null;
            }
        },
        subject: {
            element: document.getElementById('contactSubject'),
            error: document.getElementById('subjectError'),
            validate: function(value) {
                if (!value) {
                    return 'Please select a subject';
                }
                return null;
            }
        },
        message: {
            element: document.getElementById('contactMessage'),
            error: document.getElementById('messageError'),
            validate: function(value) {
                if (value.length < 10) {
                    return 'Message must be at least 10 characters long';
                }
                if (value.length > 500) {
                    return 'Message cannot exceed 500 characters';
                }
                return null;
            }
        }
    };
    
    // Add validation listeners
    Object.keys(validators).forEach(field => {
        const validator = validators[field];
        if (validator.element) {
            validator.element.addEventListener('blur', function() {
                validateField(field);
            });
            
            validator.element.addEventListener('input', function() {
                if (validator.error && validator.error.style.display === 'block') {
                    validateField(field);
                }
            });
        }
    });
    
    function validateField(fieldName) {
        const validator = validators[fieldName];
        if (!validator.element || !validator.error) return true;
        
        const value = validator.element.value.trim();
        const error = validator.validate(value);
        
        if (error) {
            validator.error.textContent = error;
            validator.error.style.display = 'block';
            validator.element.style.borderColor = '#e74c3c';
            return false;
        } else {
            validator.error.style.display = 'none';
            validator.element.style.borderColor = '#27ae60';
            return true;
        }
    }
    
    function validateForm() {
        let isValid = true;
        Object.keys(validators).forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }
    
    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                showMessage('Please fix the errors above before submitting.', 'error');
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').style.display = 'none';
            submitBtn.querySelector('.btn-loading').style.display = 'inline-block';
            
            try {
                const formData = new FormData(contactForm);
                
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 'success');
                    contactForm.reset();
                    if (charCount) charCount.textContent = '0';
                    
                    // Reset field border colors
                    Object.keys(validators).forEach(field => {
                        if (validators[field].element) {
                            validators[field].element.style.borderColor = '#e1e5e9';
                        }
                    });
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                showMessage('Oops! There was an error sending your message. Please try again or contact me directly at mirjan.personal@gmail.com', 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').style.display = 'inline-block';
                submitBtn.querySelector('.btn-loading').style.display = 'none';
            }
        });
    }
    
    // Helper functions
    function showCopySuccess(element, indicator) {
        element.classList.add('copied');
        indicator.className = 'fas fa-check';
        showToast('Email address copied to clipboard!');
        
        setTimeout(() => {
            element.classList.remove('copied');
            indicator.className = 'fas fa-copy';
        }, 2000);
    }
    
    function fallbackCopyTextToClipboard(text, element, indicator) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess(element, indicator);
            } else {
                showToast('Failed to copy email address', 'error');
            }
        } catch (err) {
            showToast('Failed to copy email address', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `copy-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);
        
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
    
    function showMessage(message, type) {
        if (formMessages) {
            formMessages.textContent = message;
            formMessages.className = `form-messages ${type}`;
            formMessages.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    formMessages.style.display = 'none';
                }, 5000);
            }
            
            formMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});
