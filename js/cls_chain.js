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

class ChainCollection {

   constructor() {
      this.chains = new Array();
      this.popupDiv = document.createElement('DIV');
      this.popupDiv.id = CHAIN_POPUP_MAIN_DIV_ID; // for CSS
      this.showNonTrueChainsInPopup = true;
   }

   /* Because of the updating of the popupDiv, you should insert in the
    * collection only empty chain (and add links after).
    */
   addChain(chain) {
      if (chain.count) {
         alert("DEBUG WARNING: newly added chain is not empty");
      }
      this.chains.push(chain);
   }

   removeChain(chain) {
      for (var i=0; i<this.chains.length; i++) {
         if (this.chains[i] === chain) {
            this.chains.splice(i, 1);
            break;
         }
      }
      // if the popup has not been shown yet, the popup div is not up-to-date,
      // and chain.popupDiv may not be in this.popupDiv, so we check bedore
      // trying to remove it
      for (var child of this.popupDiv.childNodes) {
         if (child === chain.popupDiv) {
            this.popupDiv.removeChild(chain.popupDiv);
            break;
         }
      }
   }

   sortChainsAndUpdatePopupDiv() {
      if (gText.chainPopup.visible) {
         Chain.sortChains(this.chains);
         this.updatePopupDiv()
      }
   }

   updatePopupDiv() {
      if (gLoadingTime) {
         return;
      }
      while (this.popupDiv.lastChild) {
         this.popupDiv.removeChild(this.popupDiv.lastChild);
      }
      for (var chain of this.chains) {
         this.popupDiv.appendChild(chain.popupDiv);
      }
   }

   /* use this function after loading time (when gLoadingTime is true, links
    * are not sorted, to save resources).
    */
   sortLinksOfAllChains() {
      for (var chain of this.chains) {
         chain.sortLinks();
      }
   }

   isThisChainInCollection(chain) {
      for (var c of this.chains) {
         if (c === chain) {
            return true;
         }
      }
      return false;
   }

   checkName(testName) {
      // correct?
      if (testName.search(/^[-a-zA-Z0-9_]+$/) == -1) {
         return false;
      }
      // avalaible?
      for (var chain of this.chains) {
         if (chain.name === testName) {
            return false;
         }
      }
      return true;
   }

   update() {
      this.chains =
         this.chains.filter(function(chain) { return chain.links.length > 0; });
      for (var c of this.chains) {
         c.redraw();
      }
   }

