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

/*
 *
 * The sample text, "Le Laboureur et l'Aigle" from Aesop, has been dowloaded
 * from fr.wikisource.org
 * (https://fr.wikisource.org/wiki/Fables_d%E2%80%99%C3%89sope/Le_Laboureur_et_l%E2%80%99Aigle)
 * for the French version, and from en.wikisource.org for the English version.
 * It is distributed under the terms of the CC BY-SA-3.0 licence, which you
 * can find online
 * (https://creativecommons.org/licenses/by-sa/3.0/legalcode.fr) and is
 * reproduced in the file LICENSE_FOR_SAMPLE_TEXT.
 *
 */

/* TODO
      if (navigator.userAgent.search(/Win/i) != -1) {
         if (confirm("You are using Windows!  I will use Windows line-endings (rather than default Unix line-endings), unless you press Cancel.")) {
            result = result.replace(/\n/g, "\r\n");
         }
      }

 */

class DataLoader {

   static getSampleTextWithAnnotations() {
      //return "Le petit chat.\n\nIl est parti...";
      //return '#title:Le Laboureur et l\'Aigle (Ésope, Fables, traduction Chambry)\n\n{laboureur:categorie="i nom indéfini",fonction="s sujet",head="1: laboureur",expansion="" Un laboureur}, ayant trouvé {aigle:categorie="i nom indéfini",fonction="v compl (verbe)",head="1: aigle",expansion="v" un aigle pris {filet:categorie="d nom défini",fonction="c circonstant",head="1: filet",expansion="" au filet}}, fut si frappé de {beauteAigle:categorie="p nom possessif",fonction="v compl (verbe)",head="1: beauté",expansion="n" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0: sa",expansion="" sa} beauté} qu\'{laboureur:categorie="s pronom personnel",fonction="s sujet",head="0: il",expansion="" il} {aigle:categorie="s pronom personnel",fonction="v compl (verbe)",head="0: le",expansion="" le} délivra et {aigle:categorie="s pronom personnel",fonction="v compl (verbe)",head="0: lui",expansion="" lui} donna {liberteAigle:categorie="d nom défini",fonction="v compl (verbe)",head="1: liberté",expansion="" la liberté}. {aigle:categorie="d nom défini",fonction="s sujet",head="1: aigle",expansion="" L\'aigle} ne {aigle:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0: se",expansion="" se} montra pas ingrat envers {laboureur:categorie="p nom possessif",fonction="v compl (verbe)",head="1: bienfaiteur",expansion="n" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0: son",expansion="" son} bienfaiteur}; mais {laboureur:categorie="s pronom personnel",fonction="v compl (verbe)",head="0: le",expansion="" le} voyant assis au pied d\'{mur:categorie="i nom indéfini",fonction="c circonstant",head="1: mur",expansion="v" un mur {mur:categorie="r pronom relatif",fonction="s sujet",head="0: qui",expansion="" qui} menaçait ruine}, {aigle:categorie="s pronom personnel",fonction="s sujet",head="0: il",expansion="" il} vola vers {laboureur:categorie="s pronom personnel",fonction="v compl (verbe)",head="0: lui",expansion="" lui} et enleva dans {griffes:categorie="p nom possessif",fonction="c circonstant",head="1: griffes",expansion="" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0: ses",expansion="" ses} griffes} {bandeau:categorie="d nom défini",fonction="v compl (verbe)",head="1: bandeau",expansion="v" le bandeau {bandeau:categorie="r pronom relatif",fonction="s sujet",head="0: qui",expansion="" qui} {laboureur:categorie="s pronom personnel",fonction="v compl (verbe)",head="0: lui",expansion="" lui} ceignait {teteLaboureur:categorie="d nom défini",fonction="v compl (verbe)",head="1: tête",expansion="" la tête}}. {laboureur:categorie="d nom défini",fonction="s sujet",head="1: homme",expansion="" L\'homme} {laboureur:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0: se",expansion="" se} leva et {laboureur:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0: se",expansion="" se} mit à {poursuite:categorie="p nom possessif",fonction="v compl (verbe)",head="1: poursuite",expansion="n" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0: sa",expansion="" sa} poursuite}. {aigle:categorie="d nom défini",fonction="s sujet",head="1: aigle",expansion="" L\'aigle} laissa tomber {bandeau:categorie="d nom défini",fonction="",head="1: bandeau",expansion="" le bandeau}. {laboureur:categorie="d nom défini",fonction="s sujet",head="1: laboureur",expansion="" Le laboureur} {bandeau:categorie="s pronom personnel",fonction="",head="0: le",expansion="" le} ramassa, et revenant sur {pas:categorie="p nom possessif",fonction="v compl (verbe)",head="1: pas",expansion="n" {laboureur:categorie="e déterminant possessif",fonction="n compl (nom)",head="0: ses",expansion="" ses} pas}, {laboureur:categorie="s pronom personnel",fonction="s sujet",head="0: il",expansion="" il} trouva {mur:categorie="d nom défini",fonction="",head="1: mur",expansion="" le mur écroulé} à l\'endroit où {laboureur:categorie="s pronom personnel",fonction="s sujet",head="0: il",expansion="" il} {laboureur:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0: s",expansion="" s}\'était assis, et fut bien étonné d\'être ainsi payé de retour.\n\n************************************************************************\n\nIl faut rendre {services:categorie="d nom défini",fonction="v compl (verbe)",head="1: services",expansion="v" les services {services:categorie="r pronom relatif",fonction="v compl (verbe)",head="0: qu",expansion="" qu}\'{on:categorie="s pronom personnel",fonction="s sujet",head="0: on",expansion="" on} a reçus} [...].\n'
      return '#title:Le Laboureur et l\'Aigle (Ésope, Fables, traduction Chambry)\n\n{laboureur:categorie="i nom indéfini",fonction="s sujet",head="1",expansion="" Un laboureur}, ayant trouvé {aigle:categorie="i nom indéfini",fonction="v compl (verbe)",head="1",expansion="v" un aigle pris {filet:categorie="d nom défini",fonction="c circonstant",head="1",expansion="" au filet}}, fut si frappé de {beauteAigle:categorie="p nom possessif",fonction="v compl (verbe)",head="1",expansion="n" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0",expansion="" sa} beauté} qu\'{laboureur:categorie="s pronom personnel",fonction="s sujet",head="0",expansion="" il} {aigle:categorie="s pronom personnel",fonction="v compl (verbe)",head="0",expansion="" le} délivra et {aigle:categorie="s pronom personnel",fonction="v compl (verbe)",head="0",expansion="" lui} donna {liberteAigle:categorie="d nom défini",fonction="v compl (verbe)",head="1",expansion="" la liberté}. {aigle:categorie="d nom défini",fonction="s sujet",head="1",expansion="" L\'aigle} ne {aigle:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0",expansion="" se} montra pas ingrat envers {laboureur:categorie="p nom possessif",fonction="v compl (verbe)",head="1",expansion="n" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0",expansion="" son} bienfaiteur}; mais {laboureur:categorie="s pronom personnel",fonction="v compl (verbe)",head="0",expansion="" le} voyant assis au pied d\'{mur:categorie="i nom indéfini",fonction="c circonstant",head="1",expansion="v" un mur {mur:categorie="r pronom relatif",fonction="s sujet",head="0",expansion="" qui} menaçait ruine}, {aigle:categorie="s pronom personnel",fonction="s sujet",head="0",expansion="" il} vola vers {laboureur:categorie="s pronom personnel",fonction="v compl (verbe)",head="0",expansion="" lui} et enleva dans {griffes:categorie="p nom possessif",fonction="c circonstant",head="1",expansion="" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0",expansion="" ses} griffes} {bandeau:categorie="d nom défini",fonction="v compl (verbe)",head="1",expansion="v" le bandeau {bandeau:categorie="r pronom relatif",fonction="s sujet",head="0",expansion="" qui} {laboureur:categorie="s pronom personnel",fonction="v compl (verbe)",head="0",expansion="" lui} ceignait {teteLaboureur:categorie="d nom défini",fonction="v compl (verbe)",head="1",expansion="" la tête}}. {laboureur:categorie="d nom défini",fonction="s sujet",head="1",expansion="" L\'homme} {laboureur:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0",expansion="" se} leva et {laboureur:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0",expansion="" se} mit à {poursuite:categorie="p nom possessif",fonction="v compl (verbe)",head="1",expansion="n" {aigle:categorie="e déterminant possessif",fonction="n compl (nom)",head="0",expansion="" sa} poursuite}. {aigle:categorie="d nom défini",fonction="s sujet",head="1",expansion="" L\'aigle} laissa tomber {bandeau:categorie="d nom défini",fonction="",head="1",expansion="" le bandeau}. {laboureur:categorie="d nom défini",fonction="s sujet",head="1",expansion="" Le laboureur} {bandeau:categorie="s pronom personnel",fonction="",head="0",expansion="" le} ramassa, et revenant sur {pas:categorie="p nom possessif",fonction="v compl (verbe)",head="1",expansion="n" {laboureur:categorie="e déterminant possessif",fonction="n compl (nom)",head="0",expansion="" ses} pas}, {laboureur:categorie="s pronom personnel",fonction="s sujet",head="0",expansion="" il} trouva {mur:categorie="d nom défini",fonction="",head="1",expansion="" le mur écroulé} à l\'endroit où {laboureur:categorie="s pronom personnel",fonction="s sujet",head="0",expansion="" il} {laboureur:categorie="f pronom réfléchi",fonction="v compl (verbe)",head="0",expansion="" s}\'était assis, et fut bien étonné d\'être ainsi payé de retour.\n\n************************************************************************\n\nIl faut rendre {services:categorie="d nom défini",fonction="v compl (verbe)",head="1",expansion="v" les services {services:categorie="r pronom relatif",fonction="v compl (verbe)",head="0",expansion="" qu}\'{on:categorie="s pronom personnel",fonction="s sujet",head="0",expansion="" on} a reçus} [...].\n\n#COLOR:laboureur=hsl(0, 100%, 80%)\n#COLOR:aigle=hsl(25, 100%, 80%)\n#COLOR:mur=hsl(75, 100%, 80%)\n#COLOR:bandeau=hsl(50, 100%, 80%)\n\n#TOKENIZATION-TYPE:1\n';
      //return '#title:The Peasant and the Eagle (Aesop), translated by G. F. Townsend (1887)\n\n{Peasant:function="s subject",head="1",partofspeech="i noun with indefinite article" A Peasant} found {Eagle:function="o object",head="1",partofspeech="i noun with indefinite article" an Eagle captured in {M3:function="a adverbial",head="1",partofspeech="i noun with indefinite article" a trap}}, and much admiring {Eagle:function="o object",head="1",partofspeech="d noun with definite article" the bird}, set {Peasant:function="o object",head="0",partofspeech="s personnal pronoun" him} free. {Eagle:function="s subject",head="1",partofspeech="d noun with definite article" The Eagle} did not prove ungrateful to {Peasant:function="o object",head="1",partofspeech="n noun with determiner" {Eagle:function="t other",head="0",partofspeech="e possessive adjective" his} deliverer}, for seeing {Peasant:function="o object",head="1",partofspeech="d noun with definite article" the Peasant sitting under {Wall:function="a adverbial",head="1",partofspeech="i noun with indefinite article" a wall {Wall:function="s subject",head="0",partofspeech="r relative pronoun" which} was not safe}}, {Eagle:function="s subject",head="0",partofspeech="s personnal pronoun" he} flew toward {Peasant:function="a adverbial",head="0",partofspeech="s personnal pronoun" him} and with {M14:function="a adverbial",head="1",partofspeech="n noun with determiner" {Eagle:function="t other",head="0",partofspeech="e possessive adjective" his} talons} snatched {Bundle:function="o object",head="1",partofspeech="i noun with indefinite article" a bundle} from {M17:function="a adverbial",head="1",partofspeech="t noun without determiner" {Peasant:function="t other",head="0",partofspeech="e possessive adjective" his} head}. When {Peasant:function="s subject",head="1",partofspeech="d noun with definite article" the Peasant} rose in pursuit, {Eagle:function="s subject",head="1",partofspeech="d noun with definite article" the Eagle} let {Bundle:function="o object",head="1",partofspeech="d noun with definite article" the bundle} fall again. Taking {Bundle:function="o object",head="0",partofspeech="s personnal pronoun" it} up, {Peasant:function="s subject",head="1",partofspeech="d noun with definite article" the man} returned to {M24:function="a adverbial",head="2",partofspeech="d noun with definite article" the same place}, to find that {Wall:function="s subject",head="1",partofspeech="d noun with definite article" the wall under {Wall:function="a adverbial",head="0",partofspeech="r relative pronoun" which} {Peasant:function="s subject",head="0",partofspeech="s personnal pronoun" he} had been sitting} had fallen to pieces; and {Peasant:function="s subject",head="0",partofspeech="s personnal pronoun" he} marveled at {M29:function="o object",head="1",partofspeech="d noun with definite article" the service} rendered {Peasant:function="o object",head="0",partofspeech="s personnal pronoun" him} by {Eagle:function="a adverbial",head="1",partofspeech="d noun with definite article" the Eagle}.\n\n\n\n#COLOR:Peasant=hsl(200, 100%, 80%)\n#COLOR:Eagle=hsl(0, 100%, 80%)\n#COLOR:Wall=hsl(50, 100%, 70%)\n#COLOR:Bundle=hsl(100, 100%, 80%)\n\n#TOKENIZATION-TYPE:1\n\n';

   }

