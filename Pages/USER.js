'use strict'

const { ipcRenderer } = require("electron")
const uuid = require("uuidv4")

$(function() {
    Notification.requestPermission();
})


var dataRequested

document.getElementById("dataForm").addEventListener("submit", (evt) => {
    evt.preventDefault()
    const date = new Date()
    const nome = evt.target[0].value
    const classe = evt.target[1].options[evt.target[1].selectedIndex].text;
    const piano = evt.target[2].options[evt.target[2].selectedIndex].text;
    const inizio = new Date(date.setHours(evt.target[3].value.split(":")[0], evt.target[3].value.split(":")[1], 0, 0))
    const fine = new Date(date.setHours(evt.target[4].value.split(":")[0], evt.target[4].value.split(":")[1], 0, 0))
    console.log(fine, new Date().toISOString())
    if (fine.toISOString() < inizio.toISOString()) {
        $('#errorMessage').html("L'ora d'inizio dev'essere precendente all'ora di fine.")
        $("#inputFine").val('--:--')
        $("#inputInizio").val('--:--')
    } else if (fine.toISOString() < new Date().toISOString()) {
        $('#errorMessage').html("L'orario di fine è già passato.")
        $("#inputFine").val('--:--')
    } else {
        const dataToSend = { id: uuid.uuid(), nome: nome, classe: classe, piano: piano, inizio: inizio, fine: fine }
        ipcRenderer.send("newDataUser", dataToSend)
        document.getElementById("dataForm").reset()
        $('#errorMessage').html("")
        const myNotification = new Notification('Successo', {
            body: "L'attività è stata salvata correttamente."
        })
    }
})

function deleteData(id) {
    ipcRenderer.send("deleteData", { id: id })
    $('#eliminaModal').modal('toggle');
}

document.getElementById("modificaForm").addEventListener("submit", (evt) => {
    evt.preventDefault()
    const date = new Date()
    const nome = evt.target[0].value
    const classe = evt.target[1].options[evt.target[1].selectedIndex].text;
    const piano = evt.target[2].options[evt.target[2].selectedIndex].text;
    const inizio = new Date(date.setHours(evt.target[3].value.split(":")[0], evt.target[3].value.split(":")[1], 0, 0))
    const fine = new Date(date.setHours(evt.target[4].value.split(":")[0], evt.target[4].value.split(":")[1], 0, 0))
    const id = $("#conferma").data("id")
    const post = { id: id, nome: nome, classe: classe, piano: piano, inizio: inizio, fine: fine }
    ipcRenderer.send("modifyData", { pre: dataRequested, post: post })
    $('#modificaModal').modal('toggle');
})

ipcRenderer.on("dataReturned", (event, data) => {
    dataRequested = data
    $("#modinputNome").val(data.nome)
    $("#modinputClasse").val(data.classe)
    $("#modinputPiano").val(data.piano)
    $("#modinputInizio").val(returnDate(data.inizio))
    $("#modinputFine").val(returnDate(data.fine))
})

ipcRenderer.on("data", (event, data) => {
    const dataList = document.getElementById("dataListUser")
    const dataItems = data.reduce((html, dataS) => {
        html += "<tr class='data-item'>\
        <td scope='row'>"+ dataS.nome + "</td>\
        <td>"+ dataS.classe + "</td>\
        <td>"+ dataS.piano + "</td>\
        <td>"+ returnDate(dataS.inizio) + "</td>\
        <td>"+ returnDate(dataS.fine) + "</td>\
        <td align='center'><div class='btn-circle btn-light btn-sm' data-id="+ dataS.id + " data-toggle='modal' data-target='#modificaModal'><i class='fas fa-pencil-alt'></i></div></td>\
        <td align='center'><div class='btn-circle btn-danger btn-sm' data-id="+ dataS.id + " data-toggle='modal' data-target='#eliminaModal'><i class='fas fa-trash'></i></div></td>\
      </tr>"
        return html
    }, '')

    dataList.innerHTML = dataItems
})

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

$('#modificaModal').on('show.bs.modal', function (event) {
    var id = $(event.relatedTarget).data('id');
    ipcRenderer.send("getDataById", id)
    $("#conferma").attr("data-id", id)
});

$('#eliminaModal').on('show.bs.modal', function (event) {
    var id = $(event.relatedTarget).data('id');
    $("#confermaEliminazione").attr("value", id)
});

$("#confermaEliminazione").click(function () {

    var data = $(this).attr("value");
    deleteData(data)
})

function exportData() {
    ipcRenderer.send("saveData")
    const myNotification = new Notification('Esportazione riuscita', {
        body: "Clicca qui per accedere al file."
    })
    myNotification.addEventListener('click', () => {
        console.log("click")
        ipcRenderer.send("openFile")
    });
}

$("#confermaEliminazioneStorico").click(()=>{
    $('#eliminaStoricoModal').modal('toggle');
    ipcRenderer.send("deleteAllData")
    const myNotification = new Notification('Successo', {
        body: "L'eliminazione dei dati è avvenuta con successo."
    })
})