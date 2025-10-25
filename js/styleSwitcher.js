// Variables
const links=document.querySelectorAll(".alternate-style"),
      // console.log(links);
      totalLinks=links.length;

// Style Switching
function setActiveStyle(color) {
    // console.log(color)
    for (let i = 0; i < totalLinks; i++) {
        if (color === links[i].getAttribute("title")) {
            links[i].removeAttribute("disabled");
        }
        else{
            links[i].setAttribute("disabled", "true");
        }
    }
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

// Body Skin Changing
const bodySkin=document.querySelectorAll(".body-skin"),
      totalBodySkin=bodySkin.length;
    for (let i = 0; i < totalBodySkin; i++) {
        bodySkin[i].addEventListener("change", function(){
            // console.log(this);
            if (this.value === "dark") {
                // document.body.classList.add("dark");
                document.body.className="dark";
            }
            else{
                // document.body.classList.remove("dark");
                document.body.className=""
            }
        });
        
    }
