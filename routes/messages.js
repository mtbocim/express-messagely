"use strict";

const Router = require("express").Router;
const router = new Router();

const Message = require('../models/message');

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get(
    '/:id',
    ensureLoggedIn,
    async function (req, res, body) {
        const message = await Message.get(req.params.id);

        const fromUsername = message.from_user.username;
        const toUsername = message.to_user.username;
        const username = res.locals.user.username;

        if (fromUsername &&
            toUsername &&
            username === fromUsername ||
            username === toUsername
        ) {
            return res.json({ message: message });
        }
        throw new UnauthorizedError("You are not allowed to view this message");
    });

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post(
    '/',
    ensureLoggedIn,
    //ensureCorrectUser,
    async function (req, res, next) {

        const from_username = res.locals.user.username;
        const to_username = req.body.to_username;
        const body = req.body.body;

        const newMessage = await Message.create(
            {
                from_username,
                to_username,
                body
            });

        return res.status(201).json({ message: newMessage });
    });

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post(
    '/:id/read',
    ensureLoggedIn,
    //ensureCorrectUser,
    async function (req, res, next) {
        const message = await Message.get(req.params.id);
        const currentUsername = res.locals.user.username;

        if (currentUsername === message.to_username) {
            const readMessage = await Message.markRead(req.params.id);
            return res.json({ message: readMessage });
        }

        throw new UnauthorizedError(
            "You are not allowed to perform that action"
        );
    }
)

module.exports = router;