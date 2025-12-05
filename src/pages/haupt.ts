import { html, render } from "lit";
//import { property, customElement } from 'lit/decorators.js';

import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/tab/tab.js";
import "@shoelace-style/shoelace/dist/components/tab-group/tab-group.js";
import "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js";
import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
import "@shoelace-style/shoelace/dist/components/radio-button/radio-button.js";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";

import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";

//import { styles } from '../styles/shared-styles';
import "./globals";
import { berechnungErforderlich, set_touch_support_table } from "./globals";

import { add_listeners_einstellungen, readLocalStorage } from "./einstellungen";

import "../components/dr-button-pm";

import "../components/dr-tabelle";
import "../components/dr-dialog-layerquerschnitt";
import "../components/dr-dialog-rechteckquerschnitt";
import "../components/dr-dialog_neue_eingabe";

import { drButtonPM } from "../components/dr-button-pm";
import { drRechteckQuerSchnitt } from "../components/dr-dialog-rechteckquerschnitt";

import { reset_gui } from "./mypanelgui";

import DetectOS from "./detectos";

import { addListener_filesave } from "./dateien";
import { select_loadcase_changed, select_eigenvalue_changed, select_dyn_eigenvalue_changed, copy_svg, drawsystem, click_zurueck_grafik, reset_controlpanel_grafik } from "./grafik";
import { myFormat, set_info, write } from "./utility";

import { my_jspdf } from "./mypdf";

//import { init_contextmenu } from '../components/dr-tabelle';

import {
  rechnen,
  nQuerschnittSets,
  querschnitts_zaehler,
  incr_querschnittSets,
  set_querschnittRechteck,
  get_querschnittRechteck,
  update_querschnittRechteck,
  init_tabellen,
  del_last_querschnittSet,
  del_querschnittSet,
  get_querschnitt_index,
  find_querschnittSet,
  incr_querschnitts_zaehler,
  show_gleichungssystem,
  setSystem,
  System,
  hideColumnsForFachwerk,
} from "./rechnen";

import { ConfirmDialog, AlertDialog } from "./confirm_dialog";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js";

//########################################################################################################################
let theFooter = "2D structural analysis of frames and trusses, v1.5.5, 5-Dezember-2025, ";
//########################################################################################################################

let hostname = window.location.hostname;

let dialog_querschnitt_new = true;
let dialog_querschnitt_index = 0;
let dialog_querschnitt_item_id = "";

export const nnodes_init = "3";
export const nelem_init = "2";
export const nnodalloads_init = "1";
export const nstreckenlasten_init = "1";
export const neinzellasten_init = "0";
export const ntemperaturlasten_init = "0";
export const nlastfaelle_init = "2";
export const nkombinationen_init = "2";
export const nstabvorverfomungen_init = "0";
export const nvorspannungen_init = "0";
export const nspannschloesser_init = "0";
export const nnodalmass_init = "0";
export let column_string_kombitabelle: string;
export let typs_string_kombitabelle: string;
//export let column_width_elementtabelle: string;
const nkombiSpalten_init = "3"; // immer 1 mehr als nlastfaelle_init
const nnodedisps_init = "0";
const dyn_neigv_init = "1";
const nkoppelfedern_init = "0";

let width_lager = 175; // /window.devicePixelRatio;
let width_def_d2beam = 400;

export let currentFilename = "empty";

export const app = {
  appName: "d2beam",
  browserLanguage: "de",
  file: {
    handle: null,
    name: null,
    isModified: false,
  },
  options: {
    captureTabs: true,
    fontSize: 16,
    monoSpace: false,
    wordWrap: true,
  },
  hasFSAccess: "chooseFileSystemEntries" in window || "showOpenFilePicker" in window || "showSaveFilePicker" in window,
  isMac: navigator.userAgent.includes("Mac OS X"),
};

export const Detect = new DetectOS();
{
  let txt = navigator.language;
  let txtArray = txt.split("-");

  app.browserLanguage = txtArray[0];
  console.log("app.browserLanguage", app.browserLanguage);
}

column_string_kombitabelle = '["Kombi", "Kommentar"';
for (let i = 1; i <= Number(nlastfaelle_init); i++) {
  column_string_kombitabelle = column_string_kombitabelle + ', "Lf ' + i + '"';
}
column_string_kombitabelle = column_string_kombitabelle + "]";
//console.log("column_string_kombitabelle", column_string_kombitabelle);

typs_string_kombitabelle = '["-", "text"';
for (let i = 1; i <= Number(nlastfaelle_init); i++) {
  typs_string_kombitabelle = typs_string_kombitabelle + ', "number"';
}
typs_string_kombitabelle = typs_string_kombitabelle + "]";
//console.log("typs_string_kombitabelle", typs_string_kombitabelle);

const portrait = window.matchMedia("(orientation: portrait)");

portrait.addEventListener("change", function (e) {
  if (e.matches) {
    // Portrait mode
    //write("portrait mode")
    drawsystem();
  } else {
    // Landscape
    //write("landscape mode")
    drawsystem();
  }
});

// const sleepNow = (delay: any) => new Promise((resolve) => setTimeout(resolve, delay));

// async function initTabellenLoop() {
//   for (let i = 1; i <= 25; i++) {
//     await sleepNow(50);
//     if (document.readyState === "complete") {
//       init_tabellen();
//       rechnen(1);

//       write(`document.readyState = complete after ${i * 50} msec`);
//       break;
//     }
//     console.log(`Hello #${i * 50}`);
//   }
// }

