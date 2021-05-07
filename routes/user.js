const express = require("express");

const { login, register, getStream } = require("../controllers/userController");
const authToken = require("../middleware/authToken");

const router = express.Router();


router.get('/', (req, res) => res.send('Hello this is api route!'))

router.post('/login', login)

router.post('/register', register)

router.post('/getStreams', authToken, getStream)
module.exports = router