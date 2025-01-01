const db = require('./pool')

async function createUser(user){
    await db.query('INSERT INTO users (fullname, username, password, membership) VALUES ($1, $2, $3, $4)',[user.fullname,user.email,user.password,false])
}

async function newMsg(msg, user, date){
    await db.query('INSERT INTO messages (message, author, date) VALUES ($1, $2, $3)', [msg, user, date])
}

async function getMsg(){
const {rows} = await db.query('SELECT * FROM messages;')
return rows
}

async function delteMsg(id){
    await db.query('DELETE FROM messages WHERE id = $1', [id])
}

module.exports = {
    createUser,
    newMsg,
    getMsg,
    delteMsg
}