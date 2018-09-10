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

_selectionCount = 0;
_linkIdCounter = 0;

class Link {

   static getNextSelectionCount() {
      return _selectionCount++;
   }

   /* links is sorted in situ */
   static sortLinks(links) {
      if (gLoadingTime) {
         return;
      }
      links.sort(function(a,b) {
         // a is after b
         if (a.span.compareDocumentPosition(b.span) & 2) {
            return 1;
         // a is before b
         } else if (a.span.compareDocumentPosition(b.span) & 4) {
            return -1;
         }
         return 0; });
   }

   /* @param elements: The first and last elements of the link.  They may be
    * anchors or spans.
    */
   constructor(elements, initialProperties) {
      this.id = _linkIdCounter++;
      this._name = undefined; // set up by setChain()
      this._color = ColorManager.getDefaultColor(); // set up by setChain()
      this.selectionCount = -1;
      // elements
      this.span = document.createElement('SPAN');
      this.span.classList.add(CLASS_LINK);
      this.nameSpan = document.createElement('SPAN');
      this.span.appendChild(this.nameSpan);
      this.nameSpan.className = CLASS_METADATA;
      // move all the elements in the span
      var toBeMoved = new Array();
      var cur = elements[0];
      while (true) {
         toBeMoved.push(cur);
         if (elements.length == 1 || cur === elements[1]) {
            break;
         }
         cur = cur.nextSibling;
      } 
      elements[0].parentNode.replaceChild(this.span, elements[0]);
      for (var e of toBeMoved) {
         this.span.appendChild(e);
      }
      // name
      this.nameAnchor = document.createElement('A');
      this.nameSpan.appendChild(this.nameAnchor);
      // elements for the chains popup (after moving all the elements into the
      // span, because we use this.text)
      this.popupPar = document.createElement('P');
      this.popupAnchor = document.createElement('A');
      this.popupAnchor.appendChild(document.createTextNode(this.text));
      this.popupPar.appendChild(this.popupAnchor);
      // add events to all the elements
      this._addEvents();
      // misc
      this._isSelected = false;
      this._isHidden = false;
      this.redraw();
      // properties (at the end because of the head property and this.words)
      if (gText.schema.isEmpty) {
         this.properties = null;
         if (gText.showPropertyWarnings && initialProperties
               && Object.keys(initialProperties).length) {
            alert("No schema has been defined, yet there are some properties "
               + "in the file.");
         }
      } else {
         if (!initialProperties) {
            initialProperties = {};
         }
         this.properties
            = gText.schema.buildLinkProperties(initialProperties);
         this.properties.resetHeadProperty(this);
      }
   }

   _addEvents() {
      var that = this;
      this.span.onclick = function(e) {
         if (e.ctrlKey && e.shiftKey) { // attach to new chain (ask for name)
            that.select();
            var name = CommonFunctions.getChainName(gText.chainColl, true,
               that.name);
            if (name) {
               var chain = new Chain(name);
               gText.chainColl.addChain(chain);
               gText.chainColl.transferLink(that, chain);
            }
         } else if (e.ctrlKey) { // attach to last selected chain
            var lastSelectedChain = gText.chainColl.getLastSelectedChain();
            that.select();
            if (lastSelectedChain) {
               gText.chainColl.transferLink(that, lastSelectedChain);
            }
         } else if (e.shiftKey) { // attach to new chain (default name)
            that.select();
            var name = CommonFunctions.getChainName(gText.chainColl, false);
            if (name) {
               var chain = new Chain(name);
               gText.chainColl.addChain(chain);
               gText.chainColl.transferLink(that, chain);
            }
         } else {
            if (that.isSelected) {
               that.deselect();
            } else {
               that.select();
            }
         }
         e.stopPropagation();
         return false;
      };
      this.popupAnchor.onclick = this.span.onclick;
      // drag and drop
      this.span.draggable = true;
      this.span.ondragstart = function(e) {
         e.stopPropagation(); // when overlapping span (link inside link)
         e.dataTransfer.setData("text", that.id.toString());
         // e.target is the source element (ie the element that is dragged)
         //useless: e.dataTransfer.effectAllowed = 'all';
      };
      this.span.ondragover = function(e) {
         e.preventDefault(); // allow the drop (blocked by default)
      };
      this.span.ondrop = function(e) {
         // NOTE: e.target is the target element (ie the element on which an
         // element is dropped): don't use it, but use `this/that'
         e.stopPropagation(); // when overlapping span (link inside link)
         //console.log(e.target);
         //console.log(this);
         e.preventDefault();
         var linkId = parseInt(e.dataTransfer.getData("text"));
         var sourceLink = gText.chainColl.getLinkById(linkId);
         if (!sourceLink) return;
         var targetLink = that;
         var shiftKey = e.shiftKey // doesn't seem to work on FF 54 (only 55)
            || e.dataTransfer.dropEffect == "link"; // ctrl+shift, for FF54
         //console.log(e);
         //console.log(shiftKey);
         if (shiftKey) {
            gText.substituteLink(sourceLink, targetLink);
         } else {
            if (sourceLink === targetLink) return;
            var sourceChain = gText.chainColl.getChainByLink(sourceLink);
            var targetChain = gText.chainColl.getChainByLink(targetLink);
            if (sourceChain === targetChain) return;
            var ctrlKey = e.ctrlKey // doesn't seem to work on FF 54 (only 55), and doesn't work on chromium
               || e.dataTransfer.dropEffect == "copy"; // works on all versions of FF, and on chromium if the key is pressed before beginning the d&d
            // for chrome, see: https://stackoverflow.com/questions/19010257/event-datatransfer-dropeffect-in-chrome
            //console.log(e.dataTransfer.dropEffect);
            if (sourceChain.count == 1) {
               if (targetChain.count == 1) {
                  //targetLink.setChain(sourceChain);
                  gText.chainColl.transferLink(targetLink, sourceChain);
               } else {
                  if (ctrlKey) {
                     //targetLink.setChain(sourceChain);
                     gText.chainColl.transferLink(targetLink, sourceChain);
                  } else {
                     //sourceLink.setChain(targetChain);
                     gText.chainColl.transferLink(sourceLink, targetChain);
                  }
               }
            } else {
               if (targetChain.count == 1) {
                  //targetLink.setChain(sourceChain);
                  gText.chainColl.transferLink(targetLink, sourceChain);
               } else {
                  if (ctrlKey) {
                     //targetLink.setChain(sourceChain);
                     gText.chainColl.transferLink(targetLink, sourceChain);
                  } else {
                     if (confirm("Do you want to merge?")) {
                        while (targetChain.count) {
                           //targetChain.links[0].setChain(sourceChain);
                           gText.chainColl.transferLink(targetChain.links[0], sourceChain);
                        }
                     }
                  }
               }
            }
         } // no shift key
      }; // this.span.ondrop
      this.popupAnchor.draggable = true;
      this.popupAnchor.ondragstart = this.span.ondragstart;
      this.popupAnchor.ondragover = this.span.ondragover;
      this.popupAnchor.ondrop = this.span.ondrop;
   }

