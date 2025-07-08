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
// NAVIGATION FUNCTIONALITY
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

    // Hire me button functionality
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
        console.log("Navigation initialized");
    } catch (error) {
        console.error("Error initializing navigation:", error);
    }
    
    try {
        initializeMobileNavigation();
        console.log("Mobile navigation initialized");
    } catch (error) {
        console.error("Error initializing mobile navigation:", error);
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
