# Slabs

slidy-tabs

# usage

    npm install slabs

Then:

```javascript
var Slab = require('slabs');

// Make one
var slab = new Slab();

// Set number of tabs
slab.tabs(3);

// Put content into slab.content, however you want...
crel(slab.content,
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

// put slab.element into the DOM somewhere.
document.body.appendChild(slab.element);
```
