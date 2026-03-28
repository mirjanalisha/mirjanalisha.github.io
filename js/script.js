// ====================================
// PRELOADER FUNCTIONALITY
// ====================================
window.addEventListener("load", function(){
    try {
        if (typeof gsap !== "undefined") {
            gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

            // Preloader Animation
            var timeline = gsap.timeline();
            timeline.to(".mil-preloader-animation", { opacity: 1 });
            timeline.fromTo(".mil-animation-1 .mil-h3", { y: "30px", opacity: 0 }, { y: "0px", opacity: 1, stagger: 0.4 });
            timeline.to(".mil-animation-1 .mil-h3", { opacity: 0, y: '-30' }, "+=.3");
            timeline.fromTo(".mil-reveal-box", { opacity: 0 }, { opacity: 1, x: '-30', duration: 0.1 });
            timeline.to(".mil-reveal-box", { width: "100%", x: 0, duration: 0.45 }, "+=.1");
            timeline.to(".mil-reveal-box", { right: "0" });
            timeline.to(".mil-reveal-box", { width: "0%", duration: 0.3 });
            timeline.fromTo(".mil-animation-2 .mil-h3", { opacity: 0 }, { opacity: 1 }, "-=.5");
            timeline.to(".mil-animation-2 .mil-h3", { opacity: 0, y: '-30', duration: 0.6 }, "+=.5");
            timeline.to(".mil-preloader", { 
                opacity: 0, 
                ease: 'sine', 
                duration: 0.8,
                onComplete: function () {
                    var preloader = document.querySelector('.mil-preloader');
                    if(preloader) {
                        preloader.classList.add("mil-hidden");
                        preloader.style.display = "none";
                        // add transition out of body
                        document.body.style.overflow = "auto";
                    }
                }
            }, "+=.2");

            document.body.style.overflow = "hidden"; // lock scroll until preloader done

            // Append 3D elements
            const dodecahedron = document.querySelector(".mil-dodecahedron");
            const animations = document.querySelectorAll(".mil-animation");
            if(dodecahedron && animations.length) {
                animations.forEach(anim => {
                    anim.appendChild(dodecahedron.cloneNode(true));
                });
            }

            // Home Page Parallax/Scale Animation
            const scaleImage = document.querySelectorAll(".mil-scale");
            scaleImage.forEach((section) => {
                var value1 = section.getAttribute("data-value-1") || 1;
                var value2 = section.getAttribute("data-value-2") || 1;
                gsap.fromTo(section, 
                    { scale: value1 }, 
                    { scale: value2, ease: 'sine', scrollTrigger: { trigger: "#home", scrub: true } }
                );
            });
        } else {
            fallbackPreloader();
        }
    } catch (e) {
        console.error("GSAP Animation error: ", e);
        fallbackPreloader();
    }

    function fallbackPreloader() {
        // Fallback
        const preloader = document.querySelector(".preloader") || document.querySelector(".mil-preloader");
        if (preloader) {
            preloader.classList.add("opacity-0");
            setTimeout(function(){
                preloader.style.display = "none";
            }, 1000);
        }
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
    
    const lightboxIcon = lightbox.querySelector(".lightbox-icon");
    const lightboxTitle = lightbox.querySelector(".lightbox-title");
    const lightboxDescription = lightbox.querySelector(".lightbox-description");
    const lightboxCounter = lightbox.querySelector(".lightbox-counter");
    const lightboxBtn = lightbox.querySelector(".btn-download");
    const btnText = lightboxBtn ? lightboxBtn.querySelector(".btn-text") : null;
    const lightboxRating = lightbox.querySelector(".rating-stars");
    const lightboxDate = lightbox.querySelector(".project-date");
    const lightboxDownloads = lightbox.querySelector(".download-count");
    const lightboxClose = lightbox.querySelector(".lightbox-close");
    const lightboxOverlay = lightbox.querySelector(".lightbox-overlay");
    const lightboxIframe = lightbox.querySelector(".lightbox-iframe");
    
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
        itemIndex = (itemIndex + 1) % totalPortfolioItems;
        changeItem();
    }

    function prevItem() {
        itemIndex = (itemIndex - 1 + totalPortfolioItems) % totalPortfolioItems;
        changeItem();
    }

    function toggleLightbox() {
        const isOpen = lightbox.classList.toggle("open");
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            // Clear iframe src when closing to stop music/video
            if (lightboxIframe) {
                lightboxIframe.src = "";
            }
            lightbox.classList.remove("expanded", "loading");
        }
    }

    function changeItem() {
        const item = portfolioItems[itemIndex];
        const imgElement = item.querySelector(".portfolio-img img");
        const titleElement = item.querySelector("h4");
        const category = item.getAttribute("data-category");
        
        // Extract data attributes
        const description = item.getAttribute("data-description") || "No description available.";
        const link = item.getAttribute("data-link") || "#";
        const downloads = item.getAttribute("data-downloads") || "0";
        const rating = parseFloat(item.getAttribute("data-rating")) || 0;
        const date = item.getAttribute("data-date") || "2024";

        // Handle iFrame (Web Apps)
        if (category === "web-apps") {
            lightbox.classList.add("expanded", "loading");
            if (lightboxIframe) {
                lightboxIframe.src = link;
                lightboxIframe.onload = () => {
                    lightbox.classList.remove("loading");
                };
            }
            if (btnText) btnText.textContent = "Visit Website";
        } else {
            lightbox.classList.remove("expanded", "loading");
            if (lightboxIframe) lightboxIframe.src = "";
            if (btnText) btnText.textContent = "Download";
        }

        // Update modal content
        if (imgElement && lightboxIcon) {
            lightboxIcon.src = imgElement.getAttribute("src");
        }
        
        if (titleElement && lightboxTitle) {
            lightboxTitle.textContent = titleElement.textContent;
        }
        
        if (lightboxDescription) {
            lightboxDescription.textContent = description;
        }
        
        if (lightboxBtn) {
            lightboxBtn.href = link;
        }
        
        if (lightboxDate) {
            lightboxDate.textContent = date;
        }
        
        if (lightboxDownloads) {
            lightboxDownloads.textContent = downloads;
        }
        
        if (lightboxCounter) {
            lightboxCounter.textContent = (itemIndex + 1) + " of " + totalPortfolioItems;
        }

        // Render Rating Stars
        if (lightboxRating) {
            let starsHtml = "";
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 !== 0;
            
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else if (i === fullStars && hasHalfStar) {
                    starsHtml += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }
            starsHtml += ` <span class="rating-text">(${rating})</span>`;
            lightboxRating.innerHTML = starsHtml;
        }
    }

    // Close lightbox functionality
    if (lightboxClose) {
        lightboxClose.addEventListener("click", toggleLightbox);
    }
    
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener("click", toggleLightbox);
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

    // Expose navigation functions globally
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
    const mainContent = document.querySelector(".main-content");

    if (!navTogglerBtn || !aside) return;

    function setMenuState(shouldOpen) {
        aside.classList.toggle("open", shouldOpen);
        navTogglerBtn.classList.toggle("open", shouldOpen);
        if (mainContent) {
            mainContent.classList.toggle("open", shouldOpen);
        }

        allSection.forEach(section => {
            section.classList.toggle("open", shouldOpen);
        });
    }

    function toggleMenu() {
        const willOpen = !aside.classList.contains("open");
        setMenuState(willOpen);
    }

    function closeMenu() {
        if (aside.classList.contains("open")) {
            setMenuState(false);
        }
    }

    navTogglerBtn.addEventListener("click", toggleMenu);

    document.addEventListener("click", function(event) {
        if (window.innerWidth < 1200 && aside.classList.contains("open")) {
            const clickInsideAside = aside.contains(event.target);
            const clickOnToggler = navTogglerBtn.contains(event.target);

            if (!clickInsideAside && !clickOnToggler) {
                closeMenu();
            }
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", function() {
        if (window.innerWidth >= 1200) {
            closeMenu();
        }
    });

    window.asideSectionTogglerBtn = closeMenu;
}

// ====================================
// PERSONAL INFO HELPERS
// ====================================
function updateAgeFromDOB() {
    const ageTarget = document.querySelector('[data-dob-age]');
    if (!ageTarget) return;

    const dob = new Date('1997-03-20T00:00:00');
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!hasHadBirthdayThisYear) {
        age -= 1;
    }

    ageTarget.textContent = age;
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
        updateAgeFromDOB();
        console.log("Age updated from DOB");
    } catch (error) {
        console.error("Error updating age from DOB:", error);
    }
    try {
        initializeFAQ();
        console.log("FAQ functionality initialized");
    } catch (error) {
        console.error("Error initializing FAQ:", error);
    }
    try {
        initializeBlogSection();
        console.log("Blog section initialized");
    } catch (error) {
        console.error("Error initializing blog section:", error);
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

// Blog Modal and Markdown Loading Functionality
function initializeBlogSection() {
    const blogModal = document.getElementById('blogModal');
    const modalClose = document.querySelector('.modal-close');
    const modalTitle = document.querySelector('.modal-title');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const blogContent = document.querySelector('.blog-content');
    
    // Read More buttons for featured blogs
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    
    // Archive item buttons
    const archiveItems = document.querySelectorAll('.archive-item');
    
    // Initialize marked.js for markdown parsing
    if (typeof marked === 'undefined') {
        console.warn('Marked.js not loaded. Please include marked.js library.');
        return;
    }
    
    // Configure marked options
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        highlight: function(code, lang) {
            return code; // You can integrate syntax highlighter here
        }
    });
    
    // Featured blog read more functionality
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const markdownPath = this.getAttribute('data-markdown');
            const title = this.closest('.blog-item').querySelector('.blog-title').textContent;
            openBlogModal(markdownPath, title);
        });
    });
    
    // Archive item functionality
    archiveItems.forEach(item => {
        const readBtn = item.querySelector('.archive-read-btn');
        const markdownPath = item.getAttribute('data-markdown');
        const title = item.querySelector('h5').textContent;
        
        readBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Check if item is already expanded
            if (item.classList.contains('expanded')) {
                // Collapse inline content
                const inlineContent = item.querySelector('.inline-content');
                if (inlineContent) {
                    inlineContent.remove();
                }
                item.classList.remove('expanded');
                this.querySelector('i').style.transform = 'rotate(0deg)';
            } else {
                // Collapse all other expanded items
                archiveItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('expanded')) {
                        const otherInlineContent = otherItem.querySelector('.inline-content');
                        if (otherInlineContent) {
                            otherInlineContent.remove();
                        }
                        otherItem.classList.remove('expanded');
                        otherItem.querySelector('.archive-read-btn i').style.transform = 'rotate(0deg)';
                    }
                });
                
                // Expand current item
                expandArchiveItem(item, markdownPath, title);
            }
        });
    });
    
    // Modal close functionality
    modalClose.addEventListener('click', closeBlogModal);
    
    // Close modal when clicking outside
    blogModal.addEventListener('click', function(e) {
        if (e.target === blogModal) {
            closeBlogModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogModal.classList.contains('active')) {
            closeBlogModal();
        }
    });
    
    function openBlogModal(markdownPath, title) {
        modalTitle.textContent = title;
        blogModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        blogContent.style.display = 'none';
        blogContent.classList.remove('loaded');
        
        // Load markdown content
        loadMarkdownContent(markdownPath)
            .then(html => {
                blogContent.innerHTML = html;
                loadingSpinner.style.display = 'none';
                blogContent.style.display = 'block';
                blogContent.classList.add('loaded');
            })
            .catch(error => {
                console.error('Error loading markdown:', error);
                let errorMessage = 'Error loading article content. Please try again later.';
                
                if (window.location.protocol === 'file:') {
                    errorMessage = `
                        <div class="local-file-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p><strong>Local File Access Blocked:</strong> Browsers block loading external content when opening files directly via <code>file://</code>.</p>
                            <p>To view the blog content locally, please use a local web server like <strong>VS Code Live Server</strong> or run <code>npx serve</code> in your project directory.</p>
                        </div>
                    `;
                }
                
                blogContent.innerHTML = errorMessage;
                loadingSpinner.style.display = 'none';
                blogContent.style.display = 'block';
                blogContent.classList.add('loaded');
            });
    }
    
    function closeBlogModal() {
        blogModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function expandArchiveItem(item, markdownPath, title) {
        // Create inline content container
        const inlineContent = document.createElement('div');
        inlineContent.className = 'inline-content';
        inlineContent.innerHTML = `
            <div class="inline-loading">
                <div class="small-spinner"></div>
                <span>Loading...</span>
            </div>
            <div class="inline-blog-content"></div>
        `;
        
        // Add to item
        item.appendChild(inlineContent);
        item.classList.add('expanded');
        item.querySelector('.archive-read-btn i').style.transform = 'rotate(45deg)';
        
        // Load content
        const inlineContentDiv = inlineContent.querySelector('.inline-blog-content');
        const inlineLoading = inlineContent.querySelector('.inline-loading');
        
        loadMarkdownContent(markdownPath)
            .then(html => {
                inlineContentDiv.innerHTML = html;
                inlineLoading.style.display = 'none';
                inlineContentDiv.style.display = 'block';
                
                // Smooth scroll to expanded content
                setTimeout(() => {
                    inlineContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            })
            .catch(error => {
                console.error('Error loading markdown:', error);
                let errorMessage = 'Error loading article content.';
                
                if (window.location.protocol === 'file:') {
                    errorMessage = '<p style="color: #d9534f; font-size: 0.9em;"><strong>Error:</strong> Local file access blocked. Please use a local web server.</p>';
                }
                
                inlineContentDiv.innerHTML = errorMessage;
                inlineLoading.style.display = 'none';
                inlineContentDiv.style.display = 'block';
            });
    }
    
    async function loadMarkdownContent(markdownPath) {
        try {
            const response = await fetch(markdownPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdownText = await response.text();
            return marked.parse(markdownText);
        } catch (error) {
            console.error('Error fetching markdown:', error);
            throw error;
        }
    }
}

// Add CSS for inline content
const inlineContentCSS = `
    .inline-content {
        margin-top: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 1px solid #e8dfec;
        animation: expandIn 0.3s ease;
    }
    
    @keyframes expandIn {
        from {
            max-height: 0;
            opacity: 0;
        }
        to {
            max-height: 1000px;
            opacity: 1;
        }
    }
    
    .inline-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 20px;
        color: #667eea;
    }
    
    .small-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e8dfec;
        border-top: 2px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .inline-blog-content {
        display: none;
        line-height: 1.6;
        color: #504e70;
    }
    
    .inline-blog-content h1, .inline-blog-content h2, .inline-blog-content h3 {
        color: #302e4d;
        margin-top: 20px;
        margin-bottom: 10px;
    }
    
    .inline-blog-content p {
        margin-bottom: 12px;
    }
    
    .inline-blog-content pre {
        background: #ffffff;
        border: 1px solid #d4d4e3;
        border-radius: 5px;
        padding: 10px;
        overflow-x: auto;
        font-size: 12px;
    }
    
    .inline-blog-content code {
        background: #ffffff;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 12px;
    }
    
    /* Dark mode support */
    body.dark .inline-content {
        background: #2a2a2a;
        border-color: #393939;
    }
    
    body.dark .inline-blog-content {
        color: #e9e9e9;
    }
    
    body.dark .inline-blog-content h1, 
    body.dark .inline-blog-content h2, 
    body.dark .inline-blog-content h3 {
        color: #ffffff;
    }
    
    body.dark .inline-blog-content pre,
    body.dark .inline-blog-content code {
        background: #333333;
        border-color: #393939;
    }
    
    /* Local file error styling */
    .local-file-error {
        text-align: center;
        padding: 40px 20px;
        color: #504e70;
    }
    
    .local-file-error i {
        font-size: 3em;
        color: #ffcc00;
        margin-bottom: 20px;
    }
    
    .local-file-error p {
        margin-bottom: 15px;
        line-height: 1.6;
    }
    
    .local-file-error code {
        background: #e8dfec;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
    }
`;

// Add inline content styles
const inlineStyleSheet = document.createElement('style');
inlineStyleSheet.textContent = inlineContentCSS;
document.head.appendChild(inlineStyleSheet);
