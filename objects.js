// this file contains the objects used for identifying solutions
// for a given room, set of candidate fans, and range of acceptable conditions
// defined by a addUser
//
// all objects store data in SI units (without prefixes)

/* object to represent the dimensions of a cuboid room */
function Room(ceilingHeight, sizeX, sizeY) {
  this.ceilingHeight = ceilingHeight;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.area = function() {
    return this.sizeX * this.sizeY;
  }
};

/* object to represent a candidate fan type */
function Fan(type, diameter, airflow, meetsUL507, percentFanSpeed) {
  this.type = type;
  this.diameter = diameter;
  this.airflow = airflow;
  this.meetsUL507 = meetsUL507;
  this.maxFanAirSpeed = this.airflow/(Math.PI * Math.pow(this.diameter,2)/4);
};

/* Layout object represents a potential design layout
including the room characteristics and the number of fans */
function Layout(numFansX, numFansY, room){
  this.numFansX = numFansX;
  this.numFansY = numFansY;
  this.room = room;
  this.cellSizeX = this.room.sizeX / this.numFansX;
  this.cellSizeY = this.room.sizeY / this.numFansY;
  this.cellArea = this.cellSizeX * this.cellSizeY;
  this.r = Math.sqrt(this.cellArea);
  // TODO redefine throughout to always > 1
  this.aspectRatio = Math.max(this.cellSizeX/this.cellSizeY, this.cellSizeY/this.cellSizeX);
  this.numFans =  function(){
    return parseInt(this.numFansX * this.numFansY, 10);
  };
}

/* Solution object represents a potential design solution
including the room, layout and fan characteristics */
function Solution(layout, fan, percentFanSpeed, bladeHeight, mdMin){
  this.layout = layout;
  this.fan = fan;
  this.percentFanSpeed = percentFanSpeed;
  this.dr = this.fan.diameter/this.layout.r;
  this.cd = this.layout.room.ceilingHeight/this.fan.diameter;
  this.do = this.fan.diameter/1.7;
  this.bladeHeightRange = bladeHeight;
  // this.isBladeLowest = isBladeLowest;
  this.mdMin = mdMin;
  this.clearanceX = function(){
    return (this.layout.cellSizeX - this.fan.diameter) / 2;
  }
  this.clearanceY = function(){
    return (this.layout.cellSizeY - this.fan.diameter) / 2;
  }
  this.calcBladeHeightRange = function(){
    // constrain min blade height based on UL507 requirement
    this.fan.meetsUL507 ? min = 2.1336 : min = 3.048;
    // constrain max blade height based on mount distance (avoiding starvation)
    max = this.layout.room.ceilingHeight - (this.mdMin * this.fan.diameter);
    // constrain min/max blade height based on user input ranges
    if (this.bladeHeightRange[0] > min ) min = this.bladeHeightRange[0];
    if (max > this.bladeHeightRange[1]) max = this.bladeHeightRange[1];
    mean = (min+max)/2
    return {'pass': (max-min) >= 0, 'min': min, 'max' : max, 'mean' : mean};
  }
  this.validBladeHeightRange = this.calcBladeHeightRange();
  this.hd = this.validBladeHeightRange['mean']/this.fan.diameter;
  this.calcAirspeeds = function(){
    lowest = this.percentFanSpeed * 0.01 * this.fan.maxFanAirSpeed *
    (0.9 * this.dr - 0.017 * this.cd +0.11 * this.do + p.isSeated*0.024 + 0.047);

    areaWeightedAverage = this.percentFanSpeed * 0.01 *
    this.fan.maxFanAirSpeed * (0.99 * this.dr - 0.06 * this.cd + 0.11 * this.do + p.isSeated*0.024 + 0.25);

    highest = this.percentFanSpeed * 0.01 * this.fan.maxFanAirSpeed *
    (-0.18 * this.hd - p.isSeated*0.1 + 1.3);

    uniformity = 1 - ((highest-lowest)/highest);

    return [lowest,areaWeightedAverage,highest,uniformity];
  }
  this.airspeeds = this.calcAirspeeds();
}
