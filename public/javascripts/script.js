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


document.addEventListener('DOMContentLoaded', () => {


    category.addEventListener('change', () => {
    
        if (category.value === 'Other') {
            displayFunction();
        } else {
            newcat.style.display = 'none';
        }
    });

});


function displayFunction() {
    newcat.style.display = 'block';
}