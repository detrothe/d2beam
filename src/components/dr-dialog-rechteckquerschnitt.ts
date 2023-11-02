import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

import "@shoelace-style/shoelace/dist/components/radio-button/radio-button.js";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
import "@shoelace-style/shoelace/dist/components/radio/radio.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";

// Profilename, E-Modul, A, Iy, Iz, Wichte, h, b

const PROFIL = Array(
   ["IPE 80", 210000, 7.64, 80.1, 8.5, 78.5, 80, 46],
   ["IPE 100", 210000, 10.3, 171, 15.9, 78.5, 100, 55],
   ["IPE 120", 210000, 13.2, 318, 27.7, 78.5, 120, 64],
   ["IPE 140", 210000, 16.4, 541, 44.9, 78.5, 140, 73],
   ["IPE 160", 210000, 20.1, 869, 68.3, 78.5, 160, 82],
   ["IPE 180", 210000, 23.9, 1320, 101, 78.5, 180, 91],
   ["IPE 200", 210000, 28.5, 1940, 142, 78.5, 200, 100],
   ["IPE 220", 210000, 33.4, 2770, 205, 78.5, 220, 110],
   ["IPE 240", 210000, 39.1, 3890, 284, 78.5, 240, 120],
   ["IPE 270", 210000, 45.9, 5790, 420, 78.5, 270, 135],
   ["IPE 300", 210000, 53.8, 8360, 604, 78.5, 300, 150],
   ["IPE 330", 210000, 62.6, 11770, 788, 78.5, 330, 160],
   ["IPE 360", 210000, 72.7, 16270, 1040, 78.5, 360, 170],
   ["IPE 400", 210000, 84.5, 23130, 1320, 78.5, 400, 180],
   ["IPE 450", 210000, 98.8, 33740, 1680, 78.5, 450, 190],
   ["IPE 500", 210000, 116, 48200, 2140, 78.5, 500, 200],
   ["IPE 550", 210000, 134, 67120, 2670, 78.5, 550, 210],
   ["IPE 600", 210000, 156, 92080, 3390, 78.5, 600, 220],
   ["I 80", 210000, 7.57, 77.8, 6.3, 78.5, 80, 42],
   ["I 100", 210000, 10.6, 171, 12.2, 78.5, 100, 50],
   ["I 120", 210000, 14.2, 328, 21.5, 78.5, 120, 58],
   ["I 140", 210000, 18.2, 573, 35.2, 78.5, 140, 66],
   ["I 160", 210000, 22.8, 935, 54.7, 78.5, 160, 74],
   ["I 180", 210000, 27.9, 1450, 81.3, 78.5, 180, 82],
   ["I 200", 210000, 33.4, 2140, 117, 78.5, 200, 90],
   ["I 220", 210000, 39.5, 3060, 162, 78.5, 220, 98],
   ["I 240", 210000, 46.1, 4250, 221, 78.5, 240, 106],
   ["I 260", 210000, 53.3, 5740, 288, 78.5, 260, 113],
   ["I 280", 210000, 61, 7590, 364, 78.5, 280, 119],
   ["I 300", 210000, 69, 9800, 451, 78.5, 300, 125],
   ["I 320", 210000, 77.7, 12510, 555, 78.5, 320, 131],
   ["I 340", 210000, 86.7, 15700, 674, 78.5, 340, 137],
   ["I 360", 210000, 97, 19610, 818, 78.5, 360, 143],
   ["I 380", 210000, 118, 29210, 1140, 78.5, 400, 155],
   ["I 450", 210000, 147, 45850, 1730, 78.5, 450, 170],
   ["I 500", 210000, 179, 68740, 2480, 78.5, 500, 185],
   ["HEA 100", 210000, 21.2, 349, 134, 78.5, 96, 100],
   ["HEA 120", 210000, 25.3, 606, 231, 78.5, 114, 120],
   ["HEA 140", 210000, 31.4, 1030, 389, 78.5, 133, 140],
   ["HEA 160", 210000, 38.8, 1670, 616, 78.5, 152, 160],
   ["HEA 180", 210000, 45.3, 2510, 925, 78.5, 171, 180],
   ["HEA 200", 210000, 53.8, 3690, 1340, 78.5, 190, 200],
   ["HEA 220", 210000, 64.3, 5410, 1950, 78.5, 210, 220],
   ["HEA 240", 210000, 76.8, 7760, 2770, 78.5, 230, 240],
   ["HEA 260", 210000, 86.8, 10450, 3670, 78.5, 250, 260],
   ["HEA 280", 210000, 97.3, 13670, 4760, 78.5, 270, 280],
   ["HEA 300", 210000, 113, 18260, 6310, 78.5, 290, 300],
   ["HEA 320", 210000, 124, 22930, 6990, 78.5, 310, 300],
   ["HEA 340", 210000, 133, 27690, 7440, 78.5, 330, 300],
   ["HEA 360", 210000, 143, 33090, 7890, 78.5, 350, 300],
   ["HEA 400", 210000, 159, 45070, 8560, 78.5, 390, 300],
   ["HEA 450", 210000, 178, 63720, 9470, 78.5, 440, 300],
   ["HEA 500", 210000, 198, 86970, 10370, 78.5, 490, 300],
   ["HEA 550", 210000, 212, 111900, 10820, 78.5, 540, 300],
   ["HEA 600", 210000, 226, 141200, 11270, 78.5, 590, 300],
   ["HEA 650", 210000, 242, 175200, 11720, 78.5, 640, 300],
   ["HEA 700", 210000, 560, 248300, 12180, 78.5, 690, 300],
   ["HEA 800", 210000, 286, 303400, 12640, 78.5, 790, 300],
   ["HEA 900", 210000, 321, 422100, 13550, 78.5, 890, 300],
   ["HEA 1000", 210000, 347, 553800, 14000, 78.5, 990, 300],
   ["HEB 100", 210000, 26, 450, 167, 78.5, 100, 100],
   ["HEB 120", 210000, 34, 864, 318, 78.5, 120, 120],
   ["HEB 140", 210000, 43, 1510, 550, 78.5, 140, 140],
   ["HEB 160", 210000, 54.3, 2490, 889, 78.5, 160, 160],
   ["HEB 180", 210000, 65.3, 3830, 1360, 78.5, 180, 180],
   ["HEB 200", 210000, 78.1, 5700, 2000, 78.5, 200, 200],
   ["HEB 220", 210000, 91, 8090, 2840, 78.5, 220, 220],
   ["HEB 240", 210000, 106, 11260, 3920, 78.5, 240, 240],
   ["HEB 260", 210000, 118, 14920, 5130, 78.5, 260, 260],
   ["HEB 280", 210000, 131, 19270, 6590, 78.5, 280, 280],
   ["HEB 300", 210000, 149, 25170, 8560, 78.5, 300, 300],
   ["HEB 320", 210000, 161, 30820, 9240, 78.5, 320, 300],
   ["HEB 340", 210000, 171, 36660, 9690, 78.5, 340, 300],
   ["HEB 360", 210000, 181, 43190, 10140, 78.5, 360, 300],
   ["HEB 400", 210000, 198, 57680, 10820, 78.5, 400, 300],
   ["HEB 450", 210000, 218, 79890, 11720, 78.5, 450, 300],
   ["HEB 500", 210000, 239, 107200, 12620, 78.5, 500, 300],
   ["HEB 550", 210000, 254, 136700, 133080, 78.5, 550, 300],
   ["HEB 600", 210000, 270, 171000, 13530, 78.5, 600, 300],
   ["HEB 650", 210000, 286, 210600, 13980, 78.5, 650, 300],
   ["HEB 700", 210000, 306, 256900, 14440, 78.5, 700, 300],
   ["HEB 800", 210000, 334, 359100, 14900, 78.5, 800, 300],
   ["HEB 900", 210000, 371, 494100, 15820, 78.5, 900, 300],
   ["HEB 1000", 210000, 400, 644700, 16280, 78.5, 1000, 300],
   ["HEM 100", 210000, 53.2, 1140, 399, 78.5, 120, 106],
   ["HEM 120", 210000, 66.4, 2020, 703, 78.5, 140, 126],
   ["HEM 140", 210000, 80.6, 3290, 1140, 78.5, 160, 146],
   ["HEM 160", 210000, 97.1, 5100, 1760, 78.5, 180, 166],
   ["HEM 180", 210000, 113, 7480, 2580, 78.5, 200, 186],
   ["HEM 200", 210000, 131, 10640, 3650, 78.5, 220, 206],
   ["HEM 220", 210000, 149, 14600, 5010, 78.5, 240, 226],
   ["HEM 240", 210000, 200, 24290, 8150, 78.5, 270, 248],
   ["HEM 260", 210000, 220, 31310, 10450, 78.5, 290, 268],
   ["HEM 280", 210000, 240, 39550, 13460, 78.5, 310, 288],
   ["HEM 300", 210000, 303, 59200, 19400, 78.5, 340, 310],
   ["HEM 320", 210000, 312, 68130, 19710, 78.5, 359, 309],
   ["HEM 340", 210000, 316, 76370, 19710, 78.5, 377, 309],
   ["HEM 360", 210000, 319, 84870, 19520, 78.5, 395, 308],
   ["HEM 400", 210000, 326, 104100, 19340, 78.5, 432, 307],
   ["HEM 450", 210000, 335, 131500, 19340, 78.5, 478, 307],
   ["HEM 500", 210000, 344, 161900, 19150, 78.5, 524, 306],
   ["HEM 550", 210000, 354, 198000, 19160, 78.5, 572, 306],
   ["HEM 600", 210000, 364, 237400, 18980, 78.5, 620, 305],
   ["HEM 650", 210000, 374, 281700, 18980, 78.5, 668, 305],
   ["HEM 700", 210000, 383, 329300, 18800, 78.5, 716, 304],
   ["HEM 800", 210000, 404, 442600, 18630, 78.5, 814, 313],
   ["HEM 900", 210000, 424, 570400, 18450, 78.5, 910, 302],
   ["HEM 1000", 210000, 444, 722300, 18460, 78.5, 1008, 302]
);

