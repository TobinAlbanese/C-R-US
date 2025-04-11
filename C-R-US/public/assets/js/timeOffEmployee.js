
var startTimeSelect = document.getElementById("time-off-start");
var endTimeSelect = document.getElementById("time-off-end")

var options = [];  //used to hold all time options for start and end time
var hours, minutes, ampm; //used to populate options array

//populate options array with times from 12am to 11:30pm
for(var i = 0; i <= 1410; i += 30){
    hours = Math.floor(i / 60);
    minutes = i % 60;
    if (minutes < 10){
        minutes = '0' + minutes; // adding leading zero
    }
    ampm = hours % 24 < 12 ? 'AM' : 'PM';
    hours = hours % 12;
    if (hours === 0){
        hours = 12;
    }
    options.push(hours + ':' + minutes + ' ' + ampm); 
}

//var options = ["1", "2", "3", "4", "5"];

//Go through array and add each to start time select
for(var i = 0; i < options.length; i++) {
    var timeOpt = options[i];
    var element = document.createElement("option");
    element.textContent = timeOpt;
    element.value = timeOpt;
    startTimeSelect.appendChild(element);
}

//Go through array and add each to start time select
for(var i = 0; i < options.length; i++) {
    var timeOpt = options[i];
    var element = document.createElement("option");
    element.textContent = timeOpt;
    element.value = timeOpt;
    endTimeSelect.appendChild(element);
}

//Code executes when submit button is clicked
var timeOffSubmit = document.getElementById("time-off-submit");
timeOffSubmit.addEventListener("click", function(){

    var timeOffType = document.getElementById("time-off-type").value;
    var timeOffComments = document.getElementById("time-off-comments-textarea").value;
    var timeOffDate = document.getElementById("time-off-date").value;
    var timeOffStartTime = document.getElementById("time-off-start").value;
    var timeOffEndTime = document.getElementById("time-off-end").value

    alert('Time Off Request Has Been Submitted! \n\n'
        +   'Time Off Type: ' + timeOffType + '\n'
        +   'Time Off Comments: ' + timeOffComments + '\n'
        +   'Time Off Date: ' + timeOffDate + '\n'
        +   'Time Off Start Time: ' + timeOffStartTime + '\n'
        +   'Time Off End Time: ' + timeOffEndTime);


    redirectToPage("employee");
});

//Used to redirect to correct page after submission
function redirectToPage(role) {
    if (role === "admin") {
      window.location.href = "/admin.html";
    } else if (role === "employee") {
      window.location.href = "/employeeViewPage.html";
    } else {
      window.location.href = "/index.html";
    }
  }