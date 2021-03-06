// (c) 2015 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global ble, statusDiv, temperature  */
/* jshint browser: true , devel: true*/

// See BLE health thermometer service
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.health_thermometer.xml
var healthThermometer = {
    service: '1809',
    measurement: '2a1c'
};

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.scan();
    },
    scan: function() {
        app.status("Scanning for Health Thermometer");

        var foundThermometer = false;

        function onScan(peripheral) {
            // this is demo code, assume there is only one thermometer
            console.log("Found " + JSON.stringify(peripheral));
            foundThermometer = true;

            ble.connect(peripheral.id, app.onConnect, app.onDisconnect);
        }

        function scanFailure(reason) {
            alert("BLE Scan Failed");
        }

        ble.scan([healthThermometer.service], 60, onScan, scanFailure);

        setTimeout(function() {
            if (!foundThermometer) {
                app.status("Could not find a health thermometer.");
            }
        }, 60000); // this timeout should match BLE scan
    },
    onConnect: function(peripheral) {
        app.status("Connected to " + peripheral.id);
        ble.startNotification(peripheral.id, healthThermometer.service, healthThermometer.measurement, app.onData, app.onError);
    },
    onDisconnect: function(reason) {
        alert("Disconnected " + reason);
        temperature.innerHTML = "...";
        app.status("Disconnected");
    },
    onData: function(buffer) {
        // need to decode the measurement based on the 0x2a1c specs
        // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.temperature_measurement.xml
        // hack: assume byte 0 is flags and byte 1 is a temperature
        var data = new Uint8Array(buffer);
        temperature.innerHTML = data[1];
    },
    onError: function(reason) {
        alert("There was an error " + reason);
    },
    status: function(message) {
        console.log(message);
        statusDiv.innerHTML = message;
    }
};

app.initialize();
