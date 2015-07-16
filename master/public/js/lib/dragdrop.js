var util = require('util');
var EventEmitter = require('events').EventEmitter;
var interact = require('interact.js');

var droppedTarget;
var _basket = [];

Array.prototype.unique = function () {
    var n = [this[0]];
    for (var i = 1; i < this.length; i++) {
        if (this.indexOf(this[i]) == i) n.push(this[i]);
    }
    return n;
};

function DragDrop() {
    var dropzone = null;
    Object.defineProperties(this, {
        dropzone: {
            enumerable: true,
            get: function () {
                return dropzone;
            },
            set: function (val) {
                if (dropzone == null || val == null) {
                    dropzone = val;
                }
            }
        }
    });
}

util.inherits(DragDrop, EventEmitter);

DragDrop.prototype.movedClient = function (client) {
    var group = this.dropzone;
    this.dropzone = null;
    this.emit(this.CLIENT_MOVED, client, group);
};

DragDrop.prototype.CLIENT_MOVED = 'client:moved';


var dragDrop = new DragDrop();

module.exports = dragDrop;

// target elements with the "draggable" class
interact('.show-settings .client')
    .draggable({
        // enable inertial throwing
        inertia: {
            resistance: 30,
            minSpeed: 200,
            endSpeed: 100
        },
        // keep the element within the area of it's parent
        restrict: {
            restriction: "parent",
            endOnly: true,
            elementRect: {top: 0, left: 0, bottom: 1, right: 1}
        },
        autoScroll: true,

        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
            event.target.classList.remove('drag-move');
        }
    });

function dragMoveListener(event) {
    var target = event.target,
    // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
        target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.classList.add('drag-move');
}

/* The dragging code for '.draggable' from the demo above
 * applies to this demo as well so it doesn't have to be repeated. */

// enable draggables to be dropped into this
interact('.show-settings .clients-group')
    .dropzone({
        // only accept elements matching this CSS selector
        accept: '.client',
        // Require a 25% element overlap for a drop to be possible
        overlap: 0.25,

        // listen for drop related events:

        ondropactivate: function (event) {
            // add active dropzone feedback
            event.target.classList.add('drop-active');
            _basket = [];
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget,
                dropzoneElement = event.target;
            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target');
            draggableElement.classList.add('can-drop');
            droppedTarget = event.target;
        },
        ondragleave: function (event) {
            // remove the drop feedback style
            event.target.classList.remove('drop-target');
            event.relatedTarget.classList.remove('can-drop');
            _basket.push(event.target.id);
        },
        ondrop: function (event) {
            //event.relatedTarget.textContent = 'Dropped';
            var basketUni = _basket.unique();
            var last = basketUni[basketUni.length - 1];
            if (_basket[0] != last) {
                dragDrop.dropzone = document.getElementById(basketUni[basketUni.length - 1]);
                dragDrop.movedClient(event.relatedTarget);
            }
        },
        ondropmove: function (event) {

        },
        ondropdeactivate: function (event) {
            // remove active dropzone feedback
            event.target.classList.remove('drop-active');
            event.target.classList.remove('drop-target');
        }
    });
