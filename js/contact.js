// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessages = document.getElementById('formMessages');
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    // Character counter for message field
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
    
    // Real-time validation
    const validators = {
        name: {
            element: document.getElementById('name'),
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
            element: document.getElementById('email'),
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
            element: document.getElementById('subject'),
            error: document.getElementById('subjectError'),
            validate: function(value) {
                if (!value) {
                    return 'Please select a subject';
                }
                return null;
            }
        },
        message: {
            element: document.getElementById('message'),
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
    
    // Add real-time validation to form fields
    Object.keys(validators).forEach(field => {
        const validator = validators[field];
        
        validator.element.addEventListener('blur', function() {
            validateField(field);
        });
        
        validator.element.addEventListener('input', function() {
            if (validator.error.style.display === 'block') {
                validateField(field);
            }
        });
    });
    
    function validateField(fieldName) {
        const validator = validators[fieldName];
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
                charCount.textContent = '0';
                // Reset field border colors
                Object.keys(validators).forEach(field => {
                    validators[field].element.style.borderColor = '#e1e5e9';
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
    
    function showMessage(message, type) {
        formMessages.textContent = message;
        formMessages.className = `form-messages ${type}`;
        formMessages.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessages.style.display = 'none';
            }, 5000);
        }
        
        // Scroll to message
        formMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
