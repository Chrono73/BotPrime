/* 
 * Lien à mettre dans le navigateur pour intégrer le bot à un chan:
 * https://discordapp.com/oauth2/authorize?client_id=194202468173742080&scope=bot&permissions=66186303
 * 
 * Laisser les permissions suivantes, décocher les autres:
 *      - Se connecter                          - Lire, gérer & envoyer des messages
 *      - Attacher des fichiers                 - Voir les anciens messages
 *      - Déplacer & expulser les membres       - Intégrer des liens
 *      - Parler                                - Gérer les rôles
 */

var Discord = require("discord.js");
var request = require("request");
var fs = require("fs");
var http = require('http');

var sectorNames = require('./data/sectorNames.json');
var sortie = require('./data/sortie.json');
var easter = require("./data/easter.json");

var wfdata = "http://content.warframe.com/dynamic/worldState.php";

var botPrime = new Discord.Client();

var rufFlightAcademyLessons = 0;

function typeParse(mt) {
    var res;
    switch (mt) {
        case "MT_DEFENSE":
            res = "Défense";
            break;
        case "MT_EXTERMINATION":
            res = "Extermination";
            break;
        case "MT_CAPTURE":
            res = "Capture";
            break;
        case "MT_ASSASSINATION":
            res = "Assassinat";
            break;
        case "MT_HIVE":
            res = "Ruche";
            break;
        case "MT_MOBILE_DEFENSE":
            res = "Défense mobile";
            break;
        case "MT_COUNTER_INTEL":
            res = "Imposture";
            break;
        case "MT_RESCUE":
            res = "Sauvetage";
            break;
        case "MT_INTEL":
            res = "Espionnage";
            break;
        case "MT_RETRIEVAL":
            res = "Détournement";
            break;
        case "MT_SURVIVAL":
            res = "Survie";
            break;
        case "MT_EXCAVATE":
            res = "Excavation";
            break;
        case "MT_SABOTAGE":
            res = "Sabotage";
            break;
        default:
            res = mt;
            break;
    }
    return res;
};

function computeTime(time) {
    j = Math.floor(time / 86400);
    time = time % 86400;
    h = Math.floor(time / 3600);
    time = time % 3600;
    m = Math.floor(time / 60);
    s = time % 60;
    return [j, h, m, s];
}



/*botPrime.on("ready"), function(){
    var connectMsg = "Bonjour, le bot a été update ! Venez voir les changements sur le GitHub!";
    botPrime.servers.forEach(function(serv){
        botPrime.sendMessage(serv.defaultChannel, connectMsg);
    })
}*/

