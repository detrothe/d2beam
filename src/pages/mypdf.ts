import { jsPDF, jsPDFAPI } from "jspdf";
//import autoTable from "jspdf-autotable";
import { Canvg } from "canvg";
//import { app, infoBox } from "./index.js";

// @ts-ignore
import { font } from "../fonts/FreeSans-normal.js";
// @ts-ignore
import { fontBold } from "../fonts/FreeSans-bold.js"

import htmlToPdfmake from "html-to-pdfmake"
//import { tabQWerte, schnittgroesse, bezugswerte } from "./duennQ"

import { nnodes, nelem } from "./rechnen"
import { el, element as stab, node, nlastfaelle, nkombinationen, THIIO_flag, disp_print,lagerkraefte, lagerkraefte_kombi } from "./rechnen"
import { myFormat } from './utility';
import { app } from './haupt';
import { current_unit_stress, unit_stress_factor, unit_length_factor, current_unit_length } from "./einstellungen"

const zeilenAbstand = 1.15
let Seite = 'Seite'

let doc: jsPDF;

let Seite_No: number

class pdf_table {

  doc: jsPDF
  spaltenbreite: number[]
  spalteRandLinks: number[]

  //----------------------------------------------------------------------------------------------
  constructor(doc: jsPDF, left: number, spaltenbreite: number[]) {
    //--------------------------------------------------------------------------------------------

    this.spalteRandLinks = Array(spaltenbreite.length)
    this.spaltenbreite = Array(spaltenbreite.length)
    this.doc = doc

    this.spalteRandLinks[0] = left
    this.spaltenbreite[0] = spaltenbreite[0]
    for (let i = 1; i < spaltenbreite.length; i++) {
      this.spalteRandLinks[i] = this.spalteRandLinks[i - 1] + spaltenbreite[i - 1]
      this.spaltenbreite[i] = spaltenbreite[i]
    }
  }

  //----------------------------------------------------------------------------------------------
  leftStart(ispalte: number, str: string, pos: String, padding = 0) {
    //--------------------------------------------------------------------------------------------

    let x = 0;
    let texWid = this.getHtmlWidth(str)
    if (pos === 'left') {
      x = this.spalteRandLinks[ispalte] + padding
    } else if (pos === 'right') {
      x = this.spalteRandLinks[ispalte] + this.spaltenbreite[ispalte] - texWid - padding
    } else {
      x = this.spalteRandLinks[ispalte] + this.spaltenbreite[ispalte] / 2 - texWid / 2
    }
    return x;
  }

  //----------------------------------------------------------------------------------------------
  getHtmlWidth(text: string) {
    //--------------------------------------------------------------------------------------------

    let texWid = 0

    const html = htmlToPdfmake(text) as any;

    const fs = this.doc.getFontSize();

    if (typeof html.length === 'undefined') {
      texWid = this.doc.getTextWidth(text)
    }
    else {

      for (let i = 0; i < html.length; i++) {
        if (typeof html[i].nodeName === 'undefined') { // einfacher Text
          texWid += this.doc.getTextWidth(html[i].text)
        }
        else if (html[i].nodeName === 'SUB') {
          this.doc.setFontSize(fs - 3);
          texWid += this.doc.getTextWidth(html[i].text)
          this.doc.setFontSize(fs);
        }
        else if (html[i].nodeName === 'SUP') {
          this.doc.setFontSize(fs - 3);
          texWid += this.doc.getTextWidth(html[i].text)
          this.doc.setFontSize(fs);
        }

      }
    }
    //console.log("texWidth", texWid)
    return texWid;
  }

  //----------------------------------------------------------------------------------------------
  htmlText(str: string, ispalte: number, pos: String, y: number, padding = 0) {
    //--------------------------------------------------------------------------------------------

    let x = this.leftStart(ispalte, str, pos, padding)

    htmlText(str, x, y);
  }

}



