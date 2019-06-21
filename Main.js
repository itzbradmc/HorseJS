const csv = require('csv-parser');  
const fs = require('fs');
const Race = require('./race.js')

const cards_RAW = [];
const form_RAW = [];
const ratings_RAW = [];
const results_RAW = [];

var races = []

fs.createReadStream('./Files/cards_2019-06-20.csv')
  .pipe(csv())
  .on('data', (data) => cards_RAW.push(data))
  .on('end', () => {
      console.log("Processed cards: ", cards_RAW.length, " rows")
});
console.log(cards_RAW[0])
//form
fs.createReadStream('./Files/formreport_2019-06-20.csv')
  .pipe(csv())
  .on('data', (data) => form_RAW.push(data))
  .on('end', () => {
      console.log("Processed form report: ", form_RAW.length, " rows")
});

//ratings
fs.createReadStream('./Files/ratings_2019-06-20.csv')
  .pipe(csv())
  .on('data', (data) => ratings_RAW.push(data))
  .on('end', () => {
      console.log("Processed ratings: ", ratings_RAW.length, " rows")
});

//results
fs.createReadStream('./Files/results_2019-06-20.csv')
  .pipe(csv())
  .on('data', (data) => results_RAW.push(data))
  .on('end', () => {
      console.log("Processed results: ", results_RAW.length, " rows")
});

loadFiles()
console.log(cards_RAW)
//createRaces()

function createRaces(){
    var tempRace;
    var lastTime = cards_RAW[0].RaceTime;
    cards_RAW.forEach(card => {
        if(card.RaceTime == lastTime){
            tempRace = new Race(card.Date, card.RaceTime, card.Track, card.RaceName, card.Distance, card.Class, card.Runners)
        }
        else{
            races.push(tempRace)
            console.log(tempRace)
        }
    });
}




function loadFiles(){
    
}
