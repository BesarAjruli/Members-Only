require('dotenv').config()
const {Router} = require('express')
const mainController = require('../controller/mainController')
const {body, validationResult} = require('express-validator')
const db = require('../db/pool')
const bcryptjs = require('bcryptjs')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy

const mainRouter = Router()

mainRouter.use(session({ 
    store: new (require('connect-pg-simple')(session))({
        pool: db,
        tableName: 'members_session',
        createTableIfMissing: true
      }),
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } 
}));
mainRouter.use(passport.session());

mainRouter.get('/', async (req, res) => {
    const msgs = await mainController.getMsg()
    res.render('index', {user: req.user, messages: msgs})
})
//Sign-Up routes
mainRouter.get('/sign-up', (req,res) => res.render('signUp', { errors: null, formData: {}}))
mainRouter.post('/sign-up', [
    body('password')
    .isLength({min: 8})
    .withMessage('Password must be at least 8 chaacters long!')
    .matches(/[A-Z]/)
    .withMessage('Password must contain one uppercase letter!'),
    body('confirmPass').custom((value, {req}) => {
        return value === req.body.password
    }).withMessage('Password didn\'t match')
], (req,res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).render('signUp', { errors: errors.array(), formData: req.body });
    }
    mainController.registerUser(req, res)
})
//Login routes
mainRouter.get('/login', (req, res) => res.render('login'))
mainRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/join',
    failureRedirect: '/'
}))
//Join routes
mainRouter.get('/join', (req, res) => res.render('joinMembership'))
mainRouter.post('/join', (req, res) => {
    if(!req.user){
        res.redirect('/sign-up')
    }else {
        db.query('UPDATE users SET membership = $1 WHERE id = $2;', [true, req.user.id], (err, result) => {
            if(err){
                console.error('Error updating membership:', err);
            return res.status(500).send('An error occurred while updating membership');
            }
            res.redirect('/')
        })
    }
})
//New Post route
mainRouter.post('/new', (req, res) => {
    mainController.newMsg(req)
    res.redirect('/')
})
//Delete
mainRouter.get('/delete/:id', (req, res) => {
    mainController.delteMsg(req.params.id)
    res.redirect('/')
})


//Passport
passport.use(
    new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
        const {rows} = await db.query('SELECT * FROM users WHERE username = $1',[email])
        const user = rows[0]
            try{
                if(!user){
                    return done(null,false, {message: 'Incorrecr username'})
                }

                const match = await bcryptjs.compare(password, user.password)
                if(!match){
                    return done(null, false, {message: 'Incorrect password'})
                }
                return done(null, user)
            }catch(error){
                return done(error)
            }
    })
)

passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
      const user = rows[0];
  
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

module.exports = mainRouter