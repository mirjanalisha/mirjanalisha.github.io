// ====================================
// PRELOADER FUNCTIONALITY
// ====================================
window.addEventListener("load", function(){
    const preloader = document.querySelector(".preloader");
    if (preloader) {
        preloader.classList.add("opacity-0");
        setTimeout(function(){
            preloader.style.display = "none";
        }, 1000);
    }
});

// ====================================
// SMOOTH SCROLLING UTILITY
// ====================================
function smoothScrollToSection(targetElement, offset = 0) {
    if (!targetElement) return;
    
    // Calculate scroll position with offset
    const elementTop = targetElement.offsetTop;
    const scrollTop = elementTop - offset;
    
    // Use smooth scrolling with modern API
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    } else {
        // Fallback for older browsers
        smoothScrollPolyfill(scrollTop);
    }
}

// Smooth scroll polyfill for older browsers
function smoothScrollPolyfill(targetY) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const duration = 800; // 800ms duration
    let startTime = null;
    
    function animateScroll(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const easeInOutQuad = progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;
        
        window.scrollTo(0, startY + (distance * easeInOutQuad));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
        }
    }
    
    requestAnimationFrame(animateScroll);
}

// Calculate scroll offset based on fixed elements
function getScrollOffset() {
    const aside = document.querySelector(".aside");
    const header = document.querySelector("header");
    let offset = 0;
    
    // Add offset for fixed header if exists
    if (header && window.getComputedStyle(header).position === 'fixed') {
        offset += header.offsetHeight;
    }
    
    // Add some padding for better visual spacing
    offset += 20;
    
    return offset;
}

// ====================================
// PORTFOLIO FILTER FUNCTIONALITY
// ====================================
function initializePortfolioFilter() {
    const filterContainer = document.querySelector(".portfolio-filter");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    
    if (!filterContainer || portfolioItems.length === 0) return;
    
    const filterBtns = filterContainer.children;
    const totalFilterBtn = filterBtns.length;
    const totalPortfolioItems = portfolioItems.length;

    for (let i = 0; i < totalFilterBtn; i++) {
        filterBtns[i].addEventListener("click", function () {
            // Remove active class from all buttons
            const activeBtn = filterContainer.querySelector(".active");
            if (activeBtn) activeBtn.classList.remove("active");
            
            // Add active class to clicked button
            this.classList.add("active");

            const filterValue = this.getAttribute("data-filter");
            
            // Filter portfolio items
            for (let k = 0; k < totalPortfolioItems; k++) {
                const itemCategory = portfolioItems[k].getAttribute("data-category");
                
                if (filterValue === "all" || filterValue === itemCategory) {
                    portfolioItems[k].classList.remove("hide");
                    portfolioItems[k].classList.add("show");
                } else {
                    portfolioItems[k].classList.remove("show");
                    portfolioItems[k].classList.add("hide");
                }
            }
        });
    }
}

