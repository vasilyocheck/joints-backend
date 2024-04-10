import express from 'express';
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Joints API!');
})

app.listen(4444, (e) => {
    if(e){
        return console.log(e)
    }
    console.log('[server] Listening on port 4444! Server is OK.');
})