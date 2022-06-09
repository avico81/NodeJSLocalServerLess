const PORT = 8000;

const express = require('express');
const bodyParser = require('body-parser');

const FunctionManager = require('./FunctionManager');
const FileManager = require('./FileManager');

const app = express();
app.use(bodyParser.json());


app.get('/statistics', (req, res) => {
    let stats = FunctionManager.getStats();
    res.send(stats);
});

app.post('/messages', (req, res) => {
    let { message } = req.body;
    let postMsgRes = FunctionManager.postMsg(message);
    res.send(postMsgRes);
});

app.post('/write', (req, res) => {
    FileManager.write(req.body.msg);
    res.send();    
});


app.listen(PORT, () => {
    console.log('Server started on port', PORT);
});
