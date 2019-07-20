/* define the limits within which this design method applies
given the limitations of the underlying experiment dataset*/
//TODO convert to ranges
var lims = {
  'cellSize': {
    'min' : 15,
    'max' : 50,
  },
  'numFans':{
    'min' : 1,
    'max' : 10,
  },
  'diameter':{
    'min' : 4,
    'max' : 14,
  },
  'bladeHeight' : {
    'min' : 7,
    'max' : 14,
  },
  'ceilingHeight' : {
    'min' : 9,
    'max' : 15,
  },
  'dimensionlessDiameter':{
    'min' : 0.2,
    'max' : 0.5,
  },
  'aspectRatio' : {
    'min' : 3/4,
    'max' : 4/3,
  },
}
console.log(lims);

function Room(ceilingHeight, sizeX, sizeY) {
  this.ceilingHeight = ceilingHeight;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.area = function() {
    return this.sizeX * this.sizeY;
  }
};
room1 = new Room(12,90,50)
console.log(room1)

/* fan object represents a candidate fan type */
function Fan(type, diameter, airflow, bladeHeight) {
  this.type = type;
  this.diameter = diameter;
  this.airflow = airflow;
  this.bladeHeight = bladeHeight;
};
fan1 = new Fan('BestFanEver!!',8,5100,10)
console.log(fan1)

/* Layout object represents a potential design layout
including the room characteristics and the number of fans */
function Layout(numFansX, numFansY, room, fan){
  this.numFansX = numFansX;
  this.numFansY = numFansY;
  this.room =  room;
  this.cellSizeX = this.room.sizeX / this.numFansX;
  this.cellSizeY = this.room.sizeY / this.numFansY;
  this.cellArea = this.cellSizeX * this.cellSizeY;
  this.r = Math.sqrt(this.cellArea);
  this.aspectRatio = this.cellSizeX/this.cellSizeY;
  this.validDiameters = function(){
    //test for dimensionless diameter
    vds = [lims.dimensionlessDiameter.min, lims.dimensionlessDiameter.max].map(n => n * this.r);
    maxDul507True = (this.room.ceilingHeight - 7)/0.2;
    maxDul507False = (this.room.ceilingHeight - 10)/0.2;
    if (vds[1] > maxDul507True) vds[1] = maxDul507True;
    if (vds[1] > 7 && vds[1] > maxDul507False) vds[1] = maxDul507False;
    if (vds[0] < lims.diameter.min) vds[0] = lims.diameter.min;
    if (vds[0] > lims.diameter.max) vds[1] = lims.diameter.max;
    return vds;
  }
}
layout1 = new Layout(3,2, room1, fan1);
console.log(layout1);

/* function to ensure that the resulting size of the fan 'cell' in either the
X  or Y direction is within the limits of the underlying data set.
Avoids looping through an unecessarily large array of 2d Layout objects
*/
testLims = function(value, index, testArray, )  {
  return value >= lims.cellSize.min*Math.sqrt(lims.aspectRatio.min) &&
  value <= lims.cellSize.max*Math.sqrt(lims.aspectRatio.max);
}
candidateNumFans = Array.from(Array(lims.numFans.max).keys()).map(n => n + 1)
var validNumFansX = candidateNumFans.map(n => room1.sizeX/n).filter(testLims).map(n => room1.sizeX / n);
var validNumFansY = candidateNumFans.map(n => room1.sizeY/n).filter(testLims).map(n => room1.sizeY / n);
console.log("Valid number of fans in X direction: " + validNumFansX)
console.log("Valid number of fans in Y direction: " + validNumFansY)
console.log("Total number of cases: " + (validNumFansX.length * validNumFansY.length))


/* create an array of all candidate layouts that fit within the limitations
based on all attributes
*/
layouts = [];
failAspectRatio = [0,0];
failCellSize = [0,0];
failDimensionlessDiameter = [0,0];
for (i = 0; i < validNumFansX.length; i++) {
  for (j = 0; j < validNumFansY.length; j++) {
    // instantiate a candidate solution
    candidate = new Layout(validNumFansX[i],validNumFansY[j], room1, fan1);
    // console.log(candidate);
    valid = true;
    // test to see if it meets validity criteria
    if (candidate.aspectRatio <= lims.aspectRatio.min){
      failAspectRatio[0]++;
      valid = false;
    };
    if (candidate.aspectRatio >= lims.aspectRatio.max){
      failAspectRatio[1]++;
      valid = false;
    };
    if (candidate.r <= lims.cellSize.min){
      failCellSize[0]++;
      valid = false;
    };
    if (candidate.r >= lims.cellSize.max){
      failCellSize[1]++;
      valid = false;
    };
    // if (candidate.dr <= lims.dimensionlessDiameter.min){
    //   failDimensionlessDiameter[0]++;
    //   valid = false;
    // };
    // if (candidate.dr >= lims.dimensionlessDiameter.max){
    //   failDimensionlessDiameter[1]++;
    //   valid = false;
    // };
    if (valid) layouts.push(candidate);
  };
};

console.log(failAspectRatio + " failed on [min, max] aspect ratio ");
console.log(failCellSize + " failed on [min, max] cell size");
//console.log(failDimensionlessDiameter + " failed on [min, max] dimensionless diameter");

console.log(layouts);
console.log("Total number of viable solutions: " + layouts.length);

var vv = function(value, index, thisArray) {
  return value.validDiameters();
}


/* identify range of fan diameters within which at least one layout exists
*/
var vs = layouts.map(vv, layouts)
console.log(vs)
var mins = vs.map(function(elt) { return elt[0]; });
var maxes = vs.map(function(elt) { return elt[1]; });
var anyLayout = [Math.min.apply(null, mins), Math.max.apply(null, maxes)];
console.log("Fan diameter must be within this range to have a valid layout: " + anyLayout);


/* Solution object represents a potential design solution
including the room, layout and fan characteristics */
function Solution(layout, fan){
  this.layout = layout;
  this.fan = fan;
  this.dr = this.fan.diameter/this.layout.r;
  this.clearanceX = function(){
    return (this.layout.cellSizeX - this.fan.diameter) / 2;
  }
  this.clearanceY = function(){
    return (this.layout.cellSizeY - this.fan.diameter) / 2;
  }
  this.airspeeds = function(){
    //TODO: Calculate airspeeds for each solution
    return [1,2,3];
  }
  this.validMountDistance = function(){
    if (this.layout.room.ceilingHeight - this.fan.bladeHeight > 0.2 * this.fan.diameter){
      return true;
    } else {
      return false;
    }
  }
}
solution1 = new Solution(layout1, fan1)
console.log(solution1.clearanceX())
console.log(solution1.clearanceY())


//TODO: Instantiate example fan objects
//TODO: loop through layout for a range of fan objects

/* TODO Develop methods to select for various design cases given
a set of constraints:
most/least # numFans - potentially also cost based?
Smallest/Largest diameter numFans
Highest/lowest numFans
most/least uniformity ranked based on squareness, larger D/R ratio, larger D
*/
