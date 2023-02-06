//document.getElementById("label").innerHTML = "SunTracker";

import { bresenham } from "./node_modules/bresenham/index.js";

let dmy = new Date("2010-06-21 00:00:00");

let numStepsPerHour = 1;

let numDailySteps = 24 * numStepsPerHour;

const latitude = 40;
const longitude = -105;
// positive to the east of Greenwich, negative to the west
const timeZone = -6;

const focalSunArea = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
const focalSunAndShadowCasters = [
  [0, 0, 0, 0, 2],
  [0, 0, 0, 0, 3],
  [0, 0, 0, 0, 4],
  [3, 3, 3, 3, 3],
];

const topLeftIndexOfFocalSunAreaInShadowCastersArray = [0, 0];

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

function calcElevationZenith(
  latitude = 0,
  longitude = 0,
  timeZone = 0,
  dmy = new Date("2010-01-01 00:00:00"),
  numMinutes = 0,
  numHours = 0
) {
  let minutesPastMidnight = numHours * 60 + numMinutes;
  minutesPastMidnight = numHours * 60 + numMinutes;

  dmy.setHours(numHours);
  dmy.setMinutes(numMinutes);
  //console.log(dmy);
  //   let dmy_time = dmy.getTime();
  // Calculation method from here:
  // https://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript
  // 86400000 is the number of milliseconds in a day to convert the time into the number of days
  // Timezone offset no longer used and results in skewed results compared to NOAA spreadsheet (that does use timezone offsets)- 1440 is the number of minutes in a day, needed because the timezone offset returns in minutes
  // 2440587.5 is the number of fractional days from the start of the Julian counting to Jan 1st, 1970 (the start of the JavaScript counting)
  let julianDay = dmy / 86400000 + 2440587.5;
  //let julianDay = (dmy_time / 86400000) - (dmy.getTimezoneOffset()/1440) + 2440587.5;

  // 2451545 is the number of days from the start of the Julian counting to y2k
  let julianCentury = (julianDay - 2451545) / 36525;
  //console.log(julianDay);
  //console.log(julianCentury);
  // In degrees
  let geomMeanLongSun =
    (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) %
    360;
  //console.log(geomMeanLongSun);

  // In degrees
  let geomMeanAnomalySun =
    357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  //console.log(geomMeanAnomalySun);

  let eccenEarthOrbit =
    0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
  //console.log(eccenEarthOrbit);

  let sunEqOfCenter =
    Math.sin(degrees2Radians(geomMeanAnomalySun)) *
      (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
    Math.sin(degrees2Radians(2 * geomMeanAnomalySun)) *
      (0.019993 - 0.000101 * julianCentury) +
    Math.sin(degrees2Radians(3 * geomMeanAnomalySun)) * 0.000289;

  //console.log(sunEqOfCenter);
  // in degrees
  let sunTrueLong = geomMeanLongSun + sunEqOfCenter;
  //console.log(sunTrueLong);
  // in degrees
  let sunTrueAnom = geomMeanAnomalySun + sunEqOfCenter;
  //console.log(sunTrueAnom);
  // in arbitrary units
  let sunRadVector =
    (1.000001018 * (1 - eccenEarthOrbit * eccenEarthOrbit)) /
    (1 + eccenEarthOrbit * Math.cos(degrees2Radians(sunTrueAnom)));
  //console.log(sunRadVector);
  // in degrees
  let sunAppLong =
    sunTrueLong -
    0.00569 -
    0.00478 * Math.sin(degrees2Radians(125.04 - 1934.136 * julianCentury));
  //console.log(sunAppLong);
  // in degrees
  let meanObliqEcliptic =
    23 +
    (26 +
      (21.448 -
        julianCentury *
          (46.815 + julianCentury * (0.00059 - julianCentury * 0.001813))) /
        60) /
      60;
  //console.log(meanObliqEcliptic);
  // in degrees
  let obliqCorr =
    meanObliqEcliptic +
    0.00256 * Math.cos(degrees2Radians(125.04 - 1934.136 * julianCentury));
  //console.log(obliqCorr);
  // in degrees
  let sunRtAscen = radians2Degrees(
    Math.atan2(
      Math.cos(degrees2Radians(obliqCorr)) *
        Math.sin(degrees2Radians(sunAppLong)),
      Math.cos(degrees2Radians(sunAppLong))
    )
  );
  //console.log(sunRtAscen);
  // in degrees
  let sunDeclin = radians2Degrees(
    Math.asin(
      Math.sin(degrees2Radians(obliqCorr)) *
        Math.sin(degrees2Radians(sunAppLong))
    )
  );
  //console.log(sunDeclin);
  // unitless
  let varY =
    Math.tan(degrees2Radians(obliqCorr / 2)) *
    Math.tan(degrees2Radians(obliqCorr / 2));
  //console.log(varY);
  // in minutes
  let eqOfTime =
    4 *
    radians2Degrees(
      varY * Math.sin(2 * degrees2Radians(geomMeanLongSun)) -
        2 * eccenEarthOrbit * Math.sin(degrees2Radians(geomMeanAnomalySun)) +
        4 *
          eccenEarthOrbit *
          varY *
          Math.sin(degrees2Radians(geomMeanAnomalySun)) *
          Math.cos(2 * degrees2Radians(geomMeanLongSun)) -
        0.5 * varY * varY * Math.sin(4 * degrees2Radians(geomMeanLongSun)) -
        1.25 *
          eccenEarthOrbit *
          eccenEarthOrbit *
          Math.sin(2 * degrees2Radians(geomMeanAnomalySun))
    );
  //console.log(eqOfTime);

  // in degrees
  let haSunrise = radians2Degrees(
    Math.acos(
      Math.cos(degrees2Radians(90.833)) /
        (Math.cos(degrees2Radians(latitude)) *
          Math.cos(degrees2Radians(sunDeclin))) -
        Math.tan(degrees2Radians(latitude)) *
          Math.tan(degrees2Radians(sunDeclin))
    )
  );
  //console.log(haSunrise);

  let solarNoon = (720 - 4 * longitude - eqOfTime + timeZone * 60) / 1440;
  // This reports in fractional days instead of the time from Excel, but is correct. May need to change output if this is
  // needed for downstream calculations.
  //console.log(solarNoon);

  let sunriseTime = solarNoon - (haSunrise * 4) / 1440;
  //console.log(sunriseTime);

  let sunsetTime = solarNoon + (haSunrise * 4) / 1440;
  //console.log(sunsetTime);

  //in minutes
  let sunlightDuration = 8 * haSunrise;
  //console.log(sunlightDuration);

  //in minutes
  // because the entries can be negative, need to use the true modulo calculation,
  // instead of the '%' which is the remainder operator in JS (gives same answer as modulo for numbers > 1, but different for <0).
  // Modulo calculation from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
  let trueSolarTime =
    (((minutesPastMidnight + eqOfTime + 4 * longitude - 60 * timeZone) % 1440) +
      1440) %
    1440;
  //console.log(trueSolarTime);

  // in degrees
  let hourAngle;
  if (trueSolarTime / 4 < 0) {
    hourAngle = trueSolarTime / 4 + 180;
  } else {
    hourAngle = trueSolarTime / 4 - 180;
  }
  //console.log(hourAngle);

  // in degrees
  let solarZenithAngle = radians2Degrees(
    Math.acos(
      Math.sin(degrees2Radians(latitude)) *
        Math.sin(degrees2Radians(sunDeclin)) +
        Math.cos(degrees2Radians(latitude)) *
          Math.cos(degrees2Radians(sunDeclin)) *
          Math.cos(degrees2Radians(hourAngle))
    )
  );
  //console.log(solarZenithAngle);

  // in degrees
  let solarElevationAngle = 90 - solarZenithAngle;
  //console.log(solarElevationAngle);

  // in degrees
  let atmosRefraction;
  if (solarElevationAngle > 85) {
    atmosRefraction = 0;
  } else if (solarElevationAngle > 5) {
    atmosRefraction =
      58.1 / Math.tan(degrees2Radians(solarElevationAngle)) -
      0.07 / Math.tan(degrees2Radians(solarElevationAngle)) ** 3 +
      0.000086 / Math.tan(degrees2Radians(solarElevationAngle)) ** 5;
  } else if (solarElevationAngle > -0.575) {
    atmosRefraction =
      1735 +
      solarElevationAngle *
        (-518.2 +
          solarElevationAngle *
            (103.4 +
              solarElevationAngle * (-12.79 + solarElevationAngle * 0.711)));
  } else {
    atmosRefraction = -20.772 / Math.tan(degrees2Radians(solarElevationAngle));
  }
  atmosRefraction /= 3600;
  // IF(AE2>85,0,IF(AE2>5,58.1/TAN(RADIANS(AE2))-0.07/POWER(TAN(RADIANS(AE2)),3)+0.000086/POWER(TAN(RADIANS(AE2)),5),IF(AE2>-0.575,1735+AE2*(-518.2+AE2*(103.4+AE2*(-12.79+AE2*0.711))),-20.772/TAN(RADIANS(AE2)))))/3600

  //console.log(atmosRefraction);

  // in degrees
  let solarElevationCorrectedAtmRefract = solarElevationAngle + atmosRefraction;
  //console.log(solarElevationCorrectedAtmRefract);

  // degrees clockwise from North
  let solarAzimuthAngle;
  if (hourAngle > 0) {
    solarAzimuthAngle =
      (((radians2Degrees(
        Math.acos(
          (Math.sin(degrees2Radians(latitude)) *
            Math.cos(degrees2Radians(solarZenithAngle)) -
            Math.sin(degrees2Radians(sunDeclin))) /
            (Math.cos(degrees2Radians(latitude)) *
              Math.sin(degrees2Radians(solarZenithAngle)))
        )
      ) +
        180) %
        360) +
        360) %
      360;
    //MOD(DEGREES(ACOS(((SIN(RADIANS($B$3))*COS(RADIANS(AD2)))-SIN(RADIANS(T2)))/(COS(RADIANS($B$3))*SIN(RADIANS(AD2)))))+180,360)
  } else {
    solarAzimuthAngle =
      (((540 -
        radians2Degrees(
          Math.acos(
            (Math.sin(degrees2Radians(latitude)) *
              Math.cos(degrees2Radians(solarZenithAngle)) -
              Math.sin(degrees2Radians(sunDeclin))) /
              (Math.cos(degrees2Radians(latitude)) *
                Math.sin(degrees2Radians(solarZenithAngle)))
          )
        )) %
        360) +
        360) %
      360;
  }
  //MOD(540-DEGREES(ACOS(((SIN(RADIANS($B$3))*COS(RADIANS(AD2)))-SIN(RADIANS(T2)))/(COS(RADIANS($B$3))*SIN(RADIANS(AD2))))),360))
  //console.log(solarAzimuthAngle);
  return [solarElevationCorrectedAtmRefract, solarAzimuthAngle];
}

const focalSunRows = focalSunArea.length;
const focalSunCols = focalSunArea[0].length;
//console.log({ focalSunRows });
//console.log({ focalSunCols });
const focalSunAndShadowRows = focalSunAndShadowCasters.length;
const focalSunAndShadowCols = focalSunAndShadowCasters[0].length;
//console.log({ focalSunAndShadowRows });
//console.log({ focalSunAndShadowCols });

for (let stepNum = 1; stepNum <= numDailySteps; stepNum++) {
  let focalSunDayTracker = [];
  let solarElevation, solarAzimuth;
  let numHours = 0;
  let numMins = 0;
  let minutesPastMidnight = 0;
  //  Calculate hours and minutes from the current iteration of the number of steps.
  if (stepNum >= numStepsPerHour) {
    //console.log("The step num1 is: " + stepNum);
    numHours = Math.floor(stepNum / numStepsPerHour);
    numMins = (stepNum - numStepsPerHour * numHours) * (60 / numStepsPerHour);
    //console.log("The numHours is: " + numHours + " the numMins is: " + numMins);
  } else {
    //console.log("The step num2 is: " + stepNum);
    numMins = stepNum * (60 / numStepsPerHour);
    //console.log("The numHours is: " + numHours + " the numMins is: " + numMins);
  }

  [solarElevation, solarAzimuth] = calcElevationZenith(
    latitude,
    longitude,
    timeZone,
    dmy,
    numMins,
    numHours
  );

  console.log(`Solar elevation is: ${solarElevation}`);
  console.log(`Solar azimuth is: ${solarAzimuth}`);

  // Plan
  // When solar elevation > 0 ( or > ~20 degrees to get it well above horizon so plants can use it)
  // For every hour, create copy of the focal area array
  // For each cell in the focal area array, use the azimuth to get the ending cell in the full shadow array that points to where the sun is
  // use bresenham to get all of the cells between the focal cell and where the sun is located
  // for each of those intermediate cells, calculate the sun height at that cell using the distance from the focal point and the sun elevation
  // if any intermediate cell shades the focal cell, enter 0 in the focal cell, and move to the next one. If none of the intervening cells shade the focal cell, enter 1 and move to the next focal cell.
  // Sum the entries in the focal area array over the day to get the number of hours of sunshine for that location for that day.

  if (solarElevation > 20) {
    let currDayFocalSun = [...focalSunArea];

    for (let row = 0; row < focalSunRows; row++) {
      for (let col = 0; col < focalSunCols; col++) {
        if (solarAzimuth < 135) {
          let xend =
            focalSunCols -
            col +
            (focalSunAndShadowCols -
              focalSunCols +
              topLeftIndexOfFocalSunAreaInShadowCastersArray[1]) -
            1;
          // -90 needed to get the solar azimuth (from North) to be degrees from the origin geometrically instead
          let yend = xend * Math.tan(degrees2Radians(solarAzimuth - 90));
          console.log({ row });
          console.log({ col });
          console.log({ xend });
          console.log({ yend });
        }
      }
    }
  }
}

console.log(bresenham(0, 0, 3, 7));
