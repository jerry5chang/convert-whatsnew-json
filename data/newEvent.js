module.exports.newEvent = function(){
    this.eventId = new Date().getTime().toString();
    this.webUrl = "";
    this.appUrl = "";
    this.title = {};
    this.desc = {};
}