document.addEventListener('DOMContentLoaded', () => {


    category.addEventListener('change', () => {
    
        if (category.value === 'Other') {
            displayFunction();
        } else {
            newcat.style.display = 'none';
        }
    });

});