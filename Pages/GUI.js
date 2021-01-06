'use strict'

const { ipcRenderer } = require("electron")

const attivitaPerPagina = 3

//DATA
function data(start) {
  return giorno(start.getDay()) + " " + start.getDate()
}
function giorno(index) {
  switch (index) {
    case 0:
      return "Domenica";
      break;
    case 1:
      return "Lunedì";
      break;
    case 2:
      return "Martedì";
      break;
    case 3:
      return "Mercoledì";
      break;
    case 4:
      return "Giovedì";
      break;
    case 5:
      return "Venerdì";
      break;
    case 6:
      return "Sabato";
      break;
  }
}
function returnDate(date) {
  var dateLoc = new Date(date)
  var minutes = dateLoc.getMinutes()
  var hours = dateLoc.getHours()
  if (dateLoc.getMinutes() < 10) {
    minutes = "0" + dateLoc.getMinutes()
  }
  if (dateLoc.getHours() < 10) {
    hours = "0" + dateLoc.getHours()
  }
  return hours + ":" + minutes
}
const interval = setInterval(function () {
  var now = new Date()
  $("#orario").html(returnDate(now))
  $("#data").html(data(now))
}, 1000);


$(function(){
  setTimeout(
    function() {
      ipcRenderer.send("getAllData")
    }, 3000);
})

ipcRenderer.on("data", (event, data) => {
  var quotient = Math.floor(data.length / attivitaPerPagina);
  var remainder = data.length % attivitaPerPagina

  if (data.length == 0) {
    document.getElementById("placeholder").style.display = "block"
    document.getElementById("carouselExampleSlidesOnly").style.display = "none"
  } else {
    document.getElementById("placeholder").style.display = "none"
    document.getElementById("carouselExampleSlidesOnly").style.display = "block"
  }

  var html2 = '<li data-target="#carouselExampleSlidesOnly" data-slide-to="0" class="active"></li>'
  var html1 = '<div class="carousel-item active">'

  const dataList = document.getElementById("dataList")
  const indicators = document.getElementById("indicators")

  for (let index = 0; index < quotient; index++) {
    if (index != 0) {
      html1 += '<div class="carousel-item">'
      html2 += '<li data-target="#carouselExampleSlidesOnly" data-slide-to="'+index+'"></li>'
    }
    for (let ind = 0; ind < attivitaPerPagina; ind++) {
      html1 += '<div class="card border-left-primary shadow py-2 mb-3">\
        <div class="card-body">\
          <div class="row no-gutters align-items-center">\
            <div class="col-6 h3 mb-0 font-weight-bold">'+ data[index * attivitaPerPagina + ind].nome + '</div>\
            <div class="col-2 h3 mb-0 font-weight-bold">Aula '+ data[index * attivitaPerPagina + ind].classe + '</div>\
            <div class="col-3 h3 mb-0 font-weight-bold">'+ data[index * attivitaPerPagina + ind].piano + '</div>\
            <div class="col-1 h3 mb-0 font-weight-bold"><div>'+ returnDate(data[index * attivitaPerPagina + ind].inizio) + '</div>\
            <div class="text-gray-800">'+ returnDate(data[index * attivitaPerPagina + ind].fine) + '</div>\
            </div>\
          </div>\
        </div>\
      </div>'
    }
    html1 += '</div>'
  }
  if (quotient != 0 && remainder != 0) {
    html1 += '<div class="carousel-item">'
    html2 += '<li data-target="#carouselExampleSlidesOnly" data-slide-to="'+quotient+'"></li>'
  }
  for (let index = 0; index < remainder; index++) {
    html1 += '<div class="card border-left-primary shadow py-2 mb-3">\
    <div class="card-body">\
      <div class="row no-gutters align-items-center">\
        <div class="col-6 h3 mb-0 font-weight-bold">'+ data[quotient * attivitaPerPagina + index].nome + '</div>\
        <div class="col-2 h3 mb-0 font-weight-bold">Aula '+ data[quotient * attivitaPerPagina + index].classe + '</div>\
        <div class="col-3 h3 mb-0 font-weight-bold">'+ data[quotient * attivitaPerPagina + index].piano + '</div>\
        <div class="col-1 h3 mb-0 font-weight-bold"><div>'+ returnDate(data[quotient * attivitaPerPagina + index].inizio) + '</div>\
        <div class="text-gray-800">'+ returnDate(data[quotient * attivitaPerPagina + index].fine) + '</div>\
        </div>\
      </div>\
    </div>\
  </div>'
  }

  dataList.innerHTML = html1
  indicators.innerHTML = html2

})