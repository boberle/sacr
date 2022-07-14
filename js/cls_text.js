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


class Text {

   constructor(autocomplete) {
      this.div = document.createElement("DIV");
      this.div.id = "divText"; // for CSS
      document.body.appendChild(this.div);
      this.chainColl = new ChainCollection();
      this.chainPopup = new ChainPopup(this.chainColl.popupDiv);
      this.colorManager = null;
      this.searchDialog = null;
      var that = this;
      this.dataLoader = new DataLoader(function(dataLoader) {
         that.textFilename = dataLoader.textFilename;
         that.raw_schema = dataLoader.schema;
         that.raw_text = dataLoader.text;
         that.minLinks = dataLoader.minLinks;
         that.showPropertyWarnings = dataLoader.showPropertyWarnings;
         that.tokenizationType = dataLoader.tokenizationType;
         try {
            that.schema = new Schema(that.raw_schema)
            that.colorManager = new ColorManager(dataLoader.hueStep,
               dataLoader.saturationStep, dataLoader.lightnessStep);
            var parser = new SacrParser(that.div, that.raw_text,
               that.tokenizationType, false);
            parser.parseText();
         } catch(error) {
            var errText;
            if (typeof(error) == "string") {
               errText = error;
            } else {
               errText = "<p>"+error.name+": "+error.message+"</p>";
               if (error.fileName) errText += "<p>File: "+error.fileName+"</p>";
               if (error.lineNumber) errText += "<p>Line number: "+error.lineNumber+"</p>";
               if (error.stack) errText += "<p>Stack: "+error.stack+"</p>";
           }
            that.div.innerHTML = "<p>An error occured:</p>" + errText;
            return;
         }
         gLoadingTime = false;
         that.chainColl.sortLinksOfAllChains();
      }, autocomplete);
      // parse the sacr code
      //new SacrParser(this, this.propertyColl);
   }

   clickOnTheParseButton() {
      this.dataLoader.clickOnTheParseButton();
   }


   createTokenAnchor(textContent) {
      var that = this;
      var anchor = document.createElement('A');
      anchor.appendChild(document.createTextNode(textContent));
      anchor.className = CLASS_TOKEN;
      var func = function(obj, e, dblClick) {
         // the next line will remove all selection of text made by the shift
         // key
         window.getSelection().removeAllRanges();
         e.stopPropagation();
         var selected = that.getSelectedTokens();
         // if no other token is selected, we (de)select the current token
         if (!dblClick && selected[0] === obj) {
            obj.classList.remove(CLASS_SELECTED);
         } else if (!dblClick && selected.length == 0) {
            that.chainColl.deselectAllLinks();
            obj.classList.add(CLASS_SELECTED);
         // otherwise, we create a link
         } else if (dblClick || selected.length == 1) {
            obj.classList.add(CLASS_SELECTED);
            // shift: ask for a name
            if (e.shiftKey && !e.ctrlKey) {
               that.createLinkAndChain(true);
            // ctrl: attach to previous chain
            } else if (e.ctrlKey && !e.shiftKey) {
               that.createLinkAndAttachItToLastSelectedChain();
            // otherwise, default name
            } else {
               that.createLinkAndChain(false);
            }
         // if we are here, there is a problem somewhere
         } else {
            alert("Too many words are selected!");
            obj.deselectAllTokensAndLinks();
            return;
         }
      };
      anchor.onclick = function(e){ func(this, e, false); };
      anchor.ondblclick = function(e){ func(this, e, true); };
      return anchor;
   }

   deselectAllTokensAndLinks() {
      // this is for words
      var selected = Array.from(document.getElementsByClassName(CLASS_SELECTED));
      for (var e of selected) {
         if (e.tagName == 'A') {
            e.classList.remove(CLASS_SELECTED);
         }
      }
      // this is for links
      this.chainColl.deselectAllLinks();
   }

   /* @param includeAll: If false, include only the first and last selected.
    */
   getSelectedTokens(includeAll) {
      var anchors = document.getElementsByClassName(CLASS_TOKEN);
      var start = -1;
      var end = -1;
      for (var i=0; i<anchors.length; i++) {
         if (anchors[i].classList.contains(CLASS_SELECTED)) {
            if (start == -1) {
               start = i;
            } else {
               end = i;
               break;
            }
         }
      }
      if (start == -1) {
         return new Array();
      } else if (end == -1) {
         return new Array(anchors[start]);
      } else {
         if (includeAll) {
            var res = new Array();
            for (var i=start; i<=end; i++) {
               res.push(anchors[i]);
            }
            return res;
         } else {
            return new Array(anchors[start], anchors[end]);
         }
      }
   }

