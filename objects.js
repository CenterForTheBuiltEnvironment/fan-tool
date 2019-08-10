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
function Fan(type, diameter, airflow, bladeHeight, meetsUL507) {
  this.type = type;
  this.diameter = diameter;
  this.airflow = airflow;
  this.meetsUL507 = meetsUL507;
};

/* Layout object represents a potential design layout
including the room characteristics and the number of fans */
function Layout(numFansX, numFansY, room){
  this.numFansX = numFansX;
  this.numFansY = numFansY;
  this.room =  room;
  this.cellSizeX = this.room.sizeX / this.numFansX;
  this.cellSizeY = this.room.sizeY / this.numFansY;
  this.cellArea = this.cellSizeX * this.cellSizeY;
  this.r = Math.sqrt(this.cellArea);
  this.aspectRatio = this.cellSizeX/this.cellSizeY;
  this.numFans =  function(){
    return this.numFansX * this.numFansY;
  };
  this.validDiameters = function(){
    //returns valid diameter based on dimensionless diameter
    // and diameter constraints
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
// layout1 = new Layout(3,2, room1, fans[1]);
// console.log(layout1);

/* Solution object represents a potential design solution
including the room, layout and fan characteristics */
function Solution(layout, fan){
  this.layout = layout;
  this.fan = fan;
  this.dr = this.fan.diameter/this.layout.r;
  this.cd = this.layout.room.ceilingHeight/this.fan.diameter;
  this.do = this.fan.diameter/1.7;
  this.hd = this.bladeHeight/this.fan.diameter;
  this.clearanceX = function(){
    return (this.layout.cellSizeX - this.fan.diameter) / 2;
  }
  this.clearanceY = function(){
    return (this.layout.cellSizeY - this.fan.diameter) / 2;
  }
  this.airspeeds = function(){
    lowest = 0.9 * this.dr - 0.017 * this.cd + 0.11 * this.do/1.7 + 1*0.024 + 0.047;
    areaWeightedAverage = 0.99 * this.dr - 0.06 * this.cd + 0.11 * this.do/1.7 + 1*0.024 + 0.25;
    highest = -0.18 * this.hd - 1*0.1 + 1.3;
    return [lowest,areaWeightedAverage,highest];
  }
  this.validBladeHeightRange = function(){
    this.fan.meetsUL507 ? min = 7 : min = 10;
    max = this.layout.room.ceilingHeight - 0.2 * this.fan.diameter;
    return {'min' : min, 'max' : max,}
  }
}
// solution1 = new Solution(layouts[0], fans[0])
// console.log(solution1.airspeeds())