   get words() {
      var wds = new Array();
      for (var anchor of this.span.getElementsByClassName(CLASS_TOKEN)) {
         wds.push(anchor.textContent);
      }
      return wds;
   }

   get text() {
      //var text = this.span.textContent;
      //return text.substr(text.indexOf(" ")+1);
      var clone = this.span.cloneNode(true);
      var badguys = clone.getElementsByClassName(CLASS_METADATA);
      for (var i=badguys.length-1; i>=0; i--) {
         badguys[i].parentNode.removeChild(badguys[i]);
      }
      return clone.textContent;
   }

   setChain(chain) {
      this._name = chain.name;
      this._color = chain.color;
   }

   get name() {
      return this._name;
   }

   get contentIsEmptySet() {
      return this.text === "Ø";
   }

   show() {
      if (this._isHidden) {
         this._isHidden = false;
         this.redraw();
      }
   }

   hide() {
      if (!this._isHidden) {
         this._isHidden = true;
         this.redraw();
      }
   }

   get isHidden() {
      return this._isHidden;
   }

   get isVisible() {
      return !this._isHidden;
   }

   select() {
      if (!this._isSelected) {
         gText.deselectAllTokensAndLinks();
         gText.chainColl.selectChain(this);
         this._isSelected = true;
         this.redraw();
         this.selectionCount = Link.getNextSelectionCount();
      }
   }

   deselect() {
      if (this._isSelected) {
         gText.chainColl.deselectChain(this);
         this._isSelected = false;
         this.redraw();
      }
   }

   get isSelected() {
      return this._isSelected;
   }

   destroy() {
      this.deselect(); // remove the div from the property panel
      this.span.removeChild(this.nameSpan);
      while (this.span.childNodes.length) {
         this.span.parentNode.insertBefore(this.span.firstChild, this.span);
      }
      var parentNode = this.span.parentNode;
      parentNode.removeChild(this.span);
      parentNode.normalize();
   }

   redraw() {
      this.span.style.borderColor = this._color.string;
      this.nameSpan.style.borderColor = this._color.string;
      this.nameSpan.style.backgroundColor = this._color.string;
      this.nameAnchor.style.color = this._color.invertedString;
      this.nameAnchor.innerHTML = this._name;
      if (this.isHidden) {
         this.span.classList.add(CLASS_HIDDEN);
      } else {
         this.span.classList.remove(CLASS_HIDDEN);
      }
      if (this.isSelected) {
         this.span.classList.add(CLASS_SELECTED);
         this.span.style.backgroundColor = this._color.transparentString;
         this.popupAnchor.classList.add(CLASS_SELECTED);
      } else {
         this.span.classList.remove(CLASS_SELECTED);
         this.span.style.backgroundColor = "rgba(0,0,0,0)"; // transparent
            // (for selection of a link that has nested links)
         this.popupAnchor.classList.remove(CLASS_SELECTED);
      }
      if (!gText.schema.isEmpty) {
         if (this.isSelected) {
            this.properties.div.insertBefore(gText.schema.button,
               this.properties.div.firstChild);
            gDivLinkPropertyAnchor.appendChild(this.properties.div);
            gDivLinkPropertyAnchor.style.display = 'block';
         } else {
            if (gDivLinkPropertyAnchor.childNodes.length
                  && gDivLinkPropertyAnchor.childNodes[0] == this.properties.div) {
               gDivLinkPropertyAnchor.removeChild(this.properties.div);
               gDivLinkPropertyAnchor.style.display = 'none';
            }
         }
      }
   }

   scrollTo(win) {
      var obj;
      if (!win || win == window) {
         obj = this.span;
      } else {
         obj = this.popupPar;
      }
      Scrolling.scrollTo(obj, true, win);
   }

   isEqualTo(name, searchedValue, reversed) {
      var val = this.properties.getPropertyByName(name).value == searchedValue;
      if (reversed) {
         return !val;
      }
      return val;
   }

   matches(name, pattern, reversed) {
      //console.log(pattern);
      var val = pattern.exec(this.properties.getPropertyByName(name).value);
      if (reversed) {
         return !val;
      }
      return val;
   }

}

