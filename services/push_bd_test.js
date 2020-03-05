var fs = require('fs');
//invoco servicio para subir a Base de datos
const starProcess = require("./runProcess");
//llamo clases para manejo de archivos

//llamo fenerar pdf
const generatePdf = require("./generatePdf");
const { readFilee, createFile, deleteFile } = require('./fs');
// llamado child_process
//libreria de path
const extname = require("path");

//inicializo en null una consola
let runProcess = null;


//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}



function uploadToDBToTest(pathPaciente) {
  //generateDocument()
  //console.log(pathPaciente.name);
  //console.log(path.substring(1,-1));

  //console.log(fs.readdirSync(path)[0]);
  //callChecksStudies(pathPaciente);
  searchFiles(pathPaciente.dir);

}

const callChecksStudies = (pathPaciente) => {
  searchFiles(pathPaciente.dir).then(checkList => {
    Promise.all(checkList).then(values => {
      console.log("a");
      console.log("aqui generar ");
      //push_DB_datos(pathPaciente);
      //uploadToDBToTest(pathPaciente);
    }).catch(err =>{
      console.log(err);
    });
  }).catch(err =>{
    console.log(err);
  });
}


//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFiles(path) {
  // return new Promise((resolve, reject) => {
  //   //array de promoesas
   promesasArraya = [];

   
    //leo el directorio que quiero inspeccionar 
    fs.readdir(path, (err, files) => {
      //verifico que la ruta sea correcta y que no haya ningun error
      if (err) {
        return console.log(err);
      }
      //si no hay ningun problema realizo 
      for (let i = 0; i < files.length; i++) {
        //concateno la carpeta contenedora con la carpera nueva a leer
        var stats = fs.statSync(path + "/" + files[i]);
        //verifico que el archivo sea una carpeta 
        if (stats.isDirectory()) {
          //console.log(fs.readdirSync(path)[i].substring(1,-1));
          //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
          if (fs.readdirSync(path)[i].substring(1, -1) == 'C') {
            //console.log("calibracion"+fs.readdirSync(path)[i] );
            calibracion = fs.readdirSync(path)[i];
            break;
            //llamo metodo para generar un docuemento 
          }
        }
      }


      for (let i = 0; i < files.length; i++) {
        //concateno la carpeta contenedora con la carpera nueva a leer
        var stats = fs.statSync(path + "/" + files[i]);
        //verifico que el archivo sea una carpeta 
        if (stats.isDirectory()) {
          //console.log(fs.readdirSync(path)[i].substring(1,-1));
          //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
          if (fs.readdirSync(path)[i].substring(1, -1) == 'T') {
            //creo la variable de los comando respectivos para ejecutar octave
            //console.log("split "+path.split('/')[(path.split('/').length) - 1]);
            var command = "cd /home/andresagudelo/Documentos/QTproyects/qt_mongo_prueba; ./qt_mongo_prueba '" + path + "/" + calibracion + "' '" + path + "/" + fs.readdirSync(path)[i] + "' '" + path.split('/')[(path.split('/').length) - 1] + "' '" + fs.readdirSync(path)[i] + "'";
            // promesasArraya.push(runProcess(command));
            promesasArraya.push(runProcess(command));
          }
        }
      }
      Promise.all(promesasArraya).then(values => {
        generatePdf(path);
        //debugger;
        console.log("a"+values);
        console.log("aqui generar psf");
        //push_DB_datos(pathPaciente);
        //uploadToDBToTest(pathPaciente);
      }).catch(err =>{
          //console.log("error "+err);
      }); 
     
    })
  //})
}


const verifyPromises = (checks, pathologies, promesasArray, resolve) => {
  //console.log(checks,pathologies)
  if (checks === pathologies) {
    console.log(promesasArray);
    resolve(promesasArray);
  }
}




module.exports = uploadToDBToTest;