   getChainByLink(link) {
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l === link) {
               return c;
            }
         }
      }
      return null;
   }

   getChainByName(name) {
      for (var c of this.chains) {
         if (c.name == name) {
            return c;
         }
      }
      return null;
   }

   deselectAllLinks() {
      for (var c of this.chains) {
         for (var l of c.links) {
            l.deselect();
         }
      }
   }

   getLastSelectedChain() {
      // do we have a link currently selected?
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l.isSelected) {
               return c;
            }
         }
      }
      // look for the last selected link
      // NOTE: if there is no chain, return null.
      var index = 0;
      var chain = null;
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l.selectionCount >= index) { // yeah: >= and not >
               index = l.selectionCount;
               chain = c;
            }
         }
      }
      return chain;
   }

   getSelectedLink() {
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l.isSelected) {
               return l;
            }
         }
      }
      return null;
   }

   getLinkById(id) {
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l.id == id) {
               return l;
            }
         }
      }
      return null;
   }

   getLinkBySpan(span) {
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l.span == span) {
               return l;
            }
         }
      }
      return null;
   }

   getChainByLinkSpan(span) {
      for (var c of this.chains) {
         for (var l of c.links) {
            if (l.span == span) {
               return c;
            }
         }
      }
      return null;
   }

   transferLink(link, targetChain) {
      var sourceChain = this.getChainByLink(link);
      if (sourceChain === targetChain) {
         return false;
      }
      link.setChain(targetChain);
      sourceChain.removeLink(link);
      if (sourceChain.count == 0) {
         this.removeChain(sourceChain);
      }
      targetChain.addLink(link);
   }

   getLinks() {
      var links = new Array();
      for (var c of this.chains) {
         for (var l of c.links) {
            links.push(l);
         }
      }
      return links;
   }

   /* Returns null if no more link. */
   getNextLink(refLink, backward, onlyVisible) {
      var links = this.getLinks();
      Link.sortLinks(links);
      var index = undefined;
      for (var i=0; i<links.length; i++) {
         if (links[i] === refLink) {
            index = i;
            break;
         }
      }
      if (index === undefined) {
         return null;
      }
      if (backward) {
         for (var i=index-1; i>=0; i--) {
            if (!onlyVisible || links[i].isVisible) {
               return links[i];
            }
         }
      } else {
         for (var i=index+1; i<links.length; i++) {
            if (!onlyVisible || links[i].isVisible) {
               return links[i];
            }
         }
      }
      return null;
   }

   collapseAllChainsInPopup() {
      for (var chain of this.chains) {
         chain.popupLinkDiv.style.display = 'none';
      }
   }

   expandAllChainsInPopup() {
      for (var chain of this.chains) {
         chain.popupLinkDiv.style.display = 'block';
      }
   }

   expandTrueChainsInPopup() {
      for (var chain of this.chains) {
         if (chain.isTrueChain) {
            chain.popupLinkDiv.style.display = 'block';
         } else {
            chain.popupLinkDiv.style.display = 'none';
         }
      }
   }


   expandSelectedChainInPopup() {
      var link = this.getSelectedLink();
      if (link) {
         var chain = this.getChainByLink(link);
         if (chain && chain.popupLinkDiv.style.display != 'block') {
            chain.popupLinkDiv.style.display = 'block';
         }
      }
   }

   selectChain(link) {
      var chain = this.getChainByLink(link);
      if (chain) {
         chain.popupDivHeadingParagraph.classList.add(CLASS_SELECTED);
      }
   }

   deselectChain(link) {
      var chain = this.getChainByLink(link);
      if (chain) {
         chain.popupDivHeadingParagraph.classList.remove(CLASS_SELECTED);
      }
   }

   applyToAllLinks(callback) {
      for (var c of this.chains) {
         for (var l of c.links) {
            callback(l);
         }
      }
   }

   toggleNonTrueChainsDisplayInPopup() {
      this.showNonTrueChainsInPopup = !this.showNonTrueChainsInPopup;
      for (var chain of this.chains) {
         if (chain.isTrueChain) {
            continue;
         }
         if (this.showNonTrueChainsInPopup) {
            chain.showInPopup();
         } else {
            chain.hideInPopup();
         }
      }
   }

   showChainPatters(onlyTrueChain) {
      var propName = prompt("Enter the property name:");
      if (!propName) {
         return;
      }
      var dic = new Object;
      // links are ordered when they are inserted, so no need to sort them here
      for (var chain of this.chains) {
         if (onlyTrueChain && !chain.isTrueChain) continue;
         dic[chain.name] = "";
         for (var link of chain.links) {
            var prop = link.properties.getPropertyByName(propName);
            if (!prop) {
               alert("Can't find the property!");
               return;
            }
            var value = prop.value.toString();
            if (!value) value = " ";
            dic[chain.name] += value.substr(0, 1);
         }
      }
      var res = "";
      var keys = Object.keys(dic).sort(function(a,b){
            if (dic[a] < dic[b]) return -1;
            if (dic[a] > dic[b]) return 1;
            return 0;
         });
      for (var key of keys) {
         res += key + ": " + dic[key] + "\n";
      }
      alert(res);
   }
}

/*********************************************************************/

class Chain {

   /* links is sorted in situ */
   static sortChains(chains) {
      if (gLoadingTime) {
         return;
      }
      chains.sort(function(a,b) {
         /*if (!a.count) {
            return -1;
         }
         if (!b.count) {
            return 1;
         }*/
         // a is after b
         if (a.firstLink.span.compareDocumentPosition(b.firstLink.span) & 2) {
            return 1;
         // a is before b
         } else if (a.firstLink.span.compareDocumentPosition(b.firstLink.span) & 4) {
            return -1;
         }
         return 0; });
   }

   constructor(name) {
      this._name = name;
      this._color = undefined;
      this.links = new Array();
      // elements for the popup of all chains and links
      this.popupDiv = document.createElement('DIV');
      this.popupDiv.classList.add(CLASS_CHAIN_POPUP_CHAIN_DIV);
      this.popupDivHeadingParagraph = document.createElement('P');
      this.popupDivHeadingParagraph.classList.add(CLASS_CHAIN_POPUP_CHAIN_NAME);
      this.popupDivHeading = document.createElement('A');
      this.popupDivHeadingParagraph.appendChild(this.popupDivHeading);
      this.popupDivHeading.textContent = this._name;
      var that = this;
      this.popupDivHeading.onclick = function(e) {
         if (e.ctrlKey) {
            that.firstLink.select();
         } else {
            if (that.popupLinkDiv.style.display == 'none') {
               that.popupLinkDiv.style.display = 'block';
            } else {
               that.popupLinkDiv.style.display = 'none';
            }
         }
      };
      this.popupDiv.appendChild(this.popupDivHeadingParagraph);
      this.popupLinkDiv = document.createElement('DIV');
      this.popupLinkDiv.classList.add(CLASS_CHAIN_POPUP_LINK_DIV);
      this.popupLinkDiv.style.display = 'block';
      this.popupDiv.appendChild(this.popupLinkDiv);
      // set the color
      this.color = ColorManager.getDefaultColor();
   }

