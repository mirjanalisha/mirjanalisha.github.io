/**
 * CV Download Form Logic 
 * Handles modal, persistence, and automated download.
 */

(function() {
    'use strict';

    const RESUME_URL = 'https://raw.githubusercontent.com/Mirjan-Ali-Sha/portfolio/master/assets/Mirjan-Ali-Sha-Resume.pdf';
    const STORAGE_KEY = 'cv_last_submitted_date';
    const ACCESS_KEY = '18909221-c276-4d4a-bd99-68c3b0a0b250';

    document.addEventListener('DOMContentLoaded', () => {
        initializeCVBtn();
        initializeModalEvents();
        initializeFormSubmission();
    });

    /**
     * Finds the Download CV button and updates its behavior
     */
    function initializeCVBtn() {
        // Target the button in the About section (line 373 of index.html)
        const downloadBtn = document.querySelector('a[href*="forms.gle/C2Wta7zTjmzNEktv6"]');
        
        if (!downloadBtn) {
            console.error('Download CV button not found');
            return;
        }

        // Remove the direct link and add our logic
        downloadBtn.removeAttribute('href');
        downloadBtn.removeAttribute('target');
        downloadBtn.style.cursor = 'pointer';

        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (hasSubmittedToday()) {
                console.log('User already submitted today. Downloading directly...');
                triggerDownload();
                showToast('Downloading CV directly...', 'success');
            } else {
                openCVModal();
            }
        });
    }

    /**
     * Checks if the form was successfully submitted today
     */
    function hasSubmittedToday() {
        const lastSubmitted = localStorage.getItem(STORAGE_KEY);
        if (!lastSubmitted) return false;

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return lastSubmitted === today;
    }

    /**
     * Opens the capture modal
     */
    function openCVModal() {
        const modal = document.getElementById('cvDownloadModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    /**
     * Closes the capture modal
     */
    function closeCVModal() {
        const modal = document.getElementById('cvDownloadModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Reset form and success overlay
            const form = document.getElementById('cvDownloadForm');
            const successOverlay = modal.querySelector('.cv-success-overlay');
            if (form) form.reset();
            if (successOverlay) successOverlay.classList.remove('active');
        }
    }

    function initializeModalEvents() {
        const modal = document.getElementById('cvDownloadModal');
        const closeBtn = document.querySelector('.cv-modal-close');
        const cancelBtn = document.querySelector('.cv-btn-cancel');

        if (!modal) return;

        closeBtn?.addEventListener('click', closeCVModal);
        cancelBtn?.addEventListener('click', closeCVModal);

        // Close on clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCVModal();
        });
    }

    /**
     * Handles the form submission to Web3Forms
     */
    function initializeFormSubmission() {
        const form = document.getElementById('cvDownloadForm');
        const submitBtn = form?.querySelector('.cv-btn-submit');

        if (!form || !submitBtn) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            
            // Perform Validation
            if (!validateCVForm(object)) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                return;
            }

            // Add technical metadata
            object.subject = `CV Download Request - ${object.cv_name}`;
            object.from_name = "Portfolio CV Gateway";
            object.access_key = ACCESS_KEY;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(object)
                });

                const result = await response.json();

                if (result.success) {
                    // Save state
                    const today = new Date().toISOString().split('T')[0];
                    localStorage.setItem(STORAGE_KEY, today);

                    // Show success UI
                    const successOverlay = document.querySelector('.cv-success-overlay');
                    if (successOverlay) successOverlay.classList.add('active');

                    // Trigger Download
                    setTimeout(() => {
                        triggerDownload();
                        showToast('Thank you! Starting download...', 'success');
                        
                        // Close after a short delay
                        setTimeout(closeCVModal, 2000);
                    }, 500);
                } else {
                    showToast('Submission failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('CV Form Error:', error);
                showToast('Network error. Please check your connection.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        });
    }

    /**
     * Triggers the actual file download
     */
    function triggerDownload() {
        const link = document.createElement('a');
        link.href = RESUME_URL;
        link.download = 'Mirjan-Ali-Sha-Resume.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Robust Validation Logic
     */
    function validateCVForm(data) {
        let isValid = true;
        
        // Reset all errors
        document.querySelectorAll('.cv-modal .error-msg').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.cv-modal .cv-form-control').forEach(el => el.classList.remove('invalid'));

        // Name Validation
        if (!data.cv_name || data.cv_name.trim().length < 2) {
            showFieldError('cv_name', 'Please enter your name or company');
            isValid = false;
        }

        // Address Validation
        if (!data.cv_address || data.cv_address.trim().length < 3) {
            showFieldError('cv_address', 'Please enter a valid address (City, Country)');
            isValid = false;
        }

        // Email Validation
        if (!data.cv_email) {
            showFieldError('cv_email', 'Email Address is required');
            isValid = false;
        } else {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(data.cv_email.trim())) {
                showFieldError('cv_email', 'Please enter a valid email address');
                isValid = false;
            }
        }

        // Purpose Validation
        if (!data.cv_purpose || data.cv_purpose.trim().length < 5) {
            showFieldError('cv_purpose', 'Please provide a brief purpose for the download');
            isValid = false;
        }

        // Optional Phone Validation
        if (data.cv_phone && data.cv_phone.trim().length > 0) {
            const phoneRegex = /^\+?(\d[\d\-. ]+)?(\([\d\-. ]+\))?[\d\-. ]+\d$/;
            const cleanPhone = data.cv_phone.replace(/[\s\-\(\)\.]/g, '');
            if (!phoneRegex.test(data.cv_phone) || cleanPhone.length < 8 || cleanPhone.length > 15) {
                showFieldError('cv_phone', 'Please enter a valid phone number (min 8 digits)');
                isValid = false;
            }
        }

        return isValid;
    }

    function showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`${fieldId}_error`);
        if (input) input.classList.add('invalid');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    /**
     * Helper to show toasts (using existing system if available)
     */
    function showToast(message, type) {
        if (window.ContactEnhancements && window.ContactEnhancements.showToast) {
            window.ContactEnhancements.showToast(message, type);
        } else {
            alert(message); // Fallback
        }
    }

})();
