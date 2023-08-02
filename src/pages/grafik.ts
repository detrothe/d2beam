import Two from 'two.js'

import { CTrans } from './trans';
import { CTimoshenko_beam } from "./timoshenko_beam"
import { xmin, xmax, zmin, zmax, slmax, nlastfaelle, nkombinationen } from "./rechnen";
import { el as element, node, nelem, nnodes } from "./rechnen";
import { maxValue_lf, maxValue_komb, disp_lf, THIIO_flag } from "./rechnen";
//import { Pane } from 'tweakpane';
import { myPanel } from './mypanelgui'

console.log("in grafik")

let tr: CTrans
let drawPanel = 0
let draw_lastfall = 1


let show_webgl_label = false;
let show_systemlinien = true;
let show_verformungen = false;

export function select_loadcase_changed() {

    console.log("################################################ select_loadcase_changed")
    const el_select_loadcase = document.getElementById("id_select_loadcase") as HTMLSelectElement
    console.log("option", el_select_loadcase.value)
    draw_lastfall = Number(el_select_loadcase.value)
}

//--------------------------------------------------------------------------------------------------- i n i t _ g r a f i k

export function init_grafik() {

    if (drawPanel === 0) {
        myPanel();
        drawPanel = 1;
    }

    const el_select = document.getElementById('id_select_loadcase') as HTMLSelectElement;

    while (el_select.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select.removeChild(el_select?.lastChild);
    }
    //el.style.width = '100%';   // 100px
    console.log('CREATE SELECT', nlastfaelle, el_select);

    if (THIIO_flag === 0) {

        for (let i = 0; i < nlastfaelle; i++) {
            let option = document.createElement('option');

            option.value = String(+i + 1)
            option.textContent = 'Lastfall ' + (+i + 1);

            el_select.appendChild(option);
        }

    } else if (THIIO_flag === 1) {

        for (let i = 0; i < nkombinationen; i++) {
            let option = document.createElement('option');

            option.value = String(+i + 1)
            option.textContent = 'Kombination ' + (+i + 1);

            el_select.appendChild(option);
        }
    }

}

//--------------------------------------------------------------------------------------------------- d r a w s y s t e m

