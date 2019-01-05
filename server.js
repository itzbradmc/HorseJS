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

  socket.on("formsRatings", processForms)

  socket.on("cards", processCards)

  function processForms(data){
    var forms = data.forms
    var ratings = data.ratings
    formsRawData = forms
    console.log("forms")
    var tempRaces = []
    var race = {"time": "", "horses": [/*{form object}*/]}
    var lastTime = ""
    console.log(forms.length)
    for (let i = 0; i < cardsRawData.length; i++) {
      var horse = forms[i]

      if(i == 0){
        lastTime = horse.race_time
      }

      if(horse.race_time != lastTime || i == cardsRawData.length-1){
        //console.log("start of a new race with time " + horse.RaceTime)
        tempRaces.push(race)
        //console.log("new race - " + horse.race_time + " " + horse.horse_name)
        race = {"time":"", "horses": [/*{horse object}*/]}
        lastTime = horse.race_time
      } else{
        //console.log("Adding " + horse.Horse + " to the race with time " + lastTime)
        race.time = horse.race_time
        race.horses.push(horse)
      }

      var progressData = {
        "horse" : horse.Horse,
        "progress" : (i/forms.length)*100
      }
      socket.emit("progress", progressData)
    }
    var count = 0
    //adds the forms to the existing races and horses
    races.forEach(race => {
      race.horses.forEach(horse => {
          tempRaces.forEach(tempRaces => {
            tempRaces.horses.forEach(tempHorse => {
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

    //adds the ratings to the existing races and horses
    processRatings(ratings)
  }

  function processRatings(ratings){

    var tempRaces = []
    var race = {"time": "", "horses": [/*{form object}*/]}
    var lastTime = ""
    console.log(ratings.length)
    for (let i = 0; i < ratings.length; i++) {
      var horse = ratings[i]

      if(i == 0){
        lastTime = horse.time
      }

      if(horse.time != lastTime || i == ratings.length-1){
        //console.log("start of a new race with time " + horse.RaceTime)
        tempRaces.push(race)
        //console.log("new race - " + horse.race_time + " " + horse.horse_name)
        race = {"time":"", "horses": [/*{horse object}*/]}
        lastTime = horse.time
      } else{
        //console.log("Adding " + horse.Horse + " to the race with time " + lastTime)
        race.time = horse.time
        race.horses.push(horse)
      }

      var progressData = {
        "horse" : horse.horse_name,
        "progress" : (i/ratings.length)*100
      }
      socket.emit("progress", progressData)
    }

    races.forEach(race => {
      race.horses.forEach(horse => {
          tempRaces.forEach(tempRaces => {
            tempRaces.horses.forEach(tempHorse => {
              if(horse.cards.Horse == tempHorse.horse_name){
                horse.rating = tempHorse
              }
            });
          });
      });
    });

    socket.emit("races", races)
    predictWinners()
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

  function predictWinners(){
    races.forEach(race => {
      var horses = race.horses
      var todayTotal = getTodayAndTotal(horses)
      todayTotal.sort(function(x, y) { // y = current x = last


        if (x.today < y.today) {
          return 1;
        }
        if (x.today > y.today || (y.total-x.total) > 25) {
          return -1;
        }
        return 0;
      });
      socket.emit("results", todayTotal)
    });
  }

  function getTodayAndTotal(horses){
    var result = []
    horses.forEach(horse => {
      result.push({"today": horse.rating.today, "total": horse.rating.total, "horse": horse})
    });
    return result
  }

}
