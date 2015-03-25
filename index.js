var doc = require('doc-js'),
    EventEmitter = require('events').EventEmitter,
    interact = require('interact-js'),
    pythagoreanEquation = require('math-js/geometry/pythagoreanEquation'),
    crel = require('crel'),
    venfix = require('venfix'),
    unitr = require('unitr'),
    laidout = require('laidout'),
    NE = 45,
    NW = -45,
    SE = 135,
    SW = -135,
    slabs = [];

function isHorizontal(angle){
    return ((angle > NE && angle < SE) || (angle < NW && angle > SW));
}

function delegateInteraction(interaction){
    if(interaction._slabCanceled){
        return;
    }

    if(interaction._slab){
        interaction.preventDefault();
        interaction._slab._drag(interaction);
        return;
    }

    if(!isHorizontal(interaction.getCurrentAngle(true))){
        interaction._slabCanceled = true;
        return;
    }

    var target = doc(interaction.target).closest('.slab');

    if(target && target.slab){
        interaction.preventDefault();
        interaction._slab = target.slab;
    }
}

function endInteraction(interaction){
    if(interaction._slab){
        interaction._slab._end(interaction);
        interaction._slab = null;
    }
}

function bindEvents(){
    if(typeof document === 'undefined'){
        // Not running in a browser.
        return;
    }
    interact.on('drag', document, delegateInteraction);
    interact.on('end', document, endInteraction);
    interact.on('cancel', document, endInteraction);
    window.addEventListener('resize', function(){
        slabs.forEach(function(slab){
            slab._resize();
        });
    });
}

bindEvents();

function Slab(){
    slabs.push(this);
    this._render();
}
Slab.prototype = Object.create(EventEmitter.prototype);
Slab.prototype.constructor = Slab;
Slab.prototype._distance = 0;
Slab.prototype._tabs = 1;
Slab.prototype._tab = 0;
Slab.prototype._enabled = true;
Slab.prototype._velocity = 0;
Slab.prototype.enabled = function(value){
    if(!arguments.length){
        return this._enabled;
    }

    this._enabled = !!value;

    return this;
};

Slab.prototype.tabs = function(value) {
    if(!arguments.length){
        return this._tabs;
    }

    if(isNaN(value)){
        value = 0;
    }

    value = Math.max(value,  0);

    if(value === this._tabs){
        return this;
    }

    this._tabs = value;
    this._update();

    return this;
};
Slab.prototype.tab = function(value) {
    if(!arguments.length){
        return this._tab;
    }

    if(isNaN(value)){
        value = 0;
    }

    value = Math.max(Math.min(value, this._tabs), 0);

    if(value === this._tab){
        return this;
    }

    this._cancelSettle();
    this._targetDistance = this._renderedWidth() * value;
    this._velocity = (this._targetDistance - this._distance)/10;
    this._settleToTarget();

    return this;
};
Slab.prototype._resize = function() {
    this._distance = this._renderedWidth() * this._tab;
    this._updateStyle(this._distance);
};
Slab.prototype._render = function(element){
    this.element = element || crel('div',
        crel('div')
    );

    this.content = this.element.childNodes[0];
    this.element.slab = this;
    doc(this.element).addClass('slab');
};
Slab.prototype._renderedWidth = function(){
    var width = this.content.clientWidth;
    if(isNaN(width)){
        width = 0;
    }
    return width;
};
Slab.prototype._drag = function(interaction){
    if(!this._enabled){
        this._velocity = 0;
        return;
    }

    this._cancelSettle();

    var xDelta = interaction.getMoveDelta().x;
    this._distance = Math.max(Math.min(this._distance - xDelta, (this._tabs - 1) * this._renderedWidth()), 0);
    this._velocity = interaction.getSpeed() * (xDelta < 0 ? 1 : -1) * 20;
    this._update();
};
Slab.prototype._end = function(interaction){
    this._settle();
};
Slab.prototype._update = function(){

    var slab = this;

    if(slab._distance != slab._lastDistance){
        requestAnimationFrame(function(){
            slab._updateStyle(slab._distance);
            slab.emit('move');
            slab._lastDistance = slab._distance;
        });
    }
};
Slab.prototype._updateStyle = function(displayPosition){
    for(var i = 0; i < this.content.children.length; i++){
        this.content.children[i].style[venfix('transform')] = 'translate3d(' + unitr(-displayPosition) + ',0,0)';
    }
};
Slab.prototype._direction = function(){
    return this._velocity > 0 ? 1 : -1;
};
Slab.prototype._settleToTarget = function() {
    var direction = this._direction(),
        distanceLeft = Math.abs(this._distance - this._targetDistance);

    if((this._targetDistance - this._distance) * direction <= 1){
        this._distance = this._targetDistance;
        this._tab = this._distance / this._renderedWidth();
        this._update();
        this.emit('settle');
        return;
    }

    var speed = Math.abs(this._velocity);

    this._velocity = Math.min(speed *= 1.1, distanceLeft) * direction;

    this._distance += this._velocity;

    this._update();

    this._settleFrame = requestAnimationFrame(this._settleToTarget.bind(this));
};
Slab.prototype._cancelSettle = function(){
    if(this._settleFrame){
        cancelAnimationFrame(this._settleFrame);
        this._settleFrame = null;
    }
};
Slab.prototype._settle = function(){
    var width = this._renderedWidth(),
        speed = Math.abs(this._velocity),
        sameTab;

    if(speed < 1){
        if(Math.abs(this._distance - width * this._tab) < width / 2){
            sameTab = true;
        }
        this._velocity = this._distance % width > width / 2 ? 1 : -1;
    }

    var targetDistance = width * (this._tab + (sameTab ? 0 : this._direction()));

    this._targetDistance = Math.max(Math.min(targetDistance, (this._tabs - 1) * width), 0);

    if(this._direction() < 1 && this._distance <= 0){
        this._velocity = 0;
    }

    this._settleToTarget();
};

module.exports = Slab;