// ====================================
// PORTFOLIO LIGHTBOX FUNCTIONALITY
// ====================================
function initializeLightbox() {
    const lightbox = document.querySelector(".lightbox");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    
    if (!lightbox || portfolioItems.length === 0) return;
    
    const lightboxImg = lightbox.querySelector(".lightbox-img");
    const lightboxClose = lightbox.querySelector(".lightbox-close");
    const lightboxText = lightbox.querySelector(".caption-text");
    const lightboxCounter = lightbox.querySelector(".caption-counter");
    const totalPortfolioItems = portfolioItems.length;
    
    let itemIndex = 0;

    // Add click event to portfolio items
    for (let i = 0; i < totalPortfolioItems; i++) {
        portfolioItems[i].addEventListener("click", function () {
            itemIndex = i;
            changeItem();
            toggleLightbox();
        });
    }

    // Lightbox navigation functions
    function nextItem() {
        if (itemIndex === totalPortfolioItems - 1) {
            itemIndex = 0;
        } else {
            itemIndex++;
        }
        changeItem();
    }

    function prevItem() {
        if (itemIndex === 0) {
            itemIndex = totalPortfolioItems - 1;
        } else {
            itemIndex--;
        }
        changeItem();
    }

    function toggleLightbox() {
        lightbox.classList.toggle("open");
    }

    function changeItem() {
        const imgElement = portfolioItems[itemIndex].querySelector(".portfolio-img img");
        const titleElement = portfolioItems[itemIndex].querySelector("h4");
        
        if (imgElement && lightboxImg) {
            const imgSrc = imgElement.getAttribute("src");
            lightboxImg.src = imgSrc;
        }
        
        if (titleElement && lightboxText) {
            lightboxText.innerHTML = titleElement.innerHTML;
        }
        
        if (lightboxCounter) {
            lightboxCounter.innerHTML = (itemIndex + 1) + " of " + totalPortfolioItems;
        }
    }

    // Close lightbox functionality
    if (lightbox) {
        lightbox.addEventListener("click", function (event) {
            if (event.target === lightboxClose || event.target === lightbox) {
                toggleLightbox();
            }
        });
    }

    // Add keyboard navigation
    document.addEventListener("keydown", function(event) {
        if (lightbox.classList.contains("open")) {
            if (event.key === "ArrowRight") {
                nextItem();
            } else if (event.key === "ArrowLeft") {
                prevItem();
            } else if (event.key === "Escape") {
                toggleLightbox();
            }
        }
    });

    // Expose navigation functions globally if needed
    window.nextItem = nextItem;
    window.prevItem = prevItem;
}

// ====================================
// NAVIGATION FUNCTIONALITY WITH SMOOTH SCROLLING
// ====================================
function initializeNavigation() {
    const nav = document.querySelector(".nav");
    const allSection = document.querySelectorAll(".section");
    
    if (!nav || allSection.length === 0) return;
    
    const navList = nav.querySelectorAll("li");
    const totalNavList = navList.length;
    const totalSection = allSection.length;

    for (let i = 0; i < totalNavList; i++) {
        const a = navList[i].querySelector("a");
        if (a) {
            a.addEventListener("click", function (event) {
                event.preventDefault();
                
                // Remove Back Section Class
                removeBackSection();
                
                // Handle active navigation
                for (let j = 0; j < totalNavList; j++) {
                    const navLink = navList[j].querySelector("a");
                    if (navLink && navLink.classList.contains("active")) {
                        addBackSection(j);
                    }
                    if (navLink) navLink.classList.remove("active");
                }
                
                this.classList.add("active");
                showSection(this);
                
                // Close mobile menu if open
                if (window.innerWidth < 1200) {
                    asideSectionTogglerBtn();
                }
            });
        }
    }

    function showSection(element) {
        // Remove active class from all sections
        for (let i = 0; i < totalSection; i++) {
            allSection[i].classList.remove("active");
        }
        
        // Add active class to target section
        const href = element.getAttribute("href");
        if (href) {
            const target = href.split("#")[1];
            const targetElement = document.querySelector("#" + target);
            if (targetElement) {
                targetElement.classList.add("active");
                
                // Add smooth scrolling to the target section
                setTimeout(() => {
                    const scrollOffset = getScrollOffset();
                    smoothScrollToSection(targetElement, scrollOffset);
                }, 100); // Small delay to ensure section is visible
            }
        }
    }

    function addBackSection(num) {
        if (allSection[num]) {
            allSection[num].classList.add("back-section");
        }
    }

    function removeBackSection() {
        for (let i = 0; i < totalSection; i++) {
            allSection[i].classList.remove("back-section");
        }
    }

    function updateNav(element) {
        for (let i = 0; i < totalNavList; i++) {
            const navLink = navList[i].querySelector("a");
            if (navLink) {
                navLink.classList.remove("active");
                const target = element.getAttribute("href").split("#")[1];
                const navTarget = navLink.getAttribute("href").split("#")[1];
                if (target === navTarget) {
                    navLink.classList.add("active");
                }
            }
        }
    }

    // Enhanced hire me button functionality with smooth scrolling
    const hireMeBtn = document.querySelector(".hire-me");
    if (hireMeBtn) {
        hireMeBtn.addEventListener("click", function(event) {
            event.preventDefault();
            showSection(this);
            updateNav(this);
        });
    }

    // Expose functions globally if needed
    window.showSection = showSection;
    window.updateNav = updateNav;
}

