/**
 * FAQ Unlock Functionality
 * Requires valid email and details to view content
 * Submits to Web3Forms for verification
 */

(function() {
    'use strict';

    const UNLOCK_KEY = 'faq_unlocked_email';
    let faqSection;
    let faqModal;
    let unlockForm;
    let emailInput;
    let errorMsg;
    let cancelBtn;
    let unlockBtn;
    let phoneInput;

    document.addEventListener('DOMContentLoaded', function() {
        initElements();
        checkInitialStatus();
        setupEventListeners();
    });

    function initElements() {
        faqSection = document.querySelector('#faq');
        faqModal = document.querySelector('#faqUnlockModal');
        unlockForm = document.querySelector('#faqUnlockForm');
        emailInput = document.querySelector('#faqUnlockEmail');
        errorMsg = document.querySelector('#faqEmailError');
        cancelBtn = document.querySelector('#btnCancelFaq');
        unlockBtn = document.querySelector('#btnUnlockFaq');
        phoneInput = document.querySelector('#faqUnlockPhone');
    }

    function checkInitialStatus() {
        if (isUnlocked()) {
            unlockFaq(false); // Unlock without scrolling
        } else {
            lockFaq();
        }
    }

    function isUnlocked() {
        return localStorage.getItem(UNLOCK_KEY) !== null;
    }

    function lockFaq() {
        if (faqSection) {
            faqSection.classList.add('locked');
        }
    }

    function unlockFaq(shouldScroll = true) {
        if (faqSection) {
            faqSection.classList.remove('locked');
            if (shouldScroll) {
                if (window.scrollToElement) {
                    window.scrollToElement('faq');
                } else {
                    faqSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    function setupEventListeners() {
        const faqLinks = document.querySelectorAll('a[href="#faq"]');
        faqLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (!isUnlocked()) {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal();
                }
            });
        });
        
        if (emailInput) {
            emailInput.addEventListener('focus', function() {
                this.style.borderColor = '';
                if (errorMsg) errorMsg.style.display = 'none';
            });
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('focus', function() {
                this.style.borderColor = '';
                if (errorMsg) errorMsg.style.display = 'none';
            });
        }

        if (unlockForm) {
            unlockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleUnlock();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        const overlay = document.querySelector('.faq-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && faqModal && faqModal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    function openModal() {
        if (faqModal) {
            faqModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (emailInput) emailInput.focus();
        }
    }

    function closeModal() {
        if (faqModal) {
            faqModal.classList.remove('open');
            document.body.style.overflow = 'auto';
            if (errorMsg) errorMsg.style.display = 'none';
            if (unlockForm) unlockForm.reset();
            if (emailInput) emailInput.style.borderColor = '';
            if (phoneInput) phoneInput.style.borderColor = '';
        }
    }

    async function handleUnlock() {
        const nameInput = document.querySelector('#faqUnlockName');
        const roleInput = document.querySelector('#faqUnlockRole');
        const email = emailInput.value.trim();
        const btnText = unlockBtn.querySelector('.btn-text');
        const btnLoading = unlockBtn.querySelector('.btn-loading');

        // Check if a request has already been made on this device
        if (window.RateLimiter && window.RateLimiter.isOnCooldown('faq')) {
            showError('Only one unlock request is allowed per device.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Please enter a valid email address.', emailInput);
            return;
        }

        const phone = phoneInput ? phoneInput.value.trim() : '';
        if (phone && !validatePhone(phone)) {
            showError('Please enter a valid phone number (min 8 digits).', phoneInput);
            return;
        }

        if (!nameInput.value.trim() || !roleInput.value) {
            showError('Please fill in all required fields.');
            return;
        }

        // Show loading state
        if (btnText && btnLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            unlockBtn.disabled = true;
        }

        // Prepare data for Web3Forms
        const formData = new FormData(unlockForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem(UNLOCK_KEY, email);
                // Set "permanent" cooldown for FAQ (1 year)
                if (window.RateLimiter) {
                    window.RateLimiter.setCooldown('faq', 31536000); 
                }
                closeModal();
                unlockFaq(true);
                if (window.ContactEnhancements && window.ContactEnhancements.showToast) {
                    window.ContactEnhancements.showToast('FAQs Unlocked Successfully!', 'success');
                }
            } else {
                showError('Something went wrong. Please try again later.');
                console.error('Submission failed:', result);
            }
        } catch (error) {
            showError('Network error. Please check your connection.');
            console.error('Fetch error:', error);
        } finally {
            // Restore button state
            if (btnText && btnLoading) {
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
                unlockBtn.disabled = false;
            }
        }
    }

    function showError(msg, inputElement = null) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
        }
        if (inputElement) {
            inputElement.style.borderColor = '#e74c3c';
        }
    }

    function validatePhone(phone) {
        const phoneRegex = /^\+?(\d[\d\-. ]+)?(\([\d\-. ]+\))?[\d\-. ]+\d$/;
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return phoneRegex.test(phone) && cleanPhone.length >= 8 && cleanPhone.length <= 15;
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return re.test(email);
    }

    window.isFaqUnlocked = isUnlocked;
    window.openFaqModal = openModal;

})();
