
// =======================================================================
// Module des différentes fonctions utilitaires.
// =======================================================================

module.exports = {

    // Utilisée par la fonction alerts pour connaître le type de mission.
    typeParse: function(mt) {
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
            case "MT_TERRITORY":
                res = "Territoire";
                break;
            default:
                res = mt;
                break;
        }
        return res;
    },

    // Utilisée par les fonctions Warframe pour convertir leurs timestamps.
    computeTime: function(time) {
        j = Math.floor(time / 86400);
        time = time % 86400;
        h = Math.floor(time / 3600);
        time = time % 3600;
        m = Math.floor(time / 60);
        s = time % 60;
        return [j, h, m, s];
    }

}