// ====================================
// SCROLL SPY FUNCTIONALITY
// ====================================
function initializeScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav a');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    function updateActiveNavOnScroll() {
        const scrollPos = window.pageYOffset + 100; // Add offset for better detection
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding nav link
                const correspondingLink = document.querySelector(`.nav a[href="#${sectionId}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }
    
    // Throttle scroll event for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavOnScroll, 10);
    });
}

// ====================================
// MOBILE NAVIGATION TOGGLE
// ====================================
function initializeMobileNavigation() {
    const navTogglerBtn = document.querySelector(".nav-toggler");
    const aside = document.querySelector(".aside");
    const allSection = document.querySelectorAll(".section");
    
    if (!navTogglerBtn || !aside) return;

    navTogglerBtn.addEventListener("click", asideSectionTogglerBtn);

    function asideSectionTogglerBtn() {
        aside.classList.toggle("open");
        navTogglerBtn.classList.toggle("open");
        
        for (let i = 0; i < allSection.length; i++) {
            allSection[i].classList.toggle("open");
        }
    }

    // Close mobile menu when clicking outside
    document.addEventListener("click", function(event) {
        if (window.innerWidth < 1200 && aside.classList.contains("open")) {
            const clickInsideAside = aside.contains(event.target);
            const clickOnToggler = navTogglerBtn.contains(event.target);
            
            if (!clickInsideAside && !clickOnToggler) {
                asideSectionTogglerBtn();
            }
        }
    });

    // Close mobile menu with escape key
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && aside.classList.contains("open")) {
            asideSectionTogglerBtn();
        }
    });

    // Expose function globally
    window.asideSectionTogglerBtn = asideSectionTogglerBtn;
}

// ====================================
// ENHANCED SCROLL TO TOP FUNCTIONALITY
// ====================================
function initializeScrollToTop() {
    // Create scroll to top button if it doesn't exist
    let scrollToTopBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollToTopBtn) {
        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #667eea;
            color: white;
            border: none;
            cursor: pointer;
            display: none;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(scrollToTopBtn);
    }
    
    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    // Smooth scroll to top when clicked
    scrollToTopBtn.addEventListener('click', () => {
        smoothScrollToSection(document.body, 0);
    });
}

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM Content Loaded - Initializing components...");
    
    try {
        initializePortfolioFilter();
        console.log("Portfolio filter initialized");
    } catch (error) {
        console.error("Error initializing portfolio filter:", error);
    }
    
    try {
        initializeLightbox();
        console.log("Lightbox initialized");
    } catch (error) {
        console.error("Error initializing lightbox:", error);
    }
    
    try {
        initializeNavigation();
        console.log("Navigation with smooth scrolling initialized");
    } catch (error) {
        console.error("Error initializing navigation:", error);
    }
    
    try {
        initializeMobileNavigation();
        console.log("Mobile navigation initialized");
    } catch (error) {
        console.error("Error initializing mobile navigation:", error);
    }
    
    try {
        initializeScrollSpy();
        console.log("Scroll spy initialized");
    } catch (error) {
        console.error("Error initializing scroll spy:", error);
    }
    
    try {
        initializeScrollToTop();
        console.log("Scroll to top initialized");
    } catch (error) {
        console.error("Error initializing scroll to top:", error);
    }
    try {
        initializeFAQ();
        console.log("FAQ functionality initialized");
    } catch (error) {
        console.error("Error initializing FAQ:", error);
    }
    
    console.log("All components initialized successfully");
});

// ====================================
// ERROR HANDLING
// ====================================
window.addEventListener("error", function(event) {
    console.error("JavaScript Error:", event.error);
});

// ====================================
// PERFORMANCE MONITORING
// ====================================
window.addEventListener("load", function() {
    console.log("Page fully loaded");
    
    // Optional: Add performance metrics
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log("Page load time:", loadTime + "ms");
    }
});

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Debounce function for performance optimization
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

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to any element (public utility)
window.scrollToElement = function(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        smoothScrollToSection(element, offset || getScrollOffset());
    }
};


// FAQ Accordion Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