   static getSampleTextWithoutAnnotations() {
      //return "Le petit chat.";
      //return "#title:The Peasant and the Eagle (Aesop), translated by G. F. Townsend (1887)\n\nA Peasant found an Eagle captured in a trap, and much admiring the bird, set him free. The Eagle did not prove ungrateful to his deliverer, for seeing the Peasant sitting under a wall which was not safe, he flew toward him and with his talons snatched a bundle from his head. When the Peasant rose in pursuit, the Eagle let the bundle fall again. Taking it up, the man returned to the same place, to find that the wall under which he had been sitting had fallen to pieces; and he marveled at the service rendered him by the Eagle.";
      return "#Le Laboureur et l'Aigle (Ésope, Fables, traduction Chambry)\n\nUn laboureur, ayant trouvé un aigle pris au filet, fut si frappé de sa beauté qu'il le délivra et lui donna la liberté. L'aigle ne se montra pas ingrat envers son bienfaiteur; mais le voyant assis au pied d'un mur qui menaçait ruine, il vola vers lui et enleva dans ses griffes le bandeau qui lui ceignait la tête. L'homme se leva et se mit à sa poursuite. L'aigle laissa tomber le bandeau. Le laboureur le ramassa, et revenant sur ses pas, il trouva le mur écroulé à l'endroit où il s'était assis, et fut bien étonné d'être ainsi payé de retour.\n\n************************************************************************\n\nIl faut rendre les services qu'on a reçus [...].\n";
   }

