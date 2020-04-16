const fs = require('fs');
const extname = require('path');
const { pushfile, veryBlob, deleteBlob } = require('./azure-service/azure');
const starProcess = require('./system-service/runProcess');
const { updateJson, updateJsonNumeroArchivos} = require('./system-service/jsonEditFile');
const {  readFilee, deleteFolder, copyFiles, getListFile } = require('./system-service/fs');

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


let runProcess = null;
const ROUTER_OCTAVE = process.env.ROUTER_OCTAVE;
const CONTAINER_NAME_ENTRADA = process.env.CONTAINER_NAME_ENTRADA;
const ROUTER_ENTRY_FILE = process.env.ROUTER_ENTRY_FILE;
const CONTAINER_NAME_ENTRADABACKUP = process.env.CONTAINER_NAME_ENTRADABACKUP;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesOscann = (path) => {
  spinner.text= `${chalk.green('Buscando archivos para subir...')}`;
  spinner.start();
  fs.readdir(path, (err, files) => {
    if (err) return console.log(err);
    
    for (let i = 0; i < files.length; i++) {
      let nuevoPath = `${path}/${files[i]}`;
      let stats = fs.statSync(nuevoPath);
      if (stats.isDirectory()) {
        searchFilesOscann(nuevoPath);
      } else {
        if (extname.extname(files[i]) === '.json') {
          readFilee(nuevoPath)
            .then(jsonData => {
              if (JSON.parse(jsonData).estado == 0) {
                updateJson(nuevoPath, 1).then(jsonUpdate => {
                  spinner.text= `${chalk.blue('Update estado Json =>')} paciente ${JSON.parse(jsonData).Label}`;
                });

                getListFile(path, async (err, filesList) => {
                  try {
                    updateJsonNumeroArchivos(nuevoPath, filesList.length).then(jsonUpdate => {
                      spinner.text= `${chalk.blue('Update estado Json =>')} paciente ${JSON.parse(jsonData).Label}`;
                    });
                    const indexJson = filesList.indexOf(nuevoPath);
                    if (indexJson !== -1) {
                      const fileJson = filesList.splice(indexJson, 1);
                      spinner.text= `${chalk.green('Subiendo archivos al servidor')}`;
                      const response = await pushFilesAzure(
                        filesList,
                        JSON.parse(jsonData)
                      );
                      const datajson = await updateJson(nuevoPath, 1);
                      const res = await pushFilesAzure(fileJson, JSON.parse(jsonData));
                      const datajson2 = await updateJson(nuevoPath,-1);
                      spinner.text= `${chalk.magenta('Realizando backup local')}`;
                      copyFiles(path)
                        .then(resCopyfiles => {
                          if (resCopyfiles.res) {
                            deleteFolder(path).then(resDeletedFolder => {
                              if (resDeletedFolder) {
                                spinner.succeed(`${chalk.green('Backup finalizado correctamente')}`);
                                spinner.indent = 2;
                                spinner.succeed(`${chalk.green('Proceso terminado')}`);
                              } else {
                                spinner.failed(`Error al eliminar folder`);
                              }
                            });
                          } else {
                            spinner.failed(`Error al hacer backup ${chalk.red(error)}`);
                          }
                        })
                        .catch(err => {
                          spinner.failed(`${chalk.red(error)}`);
                        });
                    }
                  } catch (error) {
                    spinner.failed(`${chalk.red(error)}`);
                  }
                });
              }
            })
            .catch(err => {
              spinner.failed(`Error al ejecutar el proceso ${chalk.red(err)}`);
            });
        }
      }
    }
  });
}

const  pushFilesAzure = (files, jsonPaciente) => {
  return new Promise((resolve, reject) => {
    try {
      let i = 0;
      files.forEach(async file => {
        const blobName = file.split(`${ROUTER_ENTRY_FILE}/`)[1];
        const existBlob = await veryBlob(CONTAINER_NAME_ENTRADA,`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`);
        if (existBlob) {
          spinner.text= `${chalk.red("Limpiando archvos en el servdor")}`;
          if (extname.extname(blobName) === '.json') {
            await deleteBlob(
              CONTAINER_NAME_ENTRADA,
              `${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`);
            await deleteBlob(
              CONTAINER_NAME_ENTRADABACKUP,
              `${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`);
          } else {
            await deleteBlob(
              CONTAINER_NAME_ENTRADA,`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`);
            await deleteBlob(
              CONTAINER_NAME_ENTRADABACKUP,`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`);
          }
        }
        if (extname.extname(blobName) !== '.avi') {
          if (extname.extname(blobName) === '.json') {
            spinner.text= `${chalk.red("Subiendo Archivo Json")}`;
            await pushfile(CONTAINER_NAME_ENTRADA, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`});
            await pushfile(CONTAINER_NAME_ENTRADABACKUP, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`});
          } else {
            await pushfile(CONTAINER_NAME_ENTRADA, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`
            });
            await pushfile(CONTAINER_NAME_ENTRADABACKUP, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`
            });
          }
        }
        i++;
        if(files.length > 1){
          spinner.text= `Subiendo ... ${chalk.red(i+1)} de ${chalk.yellow(files.length+1)} `;
        }
        if (i === files.length) {
          resolve(true);
          if(files.length > 1){
            spinner.succeed(`${chalk.green('Subida Finalizada ...')} ${chalk.yellow(i+1)} de ${chalk.yellow(files.length+1)} `);
          }
        }
      });
    } catch (error) {
      spinner.failed(`Error al subir archivos ${chalk.red(error)}`);
      reject(false);
    }
  });
}

module.exports = searchFilesOscann;
