document.getElementById("label").innerHTML = "SunTracker";

let dmy = new Date("2020-10-08 00:00:00");

let numStepsPerHour = 10;

let numSteps = 24 * numStepsPerHour;

for(let stepNum = 1; stepNum <= numSteps; stepNum ++){
    let numHours = 0;
    let numMins = 0;
    
    if(stepNum >= numStepsPerHour){
        console.log("The step num1 is: " + stepNum);
        numHours = Math.floor(stepNum / numStepsPerHour);
        numMins = (stepNum - (numStepsPerHour * numHours)) * (60/numStepsPerHour);
        console.log("The numHours is: " + numHours + " the numMins is: " + numMins);
    } else{
        console.log("The step num2 is: " + stepNum);
        numMins = stepNum * (60/numStepsPerHour);
        console.log("The numHours is: " + numHours + " the numMins is: " + numMins);
    }

    dmy.setHours(numHours);
    dmy.setMinutes(numMins);
    console.log(dmy);
}