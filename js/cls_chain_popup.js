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

/* Issues with stylesheets.  You can specify a <link rel="style.css">
 * thing with JS, but you need a absolute path for href.
 *    var link = this.win.document.createElement("LINK");
 *    link.href = "file:///foo/bar/style.css";
 *    link.type = "text/css";
 *    link.rel = "stylesheet";
 *    this.win.document.head.appendChild(link)
 * Otherwise, you need to use the document.stylesheets objects, which
 * list all the style sheets.  But by default, there is none.  To
 * create one, use:
 *    var styleElement = win.document.createElement('style');
 *    win.document.head.appendChild(styleElement);
 * Now, you have a stylesheet that you can get:
 *    var styleSheet = win.document.styleSheets[0];
 * or
 *    var styleSheet = styleElement.styleSheet
 * Then use can set the text:
 *    styleSheet.cssText = "you text"
 * or
 *    stylesheet.insertRule('p.linkParagraph { padding-left: 15px; }',
 *    index);
 * Note that in the last example, you need to specify an index (the
 * last one if you want the rule to be inserted at the end of the
 * stylesheet: use something with nextIndex++).
 */



class ChainPopup {

   constructor(chainDiv) {
      this.visible = false;
      this.chainDiv = chainDiv;
      // the window
      this.win = undefined;
      this.winWidth = '350';
      this.winHeight = '400';
      this.winTop = '100';
      this.winLeft = '100';
      // the elements
      this.h1 = document.createElement('H1');
      this.h1.appendChild(document.createTextNode('Chains and Links'));
   }

   show() {
      this.visible = true;
      gText.chainColl.sortChainsAndUpdatePopupDiv();
      // if the window is already open, just focus...
      if (this.win && !this.win.closed) {
         this.win.focus();
      } else {
         this.win = window.open("", "_blank", "status=0,width="
            +this.winWidth+",height="+this.winHeight+",top="+this.winTop
            +",left="+this.winLeft
            +",toolbar=0,menubar=0,resizable=1,scrollbars=1");
         if (!this.win) {
            alert("I can't create the popup!");
            return;
         }
         var that = this;
         this.win.onbeforeunload = function(e) {
            that.winWidth = that.win.outerWidth;
            that.winHeight = that.win.outerHeight;
            that.winLeft = that.win.screenX;
            that.winTop = that.win.screenY;
            that.visible = false;
            // next line would be necessary for Chromium, but not FF,
            // if we would keep the elements in the div, like in the
            // Display Options box.  But, because here we remove all
            // the elements of the div and create new ones, it is not
            // necessary.
            //that.win.document.body.removeChild(that.win.document.body.childNodes[1]);
            return null;
         }
         // style sheet
         var link = this.win.document.createElement("LINK");
         link.href = document.styleSheets[0].href;
         link.type = "text/css";
         link.rel = "stylesheet";
         this.win.document.head.appendChild(link)
         // get elements
         this.win.document.title = "Chains and Links";
         this.win.document.body.appendChild(this.h1);
         this.win.document.body.appendChild(this.chainDiv);
         // shortcuts
         this.win.document.body.addEventListener('keydown', gKeyDownHandler);
         /*this.win.document.body.addEventListener('keydown', function (e) {
            var tagName = document.activeElement.tagName;
            //console.log(tagName);
            //console.log(e.keyCode);
            if (tagName != 'BODY') {
               return;
            }
            if (e.keyCode == 65) { // test
               //alert('foo');
            } else if (e.keyCode == 69) { // e = expand/collapse all
               if (e.shiftKey) {
                  gText.chainColl.collapseAllChainsInPopup();
               } else {
                  gText.chainColl.expandAllChainsInPopup();
               }
            } else if (e.keyCode == 72) { // h = help
               alert("c: collapse all\ne: expand all");
            }
         });*/
      } // else
   }

};

