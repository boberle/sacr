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

var TOKENIZATION_WORD = 1;
var TOKENIZATION_WORD_N_PUNCT = 2;
var TOKENIZATION_CHARACTER = 3;

/**********************************************************************
 *                      ParsedLink
 *********************************************************************/

class ParsedLink {
   constructor(name) {
      this.name = name;
      this.properties = {}; // it's just a dictionary
      this.startAnchor = null;
      this.endAnchor = null; // same as startAnchor if only one token
   }
}


/**********************************************************************
 *                      SacrParser
 *********************************************************************/

class SacrParser {

   /* preprocessing of the input text: each line = one paragraph, no empty
    * line, etc. NOTE: no need to worry about \r\n because the text is taken
    * from a textarea, which returns only \n
    */
   static normalizeText(text) {
      text = text.replace(/\n(\s+\n)+/g, "\n\n");
      text = text.replace(/\\n\n/g, "\\n");
      text = text.replace(/\n\s*(#[^\n]+)\n/g, "\n\n$1\n\n");
      text = text.replace(/([^\n])[ \t]*\n[ \t]*(?!#|\n+)/g, "$1 ");
      text = text.replace(/[ \t]*\n\n+[ \t]*/g, "\n");
      text = text.replace(/^\n+/g, "");
      text = text.replace(/\n+$/g, "");
      return text;
   }

   static makeTokenRegex(tokenizationType, additionnalTokens) {
      additionnalTokens.sort(function(a,b) {
         if (b.length === a.length) { return 0; }
         else if (b.length > a.length) { return 1; }
         else { return -1; }; });
      var additionnalTokenString = additionnalTokens.join('|');
      var tokenization_string = undefined;
      if (tokenizationType == TOKENIZATION_WORD) {
         //alert('tokenization: words');
         tokenization_string = 
            "[a-zßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿœα-ω]+'?|[-+±]?[.,]?[0-9]+";
      } else if (tokenizationType == TOKENIZATION_WORD_N_PUNCT) {
         //alert('tokenization: word and punct');
         tokenization_string = 
         tokenization_string = 
            "[a-zßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿœα-ω]+'?|[-+±]?[.,]?[0-9]+"
            + "|[.,;:!?()\\[\\]]|-+";
      } else {
         //alert('tokenization: characters');
         tokenization_string = "[^{}]";
      }
      return new RegExp("^(" + additionnalTokenString + "|"
         + tokenization_string + ")", 'i');
   }

   constructor(div, text, tokenizationType, showPropertyWarnings) {
      this.div = div;
      this.text = text;
      this.tokenizationType = tokenizationType;
      this.showPropertyWarnings = showPropertyWarnings;
   }

   parseText() {

      var tmp;
      var additionnalTokens = new Array('%', '‰', '°', '°C', '°F');
      var tokenRegex = SacrParser.makeTokenRegex(this.tokenizationType,
         additionnalTokens);

      var parIsHeading = 0;  // 0 = no, 1 = level 1, etc.
      // variables for storing actions for creating links and chains
      var parsedLinks = new Array(); // array of ParsedLink
         // (see the class ParsedLink for details)
      // NOTE: each link found ({name:values text}) is stored in the
      // filoLinks.  When the closing } is encountered, it is popped out from
      // the filoLinks array and stored permanently in the parsedLinks array.
      var filoLinks = new Array(); // array of ParsedLink
      var colors = {};
         // array of {"chain name":<Color object>]

      // preprocessing
      this.text = SacrParser.normalizeText(this.text);
      var lines = this.text.split(/\n/);

      var textTitle = ''; // for the document.title
      var textId = ''; // idem

      var paragraph_counter = 1;

      // loop
      for (var line of lines) {

         if (line.match(/^#+$/)) {
            line = line.replace(/#/g, '*');
         }

         if (((tmp = line.match(/^#COLOR\s*:\s*([^ =]+)\s*=\s*(.+)$/)) != null)) {
            var chainName = tmp[1];
            var tmp_color = Color.parseString(tmp[2]); // returns null if
               // can't parse
            if (tmp_color) {
               //console.log("parsed color: "+tmp[2]);
               colors[chainName] = tmp_color;
               //console.log(chainName + ": " + tmp_color.string);
            } else {
               console.log("can't parse color: "+tmp[2]);
            }

         } else if (((tmp = line.match(/^#DEFAULTCOLOR\s*:\s*(\S+)$/)) != null)) {
            //var tmp_color = Color.parseString(tmp[1]);
            //if (tmp_color) {
            //   ColorManager.setDefaultColor(tmp_color);
            //}
         } else if (((tmp = line.match(/^#TOKENIZATION-TYPE/)) != null)) {
            // nothing

         } else if (((tmp = line.match(/^#.*$/)) != null)
               || ((tmp = line.match(/^\*+$/)) != null)) {
            var par = document.createElement('P');
            if (line.match(/^\*+$/)) {
               var hiddenSpan = document.createElement('SPAN');
               hiddenSpan.style.display = 'none';
               hiddenSpan.appendChild(document.createTextNode(tmp[0]));
               par.appendChild(hiddenSpan);
               par.appendChild(document.createElement('HR'));
            } else {
               var tmp2;
               if ((tmp2 = line.match(/^\s*#title\s*:\s*(.+)$/)) != null) {
                  textTitle = tmp2[1];
               } else if ((tmp2 = line.match(/^\s*#textid\s*:\s*(.+)$/)) != null) {
                  textId = tmp2[1];
               } else if ((tmp2 = line.match(/^\s*#additionnaltoken\s*:\s*(.+)$/)) != null) {
                  additionnalTokens.push(tmp2[1]);
                  tokenRegex = SacrParser.makeTokenRegex(this.tokenizationType,
                     additionnalTokens);
               }
               par.appendChild(document.createTextNode(tmp[0]));
            }
            par.className = CLASS_COMMENT;
            this.div.appendChild(par);
            if (((tmp = line.match(/^#part-heading:/)) != null)) {
               var response = CommonFunctions.parseValues(line, 13);
               if (response.startIndex != line.length) {
                  throw "Can't parse line: "+line+" (error when reading option values)";
               }
               parIsHeading = 1;
               if ('level' in response.dic) {
                  parIsHeading = response.dic.level;
               }
            }

         } else if (line.length) {
            var startIndex = 0;
            var textLen = line.length;
            var lastAnchor;
            var lastTokenType = '';
            var thereIsSomeText = '';
            var par = document.createElement('P');
            par.className = CLASS_PARAGRAPH;
            if (parIsHeading) {
               par.classList.add(CLASS_HEADING);
               par.classList.add("level"+parIsHeading);
            }
            var par_number = document.createElement('SPAN');
            par_number.className = CLASS_PAR_NUMBER;
            par_number.appendChild(document.createTextNode('[#'+paragraph_counter+'] '));
            paragraph_counter++;
            par.appendChild(par_number);
            parIsHeading = 0;
            this.div.appendChild(par);
            while(startIndex < textLen) {
               if ((tmp = line.substring(startIndex).match(tokenRegex)) != null) {
                  var anchor = gText.createTokenAnchor(tmp[0]);
                  // WARNING!!! sometimes, there are consecutive
                  // opening tag ({foo {bar A Word}}), and so you must
                  // set the anchor for ALL these tags!!!  So, just go
                  // through the array, and complete if something is
                  // undefined.
                  for (var link of filoLinks) {
                     if (!link.startAnchor) {
                        link.startAnchor = anchor;
                     }
                  }
                  lastAnchor = anchor;
                  par.appendChild(anchor);
                  startIndex += tmp[0].length;
                  lastTokenType = 'text';
                  thereIsSomeText = true;
               } else if ((tmp = line.substring(startIndex).match(/^{([-a-zA-Z0-9_]+)/)) != null) {
                  var chainName = tmp[1];
                  var response = CommonFunctions.parseValues(line, startIndex+chainName.length+1);
                  startIndex = response.startIndex;
                  if (line.substring(startIndex).search(/^\s/) != 0) {
                     throw "Can't parse line: "+line+" (error when reading property values).";
                  }
                  var parsedLink = new ParsedLink(chainName);
                  parsedLink.properties = response.dic;
                  filoLinks.push(parsedLink);
                  startIndex++;
                  lastTokenType = 'open';
                  thereIsSomeText = false;
               } else if ((tmp = line.substring(startIndex).match(/^}/)) != null) {
                  if (!thereIsSomeText) {
                     alert("Warning: an annotation has no text!");
                     filoLinks.pop();
                  } else {
                     if (filoLinks.length == 0 || !lastAnchor) {
                        throw "Syntax error in the file (too much }'s).";
                     }
                     filoLinks[filoLinks.length-1].endAnchor = lastAnchor;
                     parsedLinks.push(filoLinks.pop());
                  }
                  startIndex++;
                  lastTokenType = 'close';
               } else if ((tmp = line.substring(startIndex).match(/^\\n/)) != null) {
                  par.appendChild(document.createElement('BR'));
                  startIndex += 2;
               } else if ((tmp = line.substring(startIndex).match(/^./)) != null) {
                  par.appendChild(document.createTextNode(tmp[0]));
                  startIndex++;
                  lastTokenType = 'symbol';
               }
               //console.log(lastTokenType);
            } // while
            if (startIndex != textLen) {
               throw "The parser has stopped to early!";
            }
            if (filoLinks.length) {
               throw "Syntax error in the file (not enough }'s).";
            }
            par.normalize();

         } else {
            throw "Can't parse line: "+line;

         }

      } // for each line

      // set the document title
      try {
         if (textId && textTitle) {
            document.title = "SACR: "+textId+", "+textTitle;
         } else if (textId) {
            document.title = "SACR: "+textId;
         } else if (textTitle) {
            document.title = "SACR: "+textTitle;
         }
      } catch (err) {
         // buuuuh!
      }

      /* creation of links and chains */

      for (var parsedLink of parsedLinks) {
         gText.importLink(parsedLink.startAnchor, parsedLink.endAnchor,
            parsedLink.name, parsedLink.properties);
      }

      /* colors */

      //console.log(colors);
      for (var chainName in colors) {
         //console.log(chainName);
         var color = colors[chainName];
         //console.log('color: '+color.string);
         //console.log('exists: '+gText.colorManager.doesThisColorExist(color).toString());
         if (gText.colorManager.doesThisColorExist(color) &&
               gText.colorManager.isThisColorFree(color,
               gText.chainColl.chains)) {
            var chain = gText.chainColl.getChainByName(chainName);
            if (chain && chain.isTrueChain) {
               chain.color = color;
               //console.log('set color:'+color.string);
            }
         }
      }

   }

}

