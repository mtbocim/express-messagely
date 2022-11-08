"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    
    const hashPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `
      INSERT INTO users(
          username, 
          password, 
          first_name, 
          last_name, 
          phone, 
          join_at,
          last_login_at
      )
        VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        RETURNING 
          username,
          password,
          first_name,
          last_name,
          phone
      `,
      [
        username,
        hashPassword,
        first_name,
        last_name,
        phone
      ]
    );
    let user = results.rows[0];
    //console.log(user);
    //console log results.rows to look at data
    if (user === undefined) throw new BadRequestError("Unable to create user");
    
    return user;
  }


  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {


    const results = await db.query(
      `
      SELECT password 
        FROM users
        WHERE username = $1
      `,
      [username]
    );
    const user = results.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(
      `
      UPDATE users
        SET last_login_at = CURRENT_TIMESTAMP
        WHERE username = $1
        RETURNING users.last_login_at
      `,
      [username]
    );
    const userLoginAtTime = results.rows[0];

    //How much detail in this message?
    if (userLoginAtTime === undefined) {
      throw new NotFoundError(`Username not found: ${username} `);
    }

    return userLoginAtTime;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `
      SELECT u.username, u.first_name, u.last_name
        FROM users AS u
        ORDER BY u.username
      `
    );

    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `
      SELECT
        u.username,
        u.first_name,
        u.last_name,
        u.phone,
        u.join_at,
        u.last_login_at
        
        FROM users AS u
        WHERE u.username = $1
      `,
      [username]
    );

    const user = results.rows[0];

    if (user === undefined) throw new NotFoundError("User not found");

    return user;

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `
      SELECT 
        m.id, 
        m.body, 
        m.sent_at, 
        m.read_at,
        u_to.username,
        u_to.first_name,
        u_to.last_name,
        u_to.phone

        FROM messages AS m
        JOIN users AS u_to
          ON m.to_username = u_to.username
        WHERE m.from_username = $1
        `,
      [username]
    );

    const messages = results.rows.map(result => {
      const message = {
        id: result.id,
        to_user: {
          username: result.username,
          first_name: result.first_name,
          last_name: result.last_name,
          phone: result.phone
        },
        body: result.body,
        sent_at: result.sent_at,
        read_at: result.read_at
      }
      return message;
    });

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `
      SELECT 
        m.id,  
        m.body, 
        m.sent_at, 
        m.read_at,
        u_from.username,
        u_from.first_name,
        u_from.last_name,
        u_from.phone

        FROM messages AS m
        JOIN users AS u_from
          ON m.from_username = u_from.username
        WHERE m.to_username = $1
        `,
      [username]
    );

    const messages = results.rows.map(result => {
      const message = {
        id: result.id,
        from_user: {
          username: result.username,
          first_name: result.first_name,
          last_name: result.last_name,
          phone: result.phone
        },
        body: result.body,
        sent_at: result.sent_at,
        read_at: result.read_at
      }
      return message;
    });

    return messages;
  }
}


module.exports = User;