   static getSampleSchema() {
      return "PROP:name=categorie\n$$$\nn nom propre\nt nom sans déterminant\nd nom défini\ni nom indéfini\np nom possessif\nm nom démonstratif\ns pronom personnel\nf pronom réfléchi\nr pronom relatif\no pronom démonstratif\nz pronom zéro\ne déterminant possessif\n\nPROP:name=fonction\n$$$\ns sujet\nv compl (verbe)\nn compl (nom)\na compl (adjectif)\nc circonstant\nt autre\nh titre, parenthèse\n\nPROP:name=head,type=head\n\nPROP:name=expansion,type=text\n";
      //return "PROP:name=partofspeech\n$$$\nd noun with definite article\ni noun with indefinite article\nn noun with determiner\nt noun without determiner\ns personnal pronoun\nr relative pronoun\ne possessive adjective\n\nPROP:name=function\n$$$\ns subject\no object\nm noun modifier\na adverbial\nt other\n\nPROP:name=head,type=head\n";
   }

   /* @param go: empty, or 'withAnnotations' or 'withoutAnnotations' */
   constructor(callback, go) {
      this.callback = callback;
      var div = document.createElement('DIV');
      this.parseButton = undefined;
      this.hueStep = 25; // before _populateDiv
      this.saturationStep = 25; // before _populateDiv
      this.ligthnessStep = 10; // before _populateDiv
      this._populateDiv(div, go);
      div.style.padding = "10px";
      this.modalDiv = new ModalDiv("SACR - Coreference Chain Annotation Tool - " + VERSION, div, true);
      this.modalDiv.show();
      this.textFilename = "default";
      this.schema = "";
      this.text = "";
      this.showPropertyWarnings = false;
      this.minLinks = 2;
      this.tokenizationType = TOKENIZATION_WORD;
   }

