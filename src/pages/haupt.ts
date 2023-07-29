import { html, render } from 'lit';
//import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';

//import { styles } from '../styles/shared-styles';

import '../components/dr-button-pm';
//import '../components/dr-table';
import '../components/dr-tabelle';
import '../components/dr-dialog-layerquerschnitt';
import '../components/dr-dialog-rechteckquerschnitt';

//import { testclass } from './element';

import { addListener_filesave } from './dateien';

import {
   rechnen,
   nQuerschnittSets,
   incr_querschnittSets,
   set_querschnittRechteck,
   get_querschnittRechteck,
   update_querschnittRechteck,
   init_tabellen,
} from './rechnen';

let dialog_querschnitt_new = true;
let dialog_querschnitt_index = 0;
let dialog_querschnitt_item_id = '';

export const nnodes_init = '2';
export const nelem_init = '1';
export const nnodalloads_init = '1';
export const nelemloads_init = '1';
export const nlastfaelle_init = '2';
export const nkombinationen_init = '2';
export let column_string_kombitabelle: string;
const nkombiSpalten_init = '3'; // immer 1 mehr als nlastfaelle_init

export const app = {
   appName: 'd2beam',
   browserLanguage: 'de',
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
   hasFSAccess:
      'chooseFileSystemEntries' in window ||
      'showOpenFilePicker' in window ||
      'showSaveFilePicker' in window,
   isMac: navigator.userAgent.includes('Mac OS X'),
};

{
   let txt = navigator.language;
   let txtArray = txt.split('-');

   app.browserLanguage = txtArray[0];
   console.log('app.browserLanguage', app.browserLanguage);
}

column_string_kombitabelle = '["Kombi", "Kommentar"';
for (let i = 1; i <= Number(nlastfaelle_init); i++) {
   column_string_kombitabelle = column_string_kombitabelle + ', "Lf ' + i + '"';
}
column_string_kombitabelle = column_string_kombitabelle + ']';
console.log('column_string_kombitabelle', column_string_kombitabelle);

