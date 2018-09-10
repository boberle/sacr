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

class ColorBuilder {

   static computeNbOfColors(hueStep, saturationStep, lightnessStep) {
      var hue = Math.ceil(360/hueStep);
      var saturation = Math.ceil(100/saturationStep);
      var lightness = Math.ceil(70/lightnessStep); // because ]10;80]
      var nb = hue * saturation * lightness;
      //var count = 0;
      //for (var s=100; s>0; s-=saturationStep) {
      //   for (var l=80; l>10; l-=lightnessStep) {
      //      for (var h=0; h<360; h+=hueStep) {
      //         count++;
      //      }
      //   }
      //}
      //if (nb != count) {
      //   console.log(nb);
      //   console.log(count);
      //   alert('mismatch');
      //}
      return nb;
   }



   static buildColors(hueStep, saturationStep, lightnessStep) {
      // defaults
      if (!hueStep) hueStep = 25;
      if (!saturationStep) saturationStep = 25;
      if (!lightnessStep) lightnessStep = 10;
      // test not enough colors
      //hueStep = 360;
      //saturationStep = 100;
      //lightnessStep = 100;
      var colors = [];
      for (var s=100; s>0; s-=saturationStep) {
         for (var l=80; l>10; l-=lightnessStep) {
            for (var h=0; h<360; h+=hueStep) {
               colors.push(new Color(h, s, l));
            }
         }
      }
      console.log("number of colors: "+colors.length.toString());
      return colors;
   }

}



class Color {

   static rgb2yuv(rgb) {
      var y = Color.clamp(rgb.r *  0.29900 + rgb.g *  0.587   + rgb.b * 0.114);
      var u = Color.clamp(rgb.r * -0.16874 + rgb.g * -0.33126 + rgb.b * 0.50000 + 128);
      var v = Color.clamp(rgb.r *  0.50000 + rgb.g * -0.41869 + rgb.b * -0.08131 + 128);
      return {y:y, u:u, v:v};
   }

   static clamp(n){
      if (n<0) { return 0;}
      if (n>255) { return 255;}
      return Math.floor(n);
   }


   static yuv2rgb(yuv){
      var y = yuv.y;
      var u = yuv.u;
      var v = yuv.v;
      var r = Color.clamp(y + (v - 128) *  1.40200);
      var g = Color.clamp(y + (u - 128) * -0.34414 + (v - 128) * -0.71414);
      var b = Color.clamp(y + (u - 128) *  1.77200);
      return {r:r,g:g,b:b};
   }

   /**
   * adapted from https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h in [0;360], s/l in [0;100]
   */
   static hsl2rgb(h, s, l) {
      var r, g, b;
      h = h/360;
      s = s/100;
      l = l/100;
      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          var hue2rgb = function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }
      return {r:Math.round(r * 255),
         g:Math.round(g * 255), b:Math.round(b * 255)};
   }

   // adapted from https://stackoverflow.com/questions/9600295/automatically-change-text-color-to-assure-readability
   static invertColor(rgb) {
      var yuv = Color.rgb2yuv(rgb);
      var factor = 180;
      var threshold = 100;
      yuv.y = Color.clamp(yuv.y + (yuv.y > threshold ? -factor : factor));
      return Color.yuv2rgb(yuv);
   }

   static parseString(str) {
      var re = /hsl\((\d+), *(\d+)%, *(\d+)%\)/;
      var result = re.exec(str);
      if (result) {
         return new Color(result[1], result[2], result[3]);
      }
      return null;
   }

   constructor(h, s, l) {
      this.h = h;
      this.s = s;
      this.l = l;
      this._string = "hsl("+h+", "+s+"%, "+l+"%)";
      var rgb = Color.hsl2rgb(h, s, l);
      this._transparentString = 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.4)';
      var invertedRgb = Color.invertColor(rgb);
      this._invertedString = "rgb("+invertedRgb.r+","+invertedRgb.g+","
         +invertedRgb.b+")";
   }

   get string() {
      return this._string;
   }

   get invertedString() {
      return this._invertedString;
   }

   get transparentString() {
      return this._transparentString;
   }

   equalsString(str) {
      return str === this._string;
   }

   equalsColor(color) {
      return color.string === this._string;
   }

}

_defaultColor = null;

class ColorManager {

   static getDefaultColor() {
      if (!_defaultColor) {
         _defaultColor = new Color(0, 0, 83);
      }
      return _defaultColor;
   }

   constructor(hueStep, saturationStep, lightnessStep) {
      this.colors = ColorBuilder.buildColors(hueStep, saturationStep,
         lightnessStep);
   }

   doesThisColorExist(color) {
      for (var c of this.colors) {
         if (c.equalsColor(color)) {
            return true;
         }
      }
      return false;
   }

   isThisColorFree(color, chains) {
      if (color.equalsColor(ColorManager.getDefaultColor())) {
         return false;
      }
      for (var chain of chains) {
         if (color.equalsColor(chain.color)) {
            return false;
         }
      }
      return true;
   }


   /* If there is no more available colors, return the default color
    */
   getNextAvailableColor(chains) {
      for (var color of this.colors) {
         if (this.isThisColorFree(color, chains)) {
            return color;
         }
      }
      alert("There is no more color available.  Try to export your "
         +"annotations, reload the script and define more color on the start "
         +"page.  In the meantime, I'm using default color (gray).");
      return ColorManager.getDefaultColor(); // if there is no more color
   }

   getAvailableColors(chains) {
      var that = this;
      return this.colors.filter(
         function(c) { return that.isThisColorFree(c, chains); });
   }

   changeDefaultColor(chains) {
      var colors = this.getAvailableColors(chains);
      var chooser = new ColorChooserDialog(colors, function(color) {
         _defaultColor = color;
         // TODO redraw links and link list
      });
   }

   changeChainColor(chain, chains) {
      var colors = this.getAvailableColors(chains);
      var chooser = new ColorChooserDialog(colors, function(color) {
         chain.color = color;
         // TODO redraw links and link list
      });
   }

}


class ColorChooserDialog {

   constructor(colors, callback) {
      this.callback = callback;
      var div = document.createElement("div");
      div.style.padding = "20px";
      this.modalDiv = new ModalDiv("Color chooser", div);
      var that = this;
      for (var color of colors) {
         var par = document.createElement("p");;
         par.style.padding = "7px";
         par.style.backgroundColor = color.string;
         par.style.color = color.invertedString;
         var anchor = document.createElement("anchor");
         anchor.style.cursor = "pointer";
         anchor.color = color;
         anchor.onclick = function(e) {
            that.callback(this.color);
            that.modalDiv.close();
         };
         var textNode = document.createTextNode("Choose this color!");
         anchor.appendChild(textNode)
         par.appendChild(anchor);
         div.appendChild(par);
      }
      div.style['overflow-y'] = "scroll";
      this.modalDiv.show();
   }

}

