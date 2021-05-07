const user = require("../model/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET_KEY } = require("../config");
const saveStreamModel = require("../model/saveStreamModel");



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