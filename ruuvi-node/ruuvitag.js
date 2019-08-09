"use strict";
module.exports = function(RED) {
    function RuuviTagNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            //Expects noble manufacturer data
            if (!msg.advertisement || !msg.advertisement.manufacturerData) {
                return null;
            }
            let manufacturerDataString = msg.advertisement.manufacturerData.toString('hex');
            let ruuviData = parseRuuviData(manufacturerDataString);
            if (!ruuviData) {
                return null;
            }
            ruuviData.mac = parseMacAddress(msg.peripheralUuid);
            msg.payload = JSON.stringify(ruuviData);
            node.send(msg);
        });
    }
    RED.nodes.registerType("ruuvitag", RuuviTagNode);
}

var parseMacAddress = function(peripheralUuid) {
    // Places the colon every 2 characters, but not at the end
    return peripheralUuid.replace(/.{2}(?!\b)/g, '$&:');
}

var parseRuuviData = function(manufacturerDataString) {

    let formatStart = 4;
    let formatEnd = 6;
    let formatRawV1 = "03";
    let formatRawV2 = "05";
    let dataFormat = manufacturerDataString.substring(formatStart, formatEnd);
    let dataObject = {};
    switch (dataFormat) {
        case formatRawV1:
            dataObject = parseRawV1Ruuvi(manufacturerDataString)
            break;
        case formatRawV2:
            dataObject = parseRawV2Ruuvi(manufacturerDataString)
            break;

        default:
            //console.log("Unknown dataformat: " + dataFormat);
            dataObject = null;
    }

    return dataObject;
}

//https://github.com/ruuvi/ruuvi-sensor-protocols
var parseRawV1Ruuvi = function(manufacturerDataString) {
    let humidityStart = 6;
    let humidityEnd = 8;
    let temperatureStart = 8;
    let temperatureEnd = 12;
    let pressureStart = 12;
    let pressureEnd = 16;
    let accelerationXStart = 16;
    let accelerationXEnd = 20;
    let accelerationYStart = 20;
    let accelerationYEnd = 24;
    let accelerationZStart = 24;
    let accelerationZEnd = 28;
    let batteryStart = 28;
    let batteryEnd = 32;

    let robject = {};

    let humidity = manufacturerDataString.substring(humidityStart, humidityEnd);
    //console.log(humidity);
    humidity = parseInt(humidity, 16);
    humidity /= 2; //scale
    robject.humidity = humidity;

    let temperatureString = manufacturerDataString.substring(temperatureStart, temperatureEnd);
    let temperature = parseInt(temperatureString.substring(0, 2), 16); //Full degrees
    temperature += parseInt(temperatureString.substring(2, 4), 16) / 100; //Decimals
    if (temperature > 128) { // Ruuvi format, sign bit + value
        temperature = temperature - 128;
        temperature = 0 - temperature;
    }
    robject.temperature = +temperature.toFixed(2); // Round to 2 decimals, format as a number

    let pressure = parseInt(manufacturerDataString.substring(pressureStart, pressureEnd), 16); // uint16_t pascals
    pressure += 50000; //Ruuvi format
    robject.pressure = pressure;

    let accelerationX = parseInt(manufacturerDataString.substring(accelerationXStart, accelerationXEnd), 16); // milli-g
    if (accelerationX > 32767) { accelerationX -= 65536; } //two's complement

    let accelerationY = parseInt(manufacturerDataString.substring(accelerationYStart, accelerationYEnd), 16); // milli-g
    if (accelerationY > 32767) { accelerationY -= 65536; } //two's complement

    let accelerationZ = parseInt(manufacturerDataString.substring(accelerationZStart, accelerationZEnd), 16); // milli-g
    if (accelerationZ > 32767) { accelerationZ -= 65536; } //two's complement

    robject.accelerationX = accelerationX;
    robject.accelerationY = accelerationY;
    robject.accelerationZ = accelerationZ;

    let battery = parseInt(manufacturerDataString.substring(batteryStart, batteryEnd), 16); // milli-g
    robject.battery = battery;

    return robject;
}

var parseRawV2Ruuvi = function(manufacturerDataString) {
    let temperatureStart = 6;
    let temperatureEnd = 10;
    let humidityStart = 10;
    let humidityEnd = 14;
    let pressureStart = 14;
    let pressureEnd = 18;
    let accelerationXStart = 18;
    let accelerationXEnd = 22;
    let accelerationYStart = 22;
    let accelerationYEnd = 26;
    let accelerationZStart = 26;
    let accelerationZEnd = 30;
    let powerInfoStart = 30;
    let powerInfoEnd = 34;
    let movementCounterStart = 34;
    let movementCounterEnd = 36;
    let sequenceCounterStart = 36;
    let sequenceCounterEnd = 40;
    let macAddressStart = 40;
    let macAddressEnd = 52;

    let robject = {};

    let temperatureString = manufacturerDataString.substring(temperatureStart, temperatureEnd);
    let temperature = parseInt(temperatureString, 16); // 0.005 degrees
    robject.temperature = (temperature / 200).toFixed(2);

    let humidityString = manufacturerDataString.substring(humidityStart, humidityEnd);
    let humidity = parseInt(humidityStart, 16); // 0.0025%
    robject.humidity = (humidity / 400).toFixed(2);

    let pressure = parseInt(manufacturerDataString.substring(pressureStart, pressureEnd), 16); // uint16_t pascals
    pressure += 50000; //Ruuvi format
    robject.pressure = pressure;

    // acceleration values in milli-Gs
    let accelerationX = parseInt(manufacturerDataString.substring(accelerationXStart, accelerationXEnd), 16); // milli-g
    if (accelerationX > 32767) { accelerationX -= 65536; } //two's complement

    let accelerationY = parseInt(manufacturerDataString.substring(accelerationYStart, accelerationYEnd), 16); // milli-g
    if (accelerationY > 32767) { accelerationY -= 65536; } //two's complement

    let accelerationZ = parseInt(manufacturerDataString.substring(accelerationZStart, accelerationZEnd), 16); // milli-g
    if (accelerationZ > 32767) { accelerationZ -= 65536; } //two's complement

    robject.accelerationX = accelerationX;
    robject.accelerationY = accelerationY;
    robject.accelerationZ = accelerationZ;

    let powerInfoString = manufacturerDataString.substring(powerInfoString, powerInfoEnd);
    let battery = (parseInt(powerInfoString, 16) >> 5) + 1600; // millivolts > 1600
    let txpower = (parseInt(powerInfoString, 16) & 0x001F) - 40; // dB > -40
    robject.battery = battery;
    robject.txPower = txpower;

    let movementCounterString = manufacturerDataString.substring(movementCounterStart, movementCounterEnd);
    let movementCounter = parseInt(movementCounterString, 16);
    robject.movementCounter = movementCounter;

    let sequenceCounterString = manufacturerDataString.substring(sequenceCounterStart, sequenceCounterEnd);
    let sequenceCounter = parseInt(sequenceCounterString, 16);
    robject.sequenceCounter = sequenceCounter;

    let macAddressString = manufacturerDataString.substring(macAddressStart, macAddressEnd);
    robject.macAddress = macAddressString;

    return robject;
}
