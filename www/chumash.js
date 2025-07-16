const checkboxes = document.querySelectorAll(".checkbox");
const percent = document.querySelector(".percent");
const clearAllButton = document.querySelector("#clear-all");

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("click", updatePercent);
});
clearAllButton.addEventListener("click", clearAllCheckboxes);

// check the current day of the week
let currentDay = new Date().getDay();

// schedule the function to run every Sunday at midnight
let resetTime = new Date();
resetTime.setDate(resetTime.getDate() + (7 - currentDay));
resetTime.setHours(0, 0, 0, 0);

let timeTillReset = resetTime - new Date();
setTimeout(clearAllCheckboxes, timeTillReset);

function updatePercent(parshaName) {
 
  let checkedCount = 0;
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkedCount++;
    }
  });
  const percentValue = (checkedCount / checkboxes.length) * 100;
  percent.textContent = percentValue.toFixed(2) + "%";
  localStorage.setItem("percent", percentValue.toFixed(2));
  localStorage.setItem(this.id, this.checked);
//   localStorage.setItem("last chumash date", JSON.parse(parshaName))
//   console
}
async function updateParshaBoxes(){
    const parsha = await fetchTorahPortion()
 let localParsha = localStorage.getItem("localParsha")
//  if(localParsha == null || undefined){
//     return;
//  }
//  else 
 if(parsha !== 'Unavailable' && parsha !== localParsha){
    console.log("not the same chumash week, checkboxes cleared")
    localStorage.setItem("localParsha", parsha)
    clearAllCheckboxes();
 }
}

updateParshaBoxes()
function clearAllCheckboxes() {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  localStorage.removeItem("percent");
  checkboxes.forEach((checkbox) => {
    localStorage.removeItem(checkbox.id);
  });
  percent.textContent = "0%";

  // schedule the function to run again next Sunday at midnight
  resetTime.setDate(resetTime.getDate() + 7);
  timeTillReset = resetTime - new Date();
  setTimeout(clearAllCheckboxes, timeTillReset);
}