@customElement("dr-rechteckquerschnitt")
export class drRechteckQuerSchnitt extends LitElement {
   @property({ type: String }) title = "D2Beam RechteckQuerschnitt";

   static get styles() {
      return css`
      input,
      label {
        font-size: 1em;
        width: 6em;
      }

      button,
      select {
        font-size: 1em;
        border-radius: 3px;
        border-width: 1px;
        border-color: #303030;
        color: #444;
        padding: 0.2em;
      }

      button:active {
        background-color: darkorange;
      }
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type="number"] {
        -moz-appearance: textfield;
      }

      .input_int {
        width: 3.125em;
        margin: 0;
        padding: 1px;
        border-top: 1px solid #444;
        border-bottom: 1px solid #444;
        border-left: 0;
        border-right: 0;
        border-radius: 0;
        text-align: center;
      }

      td,
      th {
        padding: 2px;
        margin: 3px;
        /*width: 10em;*/
      }

      table {
        border: none;
        border-spacing: 0px;
        padding: 5px;
        margin: 5px;
        background-color: rgb(207, 217, 21);
        border-radius: 5px;
      }

      td.selected {
        /*background-color: rgb(206, 196, 46);*/
        color: rgb(13, 13, 13);
      }

      td.highlight {
        background-color: orange;
        color: darkslateblue;
      }

      /*Festlegung im Default-Stylesheet der Browser*/
      dialog:not([open]) {
        display: none;
      }

      /*Styling der geöffneten Popup-Box*/
      dialog[open] {
        width: 30em;
        background: #fffbf0;
        border: thin solid #e7c157;
        margin: 4em auto;
      }

      dialog::backdrop {
        background: hsl(201 50% 40% /0.5);
      }
    `;
   }

