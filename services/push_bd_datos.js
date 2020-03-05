const path = require('path');
//clase para correr funciines de comando bash
const starProcess = require("./runProcess");

//llamo fenerar pdf
const generatePdf = require("./generatePdf");
//inicializo consola vacia para ejecutar comandos
let runProcess = null;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


function uploadToDBToDatos(pathPaciente) {
  return new Promise((resolve, reject)=>{
    try {
      //console.log("subir a DAtos paciente "+ path.dirname(path.dirname(pathPaciente.dir)));
      var command = "cd /home/andresagudelo/Documentos; python ./uploadToDBfromCSV.py '"+path.dirname(path.dirname(pathPaciente.dir))+"'";
      runProcess(command).then(data =>{
        resolve(data);
      }).catch(err =>{
        reject(err);
      });
      //generateDocument(pathPaciente.dir, "db_datosPy" );  
    } catch (error) {
      reject(error);
    }
  })
}



module.exports = uploadToDBToDatos;