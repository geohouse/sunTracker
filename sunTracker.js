//document.getElementById("label").innerHTML = "SunTracker";

let dmy = new Date("2010-06-21 00:00:00");

let numStepsPerHour = 10;

let numDailySteps = 24 * numStepsPerHour;

function degrees2Radians(inputDegrees) {
  let outputRadians;
  const pi = Math.PI;
  outputRadians = inputDegrees * (pi / 180);
  return outputRadians;
}

function radians2Degrees(inputRadians) {
  let outputDegrees;
  const pi = Math.PI;
  outputDegrees = inputRadians * (180 / pi);
  return outputDegrees;
}

for (let stepNum = 1; stepNum <= numDailySteps; stepNum++) {
  let numHours = 0;
  let numMins = 0;
  //  Calculate hours and minutes from the current iteration of the number of steps.
  if (stepNum >= numStepsPerHour) {
    console.log("The step num1 is: " + stepNum);
    numHours = Math.floor(stepNum / numStepsPerHour);
    numMins = (stepNum - numStepsPerHour * numHours) * (60 / numStepsPerHour);
    console.log("The numHours is: " + numHours + " the numMins is: " + numMins);
  } else {
    console.log("The step num2 is: " + stepNum);
    numMins = stepNum * (60 / numStepsPerHour);
    console.log("The numHours is: " + numHours + " the numMins is: " + numMins);
  }

  dmy.setHours(numHours);
  dmy.setMinutes(numMins);
  console.log(dmy);
  let dmy_time = dmy.getTime();
  // Calculation method from here:
  // https://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript
  // 86400000 is the number of milliseconds in a day to convert the time into the number of days
  // Timezone offset no longer used and results in skewed results compared to NOAA spreadsheet (that does use timezone offsets)- 1440 is the number of minutes in a day, needed because the timezone offset returns in minutes
  // 2440587.5 is the number of fractional days from the start of the Julian counting to Jan 1st, 1970 (the start of the JavaScript counting)
  let julianDay = dmy / 86400000 + 2440587.5;
  //let julianDay = (dmy_time / 86400000) - (dmy.getTimezoneOffset()/1440) + 2440587.5;

  // 2451545 is the number of days from the start of the Julian counting to y2k
  let julianCentury = (julianDay - 2451545) / 36525;
  console.log(julianDay);
  console.log(julianCentury);
  // In degrees
  let geomMeanLongSun =
    (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) %
    360;
  console.log(geomMeanLongSun);

  // In degrees
  let geomMeanAnomalySun =
    357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  console.log(geomMeanAnomalySun);

  let eccenEarthOrbit =
    0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
  console.log(eccenEarthOrbit);

  let sunEqOfCenter =
    Math.sin(degrees2Radians(geomMeanAnomalySun)) *
      (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
    Math.sin(degrees2Radians(2 * geomMeanAnomalySun)) *
      (0.019993 - 0.000101 * julianCentury) +
    Math.sin(degrees2Radians(3 * geomMeanAnomalySun)) * 0.000289;

  console.log(sunEqOfCenter);
  // in degrees
  let sunTrueLong = geomMeanLongSun + sunEqOfCenter;
  console.log(sunTrueLong);
  // in degrees
  let sunTrueAnom = geomMeanAnomalySun + sunEqOfCenter;
  console.log(sunTrueAnom);
  // in arbitrary units
  let sunRadVector =
    (1.000001018 * (1 - eccenEarthOrbit * eccenEarthOrbit)) /
    (1 + eccenEarthOrbit * Math.cos(degrees2Radians(sunTrueAnom)));
  console.log(sunRadVector);
  // in degrees
  let sunAppLong =
    sunTrueLong -
    0.00569 -
    0.00478 * Math.sin(degrees2Radians(125.04 - 1934.136 * julianCentury));
  console.log(sunAppLong);
  // in degrees
  let meanObliqEcliptic =
    23 +
    (26 +
      (21.448 -
        julianCentury *
          (46.815 + julianCentury * (0.00059 - julianCentury * 0.001813))) /
        60) /
      60;
  console.log(meanObliqEcliptic);
  // in degrees
  let obliqCorr =
    meanObliqEcliptic +
    0.00256 * Math.cos(degrees2Radians(125.04 - 1934.136 * julianCentury));
  console.log(obliqCorr);
  // in degrees
  let sunRtAscen = radians2Degrees(
    Math.atan2(
      Math.cos(degrees2Radians(obliqCorr)) *
        Math.sin(degrees2Radians(sunAppLong)),
      Math.cos(degrees2Radians(sunAppLong))
    )
  );
  console.log(sunRtAscen);
  // in degrees
  let sunDeclin = radians2Degrees(
    Math.asin(
      Math.sin(degrees2Radians(obliqCorr)) *
        Math.sin(degrees2Radians(sunAppLong))
    )
  );
  console.log(sunDeclin);
  // unitless
  let varY =
    Math.tan(degrees2Radians(obliqCorr / 2)) *
    Math.tan(degrees2Radians(obliqCorr / 2));
  console.log(varY);
}