   /* note: chains are sorted every time a link is added, so no need to sort
    * them here.
    */
   get firstLink() {
      return this.links[0];
   }

   get isTrueChain() {
      return (this.links.length >= gText.minLinks)
         || (name.indexOf('_') == 0);
   }

   get name() {
      return this._name;
   }

   // assume the name is valid: use checkName()
   set name(val) {
      if (val == this._name) {
         return;
      }
      this._name = val;
      this.popupDivHeading.textContent = this._name;
      for (var link of this.links) {
         link.setChain(this);
      }
      this.redraw();
   }

   get color() {
      return this._color;
   }

   // assume the color (an object) is valid (ie. not used by another chain)
   set color(val) {
      this._color = val;
      this.popupDiv.style.color = this._color.invertedString;
      this.popupDiv.style.backgroundColor = this._color.string;
      for (var link of this.links) {
         link.setChain(this);
      }
      this.redraw();
   }

   get count() {
      return this.links.length;
   }

   upgradeToTrueChain() {
      this.color = gText.colorManager.getNextAvailableColor(gText.chainColl.chains);
   }

   downgradeToNotTrueChain() {
      this.color = ColorManager.getDefaultColor();
   }

   /* Before of the updating of ChainCollection.popupDiv, which is done here
    * and not when adding a chain to the collection, you should add only empty
    * chain to the collection, and (for this function) add only link to a
    * chain already in the collection.
    */
   addLink(link) {
      if (!gText.chainColl.isThisChainInCollection(this)) {
         alert("DEBUG WARNING: before adding link to chain, you should "
            +"add the chain to the collection.");
      }
      var wasTrueChain = this.isTrueChain;
      this.links.push(link);
      link.setChain(this);
      if (!wasTrueChain && this.isTrueChain) {
         this.upgradeToTrueChain();
      } else {
         this.redraw();
      }
      Link.sortLinks(this.links);
      this.updatePopupLinkDiv();
      gText.chainColl.sortChainsAndUpdatePopupDiv();
      this.addDraggableEventsToTheChainHeading();
   }

   // NOTE: this will not remove the chain from the chain collection if there
   // is no more link left!
   removeLink(link) {
      var wasTrueChain = this.isTrueChain;
      for (var i=0; i<this.links.length; i++) {
         if (this.links[i] === link) {
            this.links.splice(i, 1);
            break;
         }
      }
      if (wasTrueChain && !this.isTrueChain) {
         this.downgradeToNotTrueChain();
      } else {
         this.redraw();
      }
      this.popupLinkDiv.removeChild(link.popupPar);
      this.addDraggableEventsToTheChainHeading();
   }

   addDraggableEventsToTheChainHeading() {
      if (this.count) {
         this.popupDiv.draggable = true;
         this.popupDiv.ondragstart = this.firstLink.span.ondragstart;
         this.popupDiv.ondragover = this.firstLink.span.ondragover;
         this.popupDiv.ondrop = this.firstLink.span.ondrop;
      }
   }

   updatePopupLinkDiv() {
      while (this.popupLinkDiv.lastChild) {
         this.popupLinkDiv.removeChild(this.popupLinkDiv.lastChild);
      }
      for (var link of this.links) {
         this.popupLinkDiv.appendChild(link.popupPar);
      }
   }

   redraw() {
      for (var link of this.links) {
         link.redraw();
      }
   }

   /* Returns the index of `link' in this.links. */
   getIndexOf(link) {
      for (var i=0; i<this.links.length; i++) {
         if (this.links[i] === link) {
            return i;
         }
      }
      return undefined;
   }

   /* Returns null if no more link. */
   getNextLink(refLink, backward, onlyVisible) {
      // links are sorted every time a new link is added, so it's easy
      var index = this.getIndexOf(refLink);
      if (index === undefined) {
         return null;
      }
      if (backward) {
         for (var i=index-1; i>=0; i--) {
            if (!onlyVisible || this.links[i].isVisible) {
               return this.links[i];
            }
         }
      } else {
         for (var i=index+1; i<this.links.length; i++) {
            if (!onlyVisible || this.links[i].isVisible) {
               return this.links[i];
            }
         }
      }
      return null;
   }

   hide() {
      for (var link of this.links) {
         link.hide();
      }
   }

   show() {
      for (var link of this.links) {
         link.show();
      }
   }

   hideInPopup() {
      this.popupDiv.style.display = "none";
   }

   showInPopup() {
      this.popupDiv.style.display = "block";
   }

   sortLinks() {
      Link.sortLinks(this.links);
      this.updatePopupLinkDiv();
   }

}

