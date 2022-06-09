const axios = require('axios');

process.on('message', message => {
    setTimeout(() => {
        axios.post('http://localhost:8000/write', { msg: `${process.pid} recieved message "${message}"`})
        .then(res => {
            process.send({ res: 'done', msg: message });    
        }).catch(err => {
            process.send({ res: 'failed', msg: message });
        });
    }, 5000);
});