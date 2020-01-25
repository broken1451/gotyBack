import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// express
import * as express from 'express';
import * as cors from 'cors';



// configuracion de la bd en firebase de manera local, para hacerlo en produccion hay q configurar otras cosas o ejecutar firebase-deploy
const serviceAccount = require('./serviceAccountKey.json');
// Inicializar app en firebase, esto esta en la configuracion del proyecto en firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://goty-a7aab.firebaseio.com"
  });


// 1) Trabajar con firestore se hace de la siguiente manera, se necesita hacer una referencia a la base de datos
const bd = admin.firestore();




// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// cuando se realiza una peticion, si solo queremos hacer peticiones get dejar de esta manera
// export const helloWorld = functions.https.onRequest((request, response) => { 
//  response.send("Hello from Firebase!"); el send envia un html
// }); // npm run build dentro de la carpeta fulnction, tsc --watch
export const helloWorld = functions.https.onRequest((request, response) => {
 response.json({
     mensaje: "Hola mundo desde funciones de firebase!!!"
     });
});

export const getGoty = functions.https.onRequest( async (request, response) => {

    // const nombre = 'Adrian';
    // response.json({nombre});

    // Mandar prametros por la url
    // const nombre =request.query.nombre || 'Sin nombre';
    // response.json({nombre});

// 2) Crear una referencia a la coleccion
    const gotyRef = bd.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map((doc) => {
        // console.log('doc.data(): ', doc.data());
        // console.log('doc: ', doc);
         return doc.data();  
    });
    response.json(juegos); // primer registro
    // response.json(docsSnap.docs[0].data()); // primer registro

});


// Express, npm i express cors, npm i @types/express --save-dev, npm i @types/cors --save-dev

const app = express();
app.use(cors({origin: true}));

app.get('/goty', async (req, res) => {
    const gotyRef = bd.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map((doc) => {
        // console.log('docsSnap.docs: ', docsSnap.docs);
        // console.log('doc.data(): ', doc.data());
        console.log('doc.data: ', doc.data());
        return doc.data();  
    });
    console.log('juegos: ', juegos);
    res.json({juegos}); // primer registro
});

app.post('/goty/:id', async (req, res) => {
   const id = req.params.id; // atrapar el id
// const referecia al documento = bd.collection('nombrecoleccion').doc(id q recibo como parametro)  // referencis sl documento que tenga ese id y sabes si existe
   const gameRef = bd.collection('goty').doc(id);  // referencis al documento que tenga ese id y sabes si existe
   const gameSnap = await gameRef.get();

       if (!gameSnap.exists) {
           res.status(404).json({
               ok: false,
               mensaje: `no existe ese juego con este id ${id}`
           });
       } else {
        const antes = gameSnap.data() || {votos: 0}; // referencia al objeto, asi estaba e juego antes y se obtiene la data
        await gameRef.update({
               votos: antes.votos + 1,
        });
       
        res.json({
               ok: true,
               mensaje: `gracias por tu voto a ${antes.name}`
        });
       }
}); 


//  exports.nombreQueDeseeDarleAlEndPoint

// una manera
//  exports.api =  functions.https.onRequest(app);

export const api =  functions.https.onRequest(app);
