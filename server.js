const express = require('express');
const app = express();
const PORT = 3001;
const path = require('path')
const axios = require('axios')
const exec = require('child_process').exec
const spawn = require('child_process').spawn
const fs = require('fs')
//socket.io
const http = require('http');
const installedPowers = require('./powers')
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const pythonProcess = spawn('python', ['fr.py'], {}) 
const brain = require('brain.js')
//start py script
// let child = exec("start cmd.exe cd C:/Users/Bobby/Documents/Github/ghost/public /K start index.html")

//onload make sure all powers are installed----------------------------
const powersPath = __dirname + '/powers'
const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

let powers = dirs(powersPath)
const installPowers = () => {
  //check to see if that power is in the index.js file
  fs.readFile(__dirname + '/powers/index.js','utf-8', (err,info) => {
    console.log(info);
    powers.forEach(power => {
      if(info.includes(power)){
        console.log(`${power} installed`);
      }else {
        let a = info.split(',')
        a.splice(a.length - 1, 0, `${power}: require('./${power}/${power}')`)
        console.log(a);
        fs.writeFile(powersPath + '/index.js', a, () => {
        })
      }
    }) 

  })

}
installPowers()
  
const getAudioNames = () => {
  console.log(`audionames`);
  //get songs
  let data = {}
  data = fs.readdirSync(__dirname + '/audio')
  console.log(data);
  fs.writeFileSync(__dirname + '/audioNames.json', data)
}
getAudioNames();
//-----------------------------------------------------------------------
io.on('connection', (socket) => {

  socket.on('getname', () => {
    //read from data.txt
    let data = fs.readFileSync(__dirname + '/data.json')
    let names = JSON.parse(data)
    
    if(names.people.length > 1){
     names.people.splice((names.people.length - 1), 0, 'and')

      io.emit('getname', names.people.toString())

    } else {
      io.emit('getname', names.people[0])
    }

  })

  // socket.on('mute', () => {
  //   system.audio.mute(mute).then(function() {
  //     io.emit('mute', true)
  //   });
  // })

  socket.on('lightActivate', () => {
    installedPowers.lights.main('omega on')
  })

  socket.on('lightsDeactivate', () => {
    installedPowers.lights.main('omega off')
  })

 

  //when a command is sent run each power
  socket.on('commandSent', (transcript) => {
    console.log(`🤖 ${transcript}`);
    //run each power
    for (var p in installedPowers){
       x = installedPowers[p].main(transcript, io)
      }
      
  })

  
})
//socket
app.use(express.static(__dirname + '/public'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/public/index.html'));
});

//if unix

//if windows
//start face_rec

server.listen(PORT, () => {
  console.log(`Listening on PORT:  ${PORT}`);
});