export function drawsystem() {

    var params = {
        fullscreen: false
    };
    var elem = document.getElementById('id_grafik') as any; //HTMLDivElement;
    console.log("childElementCount", elem.childElementCount)

    if (elem.childElementCount > 2) elem.removeChild(elem?.lastChild);
    /*
        while (elem.hasChildNodes()) {  // alte Zeichnungen entfernen
            elem.removeChild(elem?.lastChild);  //   ?.firstChild);
        }
    */
    /*
        const el_container = document.getElementById('panel_gui') as any; //HTMLDivElement;


        const pane = new Pane({ container: el_container});  // document.querySelector('#id_grafik')

        const PARAMS = {
            speed: 0.5,
        };

        pane.addInput(PARAMS, 'speed');

        //return;
    */


    var two = new Two(params).appendTo(elem);


    console.log("document.documentElement", document.documentElement.clientHeight)

    let el = document.getElementById("id_tab_group") as any
    //let height = el.getBoundingClientRect().height
    console.log("boundingRect", el?.getBoundingClientRect().height)
    let height = document.documentElement.clientHeight //- el?.getBoundingClientRect()?.height;
    two.width = document.documentElement.clientWidth;
    el = document.querySelector('.footer'); //.getElementById("container")
    console.log("container footer boundingRect", el?.getBoundingClientRect())

    //height= height - el?.getBoundingClientRect().height;
    two.height = height
    /*
        // Two.js has convenient methods to make shapes and insert them into the scene.
        var radius = 50;
        var x = two.width * 0.5;
        var y = two.height * 0.5 - radius * 1.25;
        var circle = two.makeCircle(x, y, radius);

        y = two.height * 0.5 + radius * 1.25;
        var width = 100;
        height = 100;
        var rect = two.makeRectangle(x, y, width, height);

        // The object returned has many stylable properties:
        circle.fill = '#FF8000';
        // And accepts all valid CSS color:
        circle.stroke = 'orangered';
        circle.linewidth = 5;

        rect.fill = 'rgb(0, 200, 255)';
        rect.opacity = 0.75;
        rect.noStroke();
*/
    //two.makeLine(0, 0, two.width, two.height)



    console.log("MAX", slmax, xmin, xmax, zmin, zmax)
    console.log('maxValue_lf(komb)', maxValue_lf, maxValue_komb)

    if (tr === undefined) {
        console.log("in undefined")
        tr = new CTrans(xmin, zmin, xmax, zmax, two.width, two.height)
    } else {
        tr.init(xmin, zmin, xmax, zmax, two.width, two.height);
    }

    let x1: number, x2: number, z1: number, z2: number

    if (show_systemlinien) {

        for (let ielem = 0; ielem < nelem; ielem++) {
            //console.log("element",ielem,element)
            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));
            //console.log("x..", element[ielem].x1, element[ielem].z1, element[ielem].x2, element[ielem].z2)
            //console.log("elem", ielem, x1, z1, x2, z2)
            let line = two.makeLine(x1, z1, x2, z2);
            line.linewidth = 10;
        }
    }

    // Verformungen

    if (show_verformungen) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number
        let Nu: number[] = [2], Nw: number[] = [4]
        let nodi: number
        let u: number, w: number, uG: number, wG: number
        let disp: number[] = [6], edispL: number[] = [6]
        let iLastfall = draw_lastfall
        let scalefactor = 0
        if (THIIO_flag === 0) {
            scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].disp
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].disp
        }
        console.log("scalefaktor", scalefactor, slmax, maxValue_lf[iLastfall - 1].disp)

        for (let ielem = 0; ielem < nelem; ielem++) {
            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            nodi = element[ielem].nod1 + 1
            disp[0] = disp_lf._(nodi, 1, iLastfall);
            disp[1] = disp_lf._(nodi, 2, iLastfall);
            edispL[2] = disp[2] = disp_lf._(nodi, 3, iLastfall);
            nodi = element[ielem].nod2 + 1
            disp[3] = disp_lf._(nodi, 1, iLastfall);
            disp[4] = disp_lf._(nodi, 2, iLastfall);
            edispL[5] = disp[5] = disp_lf._(nodi, 3, iLastfall);
            console.log("disp", disp)

            edispL[0] = element[ielem].cosinus * disp[0] + element[ielem].sinus * disp[1]
            edispL[1] = -element[ielem].sinus * disp[0] + element[ielem].cosinus * disp[1]
            edispL[3] = element[ielem].cosinus * disp[3] + element[ielem].sinus * disp[4]
            edispL[4] = -element[ielem].sinus * disp[3] + element[ielem].cosinus * disp[4]

            dx = element[ielem].sl / 10.0
            kappa = element[ielem].kappa
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * kappa * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= 10; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x + sl ** 3 + 12 * kappa * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * kappa) * x ** 2 + (sl ** 3 + 6 * kappa * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * kappa - sl ** 2) * x ** 2 - 6 * kappa * sl * x) / nenner);
                u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];

                uG = element[ielem].cosinus * u - element[ielem].sinus * w
                wG = element[ielem].sinus * u + element[ielem].cosinus * w

                //console.log("x, w", x, uG, wG, tr.xPix(uG * scalefactor), tr.zPix(wG * scalefactor))
                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)
                if (i > 0) {
                    //console.log("line", xx1, zz1, xx2, zz2)
                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                    line.linewidth = 2;
                }
                x = x + dx
            }

        }
    }

    // Don’t forget to tell two to draw everything to the screen
    two.update();

    //el = document.querySelector('.footer'); //.getElementById("container")
    //console.log("nach update container footer boundingRect", el?.getBoundingClientRect())

}


//--------------------------------------------------------------------------------------------------------
function draw_systemlinien_grafik() {
    //--------------------------------------------------------------------------------------------------------

    console.log("in draw_systemlinien_grafik");
    show_systemlinien = !show_systemlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_verformungen_grafik() {
    //--------------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_verformungen = !show_verformungen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}
//---------------------------------------------------------------------------------- a d d E v e n t L i s t e n e r

window.addEventListener('draw_systemlinien_grafik', draw_systemlinien_grafik);
window.addEventListener('draw_verformungen_grafik', draw_verformungen_grafik);