{
   const template = () => html`
      <style>
         .custom-icons sl-tree-item::part(expand-button) {
            /* Disable the expand/collapse animation */
            rotate: none;
         }
      </style>

      <sl-tab-group>
         <sl-tab slot="nav" panel="tab-haupt">Haupt</sl-tab>
         <sl-tab slot="nav" panel="tab-querschnitte">Querschnitte</sl-tab>
         <sl-tab slot="nav" panel="tab-knoten">Knoten</sl-tab>
         <sl-tab slot="nav" panel="tab-elemente">Elemente</sl-tab>
         <sl-tab slot="nav" panel="tab-knotenlasten">Knotenlasten</sl-tab>
         <sl-tab slot="nav" panel="tab-elementlasten">Elementlasten</sl-tab>
         <sl-tab slot="nav" panel="tab-kombinationen">Kombinationen</sl-tab>
         <sl-tab slot="nav" panel="tab-ergebnisse">Ergebnisse</sl-tab>
         <sl-tab slot="nav" panel="tab-grafik">Grafik</sl-tab>
         <sl-tab slot="nav" panel="tab-pro">Pro</sl-tab>

         <sl-tab-panel name="tab-querschnitte">
            <sl-button id="open-dialog" @click="${handleClick}"
               >neuer allgemeiner Querschnitt</sl-button
            >
            <br />
            <sl-button
               id="open-dialog_rechteck"
               @click="${handleClick_rechteck}"
               >neuer Rechteck-Querschnitt</sl-button
            >

            <sl-tree class="custom-icons">
               <!--
               <sl-icon name="plus-square" slot="expand-icon"></sl-icon>
               <sl-icon name="dash-square" slot="collapse-icon"></sl-icon>
      -->
               <sl-tree-item id="id_tree_LQ" @click="${handleClick_LD}">
                  Linear elastisch Querschnittswerte
                  <!-- <sl-tree-item>Birch</sl-tree-item>

                  <sl-tree-item>Oak</sl-tree-item> -->
               </sl-tree-item>

               <sl-tree-item>
                  Linear elastisch allgemein
                  <sl-tree-item>Cedar</sl-tree-item>
                  <sl-tree-item>Pine</sl-tree-item>
                  <sl-tree-item>Spruce</sl-tree-item>
               </sl-tree-item>
            </sl-tree>

            <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt>
            <dr-rechteckquerschnitt
               id="id_dialog_rechteck"
            ></dr-rechteckquerschnitt>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-haupt">
            <br />

            <table id="querschnittwerte_table">
               <tbody>
                  <tr>
                     <td>Anzahl Knoten :</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nnodes"
                           nel="${nnodes_init}"
                           inputid="nnodes"
                        ></dr-button-pm>
                     </td>
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
                           onchange="berechnungErforderlich()"
                        />
                     </td>
                     <td>
                        <select name="THIIO" id="id_THIIO">
                           <option value="0" selected>
                              Theorie I. Ordnung
                           </option>
                           <option value="1">Theorie II. Ordnung</option>
                        </select>
                     </td>
                  </tr>
                  <tr>
                     <td>Anzahl Elemente :</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nelem"
                           nel="${nelem_init}"
                           ;
                           inputid="nelem"
                        ></dr-button-pm>
                     </td>
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
                     <td>Anzahl Knotenlasten :</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nnodalloads"
                           nel="${nnodalloads_init}"
                           inputid="nnodalloads"
                        ></dr-button-pm>
                     </td>
                     <td>Art innere Knoten :</td>
                     <td>
                        <select name="art" id="id_art">
                           <option value="0">u, w</option>
                           <option value="1" selected>u, w, φ</option>
                        </select>
                     </td>
                     <td>
                        <button type="button" id="readFile">
                           Daten einlesen
                        </button>
                     </td>
                  </tr>

                  <tr>
                     <td>Anzahl Elementlasten :</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nelemloads"
                           nel="${nelemloads_init}"
                           inputid="nelemloads"
                        ></dr-button-pm>
                     </td>
                     <td></td>
                     <td></td>
                     <td>
                        <button type="button" id="saveFile">
                           Daten speichern
                        </button>
                     </td>
                  </tr>
                  <tr>
                     <td>Anzahl Lastfälle :</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nlastfaelle"
                           nel="${nlastfaelle_init}"
                           inputid="nlastfaelle"
                        ></dr-button-pm>
                     </td>
                     <td>Anzahl Eigenwerte :</td>
                     <td>
                        <input
                           type="number"
                           step="any"
                           id="id_neigv"
                           name="neigv"
                           class="input_tab"
                           pattern="[0-9.,eE+-]*"
                           value="2"
                           onchange="berechnungErforderlich()"
                        />
                     </td>
                  </tr>
                  <tr>
                     <td>Anzahl Kombinationen :</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nkombinationen"
                           nel="${nkombinationen_init}"
                           inputid="nkombinationen"
                        ></dr-button-pm>
                     </td>
                  </tr>

                  <tr>
                     <td></td>
                     <td>
                        <sl-button
                           id="resize"
                           value="resize"
                           @click="${resizeTables}"
                           >Resize Tabellen</sl-button
                        >
                     </td>
                     <td>
                        <sl-button
                           id="clear"
                           value="clear"
                           @click="${clearTables}"
                           >clear Tabellen</sl-button
                        >
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td>
                        <sl-button
                           id="rechnen"
                           value="Rechnen"
                           @click="${calculate}"
                           >Rechnen</sl-button
                        >
                     </td>
                  </tr>
               </tbody>
            </table>

            <textarea id="output" rows="40" cols="8"></textarea>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-elemente"
            >Eingabe der Elemente <br />

            <dr-tabelle
               id="id_element_tabelle"
               nzeilen="${nelem_init}"
               nspalten="6"
               columns='["No", "Querschnitt", "nodTyp", "inz a", "inz e", "Gelenk a", "Gelenk e"]'
               typs='["-", "select", "number", "number", "number", "number", "number"]'
            ></dr-tabelle>

            <!-- <dr-table

                columns='["No", "y&#772; [cm]", "z&#772; [cm]"]'
               nZeilen="2"
            ></dr-table> -->
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-knoten"
            >Eingabe der Knotenkoordinaten und Lager
            <dr-tabelle
               id="id_knoten_tabelle"
               nzeilen="${nnodes_init}"
               nspalten="5"
               columns='["No", "x [m]", "z [m]", "L<sub>x</sub>", "L<sub>z</sub>", "L<sub>&phi;</sub>"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-knotenlasten"
            >Eingabe der Knotenlasten
            <dr-tabelle
               id="id_knotenlasten_tabelle"
               nzeilen="${nnodalloads_init}"
               nspalten="5"
               columns='["No", "Knoten", "Lastfall", "P<sub>x</sub> [kN]", "P<sub>z</sub> [kN]", "M<sub>y</sub> [kNm]"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-elementlasten"
            >Eingabe der Elementlasten
            <dr-tabelle
               id="id_elementlasten_tabelle"
               nzeilen="${nelemloads_init}"
               nspalten="5"
               columns='["No", "Element", "Lastfall", "Art", "p<sub>links</sub><br> [kN/m]", "p<sub>rechts</sub><br> [kN/m]"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-kombinationen"
            >Eingabe der Kombinationen
            <dr-tabelle
               id="id_kombinationen_tabelle"
               nzeilen="${nkombinationen_init}"
               nspalten="${nkombiSpalten_init}"
               columns="${column_string_kombitabelle}"
            ></dr-tabelle>
         </sl-tab-panel>

         <sl-tab-panel name="tab-ergebnisse"
            >Ergebnisse
            <div id="id_results"></div>
         </sl-tab-panel>
         <sl-tab-panel name="tab-grafik">
            <div id="id_grafik"></div>
         </sl-tab-panel>

         <sl-tab-panel name="tab-pro">Tab panel pro</sl-tab-panel>
      </sl-tab-group>

      <!-- <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt> -->
   `;

   const container = document.getElementById('container') as HTMLDivElement;
   const renderBefore = container?.querySelector('footer');
   render(template(), container, { renderBefore });

   // Tabellen sin jetzt da, Tabellen mit Voreinstellungen füllen

   init_tabellen();

   addListener_filesave();
}

