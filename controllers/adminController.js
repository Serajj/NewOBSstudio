const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../model/user');


const indexView = (req, res, next) => {
    res.render('home', { 'username': req.session.name });

}

const loginView = (req, res, next) => {
    res.render('login');

}


const loginPostView = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email);
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
        if (checkUser.type != "admin") {
            return res.status(405).json({ error: "Access denied, You are not Admin" })
        }
        req.session.loggedin = true;
        req.session.serajisagoodprogrammer = "ofcourse";
        req.session.id = checkUser.id;
        req.session.name = checkUser.name;
        req.session.email = checkUser.email;
        res.redirect('/admin');

    }

}


const liveStreamView = (req, res, next) => {
    res.render('stream', { 'username': req.session.name });

}

const streamView = (req, res, next) => {
    res.render('adminStremers', { 'username': req.session.name });

}

const editorView = (req, res, next) => {
    res.render('adminEditors', { 'username': req.session.name });

}

const taskView = (req, res, next) => {
    res.render('adminTask', { 'username': req.session.name });

}





module.exports = {
    indexView,
    loginView,
    streamView,
    loginPostView,
    streamView,
    liveStreamView,
    editorView,
    taskView
}