const express = require('express');
const app = express();
const cron = require('node-cron');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');

const runOctave = require('./services/runoctave.js');
const searchFilesOscann = require('./services/oscann_files.js');

const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS';


searchFilesOscann(path);

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