//---------------------------------------------------------------------------------------------------------------

function handleClick() {
   console.log('handleClick()');
   //console.log(this._root.querySelector('#dialog'));
   //const shadow = this.shadowRoot;
   //if (shadow) {
   //console.log(shadow.getElementById('dialog'));
   //console.log(shadow.getElementById('Anmeldung'));
   const el = document.getElementById('id_dialog');
   console.log('id_dialog', el);
   console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
}
//---------------------------------------------------------------------------------------------------------------

function handleClick_rechteck() {
   //---------------------------------------------------------------------------------------------------------------
   console.log('handleClick_rechteck()');

   const el = document.getElementById('id_dialog_rechteck');
   console.log('id_dialog_rechteck', el);
   console.log(
      'QUERY Dialog',
      el?.shadowRoot?.getElementById('dialog_rechteck')
   );

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).addEventListener('close', dialog_closed);

   dialog_querschnitt_new = true;

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
   /*
   console.log('NAME', el?.shadowRoot?.getElementById('qname'));
   var tag = document.createElement('sl-tree-item');
   var text = document.createTextNode(
      'Tutorix is the best e-learning platform'
   );
   tag.appendChild(text);
   var element = document.getElementById('id_tree_LQ');
   element?.appendChild(tag);
   */
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
//---------------------------------------------------------------------------------------------------------------
function handleClick_LD(ev: any) {
   //---------------------------------------------------------------------------------------------------------------
   console.log('handleClick_LD()', ev);
   /*
   const el = document.getElementById('id_dialog');
   console.log('id_dialog', el);
   console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
  */
}

