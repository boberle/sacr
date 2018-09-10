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

class ModalDiv {

   constructor(title, contentDiv, hideCancel) {
      this.title = title;
      this.div = null;
      this.contentDiv = contentDiv;
      this.hideCancel = hideCancel;
      this.isCancelled = false;
      this.hasBeenShown = false;
   }

   show() {
      if (this.hasBeenShown) {
         document.body.appendChild(this.div);
      } else {
         // creating the elements
         var heading = document.createElement("h1");
         heading.style.margin = "10px";
         heading.appendChild(document.createTextNode(this.title));
         this.div = document.createElement("DIV");
         this.div.style['overflow-y'] = "scroll";
         this.div.style.backgroundColor = "white";
         this.div.style.position = "fixed";
         this.div.style.top = "0px";
         this.div.style.left = "0px";
         this.div.style.height = "100%";
         this.div.style.width = "100%";
         var cancelButton = document.createElement("input");
         cancelButton.type = "button";
         cancelButton.value = "Cancel";
         cancelButton.style.position = "absolute";
         cancelButton.style.right = "20px";
         cancelButton.style.top = "20px";
         var that = this;
         cancelButton.onclick = function() {
            that.isCancelled = true;
            that.close();
         }
         this.div.appendChild(heading);
         if (!this.hideCancel) this.div.appendChild(cancelButton);
         this.div.appendChild(this.contentDiv);
         document.body.appendChild(this.div);
         this.hasBeenShown = true;
         // following line must be after appending to body
         //this.contentDiv.style.height = (this.div.clientHeight -
         //   heading.clientHeight)+"px";
      }
   }

   close() {
      document.body.removeChild(this.div);
   }

}

