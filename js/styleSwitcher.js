// Variables
const links=document.querySelectorAll(".alternate-style"),
      totalLinks=links.length;

// Style Switching with localStorage persistence
function setActiveStyle(color) {
    for (let i = 0; i < totalLinks; i++) {
        if (color === links[i].getAttribute("title")) {
            links[i].removeAttribute("disabled");
        }
        else{
            links[i].setAttribute("disabled", "true");
        }
    }
    // Save color preference
    try { localStorage.setItem('portfolio-theme-color', color); } catch(e) {}
}

const navToggle = document.querySelector(".nav-toggler");
if (navToggle) {
    navToggle.classList.remove("hidden");
}

const styleSwitcherToggle = document.querySelector(".toggle-style-switcher");
if (styleSwitcherToggle) {
    styleSwitcherToggle.addEventListener("click", () => {
        const switcher = document.querySelector(".style-switcher");
        if (switcher) {
            switcher.classList.toggle("open");
        }
    });
}

// Body Skin Changing with localStorage persistence
const bodySkin=document.querySelectorAll(".body-skin"),
      totalBodySkin=bodySkin.length;
    for (let i = 0; i < totalBodySkin; i++) {
        bodySkin[i].addEventListener("change", function(){
            /* ROYAL GOLDEN THEME SUPPORT: START */
            if (this.value === "dark") {
                document.body.className="dark";
            }
            else if (this.value === "royal-golden") {
                document.body.className="royal-golden";
            }
            else{
                document.body.className=""
            }
            /* ROYAL GOLDEN THEME SUPPORT: END */
            // Save dark/light/royal preference
            try { localStorage.setItem('portfolio-theme-mode', this.value); } catch(e) {}
        });
    }

// Restore saved theme on page load
(function restoreTheme() {
    try {
        const savedColor = localStorage.getItem('portfolio-theme-color');
        const savedMode = localStorage.getItem('portfolio-theme-mode');
        
        if (savedColor) {
            setActiveStyle(savedColor);
        }
        
        /* ROYAL GOLDEN THEME SUPPORT: START */
        if (savedMode === 'dark') {
            document.body.className = 'dark';
            const darkRadio = document.querySelector('.body-skin[value="dark"]');
            if (darkRadio) darkRadio.checked = true;
        } else if (savedMode === 'royal-golden') {
            document.body.className = 'royal-golden';
            const royalRadio = document.querySelector('.body-skin[value="royal-golden"]');
            if (royalRadio) royalRadio.checked = true;
        } else if (savedMode === 'light') {
            document.body.className = '';
            const lightRadio = document.querySelector('.body-skin[value="light"]');
            if (lightRadio) lightRadio.checked = true;
        }
        /* ROYAL GOLDEN THEME SUPPORT: END */
    } catch(e) {
        // localStorage not available, silently ignore
    }
})();
