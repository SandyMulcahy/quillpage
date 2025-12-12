let USERDATA = null;
let LIBRARY_GROUPS = null;
let CONVENTIONS = null;
let MAPPINGS = null;
let currentLibraryID = null;
let currentConventionID = null;

// fetch all JSON in parallel and cache results
function loadAllJson() {
  return $.when(
    $.getJSON("json/USERDATA.json"),
    $.getJSON("json/library_groups.json"),
    $.getJSON("json/conventions.json"),
    $.getJSON("json/library_group_conventions.json")
  ).done(function(userData, libraryData, conventionData, mappingData) {
    USERDATA = userData[0];
    LIBRARY_GROUPS = libraryData[0];
    CONVENTIONS = conventionData[0];
    MAPPINGS = mappingData[0];
  });
}

//load staff cards into core staff carousel
function loadCoreStaffCarousel() {
    let staff = USERDATA.core_staff.filter(person => person.name !== "Ruth Murray"); //MOVED RUTH TO PROJECT LEADS
    let chunkSize = 4;
    let slidesHTML = "";

    // Split staff into chunks of 5
    for (let i = 0; i < staff.length; i += chunkSize) {
        let group = staff.slice(i, i + chunkSize);

        let slideItems = "";

        group.forEach(person => {
            if (person.image_large == null) img = "img/blankprofile.webp"
            else img = person.image_large

            slideItems += `
                <div class="col-auto text-center p-0">
                    <div class="position-relative d-inline-block">
                        <img class="curve" src=${img} style="width:240px; height:240px;">
                        <div class="position-absolute top-0 start-0 w-100 h-100 d-flex 
                                    align-items-center justify-content-center bg-opacity-50
                                    text-black fw-bold fs-5 hover-overlay curve">
                            ${person.name}
                        </div>
                    </div>
                    <h6 class="carousel-title">${person.name}</h6>
                    <div class="scroll-box no-scrollbar small">${person.profile}</div>
                    
                </div>
            `;
        });

        slidesHTML += `
            <div class="carousel-item ${i === 0 ? "active" : ""}">
                <div class="row justify-content-center g-0">
                    ${slideItems}
                </div>
            </div>
        `;
    }

    $("#core-carousel-inner").html(slidesHTML);
}

// render conventions for a given library id
function loadConventionsForLibrary() {
        //create list of conventions that match current library
        let conventionIDs = MAPPINGS.filter(m=>m.library_group_id === currentLibraryID).map(m=>m.convention_id)
        let conventions = CONVENTIONS.filter(c=>conventionIDs.includes(c.id))

        let slidesHTML = "";
        let chunkSize = 5;
        // Split conventions into chunks of 5
        for (let i = 0; i < conventions.length; i += chunkSize) {
            let group = conventions.slice(i, i + chunkSize);

            let slideItems = "";

            group.forEach(convention => {
                slideItems += `
                    <button class="convention-button" data-content=${convention.id}>${convention.name}</button>
                `;
            });

            slidesHTML += `
                <div class="carousel-item ${i === 0 ? "active" : ""}">
                    <div class="row justify-content-center gap-3 button-group">
                        ${slideItems}
                    </div>
                </div>
            `;
        }
        $("#convention-carousel-inner").html(slidesHTML);

        const $carousel = $("#conventionCarousel");
        if ($carousel.length) {
            $carousel.carousel(0); // go to first slide
        }

        // Attaching click handlers after convention buttons are made
        const conventionButtons = document.querySelectorAll('.convention-button');

        conventionButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove 'active' from all buttons
                conventionButtons.forEach(btn => btn.classList.remove('active'));
                // Mark this one as active
                this.classList.add('active');

                const contentId = this.getAttribute('data-content');
                currentConventionID = Number(contentId)
                loadContributorsForConvention();
            });
        });

        // set the first convention button as active
        const $firstBtn = $("#convention-carousel-inner .convention-button").first();
        $("#convention-carousel-inner .convention-button").removeClass("active");
        if ($firstBtn.length) $firstBtn.addClass("active");
        currentConventionID = conventions[0].id
}

//load staff into 
function loadContributorsForConvention() {
    //flatten staff list
    let allStaff = Object.values(USERDATA).flat().filter(item => typeof item === "object" && item.name);

    //create list of contributors that match current convention
    let contributorNames = CONVENTIONS.filter(c => c.id === currentConventionID).map(c => c.editor_names)[0].split(",").map(name => name.trim()); 
    let contributors = allStaff.filter(u=>contributorNames.includes(u.name))

    let withProfile = contributors.filter(c => c.profile && c.profile.trim() !== "");
    let withoutProfile = contributors.filter(c => !c.profile || c.profile.trim() === "");

    let contributorCards = ""
    withProfile.forEach(person => {
        if (person.image_small == null) img = "img/blankprofile.webp"
        else img = person.image_small
        contributorCards+= `<div class="contributor-card">
        <div class="photo-small">
            <img src=${img} alt="Contributor">
        </div>
        <div class="info">
            <h4>${person.name}</h4>
            <p>${person.profile}</p>
        </div>
    </div>`
    })
    //put non profile people last
    withoutProfile.forEach(person => {
        if (person.image_small == null) img = "img/blankprofile.webp"
        else img = person.image_small
        contributorCards+= `<div class="contributor-card">
        <div class="photo-small">
            <img src=${img} alt="Contributor">
        </div>
        <div class="info">
            <h4>${person.name}</h4>
        </div>
    </div>`
    })

    $(".scroll-container .grid").html(contributorCards);
}

//LIBRARY BUTTON ACTIONS
function addLibraryButtonAction() {
    // Get all library buttons and content sections
    const buttons = document.querySelectorAll('.library-button');
    const contentSections = document.querySelectorAll('.content-section');
    // Add click event to each button
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the content ID from the button's data attribute
            const contentId = this.getAttribute('data-content');
            currentLibraryID = Number(contentId)
            loadConventionsForLibrary();
            loadContributorsForConvention();
            // Remove 'active' class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to clicked button
            this.classList.add('active');
        });
    });
}


//INITIAL LOAD
// bootstrap on page load: load json once then render default library
$(document).ready(function () {
    loadAllJson().done(function () {
        loadCoreStaffCarousel();
        addLibraryButtonAction();

        // choose default library and convention id 
        currentLibraryID = 2; //American West
        currentConventionID = 22; //utah state 1895 (2019)
        loadConventionsForLibrary();
        loadContributorsForConvention();
    });
});