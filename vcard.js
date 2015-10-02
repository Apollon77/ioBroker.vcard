/**
 *
 * vcard adapter
 *
 *
 *  file io-package.json comments:
 *
 *  {
 *      "common": {
 *          "name":         "vcard",                  // name has to be set and has to be equal to adapters folder name and main file name excluding extension
 *          "version":      "0.0.2",                    // use "Semantic Versioning"! see http://semver.org/
 *          "title":        "vcard Adapter",  // Adapter title shown in User Interfaces
 *          "authors":  [                               // Array of authord
 *              "name <hometm@gmx.de>"
 *          ]
 *          "desc":         "vcard adapter",          // Adapter description shown in User Interfaces. Can be a language object {de:"...",ru:"..."} or a string
 *          "platform":     "Javascript/Node.js",       // possible values "javascript", "javascript/Node.js" - more coming
 *          "mode":         "daemon",                   // possible values "daemon", "schedule", "subscribe"
 *          "loglevel":     "info"                      // Adapters Log Level
 *      },
 *      "native": {                                     // the native object is available via adapter.config in your adapters code - use it for configuration
 *      }
 *  }
 *
 */

/*
  Requirements:
     C:\Program Files\ioBroker\node_modules\iobroker.vcard\lib>npm install vcard-json
     C:\Program Files\ioBroker\node_modules\iobroker.vcard\lib>npm install node-schedule


 */


"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var schedule =     require('node-schedule');
var dailyScheduler=null;
var vcard =  require('vcard-json');
var vcards=null;                      // Speicher fuer alle vCards. Werden nur beim Adapter-Start geladen

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.example.0
var adapter = utils.adapter('vcard');

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});




adapter.on('stateChange', function (id, state) {
    if (state && !state.ack) {
        if (id == adapter.namespace + '.Inputs.Filter') {
                getEmailAddresses(state.val);
                getNames(state.val);
                getPostalAddress(state.val);
                getPhoneNumbers(state.val);
                ackFilter();
        } else if (id == adapter.namespace + '.Inputs.ReplacePhoneNumbers') {
            performNumberString(state.val);
        }
    }
});



// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});

function main() {
    //adapter.log.info('DEBUG VERSION');
    // in this example all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');


    // Einlesen der vcard-Datei
    if (adapter.config.vcardPath == "") {
        adapter.log.error('No vcard path configured');
        return;
    }

    /*
     //pruefen ob Zugriff via http
     if(adapter.config.vcardPath.toLowerCase().indexOf('http://')>-1){
     var xmlHttp=new XMLHttpRequest();
     xmlHttp.open('GET',adapter.config.vcardPath, false );
     xmlHttp.send(null);

     if(!xmlHttp.responseText) {
     adapter.log.error('Error reading vcards via HTTP: '+ adapter.config.vcardPath);
     adapter.log.error(xmlHttp.statusText);
     return;
     }
     vcards=vcard.parseVcard(xmlHttp.responseText);
     }*/

    try {
        vcard.parseFile(adapter.config.vcardPath, function (err, data) {
            if (err) {
                adapter.log.error('Error reading vcards: ' + err.message);
            }
            else {
                adapter.log.info('Found ' + data.length + ' vcards in file');
                vcards = data;
                try {
                    for (var contact = 0; contact < vcards.length; contact++) {
                        for (var i = 0; i < vcards[contact].phone.length; i++) {
                            if (vcards[contact].phone[i].value.indexOf('0049') == 0) {
                                //wenn Nummer mit 0049 beginnt, aendern in +49
                                if (vcards[contact].phone[i].value.length > 4)
                                    vcards[contact].phone[i].value = '+49' + vcards[contact].phone[i].value.substring(4, vcards[contact].phone[i].value.length);
                            }
                            else if (vcards[contact].phone[i].value.indexOf('00') == 0) {
                                //wenn Nummer mit Landesvorwahl (0049,0031...) beginnt
                                vcards[contact].phone[i].value = '+' + vcards[contact].phone[i].value.substring(2, vcards[contact].phone[i].value.length);
                            }
                            else if (vcards[contact].phone[i].value.indexOf('0') == 0) {
                                //wenn Nummer mit 0 beginnt (z.B. 0721), aendern in +49721. Die deutsche Landesvorwahl wird hier als default genommen
                                if (vcards[contact].phone[i].value.length > 1)
                                    vcards[contact].phone[i].value = '+49' + vcards[contact].phone[i].value.substring(1, vcards[contact].phone[i].value.length);
                            }
                        }
                    }
                }
                catch (e) {
                    adapter.log.error('Error interpreting file: ' + e.message);
                    return;
                }

            }

            getTodayBirthdayPersons();
        });

        dailyScheduler = schedule.scheduleJob({hour: 0, minute: 1}, function () {
            getTodayBirthdayPersons();
        });
    } catch (ex) {
        adapter.log.error('Error reading file: ' + ex.message);
    }
}