//----------------------------------------------------------------------------------------------
function htmlText(text: string, x: number, y: number) {
  //--------------------------------------------------------------------------------------------

  const html = htmlToPdfmake(text) as any;
  //console.log("html", text, "|" + html.text + "|", html.length)

  const fs = doc.getFontSize();

  let xx = x
  let yy = y

  if (typeof html.length === 'undefined') {
    doc.text(html.text, xx, yy)
    return
  }

  for (let i = 0; i < html.length; i++) {
    //console.log("i,nodeName", i, html[i].text, html[i].nodeName)
    if (typeof html[i].nodeName === 'undefined') { // einfacher Text
      doc.text(html[i].text, xx, yy)
      xx += doc.getTextWidth(html[i].text)
    }
    else if (html[i].nodeName === 'SUB') {
      doc.setFontSize(fs - 3);
      doc.text(html[i].text, xx, yy + 1)
      xx += doc.getTextWidth(html[i].text)
      doc.setFontSize(fs);
    }
    else if (html[i].nodeName === 'SUP') {
      doc.setFontSize(fs - 3);
      doc.text(html[i].text, xx, yy - 1)
      xx += doc.getTextWidth(html[i].text)
      doc.setFontSize(fs);
    }

  }

}

//----------------------------------------------------------------------------------------------
function neueZeile(yy: number, fs: number, anzahl = 1): number {
  //--------------------------------------------------------------------------------------------
  let y = yy + anzahl * zeilenAbstand * (fs * 0.352778)
  if (y > 270) {
    Seite_No++
    doc.text(Seite + Seite_No, 100, 290);

    doc.addPage();
    y = 20
  }
  return y
}

//----------------------------------------------------------------------------------------------
function testSeite(yy: number, fs: number, anzahl: number, nzeilen: number): number {
  //--------------------------------------------------------------------------------------------
  const laenge = nzeilen * zeilenAbstand * (fs * 0.352778)
  if (laenge > 270) {  // ganze Tabelle passt nicht auf eine Seite

    if (yy + (anzahl + 3) * zeilenAbstand * (fs * 0.352778) > 270) {  // 3 Zeilen sollten mindestens unter Überschrift passen
      Seite_No++
      doc.text(Seite + Seite_No, 100, 290);

      doc.addPage();
      return 20;

    } else {
      return yy + anzahl * zeilenAbstand * (fs * 0.352778);
    }
  }

  let y = yy + Math.min(laenge, 50)   // wenn 5cm Platz auf Seite, sonst neue Seite anfangen
  console.log("y", y, nzeilen, laenge)
  if (y > 270) {
    Seite_No++
    doc.text(Seite + Seite_No, 100, 290);

    doc.addPage();
    return 20;
  } else {
    return yy + anzahl * zeilenAbstand * (fs * 0.352778);
  }
}
//----------------------------------------------------------------------------------------------
function neueSeite(): number {
  //--------------------------------------------------------------------------------------------
  Seite_No++
  doc.text(Seite + Seite_No, 100, 290);

  doc.addPage();
  return 20;
}

//----------------------------------------------------------------------------------------------
function letzteSeite() {
  //--------------------------------------------------------------------------------------------
  Seite_No++
  doc.text(Seite + Seite_No, 100, 290);
}

