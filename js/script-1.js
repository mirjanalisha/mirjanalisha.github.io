
 window.addEventListener("load", function(){
     document.querySelector(".preloader").classList.add("opacity-0");
    //  setTimeout(() => {
     setTimeout(function(){
         document.querySelector(".preloader").style.display="none";
     },1000)
 })

// Portfolio Item Filter
const filterContainer = document.querySelector(".portfolio-filter"),
    filterBtns = filterContainer.children,
    totalFilterBtn = filterBtns.length,
    portfolioItems = document.querySelectorAll(".portfolio-item");
// portfolioItems=document.querySelector(".portfolio-items").children;
// console.log(portfolioItems);
totalPortfolioItems = portfolioItems.length;
// console.log(totalPortfolioItems);

for (let i = 0; i < totalFilterBtn; i++) {
    filterBtns[i].addEventListener("click", function () {
        filterContainer.querySelector(".active").classList.remove("active");
        this.classList.add("active");

        const filterValue = this.getAttribute("data-filter");
        // console.log(filterValue);
        for (let k = 0; k < totalPortfolioItems; k++) {
            if (filterValue === portfolioItems[k].getAttribute("data-category")) {
                portfolioItems[k].classList.remove("hide")
                portfolioItems[k].classList.add("show")
            }
            else {
                portfolioItems[k].classList.remove("show")
                portfolioItems[k].classList.add("hide")
            }
            if (filterValue === "all") {
                portfolioItems[k].classList.remove("hide")
                portfolioItems[k].classList.add("show")
            }
        }
    })

}

// Portfolio Ligthbox
const lightbox = document.querySelector(".lightbox"),
    lightboxImg = lightbox.querySelector(".lightbox-img"),
    lightboxClose = lightbox.querySelector(".lightbox-close"),
    lightboxText = lightbox.querySelector(".caption-text"),
    lightboxCounter = lightbox.querySelector(".caption-counter");
let itemIndex = 0;

for (let i = 0; i < totalPortfolioItems; i++) {
    portfolioItems[i].addEventListener("click", function () {
        // console.log(i)
        itemIndex = i;
        changeItem();
        toggleListbox();
    })
}
function nextItem() {
    if (itemIndex == totalPortfolioItems - 1) {
        itemIndex = 0;
    }
    else {
        itemIndex++;
    }
    changeItem();
}
function prevItem() {
    if (itemIndex == 0) {
        itemIndex == totalPortfolioItems;
    }
    else {
        itemIndex--;
    }
    changeItem();
}

function toggleListbox() {
    lightbox.classList.toggle("open");
}

function changeItem() {
    imgSrc = portfolioItems[itemIndex].querySelector(".portfolio-img img").getAttribute("src");
    // console.log(imgSrc);
    lightboxImg.src = imgSrc;
    lightboxText.innerHTML = portfolioItems[itemIndex].querySelector("h4").innerHTML;
    lightboxCounter.innerHTML = (itemIndex + 1) + " of " + totalPortfolioItems;
}

// Close Lightbox
lightbox.addEventListener("click", function (event) {
    if (event.target === lightboxClose || event.target === lightbox) {
        toggleListbox();
    }
})


// Aside Navbar
const nav = document.querySelector(".nav"),
    navList = nav.querySelectorAll("li"),
    totalNavList = navList.length,
    allSection = document.querySelectorAll(".section"),
    totalSection = allSection.length;

for (let i = 0; i < totalNavList; i++) {
    //   console.log(navList[i]);
    const a = navList[i].querySelector("a");
    //   console.log(a);
    a.addEventListener("click", function () {
        // Remove Back Section Class
        removeBackSection();
        // console.log(this);
        for (let j = 0; j < totalNavList; j++) {
            if (navList[j].querySelector("a").classList.contains("active")) {
                // console.log(navList[j].querySelector("a"))
                // Add Back Section Class
                addBackSection(j);
            }
            navList[j].querySelector("a").classList.remove("active");
        }
        this.classList.add("active");
        showSection(this);
        if(window.innerWidth < 1200){
            asideSectionTogglerBtn();
        }
    })
}

function showSection(element) {
    // console.log(element);
    // console.log(element.getAttribute("href").split("#"));
    // const href=element.getAttribute("href").split("#");
    //   target=href[1];
    //   console.log(target);
    // Remove class active from all section
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove("active");
    }
    const target = element.getAttribute("href").split("#")[1];
    //   console.log(target);
    document.querySelector("#" + target).classList.add("active");
}

function addBackSection(num){
    allSection[num].classList.add("back-section")
}

function removeBackSection(){
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove("back-section");
    }
}

function updateNav(element){
    // console.log(element.getAttribute("href").split("#")[1])
    for (let i = 0; i < totalNavList; i++) {
        navList[i].querySelector("a").classList.remove("active");
        const target=element.getAttribute("href").split("#")[1];
        if(target === navList[i].querySelector("a").getAttribute("href").split("#")[1]){
           navList[i].querySelector("a").classList.add("active"); 
        }
    }
}

document.querySelector(".hire-me").addEventListener("click",function(){
    // console.log(this)
    const sectionIndex=this.getAttribute("data-section-index");
    // console.log(sectionIndex);
    showSection(this);
    updateNav(this);
    // addBackSection(sectionIndex); // Not needed
    // removeBackSection(); // Not needed
})

// Navigation Toggler
const navTogglerBtn = document.querySelector(".nav-toggler"),
    aside = document.querySelector(".aside");

navTogglerBtn.addEventListener("click",asideSectionTogglerBtn)
//You can write like below code also
// navTogglerBtn.addEventListener("click", () => {
//     asideSectionTogglerBtn();
// })

function asideSectionTogglerBtn() {
    aside.classList.toggle("open");
    navTogglerBtn.classList.toggle("open");
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.toggle("open");
    }
}