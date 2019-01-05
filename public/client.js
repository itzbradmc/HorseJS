var socket;
socket = io.connect('http://localhost:3000/');

function uploadData(){
  cards = JSON.parse(document.getElementById('cards_json').value);

  socket.emit("cards", cards);

  console.log("sent");
}

socket.on("progress", function showProgress(data){
  document.getElementById("progress").innerHTML = data.horse + " " + data.progress
})

socket.on("cardsDone", function sendForms(){
  forms = JSON.parse(document.getElementById('forms_json').value);
  ratings = JSON.parse(document.getElementById('ratings_json').value);
  socket.emit("formsRatings", {"forms": forms, "ratings": ratings});
})

socket.on("races", function showRaces(data){
  console.log(data)
})

socket.on("results", function showResults(data){
  for (let i = 0; i < data.length; i++) {
    document.getElementById('results').innerHTML += "<p> " + (i+1) + " - " +data[i].horse.cards.Horse+ " today: " + data[i].today + " total: " + data[i].total +"</p>"
  }
  document.getElementById('results').innerHTML += "<br>"
})