//---------------------------------------------------------------------------------------------------------------
function calculate() {
   //---------------------------------------------------------------------------------------------------------------
   console.log('calculate');
   rechnen();

   //testclass();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_closed(e: any) {
   //---------------------------------------------------------------------------------------------------------------
   console.log('Event dialog closed', e);
   const el = document.getElementById(
      'id_dialog_rechteck'
   ) as HTMLDialogElement;

   // @ts-ignore
   const returnValue = this.returnValue;

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).removeEventListener('close', dialog_closed);

   if (returnValue === 'ok') {
      const id = 'mat-' + nQuerschnittSets;

      {
         let elem = el?.shadowRoot?.getElementById(
            'emodul'
         ) as HTMLInputElement;
         console.log('emodul=', elem.value);
         const emodul = +elem.value;
         elem = el?.shadowRoot?.getElementById('traeg_y') as HTMLInputElement;
         const Iy = +elem.value;
         elem = el?.shadowRoot?.getElementById('area') as HTMLInputElement;
         const area = +elem.value;
         elem = el?.shadowRoot?.getElementById('qname') as HTMLInputElement;
         const qname = elem.value;
         elem = el?.shadowRoot?.getElementById('height') as HTMLInputElement;
         const height = +elem.value;
         elem = el?.shadowRoot?.getElementById('bettung') as HTMLInputElement;
         const bettung = +elem.value;
         elem = el?.shadowRoot?.getElementById(
            'schubfaktor'
         ) as HTMLInputElement;
         const schubfaktor = +elem.value;
         elem = el?.shadowRoot?.getElementById(
            'querdehnzahl'
         ) as HTMLInputElement;
         const querdehnzahl = +elem.value;
         elem = el?.shadowRoot?.getElementById('wichte') as HTMLInputElement;
         const wichte = +elem.value;

         if (dialog_querschnitt_new) {
            incr_querschnittSets();

            set_querschnittRechteck(
               qname,
               id,
               emodul,
               Iy,
               area,
               height,
               bettung,
               wichte,
               schubfaktor,
               querdehnzahl
            );
         } else {
            update_querschnittRechteck(
               dialog_querschnitt_index,
               qname,
               id,
               emodul,
               Iy,
               area,
               height,
               bettung,
               wichte,
               schubfaktor,
               querdehnzahl
            );

            //console.log("UPDATE", this)
            const el = document.getElementById(
               dialog_querschnitt_item_id
            ) as HTMLElement;
            //console.log("dialog_querschnitt_item_id", el.innerHTML)
            if (el.innerHTML !== qname) {
               el.innerHTML = qname;
               const ele = document.getElementById('id_element_tabelle');
               console.log('ELE: >>', ele);
               ele?.setAttribute(
                  'namechanged',
                  String(dialog_querschnitt_index)
               );
            }
         }
      }

      if (dialog_querschnitt_new) {
         const qName = (
            el?.shadowRoot?.getElementById('qname') as HTMLInputElement
         ).value;
         console.log('NAME', qName);
         var tag = document.createElement('sl-tree-item');
         var text = document.createTextNode(qName);
         tag.appendChild(text);
         tag.addEventListener('click', opendialog);

         tag.id = id;
         var element = document.getElementById('id_tree_LQ');
         element?.appendChild(tag);
         console.log('child appendchild', element);

         const ele = document.getElementById('id_element_tabelle');
         console.log('ELE: >>', ele);
         ele?.setAttribute('newselect', '4');
      }
   }
}

