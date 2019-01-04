var express = require('express');
//stuff to connect to the servers / clients
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);

console.log("started")

var cardsRawData;
var formsRawData;

var races = [] //"time": RaceTime, "horses": [{horse Object}]

function newConnection(socket){
  console.log("New connection")
  races = []

  socket.on("forms", processForms)

  socket.on("cards", processCards)

  function processForms(data){
    formsRawData = data
    console.log("forms")
    var tempRaces = []
    var race = {"time": "", "horses": [/*{form object}*/]}
    var lastTime = ""
    console.log(data.length)
    for (let i = 0; i < cardsRawData.length; i++) {
      var horse = data[i]

      if(i == 0){
        lastTime = horse.race_time
      }

      if(horse.race_time != lastTime || i == cardsRawData.length-1){
        //console.log("start of a new race with time " + horse.RaceTime)
        tempRaces.push(race)
        console.log("new race - " + horse.race_time + " " + horse.horse_name)
        race = {"time":"", "horses": [/*{horse object}*/]}
        lastTime = horse.race_time
      } else{
        //console.log("Adding " + horse.Horse + " to the race with time " + lastTime)
        race.time = horse.race_time
        race.horses.push(horse)
      }

      var progressData = {
        "horse" : horse.Horse,
        "progress" : (i/data.length)*100
      }
      socket.emit("progress", progressData)
    }
    var count = 0
    races.forEach(race => {
      race.horses.forEach(horse => {
          tempRaces.forEach(tempRaces => {
            tempRaces.horses.forEach(tempHorse => {
              console.log(horse.cards.Horse + " - " + tempHorse.horse_name)
              if(horse.cards.Horse == tempHorse.horse_name){
                horse.form = tempHorse
                var progressData = {
                  "horse" : horse.cards.Horse,
                  "progress" : count
                }
                socket.emit("progress", progressData)
              }
            });
          });
      });
    });

    socket.emit("races", tempRaces)
    socket.emit("races", races)
  }

  function processCards(data){
    cardsRawData = data
    console.log(data.length)
    var race = {"time":"", "horses": [/*{"cards": "", "form": "", rating: ""}*/]}
    var lastTime = ""
    for (let i = 0; i < data.length; i++) {
      var horse = data[i]

      if(i == 0){
        lastTime = horse.RaceTime
      }

      if(horse.RaceTime != lastTime || i == data.length-1){
        //console.log("start of a new race with time " + horse.RaceTime)
        races.push(race)
        race = {"time":"", "horses": [/*{"cards": "", "form": "", "rating": ""}*/]}
        lastTime = horse.RaceTime
      } else{
        //console.log("Adding " + horse.Horse + " to the race with time " + lastTime)
        race.time = horse.RaceTime
        race.horses.push({"cards": horse, "form": "", "rating": ""})
      }

      var progressData = {
        "horse" : horse.Horse,
        "progress" : (i/data.length)*100
      }
      socket.emit("progress", progressData)
    }
    socket.emit("cardsDone")
  }

}
