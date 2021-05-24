const express = require('express');
const Sequelize = require('sequelize');
require('dotenv').config({ path:'variables.env' })

const db = new Sequelize(process.env.BD_NOMBRE,process.env.BD_USER,process.env.BD_PASS,{
  host:process.env.BD_HOST,
  port:process.env.BD_PORT,
  dialect:'mysql',
  define:{
    timestamps:false
  },
  pool: {
    max:5,
    min:0,
    acquire:30000,
    idle:10000
  },
  operatorAliases:false
});

const app = express();
//const router = express.Router();

db.authenticate()
  .then(() => console.log('Base de datos conectada') )
  .catch(error => console.log(error) );

const Viaje = db.define('viajes',{
    titulo: {
      type:Sequelize.STRING
    },
    precio: {
      type:Sequelize.STRING
    },
    fecha_ida: {
      type:Sequelize.DATE
    },
    fecha_vuelta: {
      type:Sequelize.DATE
    },
    imagen: {
      type:Sequelize.STRING
    },
    descripcion: {
      type:Sequelize.STRING
    },
    disponibles: {
      type:Sequelize.STRING
    },
    slug: {
      type:Sequelize.STRING
    },
});
const Testimonial = db.define('testimoniales',{
    nombre: {
      type:Sequelize.STRING
    },
    correo: {
      type:Sequelize.STRING
    },
    mensaje: {
      type:Sequelize.STRING
    },
});

//const port = process.env.PORT || 4000;

app.set('view engine', 'pug');

// Obtener el año actual
app.use((req,res,next) => {
  const year = new Date();
  res.locals.actualYear = year.getFullYear();
  res.locals.nombresitio = "Agencia de viajes";
  return next();
});

// Agregar body parser para los datos del formulario
app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

//Creamos un controller
const paginaInicio = async (req,res) => {

  const promiseDB = [];

  promiseDB.push(Viaje.findAll({limit:3}));
  promiseDB.push(Testimonial.findAll({limit:3}));

  try{
    const resultado = await Promise.all(promiseDB);

    res.render('inicio',{
      pagina:'Inicio',
      clase:'home',
      viajes: resultado[0],
      testimoniales:resultado[1]
    });
  }catch{
      console.log(error);
  }

}

const paginaNosotros = (req,res) => {
  res.render('nosotros',{
    pagina:'Nosotros'
  });
}
const paginaViajes = async (req,res) => {

  const viajes = await Viaje.findAll();

  res.render('viajes',{
    pagina:'Viajes',
    viajes,
  });
}
const paginaDetalleViaje = async (req,res) => {
  const { viaje } = req.params;

  console.log(viaje);

  try{
    const resultado = await Viaje.findOne({where: {slug:viaje }});

    res.render('Viaje',{
      pagina:'Información Viaje',
      resultado
    })
  }catch(error){
    console.log(error);
  }
}

const paginaTestimoniales = async (req,res) => {

  try{
    const testimoniales = await Testimonial.findAll();

    res.render('testimoniales',{
      pagina:'Testimoniales',
      testimoniales
    });
  }catch(error){
    console.log(error);
  }
}

const guardarTestimonial = async (req,res) => {

  const { nombre,correo,mensaje } = req.body;

  const errores = [];

  if(nombre.trim() === ''){
    errores.push({mensaje: "El nombre esta vacio"});
  }
  if(correo.trim() === ''){
    errores.push({mensaje: "El correo esta vacio"});
  }
  if(mensaje.trim() === ''){
    errores.push({mensaje: "El mensaje esta vacio"});
  }

  if(errores.length>0){

    const testimoniales = await Testimonial.findAll();

    res.render('testimoniales',{
      pagina:'Testimoniales',
      errores,
      nombre,
      correo,
      mensaje,
      testimoniales
    })
  }else{
    try{
      await Testimonial.create({
        nombre,
        correo,
        mensaje
      });
      res.redirect('/testimoniales');
    }catch(error){
      console.log(error)
    }
  }
}

//detecta una solicitud get y da una respuesta en pantalla
app.get('/',paginaInicio);

app.use('/nosotros',paginaNosotros);

app.get('/viajes',paginaViajes);
app.get('/viajes/:viaje',paginaDetalleViaje);

app.get('/testimoniales',paginaTestimoniales);
app.post('/testimoniales',guardarTestimonial);

app.get('/contacto',(req,res) => {
  res.send('Contacto');
});

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port,host, () => {
  console.log('El servidor esta funcionando en el puerto ${port}')
})
