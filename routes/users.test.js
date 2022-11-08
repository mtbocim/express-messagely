"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");

let testUserToken;
let testAdminToken;

describe("Users Routes Test", function () {
    beforeEach(async function () {
        await db.query("DELETE FROM users");
        const hashedPwd = await bcrypt.hash("secret",BCRYPT_WORK_FACTOR);
        await db.query(
            `INSERT INTO users VALUES
            (
                'test', 
                $1, 
                'testFirst', 
                'testLast', 
                '1234567890', 
                CURRENT_TIMESTAMP,
                CURRENT_T
            )
            `,
            [hashedPwd]
        )
      });

    });