// String nach Zahlen durchsuchen
function performNumberString (srcString) {
    var minNumberLength = 4;
    var rtn = "";

    adapter.setState('Inputs.ReplacePhoneNumbers', {val: srcString, ack: true});

    if (!srcString)
        return "";


    // Bestimmen, welches Zeichen eine Nummer ist
    var srcStringIsNr = new Array(srcString.length);
    for (var iSS = 0; iSS < srcString.length; iSS++) {
        srcStringIsNr[iSS] = (parseInt(srcString.charAt(iSS))) ? true : false;
        if (!srcStringIsNr[iSS] && (srcString.charAt(iSS) == '+' || srcString.charAt(iSS) == '0'))
            srcStringIsNr[iSS] = true;
    }

    var strtIndex = -1;
    var endIndex = -1;
    for (var iBS = 0; iBS < srcStringIsNr.length; iBS++) {
        // Start der Nummer
        if (iBS == 0) {
            // Erstes Zeichen
            if (srcStringIsNr[iBS])
                strtIndex = iBS;
        }
        else {
            if (srcStringIsNr[iBS] && !srcStringIsNr[iBS - 1])
                strtIndex = iBS;
        }
        // Ende der NUmmer
        if (iBS == srcStringIsNr.length - 1 && strtIndex>-1) {
            // Ende des input-Strings
            endIndex = iBS;
        }
        else if (srcStringIsNr[iBS] && !srcStringIsNr[iBS + 1]) {   //strtIndex>-1) {
            endIndex = iBS;
        }

        //nr hat begonnen und ist nun beendet
        if ((strtIndex > -1 && endIndex > -1) && (  endIndex - strtIndex < minNumberLength)) {
            //nummer zu kurz
            var nk=srcString.substring(strtIndex, (endIndex+1));
            rtn += nk;

            strtIndex = -1;
            endIndex = -1;
        }
        else if ((strtIndex > -1 && endIndex > -1) && (endIndex - strtIndex >= minNumberLength)) {
            // nummer ist lang genug

            var nn=srcString.substring(strtIndex, (endIndex+1));
            rtn += getNameToNumber(nn);;

            strtIndex = -1;
            endIndex = -1;
        }
        else if (strtIndex == -1 ) {
            //buchstaben, keine nr hat begonnen
            rtn += srcString.charAt(iBS);
        }
    }

    adapter.setState('Outputs.ReplacedPhoneNumbers', rtn);
}





// Suche Name zur Telefonnummer
function getNameToNumber(number) {
    var numberNorm;
    if(number.indexOf('0049')==0){
        //wenn Nummer mit 0049 beginnt, �ndern in +49
        if(number.length>4)
            numberNorm='+49'+number.substring(4,number.length);
    }
    else if(number.indexOf('0')==0){
        //wenn Nummer mit 0 beginnt (z.B. 0721), �ndern in +49
        if(number.length>1)
            numberNorm='+49'+number.substring(1,number.length);
    }
    else{
        numberNorm=number;
    }

    for(var contact=0;contact< vcards.length;contact++ ){
        for(var i=0;i< vcards[contact].phone.length;i++){
            if(vcards[contact].phone[i].value.replace(/ /g,'')==numberNorm){
                return vcards[contact].fullname;
            }
        }
    }

    return number;
}





// Ausgabe der Namen gefilteret
function getNames(pattern){
    var ret="";

    if(!vcards){
        adapter.log.info('getNames: vcards not initialized');
        return;
    }

    for(var contact=0;contact< vcards.length;contact++ ) {
        if(vcards[contact].fullname)
            if (vcards[contact].fullname.toLowerCase().indexOf(pattern.toLowerCase()) > -1 || pattern == '')
                ret += vcards[contact].fullname + '<br>';
    }

    if(ret.length>0){
        ret=ret.substring(0,ret.length-'<br>'.length);
    }

    adapter.setState('Outputs.FilteredFullNames', ret);
}





