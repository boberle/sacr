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

class Exporter {

   /* FUNCTIONS TO EXPORT TO A FILE */

   /* see:
    * - https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa
    * - https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
    */
   static utf8_to_b64(str) {
       return window.btoa(unescape(encodeURIComponent(str)));
   }

   /* see:
    * source: http://stackoverflow.com/questions/5552540/save-as-text-file-javascript
    */
   static writeToFile(text, filename) {
      var anchor = document.createElement('a');
      //a.href = 'data:'+mimetype+';charset=UTF-8;base64,'+btoa(content);
      //data uri scheme
      anchor.href = 'data:text/plain;charset=UTF-8;base64,'+
         Exporter.utf8_to_b64(text);
      anchor.innerHTML = 'download';
      anchor.download = filename;
      document.body.appendChild(anchor); // this is necessary (not in the
         // source)
      anchor.click();
      document.body.removeChild(anchor);
   }


   /* FUNCTIONS FOR FILENAME */

   static datePadding(text) {
      if ((text+"").length == 1) {
         return "0"+text;
      } else {
         return text+"";
      }
   }

  static getDateString() {
      var d = new Date(); 
      var str = d.getFullYear()
         + Exporter.datePadding(d.getMonth()+1)
         + Exporter.datePadding(d.getDate())
         + "-"
         + Exporter.datePadding(d.getHours())
         + Exporter.datePadding(d.getMinutes())
         + Exporter.datePadding(d.getSeconds()); 
     //console.log(str);
     return str;
   }

   static computeNewFilename(originalFilename) {
      var dateString = Exporter.getDateString();
      if (!originalFilename) {
         originalFilename = "default";
      }
      var newFilename = originalFilename;
      newFilename = newFilename.replace(/\d{8}-\d{6}/, dateString);
      if (newFilename == originalFilename) {
         newFilename = originalFilename;
         newFilename = newFilename.replace(/(\.[^.]+)$/, "_"+dateString+"$1");
         if (newFilename == originalFilename) {
            newFilename = originalFilename+"_"+dateString;
         }
      }
      return newFilename;
   }

   /* FUNCTIONS TO EXPORT TO TEXT */

   /* the general structure is as follows:
    *  - paragraph -> series of texts and spans for links.  Each link span is
    *    as follows:
    *     - span (CLASS_LINK):
    *        - span (with the name) (CLASS_METADATA)
    *           - anchor (with the name)
    */
   convertElementToText (element, complete) {
      var result = '';
      for (var e of element.childNodes) {
         if (e.nodeType == 3) { // text
            result += e.textContent;
         } else if (e.nodeType == 1) { // DOM element
            if (e.tagName == 'SPAN') {
               if (e.classList.contains(CLASS_PAR_NUMBER)) {
                  // nothing
               } else if (e.classList.contains(CLASS_METADATA)) {
                  var link = gText.chainColl.getLinkBySpan(e.parentElement);
                  if (!link) {
                     alert("One of the link span is not in the dictionary");
                  } else {
                     result += link.name;
                     if (!gText.schema.isEmpty) {
                        if (complete) {
                           result += ':' + link.properties.getString(true,
                              link.text);
                        } else {
                           result += ':' + link.properties.getString();
                        }
                     }
                     result +=  ' ';
                  }
               } else if (e.classList.contains(CLASS_LINK)) {
                  result += '{' + this.convertElementToText(e, complete) + '}';
               } else {
                  alert("Found a 'span' which is neither a link nor a metadata (className: '"+elements[i].className+"')...");
               }
            } else if (e.tagName == 'A') {
               result += e.textContent;
            } else if (e.tagName == 'BR') {
               //alert('before:\"'+result+"\"");
               result += "\\n\n";
               //alert('after:\"'+result+"\"");
            } else {
               alert("Found a <"+e.tagName+">...");
            }
         } else {
            alert("Found a element of node type: "+e.nodeType+"...");
         }
      }
      return result;
   }

   convertDomToString(complete) {
      var result = '';
      for (var par of gText.div.childNodes) {
         if (par.tagName == 'P') {
            if (par.classList.contains(CLASS_PARAGRAPH)) {
               result += this.convertElementToText(par, complete)
                  + "\n\n";
            } else if (par.classList.contains(CLASS_COMMENT)) {
               result += par.textContent + "\n\n";
            } else {
               alert("Found a 'p' which is neither a text nor an info: `"+par.textContent+"'.");
            }
         } else {
            alert("A child of the div 'text' is not a paragraph (node type: "+pars[i].nodeType+").");
         }
      }
      return result;
   }