botPrime.on("message", function(message) {
    if (message.content.charAt(0)=='!'){
        var command = message.content.substring(message.content.indexOf('!')+1).split(" ");
        switch (command[0]) {
            case "help":
                var helpMsg = "Alors, noob, on connait pas les commandes ?\n";
                helpMsg += "\t- !help:    affiche ce message.\n";
                helpMsg += "\t- !git:      affiche le lien du projet GitHub.\n";
                helpMsg += "\t- !alerts:  affiche les alertes Warframe du moment.\n";
                helpMsg += "\t- !sortie:  affiche les trois missions de la sortie d'aujourd'hui.\n";
                helpMsg += "\t- !baro:    affiche les informations liées au Void Trader.\n\n";
                helpMsg += "Tout ça avec quelques easter eggs. Et ne me fais pas répéter !\n";
                botPrime.reply(message, helpMsg);
                break;
            //========================
            
            case "git":
                botPrime.reply(message, "https://github.com/Chrono73/BotPrime");
                break;
            //========================
                
            case "alerts":
                request({
                    url: wfdata,
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var result = "\n";
                        body.Alerts.forEach( function(alert, index) {
                            var sector = sectorNames[alert.MissionInfo.location].split("|");
                            result += sector[0] + ", " + sector[1] + " - ";
                            result += typeParse(alert.MissionInfo.missionType) + " - ";
                            result += alert.MissionInfo.missionReward.credits + "cr";
                            if (alert.MissionInfo.missionReward.hasOwnProperty('countedItems')) {
                                alert.MissionInfo.missionReward.countedItems.forEach( function(reward, index) {
                                    result += " - " + reward.ItemCount + "x ";
                                    result += reward.ItemType.substring(reward.ItemType.lastIndexOf('/')+1);
                                })
                            };
                            if (alert.MissionInfo.missionReward.hasOwnProperty('items')) {
                                alert.MissionInfo.missionReward.items.forEach( function(reward, index) {
                                    result += " - 1x ";
                                    result += reward.substring(reward.lastIndexOf('/')+1);
                                })
                            };
                            rmtime = computeTime(alert.Expiry.sec - body.Time);
                            result += " - " + rmtime[2] + "m, " + rmtime[3] + "s restantes";
                            result += "\n";
                        });
                        if (result != "")
                            botPrime.reply(message, result);
                        else
                            botPrime.reply(message, "Aucune alerte en cours.");
                    }
                    else {
                        botPrime.reply(message, "Données inaccessibles.");
                    };
                })
                break;
            //========================

            case "sortie":
                request({
                    url: wfdata,
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var result = "Battez les troupes " + sortie.bosses[body.Sorties[0].Variants[0].bossIndex] + "!\n";
                        var missionCount = 1;
                        body.Sorties[0].Variants.forEach( function(sortieMission){
                            result += "Mission "+missionCount+": "+sortie.missions[sortieMission.missionIndex]+" / "+sortie.modifiers[sortieMission.modifierIndex]+"\n";
                            missionCount++;
                        })
                        rmtime = computeTime(body.Sorties[0].Expiry.sec - body.Time);
                        result += "Temps restant: " + rmtime[1] + "h, " + rmtime[2] + "m, " + rmtime[3] + "s restantes";
                        botPrime.reply(message, result);
                    }
                });
                break;
            //========================
                
            case "baro":
                request({
                    url: wfdata,
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var result = "\n";
                        result += "Baro'Ki Teer - Void Trader\n";
                        if (body.VoidTraders[0].hasOwnProperty("Manifest")) {
                            rmtime = computeTime(body.VoidTraders[0].Expiry.sec - body.Time);
                            result += "Part dans " + rmtime[0] + " jour, " + rmtime[1] + " heures, " + rmtime[2] + " minutes et " + rmtime[3] + " secondes.\n";
                            body.VoidTraders[0].Manifest.forEach( function(item){
                                result += item.ItemType.substring(reward.lastIndexOf('/')+1); + " - " + item.PrimePrice + " ducats & " + item.RegularPrice + "cr\n";
                            });
                            if (result != "")
                                botPrime.reply(message, result);
                            else
                                botPrime.reply(message, "Erreur lors de la récupération des données.");
                        }
                        else {
                            rmtime = computeTime(body.VoidTraders[0].Activation.sec - body.Time);
                            result += "Arrive dans " + rmtime[0] + " jours, " + rmtime[1] + " heures, " + rmtime[2] + " minutes et " + rmtime[3] + " secondes.\n";
                            result += "Il apparaîtra au relais de ";
                            if (body.VoidTraders[0].Node == "MercuryHUB") result += "Mercure.\n";
                            else if (body.VoidTraders[0].Node == "SaturnHUB") result += "Saturne.\n";
                            else result += "Pluton.\n";
                            if (result != "")
                                botPrime.reply(message, result);
                            else
                                botPrime.reply(message, "Erreur lors de la récupération des données.");
                        }
                    }
                });
                break;
            //========================

            case "go":

                function checkIfGoRolesExist() {
                    var valor =0, mystic = 0, instinct = 0, indolence = 0;
                    message.channel.server.roles.forEach(function(role) {
                        switch (role.name) {
                            case "Valor":
                                valor = 1;
                                break;
                            case "Mystic":
                                mystic = 1;
                                break;
                            case "Instinct":
                                instinct = 1;
                                break;
                            case "Indolence":
                                indolence = 1;
                                break;
                            default:
                                break;
                        }
                    });
                    if (!valor) 
                        message.channel.server.createRole({
                            color : 0xFF0000,
                            hoist : false,
                            name : "Valor",
                            permissions : ["sendMessages"],
                            mentionable : true
                        }, function(error, role){
                            if (error) console.log(error);
                        });
                    if (!mystic) 
                        message.channel.server.createRole({
                            color : 0x3366FF,
                            hoist : false,
                            name : "Mystic",
                            permissions : ["sendMessages"],
                            mentionable : true
                        }, function(error, role){
                            if (error) console.log(error);
                        });
                    if (!instinct) 
                        message.channel.server.createRole({
                            color : 0xE6E600,
                            hoist : false,
                            name : "Instinct",
                            permissions : ["sendMessages"],
                            mentionable : true
                        }, function(error, role){
                            if (error) console.log(error);
                        });
                    if (!indolence)
                        message.channel.server.createRole({
                            color : 0x00cc66,
                            hoist : false,
                            name : "Indolence",
                            permissions : ["sendMessages"],
                            mentionable : true
                        }, function(error, role){
                            if (error) console.log(error);
                        });
                }

                function getGoRolesIndexes() {
                    var vmii =[0,0,0,0];
                    message.channel.server.roles.forEach(function(role, index) {
                        switch (role.name) {
                            case "Valor":
                                vmii[0] = index;
                                break;
                            case "Mystic":
                                vmii[1] = index;
                                break;
                            case "Instinct":
                                vmii[2] = index;
                                break;
                            case "Indolence":
                                vmii[3] = index;
                                break;
                            default:
                                break;
                        }
                    });
                    return vmii;
                }

                function addRole(int) {
                    botPrime.addMemberToRole(message.author, message.channel.server.roles[vmii[int]], function(error){
                            if (error) console.log(error);
                    });
                }

                function removeRole(int) {
                    if (botPrime.userHasRole(message.author, message.channel.server.roles[vmii[int]])) {
                        botPrime.removeMemberFromRole(message.author, message.channel.server.roles[vmii[int]], function (error){
                            if (error) console.log(error);
                        });
                    }    
                }

                checkIfGoRolesExist();
                vmii = getGoRolesIndexes();

                switch (command[1]) {
                    case "Valor":
                        addRole(0);
                        setTimeout(function(){
                            removeRole(1);
                        }, 2000);
                        setTimeout(function(){
                            removeRole(2);
                        }, 4000);
                        setTimeout(function(){
                            removeRole(3);
                        }, 6000);
                        break;
                
                    case "Mystic":
                        addRole(1);
                        setTimeout(function(){
                            removeRole(2);
                        }, 2000);
                        setTimeout(function(){
                            removeRole(0);
                        }, 4000);
                        setTimeout(function(){
                            removeRole(3);
                        }, 6000);
                        break;

                    case "Instinct":
                        addRole(2);
                        setTimeout(function(){
                            removeRole(0);
                        }, 2000);
                        setTimeout(function(){
                            removeRole(1);
                        }, 4000); 
                        setTimeout(function(){
                            removeRole(3);
                        }, 6000);                
                        break;
                    case "Indolence":
                        addRole(3);
                        setTimeout(function(){
                            removeRole(0);
                        }, 2000);
                        setTimeout(function(){
                            removeRole(1);
                        }, 4000);
                        setTimeout(function(){
                            removeRole(2);
                        }, 6000);
                        break;   

                    case "Stop":
                        removeRole(0);
                        setTimeout(function(){
                            removeRole(1);
                        }, 2000);
                        setTimeout(function(){
                            removeRole(2);
                        }, 4000);
                        setTimeout(function(){
                            removeRole(3);
                        }, 6000);
                        break;
                };
                break;
            //========================

            case "AIRHORN":
                    break;

            // Easter Eggs
            case "ken":
                res = Math.floor((Math.random() * easter.kenOneLiners.length));
                botPrime.reply(message, "```"+easter.kenOneLiners[res]+"```");
                break;
            //========================

            /*case "Paladin, niveau 66.":
                botPrime.reply(message, "Archmâââge, 57.\n");
                break;
            //========================

            case "On fouille les cadavres pour le butin.":
                cible = message.server.members[Math.floor((Math.random() * message.server.members.length))].username;
                botPrime.reply(message, "Trop tard, "+cible+" s'en est déjà chargé pendant que vous vous battiez.\n");
                break;*/
            //========================
                
            case "bluekutku":
                var prime = 0;
                if (rufFlightAcademyLessons==2) {
                    botPrime.reply(message, "\nKseniva carted.\nQuest reward reduced to "+prime+".\nMission failed.\nReturning to Great Hall.\nBut at least Kseniva knows how to fly now.");
                    rufFlightAcademyLessons = 0;
                }
                else {
                    rufFlightAcademyLessons++;
                    prime = 9999 - 3333*rufFlightAcademyLessons;
                    botPrime.reply(message, "\nKseniva carted.\nQuest reward reduced to "+prime+".\nReturning to camp.");
                }
                break;
            //========================

            case "corona":
                nbDrops = Math.floor((Math.random() * 4)) + 4;
                var bounty = [0,0,0,0,0,0,0,0,0,0,0];
                if (message.author.username=="DGKun") {
                    for (i=0; i<nbDrops; i++) {
                        bounty[Math.floor((Math.random() * easter.rKushDrops.length-1))]++;
                    }
                }
                else {
                    for (i=0; i<nbDrops; i++) {
                        bounty[Math.floor((Math.random() * easter.rKushDrops.length))]++;
                    }
                }
                var reply = "Quest complete! Returning to camp in 1m.\n\n";
                reply += "==== Quest rewards ====\n";
                bounty.forEach(function(nb, index) {
                    if (nb!=0) reply += nb+"x "+easter.rKushDrops[index]+"\n";
                })
                botPrime.reply(message, reply);
                break;
            //========================

            case "pokeball":
                botPrime.sendMessage(message.channel, "MEURISSON!!!");
                break;
            //========================

            case "post":
                if (command.length >= 2) {
                    var reply = "Seigneur";
                    for (i=1; i<=command.length -1; i++) reply += " "+command[i];
                    reply += ", vous avez un postérieur, ma foi, très hospitalier!";
                    botPrime.sendMessage(message.channel, reply);
                }
                else
                    botPrime.reply(message, "Commande inconnue. Balance un petit !help, Tenno!");
                break;
            //========================

            default:
                botPrime.reply(message, "Commande inconnue. Balance un petit !help, Tenno!");
                break;
        }
    }
    else if (message.content=="Paladin, niveau 66."){
        botPrime.reply(message, "Archmâââge, 57.\n");
    }
    else if (message.content=="On fouille les cadavres pour le butin.") {
        cible = message.channel.server.members[Math.floor((Math.random() * message.channel.server.members.length))].username;
        botPrime.reply(message, "Trop tard, "+cible+" s'en est déjà chargé pendant que vous vous battiez.\n");
    }
});


botPrime.on("serverNewMember", function(server, user) {
    welcomeMsg = user.mention() + ", salut belle plante.\nOn en voit pas souvent des comme ça par ici!\n"
    botPrime.sendMessage(server.defaultChannel, welcomeMsg);
})

botPrime.on("disconnected", function(){
    botPrime.loginWithToken(process.env.TOKEN);
})


fs.readFile('./token', 'utf8', function read(err, token){
    if (err) {
        throw err;
    }
    else {
        botPrime.loginWithToken(token);
        console.log("Bot en ligne et prêt!\n");
    }
});

/*
botPrime.loginWithToken(process.env.TOKEN);
console.log("Bot en ligne et prêt!\n");
*/

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.send('it is running\n');
}).listen(process.env.PORT || 5000);