const Store = require("electron-store")
class DataStore extends Store {
    constructor(settings){
        super(settings)
        this.data = this.get("data") || []
    }

    saveData(){
        this.data.sort(function(a, b) {
            var dateA = new Date(a.inizio), dateB = new Date(b.inizio);
            return dateA - dateB;
        });
        this.set("data", this.data)
        return this
    }

    getData(){
        this.data = this.get("data") || []
    }

    addData(data) {
        this.data = [...this.data, data]
        return this.saveData()
    }

    deleteData(data){
        this.data = this.data.filter(t => t.id !== data.id)
        return this.saveData()
    }

    deleteAll(){
        this.data = []
        return this.saveData()
    }

    getDataById(id){
        var a = this.data.filter(t => t.id == id)
        return a[0]
    }

    modifyData(dataPre, dataPost){
        this.data = this.data.filter(t => t.id !== dataPre.id)
        this.data = [...this.data, dataPost]
        return this.saveData()
    }

}
module.exports = DataStore