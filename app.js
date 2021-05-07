const express = require('express')

const app = express()

const NodeMediaServer = require('node-media-server');

const http = require('http');

const server = http.createServer(app);

const userRoute = require('./routes/user');

const { Server } = require('socket.io');



const io = new Server(server);




const adminRouter = require('./routes/adminRoute');
var dateFormat = require('dateformat');

var saveStream = require('./model/saveStreamModel');

var session = require('express-session');


const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');

var session = require('express-session');


const port = process.env.PORT;

const portserver = process.env.PORT;


const mongoose = require('mongoose')
const { MONGODB_URL } = require('./config');
const bodyParser = require('body-parser');
const authToken = require('./middleware/authToken');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.json())

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Connected to database");

    return server.listen(port)
}).then(() => {
    console.log("Server running on port 3000");
}).catch((err) => {
    console.log(err.message);
})

/***
 * 
 * Managing Routes
 * 
 * 
 *****/

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/mystream', express.static(__dirname + '/media'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));



app.use('/admin', adminRouter);

//api routes
app.use('/api', userRoute);



app.get('/', (req, res) => res.send('Hello World!'))




app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
})

/***
 * 
 * Managing Stream Server
 * 
 * 
 *****/

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: portserver,
        mediaroot: path.join(__dirname, "media"),
        allow_origin: '*'
    },
    trans: {
        ffmpeg: ffmpegPath,
        tasks: [
            {
                app: 'live',
                mp4: true,
                mp4Flags: '[movflags=frag_keyframe+empty_moov]',

            }
        ]
    }
};

var nms = new NodeMediaServer(config)

try {
    nms.run();
    console.log("Initiated Media Server");
} catch (error) {

}


nms.on('preConnect', (id, args) => {
    console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
    // let session = nms.getSession(id);
    // session.reject();
});

nms.on('postConnect', (id, args) => {
    console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {

});

nms.on('prePublish', (id, StreamPath, args) => {
    // console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // // let session = nms.getSession(id);
    // // session.reject();
});

nms.on('postPublish', (id, StreamPath, args) => {
    // console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
    // console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id, StreamPath, args) => {
    // console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // let session = nms.getSession(id);
    // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd-HH-MM-ss");
    console.log('[connected time : ] ' + datetime);
    console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    var cod = savestreamtodb(id, StreamPath, datetime);
    console.log(cod)
});

nms.on('donePlay', (id, StreamPath, args) => {
    // console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});





/***
 * 
 * Save stream to database 
 * 
 * 
 *****/


function savestreamtodb(id, path, name) {

    var url = "http://localhost:3000/mystream" + path + "/" + name + ".mp4";
    var mystream = new saveStream({
        id, path, url
    });

    try {
        mystream.save();
    } catch (error) {
        console.log("error while saving stream " + error);
    }

    console.log("Saved to database");
    return 0;
}






/***
 * 
 * Managing Socket
 * 
 * 
 *****/

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
