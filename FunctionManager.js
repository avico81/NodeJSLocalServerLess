const cluster = require('cluster');
cluster.setupPrimary({
    exec: 'Function.js'
});

class FunctionManager{
    constructor() {
        this.workers = {};
        this.idleWorkers = {};
        this.msgCount = 0;

        cluster.on('online', (worker) => {
            this.workers[worker.process.pid] = worker;
        })

        cluster.on('message', (worker, data) => {
            this.idleWorkers[worker.process.pid] = {
                worker: worker,
                timer: setTimeout(() => {
                    worker.kill();
                }, 10000)
            };
            delete this.workers[worker.process.pid];
            if(data.res !== 'done') {
                setImmediate(() => this.postMsg(data.message, true)); // retry
            }
        });

        cluster.on('exit', (worker) => {
            if(worker.process.pid in this.idleWorkers) {
                delete this.idleWorkers[worker.process.pid];
            }
        })
    }

    postMsg(msg, retry=false) {
        if(!retry) {
            this.msgCount++;
        }
        let worker;
        if(Object.keys(this.idleWorkers).length > 0) {
            // reuse idle worker
            let idleWorkerPid = Object.keys(this.idleWorkers)[0];
            let idleWorker = this.idleWorkers[idleWorkerPid];
            clearTimeout(idleWorker.timer);  // stop the kill timer
            delete this.idleWorkers[idleWorkerPid];  // remove from idle
            worker = idleWorker.worker;
            this.workers[worker.process.pid] = worker;
        } else {
            worker = cluster.fork();
        }
        worker.send(msg);
        return `MSG "${msg}" posted`;
    }

    getStats() {
        return { 
            active_instances: Object.keys(this.workers).length + Object.keys(this.idleWorkers).length,
            total_invocation: this.msgCount
        }
    }
}


module.exports = new FunctionManager();