   _populateDiv(div, go) {
      var that = this;
      var t, p, ul, li, input;
      // use firefox
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Please use "
         + "<a href=\"http://firefox.com\" target=\"_blank\">Firefox</a>, "
         + "or at least "
         + "<a href=\"https://www.chromium.org/Home\" target=\"_blank\">Chromium</a> "
         + "or Google Chrome!";
      //p.style.color = 'red';
      p.style.fontStyle = 'italic';
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "You will find a user guide "
         + "<a href=\"../user_guide.pdf\" target=\"_blank\">here</a>"
         + ", and some video tutorials (in French) "
         + "<a href=\"http://boberle.com/projects/sacr\" target=\"_blank\">here</a>"
         + ".";
      p.style.fontStyle = 'italic';
      div.appendChild(document.createElement('HR'));
      // text
      var textareaText = document.createElement('TEXTAREA');
      textareaText.cols = 90;
      textareaText.rows = 20;
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Write or paste the <b>text</b> in the text area below, or use one of these options:";
      ul = document.createElement('UL');
      p.appendChild(ul);
      li = document.createElement('LI');
      ul.appendChild(li);
      t = document.createTextNode("load a file: ");
      li.appendChild(t);
      var inputText = document.createElement('INPUT');
      li.appendChild(inputText);
      inputText.type = 'file';
      inputText.onchange = function(){
         var reader = new FileReader();
         reader.onload = function(e) {
            textareaText.value = e.target.result;
         };
         reader.readAsText(this.files[0]);
         that.textFilename = this.files[0].name;
      };
      li = document.createElement('LI');
      ul.appendChild(li);
      t = document.createTextNode("use a text from Aesop: ");
      li.appendChild(t);
      input = document.createElement('INPUT');
      li.appendChild(input);
      input.type = 'button';
      input.value = "with annotations";
      input.onclick = function() {
         textareaText.value = DataLoader.getSampleTextWithAnnotations();
      }
      if (go == 'withAnnotations') {
         textareaText.value = DataLoader.getSampleTextWithAnnotations();
      }
      t = document.createTextNode(" or ");
      li.appendChild(t);
      input = document.createElement('INPUT');
      li.appendChild(input);
      input.type = 'button';
      input.value = "without annotation";
      input.onclick = function() {
         textareaText.value = DataLoader.getSampleTextWithoutAnnotations();
      }
      if (go == 'withoutAnnotations') {
         textareaText.value = DataLoader.getSampleTextWithoutAnnotations();
      }
      div.appendChild(textareaText);
      // properties
      var textareaProperties = document.createElement('TEXTAREA');
      textareaProperties.cols = 90;
      textareaProperties.rows = 20;
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Write or paste the <b>properties</b> in the text area below, or use one of these options:";
      ul = document.createElement('UL');
      p.appendChild(ul);
      li = document.createElement('LI');
      ul.appendChild(li);
      t = document.createTextNode("load a file: ");
      li.appendChild(t);
      var inputSchema = document.createElement('INPUT');
      li.appendChild(inputSchema);
      inputSchema.type = 'file';
      inputSchema.onchange = function(){
         var reader = new FileReader();
         reader.onload = function(e) {
            textareaProperties.value = e.target.result;
         };
         reader.readAsText(this.files[0]);
      };
      li = document.createElement('LI');
      ul.appendChild(li);
      t = document.createTextNode("use a ");
      li.appendChild(t);
      input = document.createElement('INPUT');
      li.appendChild(input);
      input.type = 'button';
      input.value = "default schema";
      input.onclick = function() {
         textareaProperties.value = DataLoader.getSampleSchema();
      }
      if (go == 'withAnnotations') {
         textareaProperties.value = DataLoader.getSampleSchema();
      }
      div.appendChild(textareaProperties);
      // number of link
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Enter the minimum number of links of a chain: ";
      input = document.createElement('INPUT');
      p.appendChild(input);
      input.type = 'number';
      input.min = '1';
      input.max = '50';
      input.value = '2';
      input.style.width = '70px'; // size attribute doesn't work for `number'
      input.onchange = function() {
         that.minLinks = this.value;
      };
      // number of colors
      p = document.createElement('P');
      div.appendChild(p);
      p.appendChild(document.createTextNode("You may want to tweak the number of colors, only if you need more colors: "));
      var colorSpan = document.createElement('SPAN');
      p.appendChild(colorSpan);
      var ul = document.createElement('UL');
      div.appendChild(ul);
      var li = document.createElement('LI');
      ul.appendChild(li)
      // hue
      li.appendChild(document.createTextNode("hue step: "));
      input = document.createElement('INPUT');
      li.appendChild(input);
      input.type = 'number';
      input.min = '10';
      input.max = '50';
      input.value = this.hueStep;
      input.style.width = '70px'; // size attribute doesn't work for `number'
      input.onchange = function() {
         that.hueStep = parseInt(this.value);
         colorSpan.innerHTML = "("+that.computeNbOfColors().toString()+" colors)";
      };
      // saturation
      li.appendChild(document.createTextNode(" saturation step: "));
      input = document.createElement('INPUT');
      li.appendChild(input);
      input.type = 'number';
      input.min = '10';
      input.max = '50';
      input.value = this.saturationStep;
      input.style.width = '70px'; // size attribute doesn't work for `number'
      input.onchange = function() {
         that.saturationStep = parseInt(this.value);
         colorSpan.innerHTML = "("+that.computeNbOfColors().toString()+" colors)";
      };
      // lightness
      li.appendChild(document.createTextNode(" lightness step: "));
      input = document.createElement('INPUT');
      li.appendChild(input);
      input.type = 'number';
      input.min = '5';
      input.max = '25';
      input.value = this.ligthnessStep;
      input.style.width = '70px'; // size attribute doesn't work for `number'
      input.onchange = function() {
         that.ligthnessStep = parseInt(this.value);
         colorSpan.innerHTML = "("+that.computeNbOfColors().toString()+" colors)";
      };
      input.onchange();
      // tokenization type
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Choose the tokenization type: ";
      var select = document.createElement('SELECT');
      p.appendChild(select);
      for (var type of new Array('word', 'word and punctuation', 'character')) {
         var option = document.createElement('OPTION');
         option.text = type;
         select.appendChild(option);
      }
      select.selectedIndex = 0; // default
      this.tokenizationType = TOKENIZATION_WORD; // default
      select.onchange = function() {
         if (this.selectedIndex == 0) {
            that.tokenizationType = TOKENIZATION_WORD;
         } else if (this.selectedIndex == 1) {
            that.tokenizationType = TOKENIZATION_WORD_N_PUNCT;
         } else {
            that.tokenizationType = TOKENIZATION_CHARACTER;
         }
      }
      // show property warnings
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Show property warnings: ";
      var checkPropertyWarnings = document.createElement('INPUT');
      checkPropertyWarnings.type = 'CHECKBOX';
      checkPropertyWarnings.checked = true;
      p.appendChild(checkPropertyWarnings);
      // parse the data
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "Then click the button to ";
      input = document.createElement('INPUT');
      p.appendChild(input);
      input.type = 'button';
      input.value = "parse the data";
      input.onclick = function() {
         if (!textareaText.value) {
            alert("No text!");
         } else {
            // check if there is a tokenization type defined in the metadata
            // of the texte
            var tmp;
            if ((tmp = textareaText.value.match(/^\s*#\s*TOKENIZATION-TYPE\s*:\s*(\d)/mi)) != null) {
               if (parseInt(tmp[1]) != that.tokenizationType) {
                  alert("Tokenization type of the text doesn't match the value of the list box!");
                  return;
               }
            }
            that.schema = textareaProperties.value;
            that.text = textareaText.value;
            that.showPropertyWarnings = checkPropertyWarnings.checked;
            that.callback(that);
            that.modalDiv.close();
         }
      };
      this.parseButton = input;
      // license
      p = document.createElement('P');
      div.appendChild(p);
      p.innerHTML = "SACR -- (C) 2017 Bruno Oberlé. This program "
         +"is distributed under the terms of the <a href=\"http://mozilla.org/MPL/2.0/\">Mozilla Public License, v.2.0</a>. "
         +"This program comes with ABSOLUTELY NO WARRANTY, see the license for more details. "
         +"Source code may be found at boberle.com.";
   }

   computeNbOfColors() {
      return ColorBuilder.computeNbOfColors(this.hueStep, this.saturationStep,
         this.ligthnessStep);
   }

   clickOnTheParseButton() {
      this.parseButton.click();
   }

}


