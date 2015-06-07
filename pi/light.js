var SPI = require('pi-spi');
var MilkCocoa = require('milkcocoa');

var spi = SPI.initialize("/dev/spidev0.0"),
    test = Buffer([0x68, 0]);

var milkcocoa = new MilkCocoa("{your-app-id}.mlkcca.com");

var old = 0;

setInterval(function() {
spi.transfer(test, test.length, function (e,d) {
    if (e) console.error(e);
    	else {
		var v = ((d[0]<<8) + d[1]) & 0x03FF
		console.log(v, "Got \""+v.toString()+"\" back.");
		if(old != v) milkcocoa.dataStore('light').push({v : v});
		old = v;
	}
});

}, 5000);