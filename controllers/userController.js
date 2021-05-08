const user = require("../model/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET_KEY } = require("../config");
const saveStreamModel = require("../model/saveStreamModel");
const streamModel = require("../model/streamModel");
var shortid = require('shortid');
const socialLoginModel = require("../model/socialLoginModel");



exports.register = async (req, res, next) => {
    const body = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password, salt)
    body.password = passwordHash;
    const { name, phone, type, email, password } = body;

    console.log(req.body)

    const checkUser = await user.findOne({ email });

    if (checkUser) {
        return res.status(403).json({ error: "Email already exist !" })
    }

    const newUser = new user({
        name, phone, type, email, password
    })

    try {
        await newUser.save();

        const token = getSignInToken(newUser);

        return res.status(200).json({ success: true, message: "Signup and logged In Successfully !!", token: token, data: getUserData(newUser) })
    } catch (error) {
        error.status = 400;
        next(error);
    }
}


exports.socialUserInfo = async (req, res, next) => {
    const body = req.body;

    if (!body.name) {
        res.status(422).json({ success: false, message: "Please Provide  name" });
    }
    if (!body.email) {
        res.status(422).json({ success: false, message: "Please Provide  email" });
    }
    if (!body.token) {
        res.status(422).json({ success: false, message: "Please Provide social auth token" });
    }
    if (!body.type) {
        res.status(422).json({ success: false, message: "Please Provide user type" });
    }



    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("mynewpassword", salt)
    body.password = passwordHash;
    const { name, type, email, token, password } = body;
    const phone = "9140327455";
    console.log(req.body)

    const checkUser = await socialLoginModel.findOne({ email });

    if (checkUser) {
        const tsoken = getSignInToken(checkUser);
        return res.status(200).json({ success: true, message: "logged In Successfully !!", token: tsoken, data: getUserData(checkUser) })
    }

    const newUser = new socialLoginModel({
        name, phone, type, email, token, password
    })

    try {
        await newUser.save();

        const token = getSignInToken(newUser);

        return res.status(200).json({ success: true, message: "logged In Successfully !!", token: token, data: getUserData(newUser) })
    } catch (error) {
        error.status = 400;
        next(error);
    }
}


exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    const checkUser = await user.findOne({ email });

    if (!checkUser) {
        return res.status(403).json({ error: "Invalid User/password!" })
    }
    const isValid = await bcrypt.compare(password, checkUser.password);
    console.log(isValid);
    if (!isValid) {
        return res.status(405).json({ error: "Incorrect Password" })
    }


    else {
        const token = getSignInToken(checkUser);
        return res.status(200).json({ success: true, message: "Login Successful !!", token: token, data: getUserData(checkUser) })
    }

}


exports.getStream = async (req, res) => {
    var streams = {};
    await saveStreamModel.find({}, function (err, allstreams) {
        //var streams = {};

        allstreams.forEach(function (stream) {
            streams[stream._id] = stream;
        });


    });
    res.status(200).json({ success: true, message: "Stream fetched successfully", data: streams });
}


//streams

exports.startStream = async (req, res) => {

    if (!req.body.stream_name) {
        res.status(422).json({ success: false, message: "Please Provide stream name" });
    }

    if (!req.body.venue) {
        res.status(422).json({ success: false, message: "Please Provide stream venue" });
    }

    if (!req.body.cover_image) {
        res.status(422).json({ success: false, message: "Please Provide stream cover_image" });
    }
    var streamId = shortid.generate();
    console.log(streamId);

    var myStream = new streamModel({
        stream_id: streamId,
        user_id: req.user.id,
        stream_name: req.body.stream_name,
        venue: req.body.venue,
        cover_image: req.body.cover_image
    })

    try {
        await myStream.save();
    } catch (error) {
        res.status(200).json({ success: false, message: "Unable to start stream", error: error.message });
    }


    // while (!checkUniqueStreamId(streamId)) {
    //     streamId = shortid.generate();
    // }
    console.log("final " + streamId);


    res.status(200).json({ success: true, message: "Stream records saved successfully", stream_id: streamId });
}

getSignInToken = user => {
    return jwt.sign({
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email
    }, TOKEN_SECRET_KEY, { expiresIn: "6h" })
}

getUserData = user => {
    return ({
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email
    })
}

checkUniqueStreamId = streamId => {
    streamModel.findOne({ stream_id: streamId }, function (err, obj) {

        if (obj) {
            return obj;
        }
        return "not unique";
    });
}

