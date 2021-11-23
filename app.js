const express = require('express')

const dotenv = require('dotenv')

const cookieParser = require('cookie-parser')

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const app = express()

app.use(bodyParser.json());

//Seteamos el motor de plantilla
app.set('view engine', 'ejs')

//Seteamos la carpeta public para archivos estaticos
app.use(express.static('public'))

//configuracion para procesar datos enviados desde formularios
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//seteamos las variables de entorno
dotenv.config({path: './env/.env'})

//Para trabajar con las cookies
app.use(cookieParser())

//Llamar al router
app.use('/', require('./routes/router'))

//Para eliminar la cache 
app.use(function(req, res, next) {
    if (!req.email){
        res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        //next();
    }
    next();
});

app.listen(3000, ()=>{
    console.log('SERVER UP running in http://localhost:3000')
})