   /* @param anchors: You can directly specify the anchors (an array with one
    * or two elements), for example when you are importing a text with
    * annotations.  If not specified, the function this.getSelectedTokens
    * will be used.
    */
   getTheElementsToCreateALink(anchors) {
      if (!anchors) {
         anchors = this.getSelectedTokens(false);
      }
      if (anchors.length == 0) {
         return new Array();
      } else if (anchors.length == 1) {
         return anchors;
      } else {
         // the following 'if' is just a shortcut to go faster, you can delete
         // it
         if (anchors[0].parentNode === anchors[1].parentNode) {
            return anchors;
         }
         var one = anchors[0]; 
         var two = anchors[1]; 
         // look for element that share a parent
         var e1 = one
         while (e1.tagName != "P") {
            var e2 = two;
            while (e2.tagName != "P") {
               if (e1.parentNode === e2.parentNode) {
                  return new Array(e1, e2);
               }
               e2 = e2.parentNode;
            }
            e1 = e1.parentNode;
         }
         alert("I can't create the link.");
         this.deselectAllTokensAndLinks();
         return null;
      }
   }

   _createLink() {
      var elementsUsedToCreateTheLink = this.getTheElementsToCreateALink();
      if (elementsUsedToCreateTheLink == null) {
         return null;
      }
      if (!elementsUsedToCreateTheLink.length) {
         alert("No item selected!");
         return false;
      }
      var link = new Link(elementsUsedToCreateTheLink, {});
      this.deselectAllTokensAndLinks();
      return link;
   }

   createLinkAndChain(askForName) {
      var tokenStrings = this.getSelectedTokens(true).map(function(e) { return e.textContent });
      var name = CommonFunctions.getChainName(this.chainColl, askForName,
         tokenStrings);
      if (!name) {
         this.deselectAllTokensAndLinks();
         return false;
      }
      var link = this._createLink();
      if (!link) {
         return false;
      }
      var chain = new Chain(name);
      this.chainColl.addChain(chain);
      chain.addLink(link);
      link.select(); // once the link is added to the chain, so the chain
         // is selected in the popup
      return true;
   }

   createLinkAndAttachItToLastSelectedChain() {
      // get the last selected chain; if null create a chain
      var lastSelectedChain = this.chainColl.getLastSelectedChain();
      if (!lastSelectedChain) {
         return this.createLinkAndChain(false);
      }
      var link = this._createLink();
      if (!link) {
         return false;
      }
      lastSelectedChain.addLink(link);
      link.select(); // once the link is added to the chain, so the chain
         // is selected in the popup
      return true;
   }

   /* Use that to create links and chain when importing a text. */
   importLink(startAnchor, endAnchor, chainName, properties) {
      // link
      var anchors = new Array(startAnchor);
      if (endAnchor && startAnchor != endAnchor) {
         anchors.push(endAnchor);
      }
      var elementsUsedToCreateTheLink
         = this.getTheElementsToCreateALink(anchors);
      if (elementsUsedToCreateTheLink == null
            || !elementsUsedToCreateTheLink.length) {
         alert("I can't create a link!");
         this.deselectAllTokensAndLinks();
         return false;
      }
      var link = new Link(elementsUsedToCreateTheLink, properties);
      // chain
      var chain = this.chainColl.getChainByName(chainName);
      if (!chain) {
         chain = new Chain(chainName);
         this.chainColl.addChain(chain);
      }
      chain.addLink(link);
      return true;
   }

   exportText(inDialog) {
      //TODO
   }

   exportProperties(inDialog) {
      //TODO use this.propertyString
   }

   destroyLink(link) {
      var chain = this.chainColl.getChainByLink(link);
      chain.removeLink(link);
      link.destroy();
      if (!chain.count) {
         this.chainColl.removeChain(chain);
      }
   }

   destroySelectedLink() {
      var link = this.chainColl.getSelectedLink();
      if (!link) {
         return false;
      }
      this.destroyLink(link);
      return true;
   }

   getSelectedChain() {
      var link = this.chainColl.getSelectedLink();
      if (!link) {
         return null;
      }
      return this.chainColl.getChainByLink(link);
   }

   changeColorOfSelectedChain() {
      var chain = this.getSelectedChain();
      if (!chain) {
         return false;
      }
      if (chain.isTrueChain) {
         var chooser = new ColorChooserDialog(
            this.colorManager.getAvailableColors(this.chainColl.chains),
            function(color) { chain.color = color; });
      } else {
         alert("You can't change the color of this chain!");
      }
      return true;
   }

   changeNameOfSelectedChain(askForName, defaultIsCurrentName) {
      var chain = this.getSelectedChain();
      if (!chain) {
         return false;
      }
      var selectedLink = this.chainColl.getSelectedLink();
      var name = undefined;
      if (askForName && defaultIsCurrentName) {
         name = CommonFunctions.getChainName(this.chainColl, true,
            selectedLink._name);
      } else if (askForName) {
         name = CommonFunctions.getChainName(this.chainColl, true,
            selectedLink.words);
      } else {
         name = CommonFunctions.getChainName(this.chainColl, false);
      }
      if (name) {
         chain.name = name;
      }
   }

