import express from 'express';

const router = express.Router();

//detecta una solicitud get y da una respuesta en pantalla
router.get('/',(req,res) => {
  res.send('Inicio');
});
router.get('/nosotros',(req,res) => {
  res.render('nosotros');
});
router.get('/contacto',(req,res) => {
  res.send('Contacto');
});

export default router;
