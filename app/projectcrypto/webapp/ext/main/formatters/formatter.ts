export type StatusItem = { 

};

export default class Formatter {

    public static formatDate(date : string) : string { 
        let formattedDate = new Date(date);
        
        const options = { 
            year : "numeric", 
            month : "short", 
            day   : "numeric",
            hour  : "2-digit", 
            minute : "2-digit",
            houre12 : false
        }

     return formattedDate.toLocaleString("en-US", options as object);
    }
}