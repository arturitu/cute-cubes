var Vehicle = function (location, mass) {
  'use strict';

  var predict = new THREE.Vector2();

  this.location = location;
  this.initMass = mass;

  this.test = function (d) {
    console.log(d);
  }
};
