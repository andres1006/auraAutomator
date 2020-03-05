const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const azure = require('azure-storage');
const extname = require("path");
const axios = require('axios');
const uuidv1 = require('uuid/v1');
const blobService = azure.createBlobService();
const fileService = azure.createFileService();
//funciones system file para manejo de archivos
//libreria de path
const { readFilee, createFile, deleteFile } = require('./fs');



//const fileService = azure.createFileService();
//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const urlAzure = "https://externalstorageaccount.blob.core.windows.net/entrada/";


async function main() {
  console.log('Azure Blob storage v12 - JavaScript quickstart sample');
  // Create the BlobServiceClient object which will be used to create a container client
  // const blobServiceClient = await BlobServiceClient.fromConnectionString(
  //   AZURE_STORAGE_CONNECTION_STRING
  // );
  // Create a unique name for the container
  const containerName = 'finalizadosBackUps';
  // searchFiles(
  //   '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_20'
  // );
  //veryBlob();
  //showBlobs(blobServiceClient, containerName);
  searchJsonBlob(blobServiceClient, containerName);



  // createContainer(containerName).then(data=>{
  //   console.log(data);
  // });

  // downloadBlobs(
  //   containerName,
  //   '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso'
  // );
  // pushfile(containerName, {
  //   blobName: 'folder/paciente_grupoA_1.json',
  //   pathFile:
  //     '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_1/paciente_grupoA_1.json'
  // }).then(res => {
  //   console.log(res);
  // });

  //console.log('\nUploading to Azure storage as blob:\n\t', blobName);
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFiles(path, hospital, folderPadre) {
  //console.log(folderPadre);
  //leo el directorio que quiero inspeccionar
  fs.readdir(path, (err, files) => {
    //verifico que la ruta sea correcta y que no haya ningun error
    if (err) {
      return console.log(err);
    }
    //si no hay ningun problema realizo
    for (let i = 0; i < files.length; i++) {
      //concateno la carpeta contenedora con la carpera nueva a leer
      var stats = fs.statSync(path + '/' + files[i]);
      //verifico que el archivo sea una carpeta
      if (stats.isDirectory()) {
        //console.log(extname.dirname(path+"/"+ files[i]));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
        searchFiles(path + '/' + files[i], hospital, folderPadre);
      } else {
        //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion
        var string = path.split("/");
        //console.log(string[string.length-1], folderPadre);
        if (string[string.length - 1] !== folderPadre) {
          pathazure = hospital + "/" + string[string.length - 2] + "/" + string[string.length - 1] + "/" + files[i];
          pathFile = path + "/" + files[i];
          //console.log(pathazure);
        } else {

          pathazure = hospital + "/" + string[string.length - 1] + "/" + files[i];
          pathFile = path + "/" + files[i];
          //console.log(pathazure);
        }
        pushfile("entrada", { blobName: pathazure, pathFile: pathFile }).then(data => {
          //console.log(data);
        })
      }
    }
  });
}

//funcion para subir archivo a azure recibe el nombre del container donde se va a almacenar y los datos del archivo
function pushfile(containerName, file) {
  return new Promise((resolve, reject) => {
    try {
      blobService.createBlockBlobFromLocalFile(
        containerName,
        file.blobName,
        file.pathFile,
        function (error, result, response) {
          if (!error) {
            resolve({ res: response.isSuccessful, result: result });
          } else {
            reject(error);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}



async function showBlobs(blobServiceClient, containerName) {
  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  console.log('\nListing blobs...');

  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log(blob.name);

  }
}

const callChecksBlobDownoload = (blobServiceClient, containerName) => {
  searchJsonBlob(blobServiceClient, containerName).then(checkList => {
    //console.log("Estudios Clasificados completos");
    Promise.all(checkList).then(values => {

    }).catch(err => {
      console.log(err);
    });
  }).catch(err => {
    console.log(err);
  })
}

async function searchJsonBlob(blobServiceClient, containerName) {
  try {
    // Get a reference to a container
    const containerClient = await blobServiceClient.getContainerClient(
      containerName
    );
    console.log('\nListing blobs...');

    // List the blob(s) in the container.
    for await (const blob of containerClient.listBlobsFlat()) {
      if (extname.extname(blob.name) === ".json") {
        //necesito acceder a la url y consultar la informacion de Json
        console.log(urlAzure + blob.name);
        const response = await axios.get(urlAzure + blob.name);
        if (response.data.estado === 1) {
          //console.log(response.data);
          downoloadBlobForPath(blobServiceClient, containerName, blob);
        
        }
      }
    }
  } catch (error) {

  }
}

async function downoloadBlobForPath(blobServiceClient, containerName, blobDownoload) {

  //array de promoesas
  promesasArray = [];
  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  var arrayPath = blobDownoload.name.split("/");
  var filesDownoload = 0;
  for await (const blob of containerClient.listBlobsFlat()) {
    var arrayPathBlob = blob.name.split("/");
    //verifico los blobs correspondientes al grupo del json encontrado
    if (arrayPathBlob[0] === arrayPath[0] && arrayPathBlob[1] === arrayPath[1]) {
      filesDownoload++;
    }
  }

  console.log(filesDownoload);
  var addCheck = 0;
  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    var arrayPathBlob = blob.name.split("/");
    //verifico los blobs correspondientes al grupo del json encontrado
    if (arrayPathBlob[0] === arrayPath[0] && arrayPathBlob[1] === arrayPath[1]) {
      return new Promise((resolve, reject) => {
        try {
          promesasArray.push(downloadBlob(
            containerName,
            blob,
            //esta ruta hayq ue configurarla desde variables de entorno
            '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso'
          ));
          addCheck++;
          verifyPromises(addCheck, filesDownoload, promesasArray, resolve);
        } catch (error) {
          reject(error);
        }
      })
    }
  }

}

const verifyPromises = (checks, pathologies, promesasArray, resolve) => {
  if (checks === pathologies) {
    resolve(promesasArray);
  }
}



async function downloadBlob(containerName, blobDownoload, destinationDirectoryPath, callback) {
  //console.log('Entering downloadBlobs.');
  // Validate directory
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(destinationDirectoryPath)) {
        console.log(destinationDirectoryPath + 'directorio no existe...'
        );
        fs.mkdirSync(destinationDirectoryPath);
        console.log('Directorio created.');
      }
      // NOTE: does not handle pagination. 
      var pathNew = blobDownoload.name.split("/");
      var pathgeneral = destinationDirectoryPath;
      for (var i = 0; i < (pathNew.length - 1); i++) {
        //verifico si el directorio donde voy a guardar existe si no lo creo
        if (!fs.existsSync(pathgeneral + "/" + pathNew[i])) {
          pathgeneral = pathgeneral + "/" + pathNew[i];
          fs.mkdirSync(pathgeneral);
          console.log(pathgeneral, ' created.');
        } else {
          pathgeneral = pathgeneral + "/" + pathNew[i];
        }
      }
      //instancio la conexion con el servicio a azure para descargar el blob al directorio seleccionado
      blobService.getBlobToLocalFile(
        containerName,
        blobDownoload.name,
        destinationDirectoryPath + '/' + blobDownoload.name,
        function (error2) {
          blobsDownloaded = 1;
          if (error2) {
            console.log(error2);
          } else {
            console.log(' Blob ' + blobDownoload.name + ' download finished.');
            resolve(blobDownoload.name);

          }
        }
      );

    } catch (error) {
      reject(error);
    }
  })

}



function downloadBlobs(containerName, destinationDirectoryPath, callback) {
  console.log('Entering downloadBlobs.');
  // Validate directory
  if (!fs.existsSync(destinationDirectoryPath)) {
    console.log(
      destinationDirectoryPath +
      ' does not exist. Attempting to create this directory...'
    );
    fs.mkdirSync(destinationDirectoryPath);
    console.log(destinationDirectoryPath + ' created.');
  }
  // NOTE: does not handle pagination.
  blobService.listBlobsSegmented(containerName, null, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      var blobs = result.entries;
      var blobsDownloaded = 0;
      blobs.forEach(function (blob) {
        if (blob.name.indexOf("/") !== -1) {
          // Validate directory
          arregloDeSubCadenas = blob.name.split('/', 2);
          if (!fs.existsSync(destinationDirectoryPath + '/' + arregloDeSubCadenas[0])) {
            console.log(destinationDirectoryPath + ' directory no existe ');
            fs.mkdirSync(destinationDirectoryPath + '/' + arregloDeSubCadenas[0]);
            console.log(destinationDirectoryPath + ' creado.');
          }
        }
        blobService.getBlobToLocalFile(
          containerName,
          blob.name,
          destinationDirectoryPath + '/' + blob.name,
          function (error2) {
            blobsDownloaded++;

            if (error2) {
              console.log(error2);
            } else {
              console.log(' Blob ' + blob.name + ' download finished.');

              if (blobsDownloaded === blobs.length) {
                // Wait until all workers complete and the blobs are downloaded
                console.log('All files downloaded');
                callback;
              }
            }
          }
        );

      });
    }
  });
}


async function createContainer(containerName) {
  return new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(containerName.toLowerCase(), function (
      err,
      result,
      response
    ) {
      if (err) {
        reject(err);
      } else {
        if (result) {
          resolve({ containerName: containerName.toLowerCase(), res: response, exist: result });
        }
        // Your code goes here
      }
    })
  });
}

async function veryBlob(blobName) {
  return new Promise((resolve, reject) => {
    try {
      blobService.getBlobProperties('entrada', blobName, function (
        err,
        properties,
        status
      ) {
        if (status.isSuccessful) {
          resolve({ status: status, properties: properties });
          console.log('existe');
        } else {
          resolve({ status: status, properties: properties });
          console.log('no existe');
        }
      });
    } catch (error) {
      reject(error);
    }
  })
}

main().then(data => {
  console.log("Done...");
})

module.exports = { pushfile, searchFiles };