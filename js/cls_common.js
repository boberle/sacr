/*
 *
 * SACR (Script d'Annotation de Chaînes de Référence): a coreference chain
 * annotation tool.
 * 
 * Copyright 2017 Bruno Oberlé.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * This program comes with ABSOLUTELY NO WARRANTY.  See the Mozilla Public
 * License, v. 2.0 for more details.
 * 
 * Some questions about the license may have been answered at
 * https://www.mozilla.org/en-US/MPL/2.0/FAQ/.
 * 
 * If you have any question, contact me at boberle.com.
 * 
 * The source code can be found at boberle.com.
 *
 */

var diacriticsMap = new Array();
diacriticsMap['à'] = 'a';
diacriticsMap['é'] = 'e';
diacriticsMap['ß'] = 'ss';
diacriticsMap['à'] = 'a';
diacriticsMap['á'] = 'a';
diacriticsMap['â'] = 'a';
diacriticsMap['ã'] = 'a';
diacriticsMap['ä'] = 'a';
diacriticsMap['å'] = 'a';
diacriticsMap['æ'] = 'a';
diacriticsMap['ç'] = 'c';
diacriticsMap['è'] = 'e';
diacriticsMap['é'] = 'e';
diacriticsMap['ê'] = 'e';
diacriticsMap['ë'] = 'e';
diacriticsMap['ì'] = 'i';
diacriticsMap['í'] = 'i';
diacriticsMap['î'] = 'i';
diacriticsMap['ï'] = 'i';
diacriticsMap['ð'] = 'd';
diacriticsMap['ñ'] = 'n';
diacriticsMap['ò'] = 'o';
diacriticsMap['ó'] = 'o';
diacriticsMap['ô'] = 'o';
diacriticsMap['õ'] = 'o';
diacriticsMap['ö'] = 'o';
diacriticsMap['ø'] = 'o';
diacriticsMap['ù'] = 'u';
diacriticsMap['ú'] = 'u';
diacriticsMap['û'] = 'u';
diacriticsMap['ü'] = 'u';
diacriticsMap['ý'] = 'y';
diacriticsMap['þ'] = 'f';
diacriticsMap['ÿ'] = 'y';
diacriticsMap['œ'] = 'oe';


class CommonFunctions {

   static removeDiacritics(text) {
      // some ideas:: http://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
      text = text.replace(/[^-A-Za-z0-9]/g, function(a){ return a in diacriticsMap ? diacriticsMap[a] : ''});
      return text.replace(/-./g, function(a){ return a.substring(1).toUpperCase(); });
   }

   static offerNameForChain(words) {
      var result = '';
      if (words.length == 1) {
         result = CommonFunctions.removeDiacritics(words[0]);
      } else {
         var c = 0;
         for (var i=0; i<words.length && c<7; i++) {
            var text = words[i].toLowerCase();
            if (result == '' && text.search(/^(?:l[ea]?|les|une?|d[ue]?|des|cettes?|ces?|[mts](?:on|es|a)|[nv](?:os|otre)|leurs?|aux?)$/i) == -1) {
               result += CommonFunctions.removeDiacritics(text);
               c++;
            } else if (i>0 && result == '') {
               result += CommonFunctions.removeDiacritics(text);
               c++;
            } else if (i>0) {
               text = CommonFunctions.removeDiacritics(text);
               result += text.substring(0, 1).toUpperCase()+text.substring(1);
               c++;
            }
         } // for
      } // if
      result = result.substring(0, 1).toUpperCase()+result.substring(1);
      return result;
   }

   /*
    * @param chainColl: used to check the name validity
    * @param askUser: boolean, if false, get a default name (M1, etc.)
    * @param defaultName: if evaluates to false, don't propose a name; if a
    * string, propose that string (e.g. the current name of the chain); if an
    * array (of strings), propose a default name based on the strings
    */
   static getChainName(chainColl, askUser, defaultName) {
      var name = undefined;
      if (askUser) {
         if (!defaultName) {
            defaultName = "";
         } else if (typeof(defaultName) == "string") {
            // nothing
         } else {
            defaultName = CommonFunctions.offerNameForChain(defaultName);
         }
         while (!name) {
            name = prompt("Enter a name:", defaultName);
            if (name == null) { // cancel
               return undefined;
            }
            if (!name || !chainColl.checkName(name)) {
               alert("Bad name!");
               name = undefined;
            }
         }
      } else {
         var count = 0;
         do {
            count++;
            name = "M" + count.toString();
         } while (!chainColl.checkName(name));
      }
      return name;
   }


   /*
    * @return: {startIndex:INT, values:{opt1: val1, etc.}}
    */
   static parseValues(text, startIndex) {
      var result = {};
      if (text.indexOf(':', startIndex) != startIndex) {
         return {startIndex:startIndex, dic:result};
      }
      var textLen = text.length;
      startIndex++;
      var tmp;
      while(startIndex < textLen) {
         if (((tmp = text.substring(startIndex).match(/^(\w+)=(\w+)/)) != null)
               || ((tmp = text.substring(startIndex).match(/^(\w+)="((?:\\"|[^"])*)"/)) != null)) {
            result[tmp[1]] = tmp[2];
            startIndex += tmp[0].length;
            if (text.substring(startIndex).match(/^[,;]/) != null) {
               startIndex++;
            } else {
               break;
            }
         } else {
            break;
         }
      } // while
      return {startIndex:startIndex, dic:result};
   };

};

