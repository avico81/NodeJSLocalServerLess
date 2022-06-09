const fs = require('fs');

class FileManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.buffers = [[], []];
        this.bufferIdx = 0;
    }

    flushBufferAndSwitch() {
        this.bufferIdx = 1 - this.bufferIdx;
        if(this.buffers[1 - this.bufferIdx].length) {
            // write prev buffer to the file
            fs.appendFileSync(this.filePath, this.buffers[1 - this.bufferIdx].join('\n') + '\n');
            // empty prev buffer
            this.buffers[1 - this.bufferIdx] = [];
        }
    }
    
    open() {
        setInterval(this.flushBufferAndSwitch.bind(this), 10000);
        return this;
    }

    write(msg) {
        this.buffers[this.bufferIdx].push(msg);
    }
}

module.exports = new FileManager('./output.txt').open();