   constructor() {
      super();
   }

   async firstUpdated() {
      const shadow = this.shadowRoot;
      if (shadow) {
         let sel = shadow?.getElementById("id_profil_select") as HTMLSelectElement;
         console.log("sel:", sel);
         for (let i = 0; i < PROFIL.length; i++) {
            let option = document.createElement("option") as HTMLOptionElement;

            option.value = option.textContent = String(PROFIL[i][0]);

            sel.appendChild(option);
         }
      }
   }

   //----------------------------------------------------------------------------------------------

   render() {
      return html`
      <dialog id="dialog_rechteck">
        <h2>Eingabe des Querschnitts</h2>

        <table id="querschnittwerte_table">
          <tbody>
            <tr>
              <td
                title="der Name des Querschnitts wird bei der Elementeingabe benötigt, für jeden Querschnitt ist ein eigener Name zu vergeben"
              >
                Name (eindeutig):
              </td>
              <td colspan="2">
                <input id="qname" type="txt" style="width:95%;" value="Rechteck" />
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <sl-radio-group
                  label="Defintion des Querschnitts"
                  name="defquerschnitt"
                  id="id_defquerschnitt"
                  value="1"
                  class="radio-group-querschnitt"
                >
                  <sl-radio-button value="1" id="id_rechteck" @click="${this._rechteck}">Rechteck</sl-radio-button>
                  <sl-radio-button value="2" id="id_werte" @click="${this._werte}">Querschnittswerte</sl-radio-button
                  ><sl-radio-button value="3" id="id_profile" @click="${this._profil}">Profil</sl-radio-button>
                </sl-radio-group>
              </td>
            </tr>

            <tr>
              <td title="die Querschnittshöhe ist für die Grafik immer einzugeben">
                Querschnittshöhe:
              </td>
              <td><input id="height" type="number" value="40" /></td>
              <td>&nbsp;[cm]</td>
            </tr>
            <tr>
              <td><span id="id_row_width">Querschnittbreite:</span></td>
              <td><input id="width" type="number" value="30" /></td>
              <td>&nbsp;[cm]</td>
            </tr>

            <tr>
              <td>
                <span id="id_row_traeg_y" style="visibility:hidden">I<sub>y</sub>:</span>
              </td>
              <td>
                <input id="traeg_y" type="number" value="160000" disabled />
              </td>
              <td>&nbsp;[cm<sup>4</sup>]</td>
            </tr>
            <tr>
              <td>
                <span id="id_row_area" disabled style="visibility:hidden">A:</span>
              </td>
              <td>
                <input id="area" type="number" value="1200" disabled />
              </td>
              <td>&nbsp;[cm²]</td>
            </tr>
            <tr>
              <td title="Abstand Oberkante Querschnitt zum Schwerpunkt (positiver Wert), wird nur für Temperaturberechnung benötigt">
                <span id="id_row_zso" disabled style="visibility:hidden">z<sub>so</sub>:</span>
              </td>
              <td>
                <input id="zso" type="number" value="0" disabled />
              </td>
              <td>&nbsp;[cm]</td>
            </tr>

            <tr>
              <td>E-Modul:</td>
              <td><input id="emodul" type="number" value="30000" /></td>
              <td>&nbsp;[MN/m²]</td>
            </tr>
            <tr>
              <td>Wichte:</td>
              <td><input id="wichte" type="number" value="0" /></td>
              <td>&nbsp;[kN/m³]</td>
            </tr>
            <tr>
              <td>Schubfaktor:</td>
              <td>
                <input id="schubfaktor" type="number" value="0.833" />
              </td>
              <td>&nbsp;[-]</td>
            </tr>
            <tr>
              <td>Querdehnzahl:</td>
              <td>
                <input id="querdehnzahl" type="number" value="0.3" />
              </td>
              <td>&nbsp;[-]</td>
            </tr>
            <tr>
              <td>Temp-Koeffizient &alpha;<sub>T</sub>:</td>
              <td><input id="alpha_t" type="number" value="1.e-5" /></td>
              <td>&nbsp;[1/K]</td>
            </tr>
          </tbody>
        </table>

        <form method="dialog">
          <sl-button id="Anmeldung" value="ok" @click="${this._dialog_ok}">ok</sl-button>
          <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">Abbrechen</sl-button>
        </form>
      </dialog>

      <dialog id="dialog_profil">
        <h2>Wähle ein Profil</h2>

        <select name="profile" id="id_profil_select"></select>
        <br /><br />

        <sl-radio-group label="Beanspruchung um Querschnittsachse" name="achse" value="y" id="id_querschnittsachse">
          <sl-radio value="y">y</sl-radio>
          <sl-radio value="z">z</sl-radio>
        </sl-radio-group>
        <br /><br />

        <sl-checkbox id="id_profilname_uebernehmen" checked>Profilname für Name des Querschnitts übernehmen</sl-checkbox>
        <br /><br />

        <form method="dialog">
          <sl-button id="id_btn_profil_ok" value="ok" @click="${this._dialog_profil_ok}">ok</sl-button>
          <sl-button id="id_btn_profil_abbruch" value="cancel" @click="${this._dialog_profil_abbruch}">Abbrechen</sl-button>
        </form>
      </dialog>
    `;
   }

