console.log('hi mum');

const ctx = new (window.AudioContext || window.webkitAudioContext);

const app = new Vue({
    el: "#app",

    data: {
        nextId: 100,
        sounds: [],
    },

    methods: {
        play() {
            var offset = 0;
            this.sounds.forEach( sound => {
                
                const source = ctx.createBufferSource();
                source.buffer = sound.buf;
                source.connect( ctx.destination );
    
                source.start(offset);
                offset += sound.buf.duration + 0.1;
            });
        },

        onDrop(e) {
            e.preventDefault();
    
            for( var i=0; i<e.dataTransfer.items.length; i+=1 ) {
                item = e.dataTransfer.items[i];
                if( item.kind !== 'file' ) {
                    console.log( `ignoring dropped non-file ${JSON.stringify(item)}` );
                    return;
                }
    
                const file = item.getAsFile();
                console.log( `accepting dropped file ${file.name}` );
    
                const reader = new FileReader();
                reader.onload = loaded => {
                    ctx.decodeAudioData( loaded.target.result )
                        .then( sound => {
                            this.sounds.push( { name:file.name, buf: sound, id: this.nextId } );
                            this.nextId += 1;
                        })
                        .catch( err => {
                            console.log(`couldn't read file: ${err}`);
                        });
                };
                reader.readAsArrayBuffer( file );
            }
        },

        onDragOver(e) {
            // suppress browser's default drag-drop for files
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        },

    },
});