//----------------------------------------------------------------------------------------------
export async function my_jspdf() {
  //--------------------------------------------------------------------------------------------

  let str: string, texWid: number

  let fs1 = 15, fs = 11
  const links = 20;

  const newLine = "\n";
  Seite_No = 0
  if (app.browserLanguage != 'de') Seite = 'page'

  // Default export is a4 paper, portrait, using millimeters for units
  doc = new jsPDF();

  doc.addFileToVFS("freesans.ttf", font);
  doc.addFont("freesans.ttf", "freesans_normal", "normal");

  doc.addFileToVFS("freesansbold.ttf", fontBold);
  doc.addFont("freesansbold.ttf", "freesans_bold", "normal");

  doc.setFont("freesans_normal");
  doc.setFontSize(fs)
  let yy = 20;

  //doc.line(links, 1, 200, 1, "S");
  //doc.line(links, 295, 200, 295, "S");

  //const txtarea = document.getElementById("freetext") as HTMLTextAreaElement
  const txtarea = document.createElement("textarea")
  txtarea.value = 'Eingabeprotokoll'

  console.log("textarea", txtarea.value)
  const txt = txtarea.value
  if (txt.length > 0) {
    let bold = false
    const myArray = txt.split(newLine);
    for (let i = 0; i < myArray.length; i++) {
      console.log("txt", i, myArray[i])

      let indexA = myArray[i].indexOf('<b>')
      let indexE = myArray[i].indexOf('</b>')
      let txtL = '', txtM = '', txtR = ''

      if (indexA > 0) txtL = myArray[i].slice(0, indexA)
      if (indexA >= 0 && indexE > 0) txtM = myArray[i].slice(indexA + 3, indexE)

      if (indexA >= 0 && indexE === -1) {                      // Fett nur zeilenweise
        txtM = myArray[i].slice(indexA + 3, myArray[i].length)
        bold = true
      } else if (indexA === -1 && indexE > 0) {
        txtM = myArray[i].slice(0, indexE)
        bold = false
      }
      if (indexE >= 0) {
        txtR = myArray[i].slice(indexE + 4, myArray[i].length)
      }
      console.log("txtLMR", txtL + '|' + txtM + '|' + txtR + '|')
      console.log("IndexAE", indexA, indexE)
      let col = links
      if (txtL.length > 0) {
        doc.setFont("freesans_normal");
        doc.text(txtL, col, yy);
        texWid = doc.getTextWidth(txtL)
        col += texWid
      }
      if (txtM.length > 0) {
        doc.setFont("freesans_bold");
        doc.text(txtM, col, yy);
        texWid = doc.getTextWidth(txtM)
        col += texWid
      }
      if (txtR.length > 0) {
        doc.setFont("freesans_normal");
        doc.text(txtR, col, yy);
      }
      if (indexA === -1 && indexE === -1) {
        if (bold) doc.setFont("freesans_bold");
        else doc.setFont("freesans_normal");
        doc.text(myArray[i], links, yy);
      }

      yy = neueZeile(yy, fs, 1)
    }
  }
  yy = neueZeile(yy, fs, 1)

  doc.setFont("freesans_bold");
  doc.setFontSize(fs1)

  if (app.browserLanguage == 'de') {
    doc.text("Ebenes Stabwerk", links, yy);
  } else {
    doc.text("2D frame analysis", links, yy);
  }

  doc.setFontSize(fs); // in points
  doc.setFont("freesans_normal");

  // Schnittgrößen drucken

  yy = neueZeile(yy, fs, 2)

  if (app.browserLanguage == 'de') {
    doc.text("Schnittgrößen", links, yy)
  } else {
    doc.text("Internal forces", links, yy)
  }
  yy = neueZeile(yy, fs, 2)

  // htmlText("V<sub>y</sub> = " + myFormat(schnittgroesse.Vy, 2, 2) + " kN", links, yy)
  // htmlText("M<sub>xp</sub> = " + myFormat(schnittgroesse.Mxp, 2, 2) + " kNm", links + 40, yy)
  // htmlText("N = " + myFormat(schnittgroesse.N, 2, 2) + " kN", links + 90, yy)

  // yy = neueZeile(yy, fs1, 1)

  // htmlText("V<sub>z</sub> = " + myFormat(schnittgroesse.Vz, 2, 2) + " kN", links, yy)
  // htmlText("M<sub>xs</sub> = " + myFormat(schnittgroesse.Mxs, 2, 2) + " kNm", links + 40, yy)
  // htmlText("M<sub>y</sub> = " + myFormat(schnittgroesse.My, 2, 2) + " kNm", links + 90, yy)

  // yy = neueZeile(yy, fs1, 1)

  // htmlText("M<sub>ω</sub> = " + myFormat(schnittgroesse.M_omega, 2, 2) + " kNm²", links + 40, yy)
  // htmlText("M<sub>z</sub> = " + myFormat(schnittgroesse.Mz, 2, 2) + " kNm", links + 90, yy)

  // yy = neueZeile(yy, fs, 2)

  // if (app.browserLanguage == 'de') {
  //   doc.text("Bezugswerte", links, yy)
  // } else {
  //   doc.text("Reference values", links, yy)
  // }
  // yy = neueZeile(yy, fs, 2)

  // doc.text("E-Modul = " + myFormat(bezugswerte.emodul * unit_stress_factor, 1, 1) + " " + current_unit_stress, links, yy)

  // if (app.browserLanguage == 'de') {
  //   doc.text("Querdehnung ν = " + myFormat(bezugswerte.mue, 1, 2), links + 70, yy)
  // } else {
  //   doc.text("Poisson's ratio ν = " + myFormat(bezugswerte.mue, 1, 2), links + 70, yy)
  // }
  // yy = neueZeile(yy, fs, 1)



  {
    const nspalten = 7, nzeilen = nnodes                             // Knoten

    yy = testSeite(yy, fs1, 1, 4 + nzeilen)
    if (app.browserLanguage == 'de') {
      doc.text("Knotenkoordinaten und Lager", links, yy)
    } else {
      doc.text("Node coordinates and supports", links, yy)
    }

    doc.setFontSize(fs)
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs1, 2)




    let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 23, 23, 23, 25])


    el_table_nodes.htmlText("No", 0, 'left', yy)
    el_table_nodes.htmlText("x [" + current_unit_length + "]", 1, 'center', yy)
    el_table_nodes.htmlText("z [" + current_unit_length + "]", 2, 'center', yy)
    el_table_nodes.htmlText("L<sub>x</sub> (kN/m)", 3, 'center', yy)
    el_table_nodes.htmlText("L<sub>z</sub> (kN/m)", 4, 'center', yy)
    el_table_nodes.htmlText("L<sub>φ</sub> (kNm/m)", 5, 'center', yy)
    el_table_nodes.htmlText("Winkel [°]", 6, 'center', yy)

    doc.setFontSize(fs)
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs1, 1)

    for (let i = 0; i < nzeilen; i++) {
      el_table_nodes.htmlText(String(+i + 1), 0, 'center', yy)

      str = myFormat(node[i].x * unit_length_factor, 2, 2)
      el_table_nodes.htmlText(str, 1, 'right', yy, 5)

      str = myFormat(node[i].z * unit_length_factor, 2, 2)
      el_table_nodes.htmlText(str, 2, 'right', yy, 5)


      for (let j = 0; j < 3; j++) {
        if (node[i].L_org[j] === 1) str = 'starr';
        else if (node[i].L_org[j] === 0) str = '-';
        else str = myFormat(node[i].L_org[j], 0, 1);

        el_table_nodes.htmlText(str, 3 + j, 'center', yy)
      }

      str = myFormat(node[i].phi, 1, 2)
      el_table_nodes.htmlText(str, 6, 'center', yy)

      yy = neueZeile(yy, fs1, 1)
    }
  }


  {
    const nspalten = 3, nzeilen = nelem

    yy = testSeite(yy, fs1, 1, 4 + nzeilen)
    if (app.browserLanguage == 'de') {
      doc.text("Elementdaten", links, yy)
    } else {
      doc.text("Element data", links, yy)
    }
    let str: string, texWid: number

    doc.setFontSize(fs)
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs1, 2)



    let el_table = new pdf_table(doc, links, [10, 30, 15, 15, 10, 10, 10, 10, 10, 10])
    console.log("el_table", el_table)

    el_table.htmlText("No", 0, 'left', yy)
    el_table.htmlText("Querschnitt", 1, 'center', yy)
    el_table.htmlText("nod a", 2, 'center', yy)
    el_table.htmlText("nod e", 3, 'center', yy)
    el_table.htmlText("Na", 4, 'center', yy)
    el_table.htmlText("Va", 5, 'center', yy)
    el_table.htmlText("Ma", 6, 'center', yy)
    el_table.htmlText("Ne", 7, 'center', yy)
    el_table.htmlText("Ve", 8, 'center', yy)
    el_table.htmlText("Me", 9, 'center', yy)

    doc.setFontSize(fs)
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs, 1)

    for (let i = 0; i < nzeilen; i++) {
      el_table.htmlText(String(+i + 1), 0, 'center', yy)
      el_table.htmlText(String(stab[i].qname), 1, 'center', yy)
      el_table.htmlText(String(+stab[i].nod[0] + 1), 2, 'center', yy)
      el_table.htmlText(String(+stab[i].nod[1] + 1), 3, 'center', yy)

      for (let j = 0; j < 6; j++) {
        if (stab[i].gelenk[j] === 0) {
          el_table.htmlText('-', j + 4, 'center', yy)
        } else {
          el_table.htmlText('ʘ', j + 4, 'center', yy)
        }
      }

      yy = neueZeile(yy, fs1, 1)
    }
  }


  doc.line(links, yy, 200, yy, "S");
  //  yy = neueZeile(yy, fs1, 2)
  yy = testSeite(yy, fs1, 2, 13)

  doc.setFontSize(fs1)
  doc.setFont("freesans_bold");
  if (app.browserLanguage == 'de') {
    doc.text("Ergebnisse", links, yy);
  } else {
    doc.text("Results", links, yy);
  }
  doc.setFontSize(fs)
  doc.setFont("freesans_normal");

  //yy = neueZeile(yy, fs, 2)

  let text: string
  let nLoop = 0
  if (THIIO_flag === 0) { // Theorie I.Ordnung
    nLoop = nlastfaelle
    // for (let iLastfall = 1; iLastfall <= nlastfaelle; iLastfall++) {
    // }
  } else {
    nLoop = nkombinationen
    // for (let iKomb = 1; iKomb <= nkombinationen; iKomb++) {
    // }
  }

  console.log("Ausgabe pdf", nLoop, nlastfaelle, nkombinationen)

  for (let iLastfall = 1; iLastfall <= nLoop; iLastfall++) {

    if (THIIO_flag === 0) text = 'Lastfall ' + iLastfall;
    else text = 'Kombination ' + iLastfall;
    console.log("text", links, yy, text)
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs, 1)

    doc.line(links, yy, 200, yy, "S");

    yy = neueZeile(yy, fs, 1)
    doc.text(text, links, yy)
    yy = neueZeile(yy, fs1, 1)

    //   Verformungen
    {
      doc.setFont("freesans_bold");
      doc.text('Knotenverformungen', links, yy)
      //yy = neueZeile(yy, fs, 1)

      doc.setFontSize(fs); doc.setFont("freesans_bold");
      yy = neueZeile(yy, fs1, 1)
      let el_table = new pdf_table(doc, links, [20, 20, 20, 20])
      el_table.htmlText("Node No", 0, 'left', yy)
      el_table.htmlText("u [mm]", 1, 'center', yy)
      el_table.htmlText("w [mm]", 2, 'center', yy)
      el_table.htmlText("φ [mrad]", 3, 'center', yy)

      doc.setFontSize(fs); doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs, 1)

      for (let i = 0; i < nnodes; i++) {
        el_table.htmlText(String(+i + 1), 0, 'center', yy)
        el_table.htmlText(myFormat(disp_print._(i + 1, 1, iLastfall), 2, 2), 1, 'right', yy, 5)
        el_table.htmlText(myFormat(disp_print._(i + 1, 2, iLastfall), 2, 2), 2, 'right', yy, 5)
        el_table.htmlText(myFormat(disp_print._(i + 1, 3, iLastfall), 2, 2), 3, 'right', yy, 5)
        yy = neueZeile(yy, fs, 1)
      }

    }


    //   Lagerkräfte
    {
      yy = neueZeile(yy, fs, 1)
      doc.setFont("freesans_bold");
      doc.text('Lagerreaktionen', links, yy)
      //yy = neueZeile(yy, fs, 1)

      doc.setFontSize(fs); doc.setFont("freesans_bold");
      yy = neueZeile(yy, fs1, 1)
      let el_table = new pdf_table(doc, links, [20, 20, 20, 20])
      el_table.htmlText("Node No", 0, 'left', yy)
      el_table.htmlText("A<sub>x</sub> [kN]", 1, 'center', yy)
      el_table.htmlText("A<sub>z</sub> [kN]", 2, 'center', yy)
      el_table.htmlText("M<sub>y</sub> [kNm]", 3, 'center', yy)

      doc.setFontSize(fs); doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs, 1)

      for (let i = 0; i < nnodes; i++) {
        el_table.htmlText(String(+i + 1), 0, 'center', yy)
        el_table.htmlText(myFormat(lagerkraefte._(i, 0, iLastfall - 1), 2, 2), 1, 'right', yy, 5)
        el_table.htmlText(myFormat(lagerkraefte._(i, 1, iLastfall - 1), 2, 2), 2, 'right', yy, 5)
        el_table.htmlText(myFormat(lagerkraefte._(i, 2, iLastfall - 1), 2, 2), 3, 'right', yy, 5)
        yy = neueZeile(yy, fs, 1)
      }

    }
  }







  // -------------------------------------  S  V  G  --------------------------------------

  //Get svg markup as string
  // let svg = document.getElementById("my-svg").innerHTML;

  // if (svg) {
  // svg = svg.replace(/\r?\n|\r/g, "").trim();
  // svg = svg.substring(0, svg.indexOf("</svg>")) + "</svg>";
  // // @ts-ignore
  // svg = svg.replaceAll("  ", "");
  // // console.log("svg", svg);

  // var canvas = document.createElement("canvas");
  // var context = canvas.getContext("2d");
  // console.log("canvas", canvas.width, canvas.height);

  // context.clearRect(0, 0, canvas.width, canvas.height);
  // const v = Canvg.fromString(context, svg);

  // v.render();

  // var imgData = canvas.toDataURL("image/png", 1);

  // if ((yy + 200) > 275) {
  //   yy = neueSeite();
  // } else {
  //   yy = neueZeile(yy, fs)
  // }
  // if (app.browserLanguage == 'de') {
  //   doc.text('Querschnitt', links, yy)
  // } else {
  //   doc.text('Cross section', links, yy)
  // }

  // doc.addImage(imgData, "PNG", 0, yy, 200, 200); // * myScreen.clientHeight / myScreen.svgWidth);

  // letzteSeite();

  let filename: any = 'd2beam.pdf'

  if (app.hasFSAccess && app.isMac) {

    filename = window.prompt(
      "Name der Datei mit Extension, z.B. d2beam.pdf\nDie Datei wird im Default Download Ordner gespeichert", 'd2beam.pdf'
    );

  } else if (app.hasFSAccess) {
    filename = window.prompt(
      "Name der Datei mit Extension, z.B. d2beam.pdf\nDie Datei wird im Default Download Ordner gespeichert", 'd2beam.pdf'
    );
  }

  try {
    doc.save(filename);
  } catch (error: any) {
    alert(error.message);
  }

  //   document.getElementById("id_pdf_info").innerText = "pdf-file saved in your Download folder";

  // }

}
