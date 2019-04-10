const noble = require('noble');
var ping = require('jjg-ping');

var devices = [];

const LOCK_SERVICE_UUID = '6e400001b5a3f393e0a9e50e24dcca9e'
const LOCK_RX_CHARACTERISTIC_UUID = '6e400002b5a3f393e0a9e50e24dcca9e'
const LOCK_TX_CHARACTERISTIC_UUID = '6e400003b5a3f393e0a9e50e24dcca9e'

const LED_SERVICE_UUID = '000015231212efde1523785feabcd123';
const LED_CHARACTERISTIC_UUID = '000015251212efde1523785feabcd123';

const serviceUUIDs = [LOCK_SERVICE_UUID, LED_SERVICE_UUID];
const characteristicUUIDs = [LOCK_RX_CHARACTERISTIC_UUID, LOCK_TX_CHARACTERISTIC_UUID, LED_CHARACTERISTIC_UUID];

noble.on('stateChange', state => {
    if (state === 'poweredOn') {
        log('Scanning');
        noble.startScanning(serviceUUIDs);
    } else {
        //noble.stopScanning();
    }
});

noble.on('scanStart', () => {
    log('Started scanning for devices!');
});

noble.on('scanStop', () => {
    log('Scan stopped!');
});

noble.on('discover', peripheral => {
    // peripheral device discovered, stop scanning
    noble.stopScanning();
    log(`Discovered '${peripheral.advertisement.localName}' ${peripheral.id}`);
    const id = peripheral.id;
    let index = -1;
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].id === id) {
            index = i;
            break;
        }
    }
    if (index === -1) {
        // not connected to discovered peripheral, starting connection
        log(`Connecting to '${peripheral.advertisement.localName}' ${peripheral.id}`);
        connectAndSetUp(peripheral);
    }
});

function connectAndSetUp(peripheral) {
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
            log('Disconnected from', peripheral.advertisement.localName, peripheral.id);
            log('Connected devices:', devices.map((device) => {
                return {
                    id: device.id,
                    name: device.advertisement.localName
                }
            }));
        }
    });

    peripheral.connect(error => {
        log('Connected to', peripheral.advertisement.localName, peripheral.id);

        devices.push(peripheral);

        // scan restart needed for raspberry
        noble.startScanning(serviceUUIDs);

        // specify the services and characteristics to discover
        peripheral.discoverSomeServicesAndCharacteristics(
            serviceUUIDs,
            characteristicUUIDs,
            onServicesAndCharacteristicsDiscovered
        );
        log('Connected devices:', devices.map((device) => {
            return {
                id: device.id,
                name: device.advertisement.localName
            }
        }));

    });

}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
    log('Discovered services and characteristics', characteristics);
    for(let i=0;i<characteristics.length;i++){
        switch(characteristics[i].uuid){
            case LOCK_RX_CHARACTERISTIC_UUID:
                break;
            case LOCK_TX_CHARACTERISTIC_UUID:
                characteristics[i].on('data', (data, isNotification) => {
                    log('Received: "' + data + '"');
                });
                // notify characteristic
                characteristics[i].subscribe(error => {
                    if (error) {
                        console.error('Error subscribing to characteristic!');
                    } else {
                        log('Subscribed for lock notifications!');
                    }
                });
                break;
            case LED_CHARACTERISTIC_UUID:
                break;
            default:
        }
    }
}

function log(){
    console.log.apply(null, [new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), ...arguments]);
}

var io = require('socket.io-client');
var socket = io('https://brave.semirsakanovic.com/');

let LOCK_DEVICE_TYPE = 'lock';
let BLINKY_DEVICE_TYPE = 'blinky';

let username = process.argv[process.argv.length - 1];

function pingGoogle(){
    ping.system.ping('google.com', function(latency, status) {
        if (status) {
            // Host is reachable/up. Latency should have a value.
            log('Google is reachable (' + latency + ' ms ping).');
        }
        else {
            // Host is down. Latency should be 0.
            log('Google is unreachable.');
        }
    });
}

socket.on('connect', function () {
    log('connect evt');
    socket.emit('authentication', { username: username, password: username });
});

socket.on('disconnect', function () {
    log('disconnect evt');
    pingGoogle();
});

socket.on('authenticated', function () {
    log("authenticated")
});

socket.on('unlock', function () {
    sendToBTDevices('CPLIN', LOCK_DEVICE_TYPE)
    log("UNLOCK THE LOCK!!!")
})

socket.on('lock', function () {
    sendToBTDevices('CPLOUT', LOCK_DEVICE_TYPE)
    log("LOCK THE LOCK!!!")
})

socket.on('ledR', function () {
    sendToBTDevices('LEDR', LOCK_DEVICE_TYPE)
    log("Turn LED red!!!")
})

socket.on('ledG', function () {
    sendToBTDevices('LEDG', LOCK_DEVICE_TYPE)
    log("Turn LED green!!!")
})

socket.on('ledB', function () {
    sendToBTDevices('LEDB', LOCK_DEVICE_TYPE)
    log("Turn LED blue!!!")
})

socket.on('buzz', function () {
    sendToBTDevices('BUZZ', LOCK_DEVICE_TYPE);
    log("Buzz!!!")
})

socket.on('ledOn', function () {
    sendToBTDevices([1], BLINKY_DEVICE_TYPE);
    log("Turn LED on!!!")
})

socket.on('ledOff', function () {
    sendToBTDevices([0], BLINKY_DEVICE_TYPE);
    log("Turn LED off!!!")
})

function sendToBTDevices(message, deviceType){
    const buffer = Buffer.from(message);
    log("Sending:  '" + buffer + "'");
    for (let i = 0; i < devices.length; i++) {
        for (let j = 0; j < devices[i].services[0].characteristics.length; j++) {
            switch(devices[i].services[0].characteristics[j].uuid){
                case LOCK_RX_CHARACTERISTIC_UUID:
                    if(deviceType === LOCK_DEVICE_TYPE){
                        devices[i].services[0].characteristics[j].write(buffer, true);
                    }
                    break;
                case LOCK_TX_CHARACTERISTIC_UUID:
                    break;
                case LED_CHARACTERISTIC_UUID:
                    if(deviceType === BLINKY_DEVICE_TYPE){
                        devices[i].services[0].characteristics[j].write(buffer, true);
                    }
                    break;
                default:
            }
        }
    }
}