{
  //const template = html`  // verwenden, wenn ohne renderbefore, siehe unten

  console.log("vor template");

  const template = () => html`
    <style>
      .custom-icons sl-tree-item::part(expand-button) {
        /* Disable the expand/collapse animation */
        rotate: none;
      }
    </style>

    <sl-tab-group id="id_sl_tab_group">
      <sl-tab id="id_tab_group" slot="nav" panel="tab-haupt">Haupt</sl-tab>
      <sl-tab slot="nav" panel="tab-grafik">Ergebnisse</sl-tab>
      <sl-tab id="id_quer" slot="nav" panel="tab-querschnitte">Querschnitte</sl-tab>
      <sl-tab slot="nav" panel="tab-knoten">Knoten</sl-tab>
      <sl-tab slot="nav" panel="tab-elemente">Elemente</sl-tab>
      <sl-tab slot="nav" panel="tab-knotenlasten">Knotenlasten</sl-tab>
      <sl-tab slot="nav" panel="tab-elementlasten">Elementlasten</sl-tab>
      <sl-tab slot="nav" panel="tab-stabvorverfomungen">Vorverformungen</sl-tab>
      <sl-tab id="id_tab_kombi" slot="nav" panel="tab-kombinationen">Kombinationen</sl-tab>
      <sl-tab slot="nav" panel="tab-ergebnisse">Ausdruck</sl-tab>
      <sl-tab id="id_tab_mass" slot="nav" panel="tab-mass" disabled>Dynamik</sl-tab>
      <sl-tab slot="nav" panel="tab-pro">Pro</sl-tab>
      <sl-tab slot="nav" panel="tab-info">Info</sl-tab>
      <sl-tab slot="nav" panel="tab-einstellungen">ꔷꔷꔷ</sl-tab>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel name="tab-haupt">
        <p><div id="id_current_filename">&nbsp;&nbsp;aktueller Dateiname: ${currentFilename}<br /></div>
        </p>
        <p>
          <button type="button" id="saveFile" style="min-width:8em;">
            Objektdaten speichern
          </button>
          <button type="button" id="readFile" style="min-width:8em;">
            Objektdaten einlesen
          </button>
        </p>

        <hr />

        <p><span id="lab_freier_text" title="Der eingegebene Text wird auch für die pdf-Ergebnissdatei verwendet">Projekt (freier Text mit HTML Formatierung für fett):</span><br>
          <textarea id="freetext" name="freetext" rows="3" cols="50" placeholder="<b>Hausübung A1, SS 2023</b>
Bearbeitet von: Melis Muster" title="Buchstaben in Fett durch <b> und </b> einrahmen, Zeilenumbruch mit Return-Taste"></textarea>
        </p>

        <br />

        <table id="querschnittwerte_table">
          <tbody>
          <tr>
              <td></td>
              <td>
                <sl-button id="clear" value="clear" @click="${handleClick_neue_eingabe}">neue Eingabe beginnen</sl-button>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <sl-button id="id_check" value="check" @click="${handleClick_eingabe_ueberpruefen}" style="min-width:100%;">Eingabe prüfen</sl-button>
              </td>
            </tr>
            <tr>
              <td>
               &nbsp;
              </td>
            </tr>
            <tr>
              <td>&nbsp;&nbsp; Berechnungsart:</td>
              <td>
                <select @change="${berechnungsart_changed}" name="stadyn" id="id_stadyn" style="min-width:100%;">
                  <option value="0" selected>statisch</option>
                  <option value="1">dynamisch</option>
                </select>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>&nbsp;&nbsp; Berechnung nach:</td>
              <td>
                <select name="THIIO" id="id_THIIO" style="min-width:100%;" onchange="berechnungErforderlich()">
                  <option value="0" selected>Th. I. Ordnung</option>
                  <option value="1">Th. II. Ordnung</option>
                </select>
              </td>
              <td></td>
            </tr>

            <tr>
              <td title="nichtlineare Materialeigenschaften nur bei Koppelfedern möglich">&nbsp;&nbsp; Materialeigenschaften:</td>
              <td>
                <select name="matprop" id="id_matprop" style="min-width:100%;" onchange="berechnungErforderlich()">
                  <option value="0" selected>linear</option>
                  <option value="1">nichtlinear</option>
                </select>
              </td>
              <td></td>
            </tr>

            <tr>
              <td>
               &nbsp;
              </td>
            </tr>

            <tr>
              <td></td>
              <td>
                <sl-button id="rechnen" value="Rechnen" @click="${calculate}" style="min-width:100%;">Rechnen</sl-button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="output_container">
          <textarea id="output" rows="40" readonly spellcheck=false></textarea>
        </div>

        <dr-dialog_neue_eingabe id="id_dialog_neue_eingabe"></dr-dialog_neue_eingabe>

        <div id="id_container" class="footer" >${theFooter}
          <a href="https://statikverstehen.de">&#169; statikverstehen.de</a>
          , ${hostname}
        </div>

      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-grafik">
        <div id="id_grafik" style=" background-color:#ffffff;margin:0;padding:0;position:relative;top:0">
          <!-- width:100vw; ;width:300px;height:300px; -->
          <div id="panel_gui"></div>
          <div id="id_grafik_group">
            <div id="id_div_select_lc">
              <select id="id_select_loadcase" on></select>
              <button id="id_button_copy_svg">save svg</button>
            </div>
            <div id="id_div_select_eigv">
              <select id="id_select_eigenvalue" on></select>
            </div>
            <div id="id_div_select_dyn_eigv">
              <select id="id_select_dyn_eigenvalue" on></select>
            </div>
          </div>
          <button id="id_button_zurueck_grafik">Fullscreen</button>

          <div id="artboard" style="margin:0;padding:0;"></div>
          <div id="svg_artboard" style="margin:0;padding:0;display:none"></div>
        </div>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel id="id_tab_querschnitt" name="tab-querschnitte">
        <!--
        <sl-button id="open-dialog" @click="${handleClick_allgeiner_querschnitt}"
          >neuer allgemeiner Querschnitt</sl-button
        >
        -->
        <p>
          <br />
          <sl-button id="open-dialog_rechteck" @click="${click_neuer_querschnitt_rechteck}">&nbsp;&nbsp;neuer Querschnitt</sl-button>
          <br /><br />
        </p>
        <sl-tree class="custom-icons">
          <!--
               <sl-icon name="plus-square" slot="expand-icon"></sl-icon>
               <sl-icon name="dash-square" slot="collapse-icon"></sl-icon>
           -->
          <sl-tree-item id="id_tree_LQ" expanded>
            Linear elastisch Querschnittswerte
          </sl-tree-item>

          <!--
          <sl-tree-item>
            Linear elastisch allgemein
            <sl-tree-item><button>button 1</button><button>button 2</button></sl-tree-item>
            <sl-tree-item>nix 2</sl-tree-item>
            <sl-tree-item>nix 3</sl-tree-item>
          </sl-tree-item>
          -->

        </sl-tree>

        <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt>
        <dr-rechteckquerschnitt id="id_dialog_rechteck"></dr-rechteckquerschnitt>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel name="tab-elemente">
        <p><b>Eingabe der Elemente</b> <br /></p>
        <p>
        <img  src="/assets/def_d2beam.png"
                  name="Definition_d2beam"
                  title="Definition Stabelement d2beam"
                  style="max-width:80%; width:${width_def_d2beam}px; height:auto; border:0px; margin: left; display: block;"
                />
                Timoshenko Stabelement d2beam, Typ 0
        </p>
        <p>
          a = Element<b>a</b>nfang <br />
          e = Element<b>e</b>nde<br />
        </p>
        <p>
          Typ = Elementtyp<br />
          0 = Timoshenko Element mit konstantem Querschnitt, nichts oder 0 eingeben<br />
          1 = Fachwerkstab
        </p>
        <p>
          N = Normalkraftgelenk, V = Querkraftgelenk, M = Momentengelenk,<br />
          für ein Gelenk ist jeweils eine 1 einzugeben
        </p>
        <p>
          nod a = globale Knotennummer am Elementanfang <br />
          nod e = globale Knotennummer am Elementende
        </p>
        <p>
          starr a = starres Stabende am Elementanfang in Meter<br />
          starr e = starres Stabende am Elementende in Meter
        </p>
        <p>
          k<sub>b</sub> = Bettung nach Winkler in kN/m²
        </p>
        <p>
          <sl-checkbox checked id="id_gelenke_anzeigen">Spalten für Gelenke anzeigen</sl-checkbox>
          <br /><br />
          <sl-checkbox checked id="id_starre_enden_anzeigen">Spalten für starre Enden anzeigen</sl-checkbox>
          <br /><br />
          <sl-checkbox checked id="id_bettung_anzeigen">Spalten für Bettung anzeigen</sl-checkbox>
          <br />
        </p>
        <p>
          Anzahl Elemente:

          <dr-button-pm id="id_button_nelem" nel="${nelem_init}" inputid="nelem"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <table>
          <tbody>
            <tr>
              <td>&nbsp;</td>
              <td>
              <dr-tabelle
                id="id_element_tabelle"
                nzeilen="${nelem_init}"
                nspalten="13"
                columns='["No", "Querschnitt", "Typ", "nod a", "nod e", "N<sub>a</sub>", "V<sub>a</sub>", "M<sub>a</sub>", "N<sub>e</sub>", "V<sub>e</sub>", "M<sub>e</sub>", "starr a<br>[m]", "starr e<br>[m]","k<sub>b</sub><br>[kN/m²]"]'
                typs='["-", "select", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number"]'
                colwidth='["4","8","2","3","3","2","2","2","2","2","2","3","3","4"]'
              ></dr-tabelle>
              </td>
              <td>&nbsp;</td>
              </tr>
          </tbody>
        </table>


        <p><br /><b>Koppelfedern</b><br /></p>

        <p>
          Anzahl Koppelfedern:

          <dr-button-pm id="id_button_nkoppelfedern" nel="${nkoppelfedern_init}" inputid="nkoppelfedern"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
                  id="id_koppelfedern_tabelle"
                  nzeilen="${nkoppelfedern_init}"
                  nspalten="9"
                  columns='["No", "nod a", "nod e", "k<sub>x</sub><br>[kN/m]", "f<sub>x.plast</sub><br>[kN]", "k<sub>z</sub><br>[kN/m]", "f<sub>z.plast</sub><br>[kN]", "k<sub>φ</sub><br>[kNm/rad]", "m<sub>φ.plast</sub><br>[kNm]", "Winkel<br>[°]"  ]'
                  colwidth='["4","3","3","5","5","5","5","5","5","5"]'
                  typs='["-", "number", "number", "text", "text", "text", "text", "text", "text"]'
        ></dr-tabelle>

      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel name="tab-knoten">
        <table>
          <tbody>
            <tr>
              <td>
                <p>
                  <b>Eingabe der Knotenkoordinaten und Lager</b><br /><br />
                  1 = starre Lagerung<br />
                  0 oder leere Zelle = frei beweglich<br />
                  > 1 = Federsteifigkeit in kN/m bzw. kNm/rad<br />
                  <br />
                  Drehung des Knotens (Lagers) im Gegenuhrzeigersinn positiv<br /><br />
                </p>
                <p>
                  Anzahl Knoten:
                  <dr-button-pm id="id_button_nnodes" nel="${nnodes_init}" inputid="nnodes"></dr-button-pm>
                  <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
                </p>
              </td>
              <td>
                <img
                  src="/assets/gedrehtes_lager.png"
                  name="gedrehtes_lager"
                  title="gedrehtes Lager"
                  style="max-width:80%; width:${width_lager}px; height:auto; border:0px; margin: auto; display: block;"
                />
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <dr-tabelle
                  id="id_knoten_tabelle"
                  nzeilen="${nnodes_init}"
                  nspalten="6"
                  columns='["No", "x [m]", "z [m]", "L<sub>x</sub><br>(kN/m)", "L<sub>z</sub><br>(kN/m)", "L<sub>φ</sub><br>(kNm/rad)", "Winkel [°]"]'
                  colwidth='["4","5","5","5","5","5","5"]'
                ></dr-tabelle>
              </td>
            </tr>
          </tbody>
        </table>

        <p><br /><b>Knotenverformungen</b><br /></p>
        <p>zum Beispiel für Stützensenkungen</p>
        <p>
          Die Richtungen stimmen mit den Richtungen des zugehörigen gedrehten Lagerknotens überein.
          <br />
          Es sind nur in den Tabellenzellen Werte einzugeben, für die definierte Verformungen gewünscht werden.<br />
          Die Zahl 0 entspricht einer starren Lagerung!
        </p>
        <p>
          Anzahl Knoten mit<br />vorgebenenen Verformungen:
          <dr-button-pm id="id_button_nnodedisps" nel="${nnodedisps_init}" inputid="nnodedisps"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
          id="id_nnodedisps_tabelle"
          nzeilen="${nnodedisps_init}"
          nspalten="5"
          columns='["No", "Knoten", "Lastfall", "u<sub>x&prime;0</sub> [mm]", "u<sub>z&prime;0</sub> [mm]", "φ<sub>0</sub> [mrad]"]'
        ></dr-tabelle>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel name="tab-knotenlasten"
        ><p><b>Eingabe der Knotenlasten</b><br /><br /></p>
        <p>
          Anzahl Knotenlasten:

          <dr-button-pm id="id_button_nnodalloads" nel="${nnodalloads_init}" inputid="nnodalloads"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
          <br /><br />
        </p>
        <dr-tabelle
          id="id_knotenlasten_tabelle"
          nzeilen="${nnodalloads_init}"
          nspalten="5"
          columns='["No", "Knoten", "Lastfall", "P<sub>x</sub> [kN]", "P<sub>z</sub> [kN]", "M<sub>y</sub> [kNm]"]'
        ></dr-tabelle>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-elementlasten"
        ><p>
          <b>Eingabe der Streckenlasten</b><br /><br />
          Lastarten<br /><br />
          0 = Trapezstreckenlast senkrecht auf Stab<br />
          1 = Trapezstreckenlast in globaler z-Richtung<br />
          2 = Trapezstreckenlast in globaler z-Richtung, Projektion<br />
          3 = Trapezstreckenlast in globaler x-Richtung<br />
          4 = Trapezstreckenlast in globaler x-Richtung, Projektion<br />
        </p>
        <p>
          p<sub>a</sub> = Streckenlast am Stabanfang<br />
          p<sub>e</sub> = Streckenlast am Stabende
        </p>
        <p>
          Anzahl Streckenlasten:
          <dr-button-pm
            id="id_button_nstreckenlasten"
            nel="${nstreckenlasten_init}"
            inputid="nelemloads"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>
        <dr-tabelle
          id="id_streckenlasten_tabelle"
          nzeilen="${nstreckenlasten_init}"
          nspalten="5"
          columns='["No", "Element", "Lastfall", "Art", "p<sub>a</sub><br> [kN/m]", "p<sub>e</sub><br> [kN/m]"]'
        ></dr-tabelle>

        <p>
          <br />
          <b>Eingabe der Einzellasten</b><br /><br />
          Einzellast P wirkt senkrecht auf Stab!<br />
        </p>
        <p>
          <br />
          Anzahl Einzellasten:
          <dr-button-pm
            id="id_button_neinzellasten"
            nel="${neinzellasten_init}"
            inputid="nelemloads"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
          id="id_einzellasten_tabelle"
          nzeilen="${neinzellasten_init}"
          nspalten="5"
          columns='["No", "Element", "Lastfall", "x [m]", "P [kN]", "M [kNm]"]'
        ></dr-tabelle>

        <p>
          <br />
          <b>Eingabe der Temperaturlasten</b><br /><br />
          T<sub>u</sub> Temperatur Unterseite (gestrichelte Faser)<br />
          T<sub>o</sub> Temperatur Oberseite<br />
        </p>
        <p>
          Anzahl Temperaturlasten:
          <dr-button-pm
            id="id_button_ntemperaturlasten"
            nel="${ntemperaturlasten_init}"
            inputid="nelemloads"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
          id="id_temperaturlasten_tabelle"
          nzeilen="${ntemperaturlasten_init}"
          nspalten="4"
          columns='["No", "Element", "Lastfall", "T<sub>u</sub> [°]", "T<sub>o</sub> [°]"]'
        ></dr-tabelle>
        <!-- neu -->

        <p>
          <br />
          <b>Eingabe der zentrischen Vorspannung</b><br /><br />
        </p>
        <p>
          Anzahl der Vorspannungen:
          <dr-button-pm
            id="id_button_nvorspannungen"
            nel="${nvorspannungen_init}"
            inputid="nvorspannungen"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
          id="id_vorspannungen_tabelle"
          nzeilen="${nvorspannungen_init}"
          nspalten="3"
          columns='["No", "Element", "Lastfall", "&sigma;<sub>v</sub> [N/mm²]"]'
        ></dr-tabelle>
        <!-- neu -->

        <p>
          <br />
          <b>Eingabe der Spannschlösser</b><br /><br />
        </p>
        <p>
          Anzahl Spannschlösser:
          <dr-button-pm
            id="id_button_nspannschloesser"
            nel="${nspannschloesser_init}"
            inputid="nspannschloesser"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
          id="id_spannschloesser_tabelle"
          nzeilen="${nspannschloesser_init}"
          nspalten="3"
          columns='["No", "Element", "Lastfall", "&Delta;s [mm]"]'
        ></dr-tabelle>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-kombinationen">
        <p>
          <b> Eingabe der Lastfälle und Kombinationen</b>
        </p>
        <p>
          Anzahl Lastfälle:
          <dr-button-pm id="id_button_nlastfaelle" nel="${nlastfaelle_init}" inputid="nlastfaelle"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>
        <dr-tabelle
          id="id_lastfaelle_tabelle"
          nzeilen="${nlastfaelle_init}"
          nspalten="1"
          columns='["Lastfall", "Bezeichnung (optional)"'
          colwidth='["10","20"]'
          typs='["-", "text"]'
        ></dr-tabelle>

        <p>
          Anzahl Kombinationen:
          <dr-button-pm id="id_button_nkombinationen" nel="${nkombinationen_init}" inputid="nkombinationen"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>

        <dr-tabelle
          id="id_kombinationen_tabelle"
          nzeilen="${nkombinationen_init}"
          nspalten="${nkombiSpalten_init}"
          columns="${column_string_kombitabelle}"
          typs="${typs_string_kombitabelle}"
          coltext="Lf"
          colwidth='["4","8","3"]'
        ></dr-tabelle>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-stabvorverfomungen">
        <p>
          <b> Folgende Eingaben werden nur bei Berechnungen nach Theorie II. Ordnung berücksichtigt</b>
        </p>
        <br />
        <p>
          <b>- Schiefstellung des gesamten Systems mithilfe der ersten Eigenform</b>
        </p>

        <table id="schiefstellung_table">
          <tbody>
            <tr>
              <td title="0 oder leer = automatische Skalierung auf den Größtwert aus der Eigenwertberechnung">
                Knoten :
              </td>
              <td>
                <input
                  type="number"
                  step="1"
                  id="id_maxu_node"
                  name="maxu_node"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value=""
                  @change=${berechnungErforderlich}
                />
              </td>
            </tr>
            <tr>
              <td>Richtung :</td>
              <td>
                <select name="maxu_dir" id="id_maxu_dir" style="min-width: 100%;"  onchange="berechnungErforderlich()">
                  <option value="0">x (u)</option>
                  <option value="1" selected>z (w)</option>
                  <option value="2">φ</option>
                </select>
              </td>
            </tr>
            <tr>
              <td title="Vorverformung am Knoten in gewählter Richtung">
                &Delta; [mm, mrad] :
              </td>
              <td>
                <input
                  type="number"
                  step="any"
                  id="id_maxu_schief"
                  name="maxu_schief"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value=""
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>

          </tbody>
        </table>

        <p>
          <br />
          <b>- Eingabe der Stabvorverfomungen</b>
        </p>
        <p>
          w<sub>0a</sub> = Vorverformung am Stabanfang, senkrecht zur Stabachse<br />
          w<sub>0e</sub> = Vorverformung am Stabende, senkrecht zur Stabachse<br />
          w<sub>0m</sub> = Stich in Stabmitte, w<sub>0m,gesamt</sub> =w<sub>0m</sub>
          +(w<sub>0a</sub>+w<sub>0e</sub>)/2  &nbsp;(nicht bei Fachwerk)
        </p>

        <p>
          Anzahl Stabvorverformungen:
          <dr-button-pm id="id_button_nstabvorverformungen" nel="${nstabvorverfomungen_init}" inputid="nstabvorverformungen"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
        </p>
        <dr-tabelle
          id="id_stabvorverfomungen_tabelle"
          nzeilen="${nstabvorverfomungen_init}"
          nspalten="5"
          columns='["No", "Element", "Lastfall", "w<sub>0a</sub> [cm]", "w<sub>0e</sub> [cm]", "w<sub>0m</sub> [cm]"]'
        ></dr-tabelle>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-ergebnisse"
        ><p><sl-button id="id_create_pdf" @click="${create_pdf}">erstelle pdf-Datei</sl-button></p>
        <b>&nbsp;Eingabeprotokoll</b>
        <div id="id_results"></div>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-pro">
        <p><b>Einstellungen D2beam Element</b><br /><br /></p>

        <table>
          <tbody>
            <tr>
              <td id="id_nteilungen" title="Stabteilungen für Ausgabe der Schnittgrößen">&nbsp;Stabteilungen Ausgabe:</td>
              <td>
                <dr-button-pm id="id_button_nteilungen" nel="10" inputid="nteilungen"  @change=${berechnungErforderlich}></dr-button-pm>
              </td>
            </tr>

            <tr>
              <td>&nbsp; </td>
            </tr>
            <tr><td>&nbsp;<b>Allgemein:</b></td></tr>

            <tr>
              <td id="id_eps_disp" title="max. Euklidische Fehlertoleranz eps für Verformungen">&nbsp;eps tol Verformung:</td>
              <td>
              <input
                  type="number"
                  step="any"
                  id="id_eps_disp_tol"
                  name="eps_disp_tol"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="1e-5"
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>

            <tr>
              <td id="id_eps_force" title="max. Euklidische Fehlertoleranz eps für Kräfte">&nbsp;eps tol Kraft:</td>
              <td>
              <input
                  type="number"
                  step="any"
                  id="id_eps_force_tol"
                  name="eps_force_tol"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="1e-8"
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>

            <tr>
              <td>&nbsp; </td>
            </tr>

            <tr><td>&nbsp;<b>für Theorie II. Ordnung:</b></td></tr>
            <tr>
              <td id="id_niter" title="max. Anzahl Iterationen bei Th. II. Ordnung">&nbsp;max. Anzahl Gleichgewichts-Iterationen:</td>
              <td>
                <dr-button-pm id="id_button_niter" nel="10" inputid="niter"  @change=${berechnungErforderlich}></dr-button-pm>
              </td>
            </tr>


            <tr>
              <td title="Anzahl der zu berechnenden Eigenwerte, für die Schiefstellung wird immer die erste Eigenform verwendet">
              &nbsp;Anzahl Knickfiguren :
              </td>
              <td>
              <dr-button-pm id="id_neigv" nel="1" minValue="1" inputid="neigv"  @change=${berechnungErforderlich}></dr-button-pm>
                <!-- <input
                  type="number"
                  step="1"
                  min="1"
                  id="id_neigv"
                  name="neigv"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="1"
                  @change=${berechnungErforderlich}
                /> -->
              </td>
            </tr>

            <tr>
              <td id="id_P_delta" title="Art der geometrischen Steifigkeitsmatrix">&nbsp;Geom. Steifigkeitsmatrix:</td>
              <td>
              <sl-select  value="false" id="id_P_delta_option" >
                 <sl-option value='false' @click=${berechnungErforderlich} > vollständiger Ansatz </sl-option>
                 <sl-option value='true' @click=${berechnungErforderlich} >nur P-Δ Effekt</sl-option>
              </sl-select>
              </td>
            </tr>
            <tr>
              <td id="id_ausgabe_SG" title="Ausgabe Schnittgrößen in Tab Ergebnisse und pdf-Datei, Neuberechnung erforderlich">&nbsp;Ausgabe Schnittgrößen:</td>
              <td>
              <sl-select  value="true" id="id_ausgabe_SG_option" >
                 <sl-option value='true' @click=${berechnungErforderlich} > Gleichgewichtsschnittgrößen </sl-option>
                 <sl-option value='false' @click=${berechnungErforderlich} >Nachweisschnittgrößen</sl-option>
              </sl-select>
              </td>
            </tr>

            <tr>
              <td>&nbsp; </td>
            </tr>

            <tr><td>&nbsp;<b>für Theorie II. Ordnung und Dynamik:</b></td></tr>
            <tr>
              <td id="id_eig_solver" title="Auswahl des Eigenwert solvers, Neuberechnung erforderlich">&nbsp;Eigenwertberechnung:</td>
              <td>
              <sl-select  value="1" id="id_eig_solver_option" >
                 <sl-option value='0' @click=${berechnungErforderlich} >GNU GSL QR Methode</sl-option>
                 <sl-option value='1' @click=${berechnungErforderlich} >simultane Vektoriteration</sl-option>
              </sl-select>
              </td>
            </tr>


            <tr>
              <td title="max. Anzahl der Iterationen für simultane Vektoriteration">
              &nbsp;max. Anzahl Iterationen für Vektoriteration :
              </td>
              <td>
                <input
                  type="number"
                  step="1"
                  min="1"
                  id="id_iter_neigv"
                  name="iter_neigv"
                  class="input_tab"
                  pattern="[0-9]*"
                  value="500"
                  @change=${berechnungErforderlich}
                />
              </td>
            </tr>

          </tbody>
        </table>

        <hr />
        <p>
          <!-- <input type="checkbox" id="id_glsystem_darstellen" />Gleichungssystem darstellen  -->
          <sl-checkbox id="id_glsystem_darstellen"><b>Gleichungssystem darstellen</b></sl-checkbox>
          <br /><br />
          &nbsp;&nbsp;Zeige :
          <select id="id_element_darstellen" on></select>
        </p>

        <div id="id_elementsteifigkeit"></div>
        <div id="id_gleichungssystem"></div>

        <!--
        <table id="querschnittwerte_table">
          <tbody>
            <tr>
              <td>Anzahl Integrationspunkte :</td>
              <td>
                <input
                  type="number"
                  step="any"
                  id="id_ndivsl"
                  name="ndivsl"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="7"
                  @change=${berechnungErforderlich}
                />
              </td>
            </tr>
            <tr>
              <td>Art der Integration :</td>
              <td>
                <select name="intart" id="id_intart">
                  <option value="0">Gauss-Legendre</option>
                  <option value="1" selected>Newton Codes</option>
                  <option value="2">Lobatto</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Art innere Knoten :</td>
              <td>
                <select name="art" id="id_art">
                  <option value="0">u, w</option>
                  <option value="1" selected>u, w, φ</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
    -->
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-mass">


      <p>
          Anzahl Eigenwerte:

          <dr-button-pm id="id_button_dyn_neigv" nel="${dyn_neigv_init}" inputid="dyn_neigv"></dr-button-pm>
          <br /><br />
        </p>

      <p><b>Eingabe der Knotenmassen</b><br /><br /></p>

      <p> M = Masse<br>
      Θ<sub>y</sub> = Massenträgheitsmoment um y-Achse<br>
      </p>

      <p>
          Anzahl Knotenmassen:

          <dr-button-pm id="id_button_nnodalmass" nel="${nnodalmass_init}" inputid="nnodalmass"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
          <br /><br />
        </p>
        <dr-tabelle
          id="id_knotenmassen_tabelle"
          nzeilen="${nnodalmass_init}"
          nspalten="3"
          columns='["No", "Knoten", "M [t]", "Θ<sub>y</sub> [tm²]"]'
        ></dr-tabelle>


    </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-info">
        <div id="id_hilfe" class="c_hilfe">
          <div id="id_doc_frame" style="position: relative; width: 760px; left:50%;">
            <iframe
              id="id_doc"
              src="src/info/Kurzdokumentation_deutsch.html"
              width="100%"
              height="1500px"
              style="border: none; overflow: scroll; background-color: white;"
            >
            </iframe>
          </div>
        </div>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-einstellungen"
        ><p><b>Einstellungen</b><br /><br /></p>
        <div id="id_einstellungen">
          <br />
          <table>
            <tbody>
              <tr>
                <td id="lab_font_size">Schriftgröße:</td>
                <td>
                  <select name="fontSize" id="id_fontsize">
                    <option value="0.5em">8</option>
                    <option value="0.5625em">9</option>
                    <option value="0.625em">10</option>
                    <option value="0.7em">11</option>
                    <option value="0.75em">12</option>
                    <option value="0.8em">13</option>
                    <option value="0.875em">14</option>
                    <option value="0.95em">15</option>
                    <option value="1em" selected>16</option>
                    <option value="1.125em">18</option>
                    <option value="1.25em">20</option>
                    <option value="1.375em">22</option>
                    <option value="1.5em">24</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td title='Selektion von Zellen mit Finger'>nur für Touchscreens: </td>
                <td><sl-checkbox id="id_touch_support_tables">Selektion von Zellen mit Finger erlauben</sl-checkbox></td>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td style="white-space:nowrap">
                  Tabellenfarbe außen: &nbsp;
                </td>
                <td>
                  <input
                    id="id_color_table_out"
                    value="#CFD915"
                  />
                </td>
              </tr>
              <tr>
                <td style="white-space:nowrap">
                  Tabellenfarbe innen: &nbsp;
                </td>
                <td>
                  <input
                    id="id_color_table_in"
                    value="#b3ae00"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <br /><br />
          <p>
            <button type="button" id="id_cb_saveLocalStorage">
              Auswahl als Standardwerte im Browser speichern
            </button>
          </p>
          <p>
            <button type="button" id="id_cb_deleteLocalStorage">
              Standardwerte im Speicher des Browsers löschen
            </button>
          </p>
        </div>
      </sl-tab-panel>
    </sl-tab-group>

  `;

  // const container = document.getElementById('container') as HTMLDivElement;
  // const renderBefore = container?.querySelector('footer');
  // render(template(), container, { renderBefore });

  // setTimeout(function(){
  //   console.log("in setTimeout document.readyState",document.readyState)
  //            console.log("Executed after 1 second");
  //        }, 500);

  render(template(), document.body);

  // Tabellen sin jetzt da, Tabellen mit Voreinstellungen füllen

  // init_tabellen();

  //init_contextmenu();

  addListener_filesave();
  add_listeners_einstellungen();
  readLocalStorage();
  set_info();

  const el_select_loadcase = document.getElementById("id_select_loadcase");
  el_select_loadcase?.addEventListener("change", select_loadcase_changed);
  const el_select_eigenvalue = document.getElementById("id_select_eigenvalue");
  el_select_eigenvalue?.addEventListener("change", select_eigenvalue_changed);
  const el_select_dyn_eigenvalue = document.getElementById("id_select_dyn_eigenvalue");
  el_select_dyn_eigenvalue?.addEventListener("change", select_dyn_eigenvalue_changed);
  const el_zurueck_grafik = document.getElementById("id_button_zurueck_grafik");
  el_zurueck_grafik?.addEventListener("click", click_zurueck_grafik);

  document?.getElementById("id_button_copy_svg")?.addEventListener("click", copy_svg, false);

  const checkbox = document.getElementById("id_glsystem_darstellen");
  checkbox!.addEventListener("sl-change", (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      gleichungssystem_darstellen(true);
    } else {
      gleichungssystem_darstellen(false);
    }
  });

  const elem_select = document.getElementById("id_element_darstellen");
  elem_select!.addEventListener("change", () => {
    // @ts-ignore
    elem_select_changed();
  });

  const checkbox_gelenk = document.getElementById("id_gelenke_anzeigen");
  checkbox_gelenk!.addEventListener("sl-change", (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      elementTabelle_gelenke_anzeigen(true);
    } else {
      elementTabelle_gelenke_anzeigen(false);
    }
  });

  const checkbox_starr = document.getElementById("id_starre_enden_anzeigen");
  checkbox_starr!.addEventListener("sl-change", (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      elementTabelle_starre_enden_anzeigen(true);
    } else {
      elementTabelle_starre_enden_anzeigen(false);
    }
  });

  const touch_support_tables = document.getElementById("id_touch_support_tables");
  touch_support_tables!.addEventListener("sl-change", (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      set_touch_support_table(true);
    } else {
      set_touch_support_table(false);
    }
  });

  const checkbox_bettung = document.getElementById("id_bettung_anzeigen");
  checkbox_bettung!.addEventListener("sl-change", (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      elementTabelle_bettung_anzeigen(true);
    } else {
      elementTabelle_bettung_anzeigen(false);
    }
  });

  // console.log("id_button_copy_svg", getComputedStyle(document?.getElementById("id_button_copy_svg")!).height);
  // console.log("rechnen", getComputedStyle(document?.getElementById("rechnen")!).width);

  // let ELEMENT = document?.querySelector(".output_container");
  // console.log("ELEMENT", ELEMENT);
  // console.log("ELEMENT", getComputedStyle(ELEMENT!).width);

  console.log("document.readyState", document.readyState);

  // let time = 0
  // //while (document.readyState != 'complete') {
  // setTimeout(function () {
  //   write("in setTimeout document.readyState " + document.readyState)
  //   if (document.readyState === 'complete') init_tabellen();
  //   console.log("Executed after 0.1 second");
  // }, 500);
  // time = time + 500
  // console.log("time used ", time)
  // write('document.readyState ' + document.readyState)
  //}

  // initTabellenLoop();
  console.log("vor init_tabellen in haupt");
  init_tabellen();

  rechnen(1);
}