   selectNextLinkInText(backward, onlyVisible, propertyToFocusOn) {
      var selectedLink = this.chainColl.getSelectedLink();
      var nextLink = this.chainColl.getNextLink(selectedLink, backward,
         onlyVisible);
      if (!nextLink) {
         alert("No more link!");
      } else {
         nextLink.select();
         this.scrollToSelectedLink();
         if (propertyToFocusOn) {
            nextLink.properties.focusOnProperty(propertyToFocusOn);
         }
      }
   }

   selectNextLinkInChain(backward, onlyVisible, propertyToFocusOn) {
      var chain = this.getSelectedChain();
      if (!chain) {
         return false;
      }
      var selectedLink = this.chainColl.getSelectedLink();
      var nextLink = chain.getNextLink(selectedLink, backward, onlyVisible);
      if (!nextLink) {
         alert("No more link!");
      } else {
         nextLink.select();
         this.scrollToSelectedLink();
         if (propertyToFocusOn) {
            nextLink.properties.focusOnProperty(propertyToFocusOn);
         }
      }
   }

   showOnlySelectedChain() {
      var selectedChain = this.getSelectedChain();
      if (!selectedChain) {
         return false;
      }
      for (var chain of this.chainColl.chains) {
         if (chain === selectedChain) {
            chain.show();
         } else {
            chain.hide();
         }
      }
   }

   scrollToSelectedLink(inPopup) {
      var selectedLink = this.chainColl.getSelectedLink();
      if (!selectedLink) {
         return false;
      }
      var win = null;
      if (inPopup) {
         if (!this.chainPopup.win) {
            return; // the popup has not been opened yet
         }
         win = this.chainPopup.win;
         this.chainColl.expandSelectedChainInPopup();
      }
      selectedLink.scrollTo(win);
   }

   showAllChains() {
      for (var chain of this.chainColl.chains) {
         chain.show();
      }
   }

   hideNonTrueChains() {
      for (var chain of this.chainColl.chains) {
         if (!chain.isTrueChain) {
            chain.hide();
         }
      }
   }

   hidePanel() {
      // TODO
   }

   showPanel() {
      // TODO
   }

   /* Substitute the source link by the target link. */
   substituteLink(source, target) {
      var sourceChain = this.chainColl.getChainByLink(source);
      this.chainColl.transferLink(target, sourceChain);
      if (!this.schema.isEmpty) {
         target.properties.copyPropertiesFrom(source.properties);
      }
      this.destroyLink(source);
      target.select();
   }

   /* @param searchedValue: a string or a pattern created with `re'.
    */
   search() {
      if (this.schema.isEmpty) {
         alert("No schema has been defined!");
         return;
      }
      var callback = function(name, searchedValue, reversed) {
         gText.chainColl.applyToAllLinks(function(link) {
            if ((typeof(searchedValue) == 'string' &&
                     link.isEqualTo(name, searchedValue, reversed))
                  || (typeof(searchedValue) == 'object' &&
                  link.matches(name, searchedValue, reversed))) {
               link.show();
            } else {
               link.hide();
            }
         });
      };
      if (!this.searchDialog) {
         this.searchDialog = new SearchDialog(this.schema, callback);
      }
      this.searchDialog.show();
   }

   changeFontSize(plus) {
      // if you want to convert to points (getComputedStyle returns pixels):
      // points = pixel * 72 / 96
      // pixels = point * 96 / 72
      // ===> size = (size * 72.0 / 96.0);
      var pars = this.div.childNodes;
      var step = 1;
      for (var par of pars) {
         var size = parseInt(getComputedStyle(par).fontSize.match(/\d+/)[0]);
         if (plus) {
            size += step;
         } else {
            if (size - step > 1) {
               size -= step;
            }
         }
         par.style.fontSize = size + "px";
      }
   }

   showStatistics() {
      var tokenCount = this.div.getElementsByClassName(CLASS_TOKEN).length;
      var chainCount = this.chainColl.chains.length;
      var linkCount = this.div.getElementsByClassName(CLASS_LINK).length;
      var trueChainCount = 0;
      var trueLinkCount = 0;
      for (var c of this.chainColl.chains) {
         if (c.isTrueChain) {
            trueChainCount++;
            trueLinkCount += c.links.length;
         }
      }
      var mean = trueLinkCount / trueChainCount;
      var msg = '';
      msg += "Number of tokens: "+tokenCount+"\n";
      msg += "Number of referents : "+chainCount+"\n";
      msg += "Number of chains: "+trueChainCount+"\n";
      msg += "Number of referring expressions: "+linkCount+"\n";
      msg += "Number of links: "+trueLinkCount+"\n";
      msg += "Average number of links per chain: "+mean+"\n";
      alert(msg);
   }

}
