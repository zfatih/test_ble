// Connect to a peripheral running the echo service
// https://github.com/noble/bleno/blob/master/examples/echo

// subscribe to be notified when the value changes
// start an interval to write data to the characteristic

//const noble = require('noble');
const noble = require('noble');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static("public"));

const baseURL = 'http://localhost:8080';

//var peripheralIdOrAddress = process.argv[2].toLowerCase();

var devices = [];

const BRAVA_SERVICE_UUID = '6e400001b5a3f393e0a9e50e24dcca9e'
const BRAVA_RX_CHARACTERISTIC_UUID = '6e400002b5a3f393e0a9e50e24dcca9e'
const BRAVA_TX_CHARACTERISTIC_UUID = '6e400003b5a3f393e0a9e50e24dcca9e'

const LED_SERVICE_UUID = '000015231212efde1523785feabcd123';
const LED_CHARACTERISTIC_UUID = '000015251212efde1523785feabcd123';
/*
const serviceUUIDs = [BRAVA_SERVICE_UUID];
const characteristicUUIDs = [BRAVA_RX_CHARACTERISTIC_UUID, BRAVA_TX_CHARACTERISTIC_UUID];

const serviceUUIDs = [LED_SERVICE_UUID];
const characteristicUUIDs = [LED_CHARACTERISTIC_UUID];
*/
const serviceUUIDs = [BRAVA_SERVICE_UUID, LED_SERVICE_UUID];
const characteristicUUIDs = [BRAVA_RX_CHARACTERISTIC_UUID, BRAVA_TX_CHARACTERISTIC_UUID, LED_CHARACTERISTIC_UUID];

noble.on('stateChange', state => {
    if (state === 'poweredOn') {
        console.log('Scanning');
        noble.startScanning(serviceUUIDs, true);
    } else {
        //noble.stopScanning();
    }
});

noble.on('scanStop', () => {
    console.log('zaustavio skeniranje');
});

noble.on('discover', peripheral => {
    // connect to the first peripheral that is scanned
    //noble.stopScanning();
    const { id } = peripheral;
    let index = -1;
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].id === id) {
            index = i;
            break;
        }
    }
    if (index === -1) {
        devices.push(peripheral);
        // console.log(peripheral);
        console.log(`Connecting to '${peripheral.advertisement.localName}' ${peripheral.id}`);
        connectAndSetUp(peripheral);
    }
});

function connectAndSetUp(peripheral) {

    peripheral.connect(error => {
        console.log('Connected to', peripheral.id);

        // specify the services and characteristics to discover

        peripheral.discoverSomeServicesAndCharacteristics(
            serviceUUIDs,
            characteristicUUIDs,
            onServicesAndCharacteristicsDiscovered
        );
    });

    peripheral.on('disconnect', () => {
        const { id } = peripheral;
        let index = -1;
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].id === id) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            devices.splice(index, 1);
        }
    });
}


function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
    console.log('Discovered services and characteristics');
    console.log(characteristics);
   /* if(characteristics[1].uuid === BRAVA_TX_CHARACTERISTIC_UUID){

        
        const echoCharacteristic = characteristics[1];
        // data callback receives notifications
        echoCharacteristic.on('data', (data, isNotification) => {
            console.log('Received: "' + data + '"');
        });

        // subscribe to be notified whenever the peripheral update the characteristic
        console.log('pozivam subscribe');
        echoCharacteristic.subscribe(error => {
            if (error) {
                console.error('Error subscribing to echoCharacteristic');
            } else {
                console.log('Subscribed for echoCharacteristic notifications');
            }
        });
    }*/
    
    // create an interval to send data to the service
    // setInterval(() => {
        //     count = 1 - count;
        //     const message = new Buffer([count]);
        //     console.log("Sending:  '" + message + "'");
        //     echoCharacteristic.write(message, true);
        // }, 2500);
}

app.post('/ledg/:deviceID', function (req, res) {
    var deviceID = req.params.deviceID;
    const message = new Buffer('LEDG');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        if (deviceID === devices[i].id) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/ledr/:deviceID', function (req, res) {
    var deviceID = req.params.deviceID;
    const message = new Buffer('LEDR');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        if (deviceID === devices[i].id) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/ledb/:deviceID', function (req, res) {
    var deviceID = req.params.deviceID;
    const message = new Buffer('LEDB');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        if (deviceID === devices[i].id) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/lock/:deviceID', function (req, res) {
    var deviceID = req.params.deviceID;
    const message = new Buffer('CPLIN');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        if (deviceID === devices[i].id) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/unlock/:deviceID', function (req, res) {
    var deviceID = req.params.deviceID;
    const message = new Buffer('CPLOUT');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        if (deviceID === devices[i].id) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/buzz/:deviceID', function (req, res) {
    var deviceID = req.params.deviceID;
    const message = new Buffer('BUZZ');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        if (deviceID === devices[i].id) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/ledg', function (req, res) {
    const message = new Buffer('LEDG');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/ledr', function (req, res) {
    const message = new Buffer('LEDR');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/ledb', function (req, res) {
    const message = new Buffer('LEDB');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/lock', function (req, res) {
    const message = new Buffer('CPLIN');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/unlock', function (req, res) {
    const message = new Buffer('CPLOUT');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/buzz', function (req, res) {
    const message = new Buffer('BUZZ');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
            for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
                devices[i].services[0].characteristics[j].write(message, true);
            }
    }
    res.setHeader('Content-Type', 'text/html');
    return res.redirect('/');
});

app.post('/ledOn', function(req, res){
    const message = new Buffer([1], 'hex');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
            devices[i].services[0].characteristics[j].write(message, true);
        }
    }
    return res.redirect('/');
})

app.post('/ledOff', function(req, res){
    const message = new Buffer([0], 'hex');
    console.log("Sending:  '" + message + "'");
    for (let i = 0; i < devices.length; i++) {
        for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
            devices[i].services[0].characteristics[j].write(message, true);
        }
    }
    return res.redirect('/');
})

app.get('/devices', function (req, res) {
    let devices_ids = devices.map(device => device.id);
    console.log(devices_ids);
    res.json(devices_ids);
});

app.listen(8080);