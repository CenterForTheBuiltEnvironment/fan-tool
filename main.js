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
  'dimensionlessDiameter':{
    'min' : 0.2,
    'max' : 0.5,
  },
  'aspectRatio' : {
    'min' : 0.666666,
    'max' : 1.5,
  },
}
console.log(lims);

function Room(ceilingHeight, sizeX, sizeY) {
  this.ceilingHeight = ceilingHeight;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.area = function() {
    return this.sizeX * this. sizeY;
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
fan1 = new Fan('BestFanEver!!',5,5100,10)
console.log(fan1)

/* Sln object represents a potential design solutiion
including the room & fan characteristics, as well as
the number of fans */
function Sln(numFansX, numFansY, room, fan){
  this.numFansX = numFansX;
  this.numFansY = numFansY;
  this.room =  room;
  this.fan = fan;
  this.cellSizeX = this.room.sizeX / this.numFansX;
  this.cellSizeY = this.room.sizeY / this.numFansY;
  this.cellArea = function(){
    return this.cellSizeX * this.cellSizeY;
  }
  this.r = Math.sqrt(this.cellArea());
  this.dr = this.fan.diameter/this.r;
  this.aspectRatio = this.cellSizeX/this.cellSizeY;
  this.validDiameters = function(){
    return [lims.dimensionlessDiameter.min, lims.dimensionlessDiameter.max].map(n => n * this.r) ;
  }
}
console.log(new Sln(3,2, room1, fan1))

/* function to ensure that the resulting size of the fan 'cell' in either the
X  or Y direction is within the limits of the underlying data set.
Avoids unecessarily looping through a large array of 2d solution objects
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


/* create an array of all candidate solutions that fit within the limitations
based on all attributes
*/
slns = [];

failAspectRatio = [0,0];
failCellSize = [0,0];
failDimensionlessDiameter = [0,0];
for (i = 0; i < validNumFansX.length; i++) {
  for (j = 0; j < validNumFansY.length; j++) {
    // instantiate a candidate solution
    candidate = new Sln(validNumFansX[i],validNumFansY[j], room1, fan1);
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
    if (valid) slns.push(candidate);
  };
};

console.log(failAspectRatio + " failed on [min, max] aspect ratio ");
console.log(failCellSize + " failed on [min, max] cell size");
console.log(failDimensionlessDiameter + " failed on [min, max] dimensionless diameter");

console.log(slns);
console.log("Total number of viable solutions: " + slns.length);

var vv = function(value, index, thisArray) {
  return value.validDiameters();
}


/* identify valid range of fan diameters to ensure a solution
*/
var vs = slns.map(vv, slns)
console.log(vs)
var mins = vs.map(function(elt) { return elt[0]; });
var maxes = vs.map(function(elt) { return elt[1]; });
var anySln = [Math.min.apply(null, mins), Math.max.apply(null, maxes)];
console.log("Fan diameter must be within this range to have any solution: " + anySln);



// console.log(possibleNumFans);
//
// var items = [
//   [1, 2],
//   [3, 4],
//   [5, 6]
// ];
//
// console.log(pars);
//
// document.write(items);
// document.write('    ')
