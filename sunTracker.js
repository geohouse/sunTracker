document.getElementById("label").innerHTML = "SunTracker";

let dmy = new Date("2020-10-08 00:00:00");

let numStepsPerHour = 10;

let numSteps = 24 * numStepsPerHour;

function degrees2Radians(inputDegrees){
    let outputRadians = undefined;
    let pi = Math.PI;
    outputRadians = inputDegrees * (pi/180);
    return outputRadians;
}


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
    let dmy_time = dmy.getTime();
    // Calculation method from here:
    // https://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript
    // 86400000 is the number of milliseconds in a day to convert the time into the number of days
    // No longer used - 1440 is the number of minutes in a day, needed because the timezone offset returns in minutes
    // 2440587.5 is the number of fractional days from the start of the Julian counting to Jan 1st, 1970 (the start of the JavaScript counting)
    let julianDay = (dmy_time / 86400000) + 2440587.5;
    //let julianDay = (dmy_time / 86400000) - (dmy.getTimezoneOffset()/1440) + 2440587.5;
    
    // 2451545 is the number of days from the start of the Julian counting to y2k
    let julianCentury = (julianDay - 2451545)/36525
    console.log(julianDay);
    console.log(julianCentury);
    // In degrees
    let geomMeanLongSun = (280.46646 + julianCentury * (36000.76983 + (julianCentury * 0.0003032))) % 360;
    console.log(geomMeanLongSun);

    // In degrees
    let geomMeanAnomalySun = 357.52911 + julianCentury * (35999.05029 - (0.0001537 * julianCentury));
    console.log(geomMeanAnomalySun);

    let eccenEarthOrbit = 0.016708634 - julianCentury * (0.000042037 + (0.0000001267 * julianCentury));
    console.log(eccenEarthOrbit);

    let sunEqOfCenter = Math.sin(degrees2Radians(geomMeanAnomalySun)) * (1.914602 - julianCentury * (0.004817 + (0.000014 * julianCentury))) + Math.sin(degrees2Radians(2 * geomMeanAnomalySun)) * (0.19993 - (0.000101 * julianCentury)) + Math.sin(degrees2Radians(3*geomMeanAnomalySun)) * 0.000289;

    console.log(sunEqOfCenter);

}