console.log('hi mum');

const ctx = new (window.AudioContext || window.webkitAudioContext);

const formatTimeLength = function(l) {
    return (+l).toLocaleString(undefined, {maximumFractionDigits:2});
};
Vue.filter('time', formatTimeLength);

const app = new Vue({
    el: "#app",

    data: {
        nextId: 100,
        maxLength: 16,
        gap: 0.1,
        sounds: [],
    },

    computed: {
        totalLength() {
            var length = 0;
            this.sounds.forEach( (sound,ix) => {
                if( ix != 0 ) {
                    length += this.gap;
                }
                length += sound.duration;
            });
            return length;
        },
    },

    methods: {
        playAll() {
            var offset = 0;
            this.sounds.forEach( sound => {
                
                const source = ctx.createBufferSource();
                source.buffer = sound.buf;
                source.connect( ctx.destination );
    
                source.start(ctx.currentTime + offset);
                offset += sound.duration + this.gap;
            });
        },

        playOne(sound) {
            const source = ctx.createBufferSource();
            source.buffer = sound.buf;
            source.connect( ctx.destination );
            source.start();
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
                            this.sounds.push( { 
                                name:file.name,
                                buf: sound, 
                                duration: sound.duration,
                                id: this.nextId
                            });
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

