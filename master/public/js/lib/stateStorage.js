var util = require('util');
var EventEmitter = require('events').EventEmitter;
function StateStorage() {
    var showSettings = true;
    var arrangeClients = false;
    var editable = false;

    Object.defineProperties(this, {
        show: {
            enumerable: true,
            get: function () {
                return showSettings;
            },
            set: function (val) {
                showSettings = val;

                if (showSettings == false) {
                    this.arrangeClients = false;
                } else {
                    this.emit('change');
                }

                this.emit('show', showSettings);
            }
        },
        arrangeClients: {
            enumerable: true,
            get: function () {
                return arrangeClients;
            },
            set: function (val) {
                arrangeClients = val;

                this.emit('change');
                this.emit('arrangeClients', arrangeClients);

            }
        },
        editable: {
            enumerable: true,
            get: function () {
                return !showSettings;
            }
        }
    });
}

util.inherits(StateStorage, EventEmitter);

var stateStorage = new StateStorage();

module.exports = stateStorage;
