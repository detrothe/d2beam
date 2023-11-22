import { el, element as stab, node, nelem, nnodes, nloads, neloads, eload, nstabvorverfomungen, stabvorverformung, nelem_Balken, nQuerschnittSets } from "./rechnen";

import { testNumber, myFormat, write } from './utility'

//---------------------------------------------------------------------------------------------------------------
export function prot_eingabe(iLastfall: number, newDiv: HTMLDivElement) {
    //-----------------------------------------------------------------------------------------------------------

    console.log("----------------- in prot_eingabe --------------------")

    if (iLastfall > 1) return newDiv;

    {
        const kopf = ["No", "x [m]", "z [m]", "L<sub>x</sub> <br> (kN/m)", "L<sub>z</sub> <br> (kN/m)", "L<sub>&phi;</sub> <br> (kNm/rad)", "Winkel <br> [°]", 'n<sub>x</sub>', 'n<sub>z</sub>', 'n<sub>&phi;</sub>']
        //const kopf2 = ['', '', '[cm²]', '[cm<sup>4</sup>]', '[N/mm²]', '-', '-', '[1/K]', '[kN/m³]'];
        const kopf_text = ['Nummer', 'Koordinate x', 'Koordinate z', 'Lagerung in x-Richtung', 'Lagerung in z-Richtung', 'Lagerung gegen Verdrehung', 'Lagerdrehung', 'Gleichungsnummer in x-Richtung', 'Gleichungsnummer in z-Richtung', 'Gleichungsnummer in phi-Richtung'];

        let tag = document.createElement("p"); // <p></p>
        let text = document.createTextNode("Knoten");
        tag.appendChild(text);
        tag.innerHTML = "<b>Knoten</b>"
        newDiv?.appendChild(tag);


        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_ein_Knoten");
        table.setAttribute("class", "output_table_ein");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();

        const row0 = thead.insertRow();

        // @ts-ignore
        let th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "";
        th0.colSpan = 7
        row0.appendChild(th0);


        // @ts-ignore
        th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Freihheitsgrade";
        th0.title = "Nummern der Gleichungen"
        th0.setAttribute("class", "table_ein_cell_center");
        th0.colSpan = 3
        row0.appendChild(th0);

        const row = thead.insertRow();

        for (let i = 0; i < 10; i++) {
            // @ts-ignore
            let th0 = table.tHead.appendChild(document.createElement("th"));
            th0.innerHTML = kopf[i];
            th0.title = kopf_text[i];
            th0.setAttribute("class", "table_ein_cell_center");
            row.appendChild(th0);
        }

        for (let i = 0; i < nnodes; i++) {

            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_ein_cell_center");

            for (let ispalte = 1; ispalte < 10; ispalte++) {
                newCell = newRow.insertCell(ispalte);
                if (ispalte === 1) { newText = document.createTextNode(myFormat(node[i].x, 3, 3)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 2) { newText = document.createTextNode(myFormat(node[i].z, 3, 3)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 3) { newText = document.createTextNode(myFormat(node[i].L_org[0], 0, 1)); newCell.style.minWidth = '5rem'; }
                else if (ispalte === 4) { newText = document.createTextNode(myFormat(node[i].L_org[1], 0, 1)); newCell.style.minWidth = '5rem'; }
                else if (ispalte === 5) { newText = document.createTextNode(myFormat(node[i].L_org[2], 0, 1)); newCell.style.minWidth = '5rem'; }
                else if (ispalte === 6) newText = document.createTextNode(myFormat(node[i].phi, 0, 3));
                else {
                    let lager = 0
                    if (ispalte === 7) lager = node[i].L[0] + 1;
                    else if (ispalte === 8) lager = node[i].L[1] + 1;
                    else if (ispalte === 9) lager = node[i].L[2] + 1;
                    else { }
                    if (lager === 0) newText = document.createTextNode('-');
                    else newText = document.createTextNode(String(lager));
                    // else if (ispalte === 7) newText = document.createTextNode(myFormat(node[i].L[0], 0, 2));
                    // else if (ispalte === 8) newText = document.createTextNode(myFormat(node[i].L[1], 0, 2));
                    // else if (ispalte === 9) newText = document.createTextNode(myFormat(node[i].L[2], 0, 2));
                }

                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");

            }

        }
    }



    {

        const kopf = ['No', 'Name', 'A <br> [cm<sup>2</sup>]', 'I<sub>y</sub> <br> [cm<sup>4</sup>]', 'E-Modul <br> [N/mm<sup>2</sup>]', '&nu; <br> -', '&kappa;<sub>&tau;</sub> <br> -', '&alpha;<sub>T</sub> <br> [1/K]', 'Wichte <br> [kN/m<sup>3</sup>]'];
        //const kopf2 = ['', '', '[cm²]', '[cm<sup>4</sup>]', '[N/mm²]', '-', '-', '[1/K]', '[kN/m³]'];
        const kopf_text = ['Nummer', 'Querschnittsname', 'Querschnittsfläche', 'Trägheitsmoment', 'Elastizitätsmodul', 'Querdehnzahl', 'Schubmodul', 'Wärmeausdehnungskoeffizient', 'Wichte'];

        let tag = document.createElement("p"); // <p></p>
        let text = document.createTextNode("Querschnitte");
        tag.appendChild(text);
        tag.innerHTML = "<b>Querschnitte</b>"
        newDiv?.appendChild(tag);


        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_ein_querschnitte");
        table.setAttribute("class", "output_table_ein");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row = thead.insertRow();

        for (let i = 0; i < 9; i++) {
            // @ts-ignore
            let th0 = table.tHead.appendChild(document.createElement("th"));
            th0.innerHTML = kopf[i];
            th0.title = kopf_text[i];
            th0.setAttribute("class", "table_ein_cell_center");
            row.appendChild(th0);
        }

        // const row2 = thead.insertRow();

        // for (let i = 0; i < 9; i++) {
        //     // @ts-ignore
        //     let th0 = table.tHead.appendChild(document.createElement("th"));
        //     th0.innerHTML = kopf2[i];
        //     th0.setAttribute("class", "table_ein_cell_center");
        //     row2.appendChild(th0);
        // }


        for (let i = 0; i < nQuerschnittSets; i++) {

            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_ein_cell_center");

            for (let ispalte = 1; ispalte <= 8; ispalte++) {
                newCell = newRow.insertCell(ispalte);
                if (ispalte === 1) newText = document.createTextNode(stab[i].qname);
                else if (ispalte === 2) { newText = document.createTextNode(myFormat(el[i].area * 10000., 1, 2)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 3) { newText = document.createTextNode(myFormat(el[i].Iy * 100000000., 1, 1)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 4) { newText = document.createTextNode(myFormat(el[i].emodul / 1000., 1, 1)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 5) { newText = document.createTextNode(myFormat(el[i].querdehnzahl, 1, 2)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 6) { newText = document.createTextNode(myFormat(el[i].schubfaktor, 0, 3)); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 7) { newText = document.createTextNode(myFormat(el[i].alphaT,1,2,1)); newCell.style.minWidth = '4rem'; }
                //else if (ispalte === 7) { newText = document.createTextNode(String(Number.parseFloat(el[i].alphaT).toExponential())); newCell.style.minWidth = '4rem'; }
                else if (ispalte === 8) { newText = document.createTextNode(myFormat(el[i].wichte, 1, 2)); newCell.style.minWidth = '4rem'; }
                else { }
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }
        }
    }

    {

        let tag = document.createElement("p"); // <p></p>
        let text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = "<b>Stabelemente</b>"
        newDiv?.appendChild(tag);

        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_ein_elemente");
        table.setAttribute("class", "output_table_ein");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row0 = thead.insertRow();

        // @ts-ignore
        let th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "";
        th0.title = "Stabnummer"
        //th0.setAttribute("class", "table_ein_cell_center");
        th0.colSpan = 4
        row0.appendChild(th0);


        // @ts-ignore
        th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Gelenke";
        th0.title = "Gelenke"
        th0.setAttribute("class", "table_ein_cell_center");
        th0.colSpan = 6
        row0.appendChild(th0);

        // @ts-ignore
        th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "";
        row0.appendChild(th0);

        // @ts-ignore
        th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Inzidenzvektor";
        th0.title = "zeigt an, an welchen globalen Freigeitsgraden die 6 Elementfreiheitsgrade liegen, 0=starre Lagerung"
        th0.setAttribute("class", "table_ein_cell_center");
        th0.colSpan = 6
        row0.appendChild(th0);


        const row = thead.insertRow();

        // @ts-ignore
        th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "El No";
        th0.title = "Stabnummer"
        th0.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th0);
        // @ts-ignore
        const th1 = table.tHead.appendChild(document.createElement("th"));
        th1.innerHTML = "Querschnitt";
        th1.title = "Querschnittsname"
        th1.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = "nod a";
        th2.title = "globale Knotennummer am Elementanfang"
        th2.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th2);
        // @ts-ignore
        const th3 = table.tHead.appendChild(document.createElement("th"));
        th3.innerHTML = "nod e";
        th3.title = "globale Knotennummer am Elementende"
        th3.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th3);

        // @ts-ignore
        let th4 = table.tHead.appendChild(document.createElement("th"));
        th4.innerHTML = "N<sub>a</sub>";
        th4.title = "Normalkraftgelenk am Stabanfang"
        th4.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th4);
        // @ts-ignore
        let th5 = table.tHead.appendChild(document.createElement("th"));
        th5.innerHTML = "V<sub>a</sub>";
        th5.title = "Querkraftgelenk am Stabanfang"
        th5.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th5);
        // @ts-ignore
        let th6 = table.tHead.appendChild(document.createElement("th"));
        th6.innerHTML = "M<sub>a</sub>";
        th6.title = "Biegemomentgelenk am stabanfang"
        th6.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th6);


        // @ts-ignore
        th4 = table.tHead.appendChild(document.createElement("th"));
        th4.innerHTML = "N<sub>e</sub>";
        th4.title = "Normalkraftgelenk am Stabende"
        th4.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th4);
        // @ts-ignore
        th5 = table.tHead.appendChild(document.createElement("th"));
        th5.innerHTML = "V<sub>e</sub>";
        th5.title = "Querkraftgelenk am Stabende"
        th5.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th5);
        // @ts-ignore
        th6 = table.tHead.appendChild(document.createElement("th"));
        th6.innerHTML = "M<sub>e</sub>";
        th6.title = "Biegemomentgelenk am Stabende"
        th6.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th6);

        // @ts-ignore
        th6 = table.tHead.appendChild(document.createElement("th"));
        th6.innerHTML = "Länge [m]";
        th6.title = "Stablänge"
        th6.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th6);

        for (let i = 1; i <= 6; i++) {
            // @ts-ignore
            th6 = table.tHead.appendChild(document.createElement("th"));
            th6.innerHTML = "lm(" + i + ")"
            th6.title = "Gleichungsnummer"
            th6.setAttribute("class", "table_ein_cell_center");
            row.appendChild(th6);
        }

        for (let i = 0; i < nelem_Balken; i++) {

            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_ein_cell_center");

            let ispalte = 1
            newCell = newRow.insertCell(ispalte);
            newText = document.createTextNode(String(stab[i].qname));
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            for (let j = 0; j < 2; j++) {
                ispalte++
                newCell = newRow.insertCell(ispalte);
                newText = document.createTextNode(String(+stab[i].nod[j] + 1));
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }

            for (let j = 1; j <= 6; j++) {
                newCell = newRow.insertCell(j + 3);  // Insert a cell in the row at index 1
                newText = document.createTextNode(String(stab[i].gelenk[j - 1]));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }
            ispalte = 10
            newCell = newRow.insertCell(ispalte);
            newText = document.createTextNode(myFormat(stab[i].sl, 3, 3));
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");


            for (let j = 0; j < 6; j++) {
                ispalte++
                newCell = newRow.insertCell(ispalte);
                newText = document.createTextNode(String(+el[i].lm[j] + 1));
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }

        }
    }

    return newDiv;

}