// Ausgabe der emailadressen ggf. gefilteret
function getEmailAddresses(pattern){
    var ret="";

    if(!vcards){
        adapter.log.info('getEmailAddresses: vcards not initialized');
        return;
    }

    for(var contact=0;contact< vcards.length;contact++ ){
        if(vcards[contact].fullname)
            if(vcards[contact].fullname.toLowerCase().indexOf(pattern.toLowerCase())>-1 ||  pattern=="" )
                for(var eNr=0;eNr<vcards[contact].email.length;eNr++) {
                    ret += vcards[contact].email[eNr].value + '<br>';
                }
    }
        if(ret.length>0){
            ret=ret.substring(0,ret.length-'<br>'.length);
    }

    adapter.setState('Outputs.FilteredEmailAddresses', ret);
}





// Ausgabe der Anschrift
function getPostalAddress(pattern){
    var ret="";

    if(!vcards){
        adapter.log.info('getPostalAddress: vcards not initialized');
        return;
    }

    for(var contact=0;contact< vcards.length;contact++ ){
        if(vcards[contact].fullname)
            if(vcards[contact].fullname.toLowerCase().indexOf(pattern.toLowerCase())>-1 ||  pattern=="" )
                for(var aNr=0;aNr<vcards[contact].addr.length;aNr++) {
                    ret +=(vcards[contact].fullname)?vcards[contact].fullname+'<br>':"";
                    ret +=(vcards[contact].addr[aNr].street)?vcards[contact].addr[aNr].street+'<br>':"";
                    ret +=(vcards[contact].addr[aNr].zip)?vcards[contact].addr[aNr].zip:"";
                    ret +=(vcards[contact].addr[aNr].city)?' '+ vcards[contact].addr[aNr].city+'<br>':"";
                    ret +=(vcards[contact].addr[aNr].state)?vcards[contact].addr[aNr].state+'<br>':"";
                    ret +=(vcards[contact].addr[aNr].country)?vcards[contact].addr[aNr].country+'<br>':"";
                    ret+='<br>'
                }
    }

    if(ret.length>0){
        ret=ret.substring(0,ret.length - '<br><br>'.length);
    }

    adapter.setState('Outputs.FilteredPostalAddresses', ret);
}





// Prueft, wer am aktuellen Tag Geburtstag hat
function getTodayBirthdayPersons(){
    var month=new Date().getMonth()+1;
    var day=new Date().getDate();
    month=(month<10)?'0'+month:month;
    day=(day<10)?'0'+day:day;
    var datePattern='-'+month+'-'+day;
    var ret="";

    if(!vcards){
        adapter.log.info('getTodayBirthdayPersons: vcards not initialized');
        return;
    }

    for(var contact=0;contact< vcards.length;contact++ ){
        if(vcards[contact].bday.indexOf(datePattern)==4  )
            ret+=vcards[contact].fullname+'<br>';
    }

    if(ret.length>0){
        ret=ret.substring(0,ret.length-4);
    }

    adapter.setState('Outputs.TodaysBirthdays', ret);
}



function getPhoneNumbers(pattern){
    var maxHits=5;
    var ret="";

    if(!vcards){
        adapter.log.info('getPhoneNumbers: vcards not initialized');
        return;
    }

    for(var contact=0;contact< vcards.length;contact++ ){
        if(vcards[contact].fullname)
            if(vcards[contact].fullname.toLowerCase().indexOf(pattern.toLowerCase())>-1 ||  pattern=="" )
                for(var eNr=0;eNr<vcards[contact].phone.length;eNr++) {
                    ret += vcards[contact].phone[eNr].value + '<br>';
                }
    }
    if(ret.length>0){
        ret=ret.substring(0,ret.length-'<br>'.length);
    }

    adapter.setState('Outputs.FilteredPhoneNumbers', ret);
}

// Setzt Filter ack
function ackFilter(){
    adapter.getState('Inputs.Filter', function (err, res){
        if(res) {
            adapter.setState('Inputs.Filter', {val: res, ack: true});
        }
    });
}