   _dialog_ok() {
      console.log("dialog_ok");
      const shadow = this.shadowRoot;
      if (shadow) {
         //console.log(
         //   'email: ',
         //   (shadow.getElementById('email') as HTMLInputElement).value
         //);

         (shadow.getElementById("dialog_rechteck") as HTMLDialogElement).close("ok");
      }
   }

   _dialog_abbruch() {
      console.log("dialog_abbruch");
      const shadow = this.shadowRoot;
      if (shadow) (shadow.getElementById("dialog_rechteck") as HTMLDialogElement).close("cancel");
   }

   _rechteck() {
      console.log("rechteck");
      const shadow = this.shadowRoot;
      if (shadow) {
         (shadow?.getElementById("traeg_y") as HTMLInputElement).disabled = true;
         (shadow?.getElementById("id_row_traeg_y") as HTMLSpanElement).style.visibility = "hidden";
         (shadow?.getElementById("id_row_area") as HTMLSpanElement).style.visibility = "hidden";
         (shadow?.getElementById("area") as HTMLInputElement).disabled = true;
         (shadow?.getElementById("width") as HTMLInputElement).disabled = false;
         (shadow?.getElementById("id_row_width") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("id_row_zso") as HTMLSpanElement).style.visibility = "hidden";
         (shadow?.getElementById("zso") as HTMLInputElement).disabled = true;
      }
   }

