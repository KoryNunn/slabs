var Slab = require('../'),
    crel = require('crel');

window.onload = function(){

    var slab = new Slab();
    slab.tabs(3);
    crel(slab.element, {'class':'slab'});
    crel(slab.content, {'class':'slabContent'},
        crel('div', {'class':'tab'},
            crel('h1', 'THINGS')
        ),
        crel('div', {'class':'tab'},
            crel('h1', 'STUFF')
        ),
        crel('div', {'class':'tab'},
            crel('h1', 'MAJIGGER')
        ),
        crel('div', {'class':'tab'},
            crel('h1', 'Etc...')
        )
    );

    document.body.appendChild(slab.element);
};