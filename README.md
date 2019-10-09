# node-red
Node red trials, probably does not suit any purpose.

## Node version
Note: This project relies on [Noble](https://github.com/noble/noble) which is not maintained by the original author(s). 
You're probably going to have bad time if you're trying to run this code on NodeJS 10, and you might have some luck with NodeJS 8. Anyway, this project won't be maintained until the issues with NodeJS / Noble are cleared out. Feel free to open a pull request which works with [Abandonware Noble](https://www.npmjs.com/package/@abandonware/noble) or some other BLE backend if you happen to make one. 

# RuuviTag node
## About
Listens to node-red-contrib-noble messages, and parses RuuviTag weather station data in high resolution mode.
Puts sensor data to msg.payload as JSON, and depending on which [Ruuvi format](https://github.com/ruuvi/ruuvi-sensor-protocols) used, contains:

*RAWv1*

temperature, humidity, pressure, accelerationX, accelerationY, accelerationZ, battery. Units are:
 - Temperature: Celcius
 - Humidity: RH-%
 - Pressure: Pascal
 - Acceleration: milli-G
 - Battery: mV

*RAWv2*

adds txPower, movementCounter, and sequenceCounter. Units are:
 - txPower: dB
 - movementCounter: incremented rolling number with movement
 - sequenceCounter: incremented sequence counter

Currently version 0.1.0, i.e. alpha-quality. All comments and suggestions are welcome, please open pull-requests (and comment that BSD-3 is ok) if you
want to contribute. Suggestions for improvement can be given as github issues.

## Installing
Clone the repository to you computer, and in the root of project (i.e. folder with package.json) run
`sudo npm link `.
Then in your node red directory (typically ~/.node-red) run ` npm link node-red-contrib-ruuvitag `.

Project additionally depends on node-red-contrib-noble, but there is no proper dependency management yet.
Run manually ` sudo npm install -g node-red-contrib-noble `. You also need bluetooth stack used by noble,
for details please see [noble install instructions](https://github.com/kmi/node-red-contrib-noble).

Please update your machine if you're having syntax errors, see issue #1 for details.

## Usage
Allow duplicates in noble configuration, and set scan=true to noble node. Connect noble output to RuuviTag input,
and parse RuuviTag data as you wish.

![Example flow](./images/nodered_ruuvinode_flow.png)

If you want to use RAWv2 mode, install firmware version [2.4.2](lab.ruuvi.com/dfu) and press button "B" once to enter the RAWv2 mode on RuuviTag.
For more details please see [ruuvi website](https://ruu.vi).