   _werte() {
      console.log("werte");
      const shadow = this.shadowRoot;
      if (shadow) {
         (shadow?.getElementById("width") as HTMLInputElement).disabled = true;
         (shadow?.getElementById("traeg_y") as HTMLInputElement).disabled = false;
         (shadow?.getElementById("id_row_width") as HTMLSpanElement).style.visibility = "hidden";
         (shadow?.getElementById("id_row_traeg_y") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("id_row_area") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("area") as HTMLInputElement).disabled = false;
         (shadow?.getElementById("id_row_zso") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("zso") as HTMLInputElement).disabled = false;
      }
   }

   _profil() {
      console.log("profil");
      const shadow = this.shadowRoot;
      if (shadow) {
         // let sel = shadow?.getElementById(
         //    'id_profil_select'
         // ) as HTMLSelectElement;
         // console.log("sel:", sel)
         // console.log("childnodes", sel.children.length, sel.childNodes.length)
         // sel.remove(6)
         // sel.remove(5)
         // for (let i = sel.children.length - 1; i >= 0; i--) sel.remove(i);
         // for (let i = 0; i < PROFIL.length; i++) {
         //    let option = (document.createElement('option') as HTMLOptionElement);

         //    option.value = option.textContent = String(PROFIL[i][0]);

         //    sel.appendChild(option);
         // }

         /*
                     <option value="">--Please choose an option--</option>
                     <option value="IPE80">IPE 80</option>
                     <option value="IPE100">IPE 100</option>
                     <option value="IPE120">IPE 120</option>
                     <option value="IPE140">IPE 140</option>
                     <option value="IPE160">IPE 160</option>
                     <option value="IPE180">IPE 180</option>
                     */

         let dialog = shadow?.getElementById("dialog_profil") as HTMLDialogElement;
         dialog.showModal();

         //(shadow?.getElementById('dialog_profil') as HTMLDialogElement).hidden=false;
         (shadow?.getElementById("width") as HTMLInputElement).disabled = true;
         (shadow?.getElementById("traeg_y") as HTMLInputElement).disabled = false;
         (shadow?.getElementById("id_row_width") as HTMLSpanElement).style.visibility = "hidden";
         (shadow?.getElementById("id_row_traeg_y") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("id_row_area") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("area") as HTMLInputElement).disabled = false;
         (shadow?.getElementById("id_row_zso") as HTMLSpanElement).style.visibility = "visible";
         (shadow?.getElementById("zso") as HTMLInputElement).disabled = false;
      }
   }

