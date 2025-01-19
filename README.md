# SACR -- Coreference Chain Annotation Tool

## Introduction

SACR (from the French "Script d'Annotation des Chaînes de Référence") is a tool optimized for coreference chain annotation.  It has been published in the following paper:

[Oberle B. (2018). **SACR: A Drag-and-Drop Based Tool for Coreference Annotation.** _Proceedings of the 11th Edition of the Language Resources and Evaluation Conference (LREC 2018)_. Miyazaki, Japan.](http://www.lrec-conf.org/proceedings/lrec2018/summaries/178.html)

You can download the poster [here](http://boberle.com/publications/res/Oberle-2018_lrec_poster.pdf).


## Usage

SACR is a single webpage.  All operations are done in the browser.  You can download it and open the `index.html` file, or use it online at [boberle.com](http://boberle.com/projects/sacr).

The workflow is as follows:

(1) Mark the referring expressions:

![Mark the referring expressions](docs/screenshot02.png)


(2) Build the coreference chains:

![build the coreference chains](docs/screenshot03.png)


(3) Add feature annotations:

![add feature annotations](docs/screenshot04.png)


(4) Play and search:

![play and search](docs/screenshot05.png)



## Getting help

Documentation can be found in the `user_guide.pdf` file.

Video tutorials (in French) are available on my [Youtube channel](https://www.youtube.com/channel/UCOwucR9MSBbuOsa1owqyM5Q), with a dedicated
[playlist](https://www.youtube.com/watch?v=mjxR7m5fSrE&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z):

- [01: ouvrir un fichier](https://www.youtube.com/watch?v=mjxR7m5fSrE&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=1),
- [02: annoter](https://www.youtube.com/watch?v=LDqy4x5xQl8&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=2),
- [03: stratégies d'annotation](https://www.youtube.com/watch?v=0oslSmkb020&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=3),
- [04: sauver les annotations](https://www.youtube.com/watch?v=dvqVGfMPP_w&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=4),
- [05: la popup](https://www.youtube.com/watch?v=xpP39cZamlk&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=5),
- [06: naviguer](https://www.youtube.com/watch?v=f4GE63hibKc&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=6),
- [07: annoter les propriétés de chaque mention](https://www.youtube.com/watch?v=pT-ICzuQAAo&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=7),
- [08: rechercher](https://www.youtube.com/watch?v=-tFTjhFFS5o&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=8),
- [09 configurer](https://www.youtube.com/watch?v=lEsM8F-IK8M&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=9),
- [10: récapitulatif](https://www.youtube.com/watch?v=H62pm0Zyh7M&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=10),
- [11: comment afficher la popup bloquée par Firefox?](https://www.youtube.com/watch?v=rp_f0LPr-dg&list=PLLXnGmOewaNXrAvW9xsrtNrYqUDocZ18Z&index=11)


## Convert all the annotation into a relational database

Use the [coreference database project](https://github.com/boberle/coreference_databases) scripts to convert your work into a relational database, in the form of a series of CSV (Comma Separated Values) files, that you can use in a spreadsheet program like Microsoft Office or LibreOffice Calc, or in a specialized statistic program like R or Python's Pandas.

This works for a single text or a whole corpus (several texts separately annotated with SACR).

The table (CSV files) are:

- `tokens`: all the tokens in the texts
- `sentences`: all the sentences in the texts, with specific annotations (like the number of tokens, mentions, chains, etc.),
- `paragraphs`: all the paragraphs in the texts, with specific annotations (like the number of tokens, mentions, chains, etc.),
- `texts`: all the texts, with specific annotations (like the number of tokens, mentions, chains, etc.),
- `chains`: all the chains in the texts, with specific annotations (like the number of mentions, etc.)
- `mentions`: all the mentions in the texts, with specific annotations (like the name of the chain, the size of the chain, etc.)
- `relations`: all the relations in the texts, with specific annotations (like the distance between two mentions). There are several types of relations:
   - `first`: relations from the first mention to every other mentions in the chain (A-B, A-C, A-D...),
   - `consecutive`: relations from a mention to the next mention in the chain (A-B, B-C, C-D...),
   - `all`: both first and consecutive relations.


## Conversion scripts to other formats

### From and to other coreference formats

See the [`corefconversion` project](https://github.com/boberle/corefconversion) to convert from and to Conll and other formats.


## Source code and licence

Source code may be found on [github](https://github.com/boberle/sacr) or [boberle.com](http://boberle.com).

The tool is distributed under the terms of the Mozilla Public License v2.  This program comes with ABSOLUTELY NO WARRANTY, see the LICENSE file for more details.


## Contact

Want to talk? Reach me at bruno@boberle.com.

