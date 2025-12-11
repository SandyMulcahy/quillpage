//GET USER DATA
$(document).ready(function () {
    $.getJSON("USERDATA.json", function (data) {

        //CORE STAFF CAROUSEL
        let staff = data.core_staff.filter(person => person.name !== "Ruth Murray");
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
                        <img src=${img} style="max-height: 240px; max-width: 240px;" alt=${person.name}>
                        <h6 class="mb-0">${person.name}</h6>
                        <div class="scroll-box small">${person.profile}</div>
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
    });
});


//JS that does shows the right content when any button is selected
// Get all library buttons and content sections
const buttons = document.querySelectorAll('.library-button');
const contentSections = document.querySelectorAll('.content-section');
// Add click event to each button
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Get the content ID from the button's data attribute
        const contentId = this.getAttribute('data-content');
        // Remove 'active' class from all buttons
        buttons.forEach(btn => btn.classList.remove('active'));
        // Add 'active' class to clicked button
        this.classList.add('active');
        // Hide all content sections
        contentSections.forEach(section => section.classList.remove('active'));
        // Show the matching content section
        document.getElementById(contentId).classList.add('active');
    });
});
