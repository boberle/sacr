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

EDIT_NORMAL = 0;
EDIT_TAB = 1;
EDIT_AUTO = 2;

class Schema {

   constructor(code) {
      this.isEmpty = true;
      this._rawProperties = {}; // name:{dic found in the code}
      this._parse(code);
      this.listOfProperties = {}; // name:{type:"TYPE", values:[VALUES]}
         // (values is empty for textbox and head)
      this.editMode = EDIT_NORMAL;
      this.editInChain = false;
      this.editOnlyVisible = false;
      this._button = null;
      var that = this;
      this._editModeDialog = new EditModeDialog(
         function(editMode, inChain, onlyVisible) {
            that.editMode = editMode;
            that.editInChain = inChain;
            that.editOnlyVisible = onlyVisible;
      });
   }

   _parse(text) {
      var tmp;
      var lines = text.split(/\n+/);
      var cur = null;
      for (var line of lines) {
         if ((line.match(/^\s*(?:#.*)?$/)) != null) {
            // nothing: it's a comment
         } else if (((tmp = line.match(/^PROP:/)) != null)) {
            if (cur) {
               this.addPrototypeProperty(cur);
            }
            var response = CommonFunctions.parseValues(line, 4);
            if (response.startIndex != line.length) {
               alert("Can't parse line: "+line+" (error when reading option values)");
            }
            cur = response.dic;
         } else if (((tmp = line.match(/^\s*(.+)$/)) != null)) {
            if (cur) {
               if (!('values' in cur)) {
                  cur.values = new Array();
               }
               cur.values.push(tmp[1] == '$$$' ? '' : tmp[1]);
            } else {
               alert("Can't parse line: "+line);
            }
         } else {
            alert("Can't parse line: "+line);
         }
      } // for
      if (cur) {
         this.addPrototypeProperty(cur);
      }
   }

   addPrototypeProperty(dic) {
      if ('name' in dic) {
         this._rawProperties[dic['name']] = dic;
         this.isEmpty = false;
         //console.log(dic)
      } else {
         alert("error in the schema: a property doesn't have any name");
      }
   }

   /* @param givenValues: A dictionary (keys are property names (like
    * `gramfunction'), values are property values (like `subject')).  Give an
    * empty dictionary to get a default property list.
    */
   buildLinkProperties(givenValues) {
      var properties = [];
      for (var name in this._rawProperties) {
         this.listOfProperties[name] = {};
         this.listOfProperties[name]['type'] = 'normal'; // default
         this.listOfProperties[name]['values'] = {}; // default
         var setup = this._rawProperties[name];
         var initialValue = "";
         if (name in givenValues) {
            initialValue = givenValues[name];
         } else if (gText.showPropertyWarnings
               && Object.keys(givenValues).length) {
            alert("Property `"+name+"' not found in the file.");
         }
         var prop = new LinkProperty(name, initialValue);
         if ('newline' in setup)
            prop.newLineAfter = (setup['newline'] == 'true');
         if ('showname' in setup)
            prop.showName = (setup['showname'] == 'true');
         if ('textboxsize' in setup)
            prop.textboxSize = setup['textboxsize'];
         if ('type' in setup)
            prop.type = setup['type'];
            this.listOfProperties[name]['type'] = prop.type;
         if ('values' in setup)
            prop.values = setup['values'];
            this.listOfProperties[name]['values'] = prop.values;
         if ('addShortcuts' in setup)
            prop.addShortcuts = setup['addShortcuts'];
         properties.push(prop);
      }
      if (gText.showPropertyWarnings) {
         for (var name in givenValues) {
            if (!(name in this._rawProperties)) {
                  alert("Property `"+name+"' found in the file, but not in the schema.");
            }
         }
      }
      return new LinkProperties(properties);
   }

   get button() {
      if (!this._button) {
         this._button = document.createElement('INPUT');
         this._button.type = 'BUTTON';
         this._button.value = 'Edit Mode';
         var that = this;
         this._button.onclick = function() {
            that._editModeDialog.show();
         };
      }
      return this._button;
   }

}


class LinkProperties {

   constructor(properties) {
      this.properties = properties;
      this.div = document.createElement('DIV');
      for (var property of properties) {
         if (property.showName) {
            this.div.appendChild(document.createTextNode(property.name+": "));
         }
         this.div.appendChild(property.element);
      }
   }

   resetHeadProperty(link) {
      for (var prop of this.properties) {
         if (prop.type == 'head') {
            prop.resetHead(link);
         }
      }
   }

   getString(includeHeadText, content) {
      var props = {};
      for (var property of this.properties) {
         props[property.name] = property.value;
      }
      if (includeHeadText) {
         for (var property of this.properties) {
            if (property.type == 'head') {
               props['head_text'] = property.headText;
            }
         }
      }
      if (content) {
         props['content'] = content;
      }
      var keys = new Array();
      for (var key in props) {
         keys.push(key);
      }
      keys.sort();
      var strings = new Array();
      for (var key of keys) {
         //console.log(key);
         var esc = props[key].replace('"', "&quot;");
         strings.push(key + '="' + esc + '"');
      }
      return strings.join(',');
   }

   copyPropertiesFrom(properties) {
      for (var i=0; i<this.properties.length; i++) {
         //properties.properties[i].setValue(this.properties[i].value);
         this.properties[i].setValue(properties.properties[i].value);
         // note: properties is an instance of LinkProperties, so the array is
         // at properties.properties
      }
   }

   getPropertyByName(name) {
      for (var prop of this.properties) {
         if (prop.name == name) {
            return prop;
         }
      }
      return null;
   }

   focusOnProperty(name) {
      for (var prop of this.properties) {
         if (prop.name == name) {
            prop.element.focus();
         }
      }
   }

}

class LinkProperty {

   constructor(name, initialValue) {
      this.name = name; // the name of the property
      this.initialValue = initialValue;
      this.showName = false; //
      this.type = 'normal'; // normal, head, label (= a textbox), text, ref
      this.newLineAfter = false;
      this.values = []; // an array of possible values (for combo)
      this.addShortcuts = false;
      this.textboxSize = 7;
      this._element = null;
   }

   get value() {
      if (this.type == 'normal') {
         return this._element.options.item(this._element.selectedIndex).value;
      } else if (this.type == 'head') {
         return this._element.options.item(this._element.selectedIndex).value;
      } else if (this.type == 'text') {
         return this._element.value;
      } else {
         return undefined;
      }
   }

   get headText() {
      if (this.type == 'head') {
         return this._element.options.item(this._element.selectedIndex).word;
      } else {
         return "";
      }
   }

   /* use this when substituting a link by an other */
   setValue(value) {
      if (this.type == 'normal') {
         var found = false;
         for (var option of this._element.options) {
            if (option.value == value) {
               option.selected = true;
               found = true;
               break;
            }
         }
         if (!found) {
            alert("can't find the value: `"+value+"'");
         }
      } else if (this.type == 'head') {
         // don't change the value
      } else if (this.type == 'text') {
         this._element.value = value;
      } else {
         // nothing
      }
   }

   get element() {
      if (this._element) {
         return this._element;
      }
      if (this.type == 'normal') {
         this._element = document.createElement('SELECT');
         this.addComboEvents(this._element);
         var first = true;
         var counter = 97;
         for (var choice of this.values) {
            var option = document.createElement('OPTION');
            option.value = choice;
            if (this.addShortcuts) {
               if (option.value) {
                  option.text = String.fromCharCode(counter++)+" "+option.value;
               } else {
                  option.text = option.value;
               }
            } else {
               option.text = option.value;
            }
            this._element.add(option);
            if (first || this.initialValue === choice) {
               option.selected = true;
               first = false;
            }
         }
         if (gText.showPropertyWarnings) {
            if (this.values.indexOf(this.initialValue) == -1) {
               alert("Unknown property value `"+this.initialValue+"'.");
            }
         }
      } else if (this.type == 'head') {
         this._element = document.createElement('SELECT');
         this.addComboEvents(this._element);
      } else if (this.type == 'text') {
         this._element = document.createElement('INPUT');
         this._element.type = 'TEXT';
         this.addTextboxEvents(this._element);
         if (this.initialValue) {
            this._element.value = this.initialValue;
         }
         var size = parseInt(this.textboxSize);
         if (!isNaN(size)) {
            this._element.size = size;
         }
      } else {
         alert("Unknown property type: "+this.type+".");
      }
      return this._element;
   }

   addComboEvents(control) {
      var that = this;
      control.onchange = function(e) {
         if (gText.schema.editMode == EDIT_AUTO) {
            if (gText.schema.editInChain) {
               gText.selectNextLinkInChain(false, gText.schema.editOnlyVisible,
                  that.name);
            } else {
               gText.selectNextLinkInText(false, gText.schema.editOnlyVisible,
                  that.name);
            }
         }
      }
      // onkeypress is used for tab, and tab only
      control.onkeypress = function(e) {
         if (gText.schema.editMode == EDIT_AUTO
               || gText.schema.editMode == EDIT_TAB) {
            if (e.keyCode == 9 && e.shiftKey) { // backward tab
               if (gText.schema.editInChain) {
                  gText.selectNextLinkInChain(true,
                     gText.schema.editOnlyVisible, that.name);
               } else {
                  gText.selectNextLinkInText(true,
                     gText.schema.editOnlyVisible, that.name);
               }
            } else if (e.keyCode == 9) {
               if (gText.schema.editInChain) {
                  gText.selectNextLinkInChain(false,
                     gText.schema.editOnlyVisible, that.name);
               } else {
                  gText.selectNextLinkInText(false,
                     gText.schema.editOnlyVisible, that.name);
               }
            }
         }
      };
      control.onkeydown = function(e) {
         if (e.keyCode == 52 && e.shiftKey) { // $
            if (this.tagName == "SELECT") {
               for (var option of this.options) {
                  if (option.value == "") {
                     option.selected = true;
                     this.onchange();
                     break;
                  }
               }
            }
         } else if (e.keyCode == 32) { // space
            if (gText.schema.editMode == EDIT_AUTO) {
               if (gText.schema.editInChain) {
                  gText.selectNextLinkInChain(false,
                     gText.schema.editOnlyVisible, that.name);
               } else {
                  gText.selectNextLinkInText(false,
                     gText.schema.editOnlyVisible, that.name);
               }
            }
         }
      }
      // onkeyup is used for key other then tab: don't do that
      // in onkeypress, otherwise the selection is not saved!
      control.onkeyup = function(e) {
         // nothing
      };
   }

   addTextboxEvents(control) {
      var that = this;
      control.onkeypress = function(e) {
         if (gText.schema.editMode == EDIT_AUTO
               || gText.schema.editMode == EDIT_TAB) {
            if (e.keyCode == 9 && e.shiftKey) { // backward tab
               if (gText.schema.editInChain) {
                  gText.selectNextLinkInChain(true,
                     gText.schema.editOnlyVisible, that.name);
               } else {
                  gText.selectNextLinkInText(true,
                     gText.schema.editOnlyVisible, that.name);
               }
            } else if (e.keyCode == 9) {
               if (gText.schema.editInChain) {
                  gText.selectNextLinkInChain(false,
                     gText.schema.editOnlyVisible, that.name);
               } else {
                  gText.selectNextLinkInText(false,
                     gText.schema.editOnlyVisible, that.name);
               }
            }
         }
      };


   }

   resetHead(link) {
      if (this.type != 'head') {
         return;
      }
      var words = link.words;
      // first
      this.values = new Array('');
      var option = document.createElement('OPTION');
      option.value = '';
      option.text = '';
      this.element.add(option); // and NOT this._element !
      option.selected = true;
      // other
      for (var i=0; i<words.length; i++) {
         var option = document.createElement('OPTION');
         this.values.push(i.toString());
         option.value = i.toString();
         option.word = words[i];
         option.text = i.toString()+": "+words[i];
         this.element.add(option); // and NOT this._element !
         if (this.initialValue == option.value) {
            option.selected = true;
         }
      }
   }

}



class SearchDialog {

   constructor(schema, callback) {
      this.callback = callback;
      var div = document.createElement("div");
      div.style.padding = "20px";
      this.modalDiv = new ModalDiv("Search box", div);
      var that = this;
      // selection paragraph
      var par = document.createElement('P');
      div.appendChild(par);
      var checkUseRegex = document.createElement('INPUT');
      checkUseRegex.type = 'CHECKBOX';
      par.appendChild(checkUseRegex);
      par.appendChild(document.createTextNode("use regex"));
      // two paragraphs
      var equalPar = document.createElement('P');
      div.appendChild(equalPar);
      var matchPar = document.createElement('P');
      matchPar.style.display = "none";
      div.appendChild(matchPar);
      // checkbox
      checkUseRegex.onchange = function(e) {
         if (this.checked) {
            equalPar.style.display = "none";
            matchPar.style.display = "block";
         } else {
            equalPar.style.display = "block";
            matchPar.style.display = "none";
         }
      };
      // controls for equalPar
      var equalProperty = document.createElement('select');
      equalPar.appendChild(equalProperty);
      //console.log(schema.listOfProperties);
      for (var propName in schema.listOfProperties) {
         if (schema.listOfProperties[propName]['type'] == 'normal') {
            var option = document.createElement('option');
            option.value = propName;
            option.text = propName;
            equalProperty.appendChild(option);
         }
      }
      var equalOperator = document.createElement('select');
      equalPar.appendChild(equalOperator);
      for (var op of ['is equal to', 'is not equal to']) {
         var option = document.createElement('option');
         option.value = op;
         option.text = op;
         equalOperator.appendChild(option);
      }
      var equalValue = document.createElement('select');
      equalPar.appendChild(equalValue);
      equalProperty.onchange = function(e) {
         var propName = this.options.item(this.selectedIndex).value;
         var values = schema.listOfProperties[propName]['values'];
         while (equalValue.options.length > 0) {                
            equalValue.remove(0);
         } 
         for (var value of values) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            equalValue.appendChild(option);
         }
      };
      equalProperty.onchange();
      // controls for matchPar
      var matchProperty = document.createElement('select');
      matchPar.appendChild(matchProperty);
      for (var propName in schema.listOfProperties) {
         var option = document.createElement('option');
         option.value = propName;
         option.text = propName;
         matchProperty.appendChild(option);
      }
      var matchOperator = document.createElement('select');
      matchPar.appendChild(matchOperator);
      for (var op of ['matches', 'does not match']) {
         var option = document.createElement('option');
         option.value = op;
         option.text = op;
         matchOperator.appendChild(option);
      }
      var matchValue = document.createElement('input');
      matchValue.type = "text";
      matchPar.appendChild(matchValue);
      // search button
      var buttonPar = document.createElement('P');
      div.appendChild(buttonPar);
      var button = document.createElement('input');
      button.type = "button";
      button.value = "search";
      buttonPar.appendChild(button);
      buttonPar.onclick = function(e) {
         var name, searchedValue, reversed;
         if (checkUseRegex.checked) {
            name = matchProperty.options.item(matchProperty.selectedIndex).value;
            op = matchOperator.options.item(matchOperator.selectedIndex).value;
            if (op == 'matches') {
               reversed = false;
            } else {
               reversed = true;
            }
            var value = matchValue.value;
            if (!value) {
               value = "^$";
            }
            try {
               searchedValue = new RegExp(value);
            } catch(err) {
               searchedValue = null;
               alert("Invalid regular expression.");
            }
         } else {
            name = equalProperty.options.item(equalProperty.selectedIndex).value;
            op = equalOperator.options.item(equalOperator.selectedIndex).value;
            if (op == 'is equal to') {
               reversed = false;
            } else {
               reversed = true;
            }
            searchedValue =
               equalValue.options.item(equalValue.selectedIndex).value;
         }
         if (searchedValue !== null) { // see the try/catch above
            that.callback(name, searchedValue, reversed); // if searchedValue
               // is a string, it will be used with an `equal to' function,
               // otherwise with a regex function
            that.modalDiv.close();
         }
      };
      div.style['overflow-y'] = "scroll";
   }

   show() {
      this.modalDiv.show();
   }

}


class EditModeDialog {

   constructor(callback) {
      this.callback = callback;
      var div = document.createElement("div");
      div.style.padding = "20px";
      this.modalDiv = new ModalDiv("Edit mode", div);
      var that = this;
      var par = document.createElement('P');
      div.appendChild(par);
      par.appendChild(document.createTextNode("Choose the edit mode: "));
      // combo
      var comboEditMode = document.createElement('select');
      par.appendChild(comboEditMode);
      var modes = ["normal: html elements behave normally",
         "tab-mode: use tab on a property control to go to the next link",
         "auto-mode: setting a property automatically put you on the next link"];
      var first = true;
      for (var i=0; i<modes.length; i++) {
         var option = document.createElement('option');
         option.value = i.toString();
         option.text = modes[i];
         comboEditMode.appendChild(option);
         if (first) {
            option.selected = true;
            first = false;
         }
      }
      // checkboxes
      par = document.createElement('P');
      div.appendChild(par);
      var checkInChain = document.createElement('INPUT');
      checkInChain.type = 'CHECKBOX';
      par.appendChild(checkInChain);
      par.appendChild(document.createTextNode("only links on the same chain"));
      var checkOnlyVisible = document.createElement('INPUT');
      checkOnlyVisible.type = 'CHECKBOX';
      par.appendChild(checkOnlyVisible);
      par.appendChild(document.createTextNode("only visible links"));
      // ok button
      par = document.createElement('P');
      div.appendChild(par);
      var buttonPar = document.createElement('P');
      par.appendChild(buttonPar);
      var button = document.createElement('input');
      button.type = "button";
      button.value = "save";
      buttonPar.appendChild(button);
      buttonPar.onclick = function(e) {
         var editMode, inChain, onlyVisible;
         editMode = comboEditMode.options.item(comboEditMode.selectedIndex).value;
         inChain = checkInChain.checked;
         onlyVisible = checkOnlyVisible.checked;
         that.callback(editMode, inChain, onlyVisible);
         that.modalDiv.close();
      };
      div.style['overflow-y'] = "scroll";
   }

   show() {
      this.modalDiv.show();
   }

}
