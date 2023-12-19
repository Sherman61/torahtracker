const checkboxes = document.querySelectorAll('.checkbox');
const percent = document.querySelector('.percent');
const clearAllButton = document.querySelector('#clear-all');

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', updatePercent);
});
clearAllButton.addEventListener('click', clearAllCheckboxes);

// check the current day of the week
let currentDay = new Date().getDay();

// schedule the function to run every Sunday at midnight
let resetTime = new Date();
resetTime.setDate(resetTime.getDate() + (7 - currentDay));
resetTime.setHours(0, 0, 0, 0);

let timeTillReset = resetTime - new Date();
setTimeout(clearAllCheckboxes, timeTillReset);

function updatePercent() {
    let checkedCount = 0;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedCount++;
        }
    });
    const percentValue = (checkedCount / checkboxes.length) * 100;
    percent.textContent = percentValue.toFixed(2) + '%';
    localStorage.setItem('percent', percentValue.toFixed(2));
    localStorage.setItem(this.id, this.checked);
}

function clearAllCheckboxes() {
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    localStorage.removeItem('percent');
    checkboxes.forEach(checkbox => {
        localStorage.removeItem(checkbox.id);
    });
    percent.textContent = '0%';

    // schedule the function to run again next Sunday at midnight
    resetTime.setDate(resetTime.getDate() + 7);
    timeTillReset = resetTime - new Date();
    setTimeout(clearAllCheckboxes, timeTillReset);
}

// On page load, retrieve the saved data
window.onload = function(){
    percent.textContent = localStorage.getItem('percent') + '%';
    checkboxes.forEach(checkbox => {
        checkbox.checked = JSON.parse(localStorage.getItem(checkbox.id));
    });
}