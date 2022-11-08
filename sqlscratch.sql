INSERT INTO users(username, password, first_name, last_name, phone, join_at, last_login_at)
    VALUES('mtbocim2', 'test','Michael','Bocim','1234567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT u.username, u.first_name, u.last_name
    FROM users AS u


SELECT u.username, u.first_name, u.last_name, u.phone, u.join_at, u.last_login_at
    FROM users AS u
    WHERE u.username = $1;

SELECT 
    m.id, 
    m.to_username, 
    m.body, 
    m.sent_at, 
    m.read_at,
    u.username,
    u.first_name,
    u.last_name,
    u.phone
    FROM messages AS m
    JOIN users AS u
        ON u.username = m.to_username
    WHERE u.username = 'mtbocim';


    SELECT 
        m.id, 
        m.from_username, 
        m.body, 
        m.sent_at, 
        m.read_at,
         u.username,
        u.first_name,
        u.last_name,
        u.phone
    FROM messages AS m
    JOIN users AS u
        ON u.username = m.from_username
    WHERE u.username = 'mtbocim';

    UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = 'mtbocim'
    RETURNING users.last_login_at;