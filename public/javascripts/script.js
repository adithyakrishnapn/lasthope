var center = document.getElementById('center');
var detail = document.getElementById('detail');
var category = document.getElementById('category');
var newcat = document.getElementById('newcat');


function details(event) {
    event.preventDefault(); // Prevents any form submission by the button

    if (category.value === 'Other') {
        var addNew = document.createElement('option');
        addNew.value = newcat.value;
        addNew.textContent = newcat.value; // Also set textContent to show the user
        category.add(addNew);
        category.value = addNew.value;
        console.log(category.value);
    } else {
        center.style.display = 'none';
        detail.style.display = 'block';
    }

    var number = document.getElementById('aadharNumber');
    var name = document.getElementById('aadharName');
    var namelabel = document.getElementById('namelabel');
    var numberlabel = document.getElementById('numberlabel');
    var headingdetails = document.getElementById('headingdetails')
    number.placeholder = `${category.value} Number`; 
    name.placeholder = `Enter ${category.value} Holder Name`;
    namelabel.innerHTML = `${category.value} Holder Name`;
    numberlabel.innerHTML = `${category.value} Number`;
    headingdetails.innerHTML = `Fill ${category.value} details`
}


function displayFunction() {
    newcat.style.display = 'block';
}


// //functions for header username hover action
// function displaybtns() {
//     let btns = document.getElementById("morebtns");
//     btns.style.display = "block";
// }

// function hidebtns() {
//     let userbtns = document.getElementById('userbtns');
//     let morebtns = document.getElementById('morebtns');
//     let mouseOverElements = [userbtns, morebtns];

//     if (!mouseOverElements.some(el => el.matches(':hover'))) {
//         morebtns.style.display = "none";
//     }
// }