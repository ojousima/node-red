# node-red
Node-Red node that handles [Noble](https://www.npmjs.com/package/@abandonware/noble) Bluetooth Low Energy outputs from a 
[RuuviTag®](https://ruuvi.com) directly, or accepts MQTT output from the Ruuvi Gateway.  Example output: 

```
{"temperature":19.87,"humidity":45.72,"pressure":100430,"accelerationX":4,"accelerationY":100,"accelerationZ":1032,"battery":3133,"txPower":-18,"movementCounter":10,"sequenceCounter":12560,"mac":"c9:xx:xx:c7:aa:cb"}
```

## Node version
Following the install instructions below it will work with Node.js up to v16

# RuuviTag node
## About
Listens to node-red-contrib-noble messages or Ruuvi Gateway MQTT messages, and parses RuuviTag weather station data in high resolution mode.
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

Currently version 0.1.0, i.e. alpha-quality. All comments and suggestions are welcome, please open pull-requests (and comment that BSD-3 is ok) if you want to contribute. Suggestions for improvement can be given as github issues.

## Installing on a Raspberry Pi

After a [Node-red installation](https://nodered.org/docs/getting-started/raspberrypi) check the Bluetooth interface with 

```
hciconfig
```

Install dependencies

```
sudo apt install libbluetooth-dev libudev-dev git
```

Grant the node binary "cap_net_raw" privileges, so it can start/stop BLE advertising, with command

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

Install the `noble` package, the latest updated `node-red-contrib-noble` node and this `node-red-contrib-ruuvitag` node

```
cd ~/.node-red
npm install @abandonware/noble
npm install MatsA/node-red-contrib-noble
npm install ojousima/node-red
```

Restart Node-Red, ```sudo systemctl restart nodered```, and check the installed Nodes via the Node-Red GUI. It will appear in the Node list below "advanced"

## Usage
Allow duplicates in noble configuration, and set scan=true to noble node. Connect noble output to RuuviTag input,
and parse RuuviTag data as you wish.

![Example flow](./images/nodered_ruuvinode_flow.png)

If you want to use RAWv2 mode, install firmware version [2.4.2](lab.ruuvi.com/dfu) and press button "B" once to enter the RAWv2 mode on RuuviTag.
For more details please see [ruuvi website](https://ruu.vi).
