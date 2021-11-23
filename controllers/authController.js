const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require('util')

//Procedimiento para registrarnos
exports.register = async (req, res)=>{

    try {
        const nombre = req.body.nombre
        const email = req.body.email
        const telefono = req.body.telefono
        const direccion = req.body.direccion
        const genero = req.body.genero
        const password = req.body.password

        let passwordHash = await bcryptjs.hash(password, 8)
        
        conexion.query('INSERT INTO users SET ?', {nombre:nombre, email:email, telefono:telefono, direccion:direccion, genero:genero, password:passwordHash}, (error, results)=>{
            if (error) {
                console.log(error)
            }
            res.redirect('/')
        })

    } catch (error) {
        console.log(error)
    }
}

exports.login = async (req, res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        

        if (!email || !password) {
            res.render('login', {
                alert:true,
                alertTitle:"Advertencia",
                alertMessage:"Ingrese un Usuario y Contraceña",
                alertIcon:'info',
                showConfirmButton:true,
                timer:false,
                ruta:'login'

            })    
        } else {
            conexion.query('SELECT * FROM users WHERE email = ?', [email], async (error, results)=>{
                if (results.length == 0 || !(await bcryptjs.compare(password, results[0].password))) {
                    res.render('login', {
                        alert:true,
                        alertTitle:"Error",
                        alertMessage:"Ingrese un Usuario y Contraceña",
                        alertIcon:'error',
                        showConfirmButton:true,
                        timer:false,
                        ruta:'login'
        
                    })
                }else{
                    //Inicio de Sesion OK
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO,{
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    console.log("Token: "+token+"Usuario: "+email)

                    const cookiesOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                    res.render('login', {
                        alert:true,
                        alertTitle:"Conexion Exitosa",
                        alertMessage:"Login Correcto",
                        alertIcon:'success',
                        showConfirmButton:false,
                        timer:800,
                        ruta:''
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.isAuthenticated = async (req, res, next)=>{
    if (req.cookies.jwt) {
        try {

            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results)=>{
                if (!results) {
                    return next()
                }
                req.email = results[0]
                return next()
            })
            
        } catch (error) {
            console.log(error)
            return next()
        }
    } else {
        res.redirect('/login')
        
    }


}


exports.logout = (req, res)=>{
    res.clearCookie('jwt')
    return res.redirect('/')

}
    

   