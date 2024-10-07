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

//lost filter and sort
function lostfilter(){
    let lostfilter = document.getElementById('lostfilter');
    //let lostsort = document.getElementById('lostsort');

    if(lostfilter.style.display === 'none' || lostfilter.style.display === ''){
      //  lostsort.style.display = 'none';//incase its visible
        lostfilter.style.display = 'block';
    }else{
        lostfilter.style.display = 'none'
    }
}

/**function lostsort(){
    let lostsort = document.getElementById('lostsort');
    let lostfilter = document.getElementById('lostfilter');

    if(lostsort.style.display === 'none' || lostsort.style.display === ''){
    lostfilter.style.display = 'none' //Incase if its visible
    lostsort.style.display = 'block';
    }else{
        lostsort.style.display = 'none'
    }
}**/
//found filter and sort
function foundfilter(){
    let foundfilter = document.getElementById('foundfilter');
    //let foundsort = document.getElementById('foundsort');

    if(foundfilter.style.display === 'none' || foundfilter.style.display === ''){
        //foundsort.style.display = 'none' // incase if its visible
        foundfilter.style.display = 'block';
    }else{
        foundfilter.style.display = 'none'
    }
}

/**function foundsort(){
    let foundsort = document.getElementById('foundsort');
    let foundfilter = document.getElementById('foundfilter');

    if(foundsort.style.display === 'none' || foundsort.style.display === ''){
    foundfilter.style.display = 'none' //Incase if its vsble
    foundsort.style.display = 'block';
    }else{
        foundsort.style.display = 'none'
    }
}**/