//---------------------------------------------------------------------------------------------------------------
function opendialog(ev: any) {
   //---------------------------------------------------------------------------------------------------------------

   // @ts-ignore
   console.log('opendialog geht', this);
   ev.preventDefault;

   // @ts-ignore
   const id = this.id;

   console.log('id', document.getElementById(id));

   const myArray = id.split('-');
   console.log('Array', myArray.length, myArray[0], myArray[1]);

   const index = Number(myArray[1]);
   {
      //let qname: string = '', id0: string = ''
      //let emodul: number = 0, Iy: number = 0, area: number = 0, height: number = 0, bettung: number = 0, wichte: number = 0;

      const [
         qname,
         id0,
         emodul,
         Iy,
         area,
         height,
         bettung,
         wichte,
         schubfaktor,
         querdehnzahl,
      ] = get_querschnittRechteck(index);

      if (id0 !== id) console.log('BIG Problem in opendialog');

      const el = document.getElementById(
         'id_dialog_rechteck'
      ) as HTMLDialogElement;

      let elem = el?.shadowRoot?.getElementById('emodul') as HTMLInputElement;
      console.log('set emodul=', elem.value, emodul);
      elem.value = String(emodul);
      elem = el?.shadowRoot?.getElementById('traeg_y') as HTMLInputElement;
      elem.value = String(Iy);
      elem = el?.shadowRoot?.getElementById('area') as HTMLInputElement;
      elem.value = String(area);
      elem = el?.shadowRoot?.getElementById('qname') as HTMLInputElement;
      elem.value = String(qname);
      elem = el?.shadowRoot?.getElementById('height') as HTMLInputElement;
      elem.value = String(height);
      elem = el?.shadowRoot?.getElementById('bettung') as HTMLInputElement;
      elem.value = String(bettung);
      elem = el?.shadowRoot?.getElementById('wichte') as HTMLInputElement;
      elem.value = String(wichte);
      elem = el?.shadowRoot?.getElementById('schubfaktor') as HTMLInputElement;
      elem.value = String(schubfaktor);
      elem = el?.shadowRoot?.getElementById('querdehnzahl') as HTMLInputElement;
      elem.value = String(querdehnzahl);
   }

   //const el=document.getElementById(id);
   const el = document.getElementById('id_dialog_rechteck');

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).addEventListener('close', dialog_closed);

   dialog_querschnitt_new = false;
   dialog_querschnitt_index = index;
   dialog_querschnitt_item_id = id;

   //console.log('id_dialog', el);
   //console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
}

//---------------------------------------------------------------------------------------------------------------
export function resizeTables() {
   //---------------------------------------------------------------------------------------------------------------
   {
      const el_knoten = document.getElementById('id_button_nnodes');
      const nnodes = (
         el_knoten?.shadowRoot?.getElementById('nnodes') as HTMLInputElement
      ).value;

      const el = document.getElementById('id_knoten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nnodes);
   }
   {
      const el_elemente = document.getElementById('id_button_nelem');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById('nelem') as HTMLInputElement
      ).value;

      const el = document.getElementById('id_element_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_nnodalloads');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nnodalloads'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_knotenlasten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_nelemloads');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nelemloads'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_elementlasten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      let el_elemente = document.getElementById('id_button_nkombinationen');
      let nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nkombinationen'
         ) as HTMLInputElement
      ).value;

      let el = document.getElementById('id_kombinationen_tabelle');
      console.log('EL nzeilen: >>', nelem);
      el?.setAttribute('nzeilen', nelem);
      //---------------------------------------
      el_elemente = document.getElementById('id_button_nlastfaelle');
      nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nlastfaelle'
         ) as HTMLInputElement
      ).value;

      el = document.getElementById('id_kombinationen_tabelle');
      console.log('EL nspalten: >>', nelem);
      el?.setAttribute('nspalten', String(Number(nelem) + 1)); // +1 wegen Kommentarspalte
   }
}

//---------------------------------------------------------------------------------------------------------------
export function clearTables() {
   //------------------------------------------------------------------------------------------------------------

   let el = document.getElementById('id_knoten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_element_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_knotenlasten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_elementlasten_tabelle');
   el?.setAttribute('clear', '0');
}