   // _ende() {
   //    console.log('in ende');
   //    const shadow = this.shadowRoot;
   //    if (shadow) {
   //       (
   //          shadow?.getElementById('dialog_rechteck') as HTMLDialogElement
   //       ).hidden = false;
   //    }
   // }

   _dialog_profil_ok() {
      console.log("_dialog_profil_ok");
      const shadow = this.shadowRoot;
      if (shadow) {
         let wahl = (shadow.getElementById("id_profil_select") as HTMLSelectElement).value;
         console.log("wahl", wahl);
         let uebernehmen = (shadow.getElementById("id_profilname_uebernehmen") as SlCheckbox).checked;
         console.log("uebernehmen", uebernehmen);
         let achse = (shadow.getElementById("id_querschnittsachse") as HTMLSelectElement).value;
         console.log("achse", achse);

         if (uebernehmen) {
            (shadow?.getElementById("qname") as HTMLInputElement).value = wahl;
         }

         let index: number
         for (index = 0; index < PROFIL.length; index++) {
            if (PROFIL[index][0] === wahl) {
               console.log("index", index)
               break;
            }
         }

         if (index < PROFIL.length) {
            (shadow?.getElementById("emodul") as HTMLInputElement).value = String(PROFIL[index][1]);
            (shadow?.getElementById("area") as HTMLInputElement).value = String(PROFIL[index][2]);
            (shadow?.getElementById("wichte") as HTMLInputElement).value = String(PROFIL[index][5]);
            (shadow?.getElementById("querdehnzahl") as HTMLInputElement).value = "0.3";
            (shadow?.getElementById("alpha_t") as HTMLInputElement).value = "1.2e-6";
            if (achse === 'y') {
               (shadow?.getElementById("traeg_y") as HTMLInputElement).value = String(PROFIL[index][3]);
               (shadow?.getElementById("height") as HTMLInputElement).value = String(Number(PROFIL[index][6]) / 10.);  // h
               (shadow?.getElementById("zso") as HTMLInputElement).value = String(Number(PROFIL[index][6]) / 20.);  // zso
               (shadow?.getElementById("width") as HTMLInputElement).value = String(Number(PROFIL[index][7]) / 10.);  // b
            } else {
               (shadow?.getElementById("traeg_y") as HTMLInputElement).value = String(PROFIL[index][4]);
               (shadow?.getElementById("height") as HTMLInputElement).value = String(Number(PROFIL[index][7]) / 10.);  // b
               (shadow?.getElementById("zso") as HTMLInputElement).value = String(Number(PROFIL[index][7]) / 20.);  // zso
               (shadow?.getElementById("width") as HTMLInputElement).value = String(Number(PROFIL[index][6]) / 10.);  // h
            }
         }

         (shadow.getElementById("dialog_profil") as HTMLDialogElement).close("ok");
      }
   }

   _dialog_profil_abbruch() {
      console.log("_dialog_profil_abbruch");
      const shadow = this.shadowRoot;
      if (shadow) (shadow.getElementById("dialog_profil") as HTMLDialogElement).close("cancel");
   }
}
