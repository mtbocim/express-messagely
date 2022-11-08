"use strict";

const Router = require("express").Router;
const router = new Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next) {
    
    if (req.body === undefined) throw new BadRequestError();
    
    const { username, password } = req.body;
   
    const user = await User.authenticate(username)

    if (user) {
        if (await bcrypt.compare(password, user.password) === true) {
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
    }
    throw new UnauthorizedError("Invalid username/password");

});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res, next) {
    
    if (req.body === undefined) throw new BadRequestError();

    const { username, password, first_name, last_name, phone } = req.body;

    const newUser = 
        await User.register(username,password,first_name,last_name,phone);

    console.log("newUser>>>>>>>>>>>>>>>>>",newUser);
   
    const user = await User.authenticate(newUser);
   
    if (user) {
        if (await bcrypt.compare(password, user.password) === true) {
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
    }
    throw new UnauthorizedError("Invalid username/password");
});

module.exports = router;