//---------------------------------------------------------------------------------------------------------------

function handleClick_allgeiner_querschnitt() {
  console.log("handleClick_allgeiner_querschnitt()");

  const el = document.getElementById("id_dialog");
  console.log("id_dialog", el);
  console.log("QUERY Dialog", el?.shadowRoot?.getElementById("dialog"));
  (el?.shadowRoot?.getElementById("dialog") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------

function click_neuer_querschnitt_rechteck() {
  //---------------------------------------------------------------------------------------------------------------
  console.log("click_neuer_querschnitt_rechteck()");

  const el = document.getElementById("id_dialog_rechteck") as drRechteckQuerSchnitt;

  el.init_name_changed(true);

  // console.log("id_dialog_rechteck", el);
  // console.log("QUERY Dialog", el?.shadowRoot?.getElementById("dialog_rechteck"));

  (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).addEventListener("close", dialog_closed);

  dialog_querschnitt_new = true;

  (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).showModal();
}
/*
//---------------------------------------------------------------------------------------------------------------
function neuZeilen() {
   //---------------------------------------------------------------------------------------------------------------
   const el = document.getElementById('id_knoten_tabelle');
   console.log('EL: >>', el);
   el?.setAttribute('nzeilen', '4');
   console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));
   const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
   console.log('nZeilen', table.rows.length);
   console.log('nSpalten', table.rows[0].cells.length);

   let nnodes = table.rows.length - 1;
   let wert: any;

   for (let i = 0; i < nnodes; i++) {
      let child = table.rows[i + 1].cells[1]
         .firstElementChild as HTMLInputElement;
      wert = child.value;
      child.value = '21';
      console.log('NODE i:1', i, wert);
      child = table.rows[i + 1].cells[2].firstElementChild as HTMLInputElement;
      console.log('NODE i:2', i, wert);
      wert = child.value;
   }
}
*/
/*
//---------------------------------------------------------------------------------------------------------------
function handleClick_rechteck_dialog(ev: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("handleClick_LD()", ev);

 const el = document.getElementById('id_dialog');
 console.log('id_dialog', el);
 console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
 (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
}
*/

//---------------------------------------------------------------------------------------------------------------
function calculate() {
  //------------------------------------------------------------------------------------------------------------
  //console.log('calculate');

  resizeTables();
  rechnen(1);

  //testclass();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_closed(e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog closed", e);
  const el = document.getElementById("id_dialog_rechteck") as HTMLDialogElement;

  // @ts-ignore
  const returnValue = this.returnValue;

  (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).removeEventListener("close", dialog_closed);

  if (returnValue === "ok") {
    let id: string;
    if (dialog_querschnitt_new) {
      incr_querschnitts_zaehler();
      id = "mat-" + querschnitts_zaehler;
    } else {
      id = "mat-" + dialog_querschnitt_index;
    }
    {
      let elem = el?.shadowRoot?.getElementById("emodul") as HTMLInputElement;
      //console.log("emodul=", elem.value);
      const emodul = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("traeg_y") as HTMLInputElement;
      const Iy = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("area") as HTMLInputElement;
      const area = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("qname") as HTMLInputElement;
      const qname = elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("height") as HTMLInputElement;
      const height = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("width") as HTMLInputElement;
      const width = +elem.value.replace(/,/g, ".");
      //         elem = el?.shadowRoot?.querySelector('.radio-group-querschnitt') as any;
      elem = el?.shadowRoot?.getElementById("id_defquerschnitt") as any;
      //console.log("defquerschnitt", elem)
      const defquerschnitt = +elem.value.replace(/,/g, ".");
      //console.log("defquerschnitt", defquerschnitt)
      elem = el?.shadowRoot?.getElementById("schubfaktor") as HTMLInputElement;
      const schubfaktor = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("querdehnzahl") as HTMLInputElement;
      const querdehnzahl = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("wichte") as HTMLInputElement;
      const wichte = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("zso") as HTMLInputElement;
      const zso = +elem.value.replace(/,/g, ".");
      elem = el?.shadowRoot?.getElementById("alpha_t") as HTMLInputElement;
      const alphaT = +elem.value.replace(/,/g, ".");
      //console.log("dialog_closed",elem.value,alphaT)

      //console.log("ALPHA T = ", alphaT);

      if (dialog_querschnitt_new) {
        incr_querschnittSets();

        set_querschnittRechteck(qname, id, emodul, Iy, area, height, width, defquerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT);
      } else {
        update_querschnittRechteck(dialog_querschnitt_index, qname, id, emodul, Iy, area, height, width, defquerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT);

        // Name des Querschnitts in Querschnitts-tree (tab Querschnitte) ändern
        const el = document.getElementById(dialog_querschnitt_item_id) as HTMLElement;
        console.log("dialog_querschnitt_item_id", dialog_querschnitt_item_id);
        console.log("dialog_querschnitt_index, qname", dialog_querschnitt_index, qname); // , el.textContent

        if (el.textContent !== qname) {
          // innerHTML
          el.textContent = qname;
          const ele = document.getElementById("id_element_tabelle");
          //console.log('ELE: >>', ele);
          ele?.setAttribute("namechanged", String(dialog_querschnitt_index));
        }
      }
    }

    if (dialog_querschnitt_new) {
      const qName = (el?.shadowRoot?.getElementById("qname") as HTMLInputElement).value;
      console.log("NAME", qName);

      add_new_cross_section(qName, id);
    }

    berechnungErforderlich(true);
  }
}

//---------------------------------------------------------------------------------------------------------------
export function add_new_cross_section(qName: string, id: string) {
  //-------------------------------------------------------------------------------------------------------------

  const tag = document.createElement("sl-tree-item");
  // tag.textContent = qName
  //const text = document.createTextNode(qName);
  //tag.appendChild(text);

  const quer_button = document.createElement("sl-button");
  quer_button.textContent = qName;
  quer_button.style.minWidth = "8rem";
  quer_button.addEventListener("click", opendialog);
  quer_button.title = "click to modify";
  quer_button.id = id;
  //quer_button.style.margin='0';
  //quer_button.style.padding='0';

  const delete_button = document.createElement("button");
  //delete_button.textContent = "delete";
  delete_button.value = id;
  delete_button.className = "btn";
  delete_button.innerHTML = '<i class = "fa fa-trash"></i>';
  delete_button.addEventListener("click", contextmenu_querschnitt);
  delete_button.title = "delete Querschnitt";
  //delete_button.style.margin='0';
  //delete_button.style.padding='auto'

  //  var br = document.createElement("br");
  //  tag.appendChild(br);
  var div = document.createElement("div");
  //div.id='div_add_cross_section'
  div.style.display = "flex";
  div.style.alignItems = "center";
  // div.style.backgroundColor = "#f5f5f5";
  div.style.border = "0px";

  div.appendChild(quer_button);
  div.appendChild(delete_button);

  tag.appendChild(div);

  const element = document.getElementById("id_tree_LQ");
  element?.appendChild(tag);
  console.log("child appendchild", element);

  const ele = document.getElementById("id_element_tabelle");
  //console.log("ELE: >>", ele);
  ele?.setAttribute("add_new_option", "4");
}

//---------------------------------------------------------------------------------------------------------------
export async function contextmenu_querschnitt(ev: any) {
  //-------------------------------------------------------------------------------------------------------------

  let qname = "";

  ev.preventDefault();

  // @ts-ignore
  const el = this;
  //console.log("el,this",ev.offsetParent)
  const id_button = el.value; // button
  const ele = document.getElementById(id_button) as SlButton;
  if (ele != null) qname = ele.textContent!;
  //console.log("contextmenu_querschnitt, qname", el.innerText, el.textContent, '|', el.value);

  const dialog = new ConfirmDialog({
    trueButton_Text: "ja",
    falseButton_Text: "nein",
    question_Text: "Lösche Querschnitt: " + qname,
  });
  const loesche = await dialog.confirm();
  //console.log("loesche", loesche);

  if (loesche) {
    // window.confirm("Lösche Querschnitt: " + qname)

    const anzahl = find_querschnittSet(qname);
    if (anzahl === 0) {
      del_querschnittSet(qname);

      let element = document.getElementById("id_tree_LQ") as any;
      //console.log("element.children", element.children);
      //console.log("el.parentNode", el.parentNode.parentNode);
      //console.log("el.parentElement", el.parentElement.parentElement);
      element?.removeChild(el.parentElement.parentElement);
    } else {
      const dialogAlert = new AlertDialog({
        trueButton_Text: "ok",
        question_Text: "Es gibt mindestens ein Element, das den Querschnitt verwendet",
      });
      await dialogAlert.confirm();
      //window.alert("Lösche Querschnitt: ")
    }
  }
}

//---------------------------------------------------------------------------------------------------------------
export function opendialog(ev: any) {
  //-------------------------------------------------------------------------------------------------------------

  // @ts-ignore
  console.log("opendialog geht", this);
  ev.preventDefault;

  // @ts-ignore
  const id = this.id;

  // console.log("id", document.getElementById(id));

  // const myArray = id.split("-");
  // console.log("Array", myArray.length, myArray[0], myArray[1]);

  // const index = Number(myArray[1]);

  // @ts-ignore
  const ele = this;
  const qname = ele.textContent;
  console.log("opendialog, qname", ele.innerText, "|", ele.textContent, ele.id);
  const index = get_querschnitt_index(qname);

  if (index < 0) {
    alert("BIG Problem in opendialog, contact developer");
    return;
  }

  {
    //let qname: string = '', id0: string = ''
    //let emodul: number = 0, Iy: number = 0, area: number = 0, height: number = 0, bettung: number = 0, wichte: number = 0;

    const [qname, id0, emodul, Iy, area, height, width, definedQuerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT] = get_querschnittRechteck(index);

    //if (id0 !== id) console.log("BIG Problem in opendialog");

    const el = document.getElementById("id_dialog_rechteck") as HTMLDialogElement;

    let elem = el?.shadowRoot?.getElementById("emodul") as HTMLInputElement;
    console.log("set emodul=", elem.value, emodul);
    elem.value = String(emodul);
    elem = el?.shadowRoot?.getElementById("traeg_y") as HTMLInputElement;
    elem.value = String(Iy);
    elem = el?.shadowRoot?.getElementById("area") as HTMLInputElement;
    elem.value = String(area);
    elem = el?.shadowRoot?.getElementById("qname") as HTMLInputElement;
    elem.value = String(qname);
    elem = el?.shadowRoot?.getElementById("height") as HTMLInputElement;
    elem.value = String(height);
    elem = el?.shadowRoot?.getElementById("width") as HTMLInputElement;
    elem.value = String(width);
    elem = el?.shadowRoot?.getElementById("id_defquerschnitt") as HTMLInputElement;
    elem.value = String(definedQuerschnitt);
    elem = el?.shadowRoot?.getElementById("wichte") as HTMLInputElement;
    elem.value = String(wichte);
    elem = el?.shadowRoot?.getElementById("schubfaktor") as HTMLInputElement;
    elem.value = String(schubfaktor);
    elem = el?.shadowRoot?.getElementById("querdehnzahl") as HTMLInputElement;
    elem.value = String(querdehnzahl);
    elem = el?.shadowRoot?.getElementById("zso") as HTMLInputElement;
    elem.value = String(zso);
    let wert = String(myFormat(Number(alphaT), 1, 6, 1)).replace(/,/g, ".");
    elem = el?.shadowRoot?.getElementById("alpha_t") as HTMLInputElement;
    // elem.setAttribute('value', String(myFormat(Number(alphaT), 1, 6, 1)));
    console.log("myformat", alphaT, "|", myFormat(Number(alphaT), 1, 6, 1), "|", String(myFormat(Number(alphaT), 1, 6, 1)));
    //    elem.value = String(alphaT);
    elem.value = wert;
  }

  //const el=document.getElementById(id);
  const el = document.getElementById("id_dialog_rechteck") as drRechteckQuerSchnitt;

  el.init_name_changed(false);

  (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).addEventListener("close", dialog_closed);

  dialog_querschnitt_new = false;
  dialog_querschnitt_index = index;
  dialog_querschnitt_item_id = id;

  (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------
export function resizeTables() {
  //---------------------------------------------------------------------------------------------------------------
  {
    const el_knoten = document.getElementById("id_button_nnodes");
    const nnodes = (el_knoten?.shadowRoot?.getElementById("nnodes") as HTMLInputElement).value;

    const el = document.getElementById("id_knoten_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nnodes);
  }
  {
    const el_knoten = document.getElementById("id_button_nnodedisps");
    const nnodes = (el_knoten?.shadowRoot?.getElementById("nnodedisps") as HTMLInputElement).value;

    const el = document.getElementById("id_nnodedisps_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nnodes);
  }
  {
    const el_elemente = document.getElementById("id_button_nelem");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nelem") as HTMLInputElement).value;

    const el = document.getElementById("id_element_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);

    // el?.setAttribute("hide_column", String(9));
    // el?.setAttribute("hide_column", String(8));
    // el?.setAttribute("hide_column", String(6));
    // el?.setAttribute("hide_column", String(5));
  }

  {
    const el_elemente = document.getElementById("id_button_nnodalloads");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nnodalloads") as HTMLInputElement).value;

    const el = document.getElementById("id_knotenlasten_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_nstreckenlasten");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nelemloads") as HTMLInputElement).value;

    const el = document.getElementById("id_streckenlasten_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_neinzellasten");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nelemloads") as HTMLInputElement).value;

    const el = document.getElementById("id_einzellasten_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_ntemperaturlasten");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nelemloads") as HTMLInputElement).value;

    const el = document.getElementById("id_temperaturlasten_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_nstabvorverformungen");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nstabvorverformungen") as HTMLInputElement).value;

    const el = document.getElementById("id_stabvorverfomungen_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_nvorspannungen");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nvorspannungen") as HTMLInputElement).value;

    const el = document.getElementById("id_vorspannungen_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_nspannschloesser");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nspannschloesser") as HTMLInputElement).value;

    const el = document.getElementById("id_spannschloesser_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_nlastfaelle");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nlastfaelle") as HTMLInputElement).value;

    const el = document.getElementById("id_lastfaelle_tabelle");
    //console.log("EL: >>", el);
    el?.setAttribute("nzeilen", nelem);
  }

  {
    let el_elemente = document.getElementById("id_button_nkombinationen");
    let nelem = (el_elemente?.shadowRoot?.getElementById("nkombinationen") as HTMLInputElement).value;

    let el = document.getElementById("id_kombinationen_tabelle");
    //console.log("EL nzeilen: >>", nelem);
    el?.setAttribute("nzeilen", nelem);
    //---------------------------------------
    el_elemente = document.getElementById("id_button_nlastfaelle");
    nelem = (el_elemente?.shadowRoot?.getElementById("nlastfaelle") as HTMLInputElement).value;

    el = document.getElementById("id_kombinationen_tabelle");
    //console.log("EL nspalten: >>", nelem);
    el?.setAttribute("nspalten", String(Number(nelem) + 1)); // +1 wegen Kommentarspalte
  }

  {
    const el_elemente = document.getElementById("id_button_nnodalmass");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nnodalmass") as HTMLInputElement).value;

    const el = document.getElementById("id_knotenmassen_tabelle");
    el?.setAttribute("nzeilen", nelem);
  }

  {
    const el_elemente = document.getElementById("id_button_nkoppelfedern");
    const nelem = (el_elemente?.shadowRoot?.getElementById("nkoppelfedern") as HTMLInputElement).value;

    const el = document.getElementById("id_koppelfedern_tabelle");
    el?.setAttribute("nzeilen", nelem);
  }

  // if (System === 0) showColumnsForStabwerk();
  // else hideColumnsForFachwerk();
  if (System === 1) hideColumnsForFachwerk();
}

//---------------------------------------------------------------------------------------------------------------
export function clearTables() {
  //------------------------------------------------------------------------------------------------------------

  let el = document.getElementById("id_knoten_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_nnodedisps_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_element_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_knotenlasten_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_streckenlasten_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_einzellasten_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_temperaturlasten_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_stabvorverfomungen_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_vorspannungen_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_spannschloesser_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_lastfaelle_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_kombinationen_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_knotenmassen_tabelle");
  el?.setAttribute("clear", "0");

  el = document.getElementById("id_koppelfedern_tabelle");
  el?.setAttribute("clear", "0");

  while (nQuerschnittSets > 0) {
    del_last_querschnittSet();
    let element = document.getElementById("id_tree_LQ") as any;
    element?.removeChild(element?.lastChild);
  }
}

//---------------------------------------------------------------------------------------------------------------

function handleClick_neue_eingabe() {
  //------------------------------------------------------------------------------------------------------------
  console.log("handleClick_neue_eingabe()");

  const el = document.getElementById("id_dialog_neue_eingabe");
  // console.log('id_dialog_neue_eingabe', el);
  // console.log(
  //   'QUERY Dialog',
  //   el?.shadowRoot?.getElementById('dialog_neue_eingabe')
  // );

  (el?.shadowRoot?.getElementById("dialog_neue_eingabe") as HTMLDialogElement).addEventListener("close", dialog_neue_eingabe_closed);

  (el?.shadowRoot?.getElementById("dialog_neue_eingabe") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_neue_eingabe_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_neue_eingabe") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  (ele?.shadowRoot?.getElementById("dialog_neue_eingabe") as HTMLDialogElement).removeEventListener("close", dialog_closed);

  if (returnValue === "ok") {
    let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);

    setSystem(system);

    console.log("Dialog neue Eingabe mit ok geschlossen", system);

    let el = document.getElementById("id_button_nnodes") as drButtonPM;
    console.log("el id_button_nnodes", el);
    el.setValue(2);

    el = document.getElementById("id_button_nelem") as drButtonPM;
    el.setValue(1);
    el = document.getElementById("id_button_nnodalloads") as drButtonPM;
    el.setValue(0);
    el = document.getElementById("id_button_nstreckenlasten") as drButtonPM;
    el.setValue(0);

    el = document.getElementById("id_button_neinzellasten") as drButtonPM;
    el.setValue(0);

    el = document.getElementById("id_button_ntemperaturlasten") as drButtonPM;
    el.setValue(0);

    el = document.getElementById("id_button_nlastfaelle") as drButtonPM;
    el.setValue(1);
    el = document.getElementById("id_button_nkombinationen") as drButtonPM;
    el.setValue(0);
    el = document.getElementById("id_button_nstabvorverformungen") as drButtonPM;
    el.setValue(0);

    el = document.getElementById("id_button_niter") as drButtonPM;
    el.setValue(5);

    el = document.getElementById("id_button_nnodalmass") as drButtonPM;
    el.setValue(0);

    el = document.getElementById("id_button_dyn_neigv") as drButtonPM;
    el.setValue(1);

    let eli = document.getElementById("id_eps_disp_tol") as HTMLInputElement;
    eli.value = "1e-5";

    let els = document.getElementById("id_P_delta_option") as SlSelect;
    els.setAttribute("value", "false");

    els = document.getElementById("id_ausgabe_SG_option") as SlSelect;
    els.setAttribute("value", "true");

    els = document.getElementById("id_eig_solver_option") as SlSelect;
    els.setAttribute("value", "1");

    eli = document.getElementById("id_maxu_node") as HTMLInputElement;
    eli.value = "";

    let elSel = document.getElementById("id_maxu_dir") as HTMLSelectElement;
    elSel.options[1].selected = true;

    eli = document.getElementById("id_maxu_schief") as HTMLInputElement;
    eli.value = "";

    el = document.getElementById("id_neigv") as drButtonPM;
    el.setValue(1);

    el = document.getElementById("id_button_nkoppelfedern") as drButtonPM;
    el.setValue(0);

    elSel = document.getElementById("id_stadyn") as HTMLSelectElement;
    elSel.value = "0";

    const id_mass = document.getElementById("id_tab_mass") as SlSelect;
    id_mass.disabled = true;

    elSel = document.getElementById("id_THIIO") as HTMLSelectElement;
    elSel.options[0].selected = true;

    elSel = document.getElementById("id_matprop") as HTMLSelectElement;
    elSel.options[0].selected = true;

    resizeTables();
    clearTables();
    reset_gui();
    reset_controlpanel_grafik();

    if (system === 1) {
      el = document.getElementById("id_button_nteilungen") as drButtonPM;
      el.setValue(1);
    } else {
      el = document.getElementById("id_button_nteilungen") as drButtonPM;
      el.setValue(10);
    }

    berechnungErforderlich(true);

    let element = document.getElementById("id_quer"); // id_eingabe
    element?.click();
  }
}

//---------------------------------------------------------------------------------------------------------------
export function set_current_filename(name: string) {
  //-------------------------------------------------------------------------------------------------------------
  currentFilename = name;
  console.log("file name", name);
  const el = document.getElementById("id_current_filename") as HTMLElement;
  el.innerHTML = "&nbsp;&nbsp;aktueller Dateiname: " + currentFilename;
}

//---------------------------------------------------------------------------------------------------------------
function handleClick_eingabe_ueberpruefen() {
  //-------------------------------------------------------------------------------------------------------------
  console.log("handleClick_eingabe_ueberpruefen()");

  resizeTables();
  rechnen(0);
}

//---------------------------------------------------------------------------------------------------------------
function create_pdf() {
  //-------------------------------------------------------------------------------------------------------------
  my_jspdf();
}

//---------------------------------------------------------------------------------------------------------------
function gleichungssystem_darstellen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  console.log("in gleichungssystem_darstellen", check);
  show_gleichungssystem(check);
  //myFunction_get();
  //myFunction_set();
}

//---------------------------------------------------------------------------------------------------------------
function elem_select_changed() {
  //-------------------------------------------------------------------------------------------------------------
  console.log("elem_select_changed");
  const checkbox = document.getElementById("id_glsystem_darstellen") as HTMLInputElement;
  console.log("checkbox", checkbox.checked);
  if (checkbox.checked) show_gleichungssystem(true);
}

//---------------------------------------------------------------------------------------------------------------
function berechnungsart_changed() {
  //---------------------------------------------------------------------------------------------------------------
  // console.log("berechnungsart_changed");
  const sel = document.getElementById("id_stadyn") as HTMLSelectElement;
  const id_mass = document.getElementById("id_tab_mass") as SlSelect;
  if (sel.value === "0") id_mass.disabled = true;
  else id_mass.disabled = false;
  berechnungErforderlich();
}

//---------------------------------------------------------------------------------------------------------------
function elementTabelle_gelenke_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_gelenke_anzeigen", check);

  if (check) {
    let el = document.getElementById("id_element_tabelle");
    for (let i = 10; i > 4; i--) el?.setAttribute("show_column", String(i));
  } else {
    let el = document.getElementById("id_element_tabelle");
    for (let i = 10; i > 4; i--) el?.setAttribute("hide_column", String(i));
  }
}

//---------------------------------------------------------------------------------------------------------------
function elementTabelle_starre_enden_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_starre_enden_anzeigen", check);

  if (check) {
    let el = document.getElementById("id_element_tabelle");
    for (let i = 12; i > 10; i--) el?.setAttribute("show_column", String(i));
  } else {
    let el = document.getElementById("id_element_tabelle");
    for (let i = 12; i > 10; i--) el?.setAttribute("hide_column", String(i));
  }
}

//---------------------------------------------------------------------------------------------------------------
function elementTabelle_bettung_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_bettung_anzeigen", check);

  if (check) {
    let el = document.getElementById("id_element_tabelle");
    for (let i = 13; i > 12; i--) el?.setAttribute("show_column", String(i));
  } else {
    let el = document.getElementById("id_element_tabelle");
    for (let i = 13; i > 12; i--) el?.setAttribute("hide_column", String(i));
  }
}
