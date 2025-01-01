const db = require('../db/query')
const bcryptjs = require('bcryptjs')

async function registerUser(req, res){
    bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
        try {
            const user = {
                fullname: req.body.firstName + ' ' + req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                membership: false
            }
            await db.createUser(user)
            return res.redirect('/login')
      } catch (error) { 
        res.redirect('sign-up')
        return error;
      }})
}

async function newMsg(req){
    const now = new Date();
    const date = now.toISOString().replace('Z', '');

    await db.newMsg(req.body.msg, req.user.username, date)
}

async function getMsg(){
   return await db.getMsg()
}

async function delteMsg(id){
    await db.delteMsg(id)
}

module.exports = {
    registerUser,
    newMsg,
    getMsg,
    delteMsg
}