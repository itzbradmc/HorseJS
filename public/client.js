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
  socket.emit("forms", forms);
})

socket.on("races", function showRaces(data){
  console.log(data)
})
