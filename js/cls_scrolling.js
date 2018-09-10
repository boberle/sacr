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


class Scrolling {

   /*
    * To scroll to a DOM object, use must use the function window.scroll(),
    * which is described here:
    * https://developer.mozilla.org/en-US/docs/Web/API/Window/scroll:
    *    window.scroll(x-coord, y-coord)
    * example:
    *    <button onClick="scroll(0, 100);">click to scroll down 100
    *    pixels</button>
    * Note that window.scrollTo() is the same method.
    *
    * But to find the number of pixels you want to scroll, you need to find
    * the vertical position of the object.  For, that, use the function below,
    * found on
    * http://stackoverflow.com/questions/5007530/how-do-i-scroll-to-an-element-using-javascript#5007606
    *    static findPosition(obj) {
    *       var curTop = 0;
    *       if (obj.offsetParent) {
    *          do {
    *             curTop += obj.offsetTop;
    *          } while (obj = obj.offsetParent);
    *       }
    *       return curTop;
    *    }
    *
    * So you just have to call: window.scroll(0, findPosition(yourObject))
    *
   /* return 
    */

   /*
    * Returns the vertical position of an object, in pixels.
    */
   static findPosition(obj) {
      var curTop = 0;
      if (obj.offsetParent) {
         do {
            curTop += obj.offsetTop;
         } while (obj = obj.offsetParent);
      }
      return curTop;
   }


   /*
    * Scroll the window to show the object (a DOM object).
    * @param evenIfNotNeeded: scroll even if the object is already visible.
    */
   static scrollTo(obj, evenIfNotNeeded, win) {
      // scrollOffset is the minimum amount of space (in pixels) to leave at
      // the top of the window, so the obj is not directly at the margin.
      if (!win) {
         win = window;
      }
      var scrollOffset = win.innerHeight / 5;
      var pos = Scrolling.findPosition(obj) - scrollOffset;
      if (pos < 0) {
         pos = 0;
      }
      if (evenIfNotNeeded || !Scrolling.isVisible(obj, win)) {
         win.scroll(0, pos);
      }
   }

   /*
    * Returns the height of the given object.
    */
   static findHeight(obj) {
      var styleObject = getComputedStyle(obj);
      if (styleObject && styleObject.height) {
         var value = styleObject.height.match(/\d+/); // ex.: 40px
         if (value) {
            return parseInt(value[0]); // match returns an array
         }
      }
      return 0;
   }

   /*
    * Returns true if given position is visible on the screen.
    */
   static isVisible(obj, win) {
      if (!win) {
         win = window;
      }
      // the object is above the visible part of the screen
      var pos = Scrolling.findPosition(obj);
      if (pos < win.scrollY) {
         return false;
      }
      // the object (meaning: its bottom) is below the visible part of the
      // screen
      var height = Scrolling.findHeight(obj);
      // note that spans don't seem to have any computable height.  We use one
      // sixth of the window as a rule of thumb
      if (!height) {
         height = win.innerHeight / 6;
      }
      var bottomPos = pos + height;
      var bottomLimit = win.scrollY + win.innerHeight
         - Scrolling.findHeight(gDivLinkPropertyAnchor);
      if (bottomPos > bottomLimit) {
         return false;
      }
      return true;
   }


/*
   // need to scroll to the link only if it is not in the top half
   // part of the windows
   function isScrollNeeded(pos) {
      var minAllowedPos = window.scrollY;
      var maxAllowedPos;
      var divControlsHeight;
      if (divControlsHeight = gCommonFunctions.getDivControlsHeight()) {
         //console.log("using control panel height, which is: " + divControlsHeight);
         maxAllowedPos = minAllowedPos + window.innerHeight - divControlsHeight;
      } else {
         maxAllowedPos = minAllowedPos + (window.innerHeight/2);
      }
      //console.log("windows inner height is: "+window.innerHeight);
      //console.log("element position is: "+pos);
      //console.log("min allowed pos: "+ minAllowedPos);
      //console.log("max allowed pos: "+ maxAllowedPos);
      var estimatedLineHeight = 250;
      return (!(minAllowedPos <= pos && (pos + estimatedLineHeight) <= maxAllowedPos));
   }
*/




}