   getColors() {
      var result = '';
      for (var chain of gText.chainColl.chains) {
         if (chain.isTrueChain) {
            result += "#COLOR:" + chain.name + "=" + chain.color.string + "\n";
         }
      }
      return result;
   }

   getTokenizationType() {
      return "#TOKENIZATION-TYPE:"+gText.tokenizationType.toString()+"\n";
   }


   computeText(complete) {
      var result = "";
      result += this.convertDomToString(complete);
      result += "\n\n" + this.getColors() + "\n";
      result += this.getTokenizationType() + "\n";
      return result;
   }

   convertElementToHTMLText(element, brackets, indices) {
      var result = '';
      for (var e of element.childNodes) {
         if (e.nodeType == 3) { // text
            result += e.textContent;
         } else if (e.nodeType == 1) { // DOM element
            if (e.tagName == 'SPAN') {
               if (e.classList.contains(CLASS_PAR_NUMBER)) {
                  // nothing
               } else if (e.classList.contains(CLASS_METADATA)) {
                  // nothing
               } else if (e.classList.contains(CLASS_LINK)) {
                  const chain = gText.chainColl.getChainByLinkSpan(e);
                  if (!chain) {
                     alert("One of the link span is not in the dictionary");
                  } else {
                     let index = "";
                     if (chain.isTrueChain) {
                        if (!(chain.name in indices)) {
                           indices[chain.name] = Object.keys(indices).length ? Math.max(...Object.values(indices)) + 1 : 1;
                        }
                        index = `<sub>${indices[chain.name]}</sub>`;
                     }
                     if (brackets) {
                        const style = `font-weight: bold; font-size: 130%; color: ${chain.color.string}`;
                        result += `<span style="${style}">[</span>${this.convertElementToHTMLText(e, brackets, indices)}<span style="${style}">]${index}</span>`;
                     } else {
                        result += `<span class="link" style="border: ${chain.color.string} 2pt solid;"><span style="background-color: ${chain.color.string};">${chain.name}</span> ${this.convertElementToHTMLText(e, brackets, indices)}</span>`;
                     }
                  }
               } else {
                  alert("Found a 'span' which is neither a link nor a metadata (className: '"+elements[i].className+"')...");
               }
            } else if (e.tagName == 'A') {
               result += e.textContent;
            } else if (e.tagName == 'BR') {
               result += "</br>";
            } else {
               alert("Found a <"+e.tagName+">...");
            }
         } else {
            alert("Found a element of node type: "+e.nodeType+"...");
         }
      }
      return result;
   }

   convertDomToHTMLString(brackets) {
      var result = '';
      const indices = {};
      for (var par of gText.div.childNodes) {
         if (par.tagName == 'P') {
            if (par.classList.contains(CLASS_PARAGRAPH)) {
               result += `<p style="margin: 0; padding: 10px; ${brackets ? '' : 'line-height: 3.1em; padding-left: 0;'}">${this.convertElementToHTMLText(par, brackets, indices)}</p>\n`;
            } else if (par.classList.contains(CLASS_COMMENT)) {
               result += `<p style="font-family: mono; background-color: antiquewhite; padding: 10px; margin: 0px">${par.textContent}</p>\n`;
            } else {
               alert("Found a 'p' which is neither a text nor an info: `"+par.textContent+"'.");
            }
         } else {
            alert("A child of the div 'text' is not a paragraph (node type: "+pars[i].nodeType+").");
         }
      }
      return result;
   }

   computeHTML(brackets) {
      var result = "<html><head><style>p > .link { padding: 11px; padding-left: 0; } p > .link > .link { padding: 8px; padding-left: 0; } p > .link > .link > .link { padding: 5px; padding-left: 0; } p > .link > .link > .link > .link { padding: 0; } p > .link > span { padding: 11px; } p > .link > .link > span { padding: 8px; } p > .link > .link > .link > span { padding: 5px; } p > .link > .link > .link > .link > span { padding: 0; }</style></head><body>";
      result += this.convertDomToHTMLString(brackets);
      result += "</body></html>";
      return result;
   }

   computeSchema() {
      return gText.raw_schema;
   }

   exportText(complete) {
      var filename = Exporter.computeNewFilename(gText.textFilename);
      var text = this.computeText(complete);
      Exporter.writeToFile(text, filename);
   }

   exportHTML(brackets=false) {
      var filename = Exporter.computeNewFilename(gText.textFilename) + ".html";
      var text = this.computeHTML(brackets);
      Exporter.writeToFile(text, filename);
   }

   exportSchema() {
      var filename = Exporter.computeNewFilename(gText.textFilename+"-schema");
      var text = this.computeSchema();
      Exporter.writeToFile(text, filename);
   }

   showSchema() {
      alert(this.computeSchema());
   }

}

