
import Two from 'two.js'

import { CTrans } from './trans';
import { myFormat, write } from './utility'
//import { CTimoshenko_beam } from "./timoshenko_beam"
import { xmin, xmax, zmin, zmax, slmax, nlastfaelle, nkombinationen, neigv, nelTeilungen, load } from "./rechnen";
import { el as element, node, nelem, nnodes, nloads, neloads, eload, nstabvorverfomungen, stabvorverformung } from "./rechnen";
import { maxValue_lf, maxValue_komb, maxValue_eigv, maxValue_u0, maxValue_eload, lagerkraefte, THIIO_flag, maxValue_w0 } from "./rechnen";
//import { Pane } from 'tweakpane';
import { myPanel, get_scale_factor } from './mypanelgui'
//import { colorToRgbNumber } from '@tweakpane/core';
import { app } from "./haupt";
import { saveAs } from 'file-saver';


console.log("in grafik")

//let two: Two
let domElement: any = null
let svgElement: any = null;
let wheel_factor = 1.0
let mouseOffsetX = 0.0
let mouseOffsetY = 0.0
let mouseDx = 0.0
let mouseDz = 0.0

let xminw = 0.0, xmaxw = 0.0, zminw = 0.0, zmaxw = 0.0
let xmint = 0.0, xmaxt = 0.0, zmint = 0.0, zmaxt = 0.0

let tr: CTrans

let drawPanel = 0
let draw_lastfall = 1
let draw_eigenform = 1

let devicePixelRatio = 1

let scaleFactor_panel = 1.0
let show_labels = false;
let show_systemlinien = true;
let show_verformungen = false;
let show_eigenformen = false;
let show_momentenlinien = false;
let show_querkraftlinien = false;
let show_normalkraftlinien = false;
let show_schiefstellung = false;
let show_lasten = true;
let show_lagerkraefte = true;
let show_stabvorverformung = false;


const style_txt = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: 'red',
    //opacity: 0.5,
    //leading: 50
    weight: 'bold'
};

const style_txt_lager = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: '#006666',
    weight: 'bold'
};

const style_txt_knotenlast = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: '#dc0000',
    weight: 'bold'
};
const style_pfeil = {
    b: 20,
    h: 10,
    linewidth: 2,
    color: '#000000'
}

const style_pfeil_lager = {
    radius: 50,
    a: 35,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#006666'
}

const style_pfeil_knotenlast = {
    a: 35,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#dc0000'
}

const style_pfeil_moment = {
    radius: 50,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#dc0000'
}
export function select_loadcase_changed() {

    //console.log("################################################ select_loadcase_changed")
    const el_select_loadcase = document.getElementById("id_select_loadcase") as HTMLSelectElement
    //console.log("option", el_select_loadcase.value)
    draw_lastfall = Number(el_select_loadcase.value)
    drawsystem();
}

export function select_eigenvalue_changed() {

    //console.log("################################################ select_eigenvalue_changed")
    const el_select_eigenvalue = document.getElementById("id_select_eigenvalue") as HTMLSelectElement
    //console.log("option", el_select_eigenvalue.value)
    draw_eigenform = Number(el_select_eigenvalue.value)
    drawsystem();
}

//--------------------------------------------------------------------------------------------------- i n i t _ g r a f i k

export function init_grafik() {

    if (drawPanel === 0) {
        myPanel();
        drawPanel = 1;
    }

    devicePixelRatio = window.devicePixelRatio
    write('devicePixelRatio =  ', devicePixelRatio)

    const el_select = document.getElementById('id_select_loadcase') as HTMLSelectElement;

    while (el_select.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select.removeChild(el_select?.lastChild);
    }
    //el.style.width = '100%';   // 100px
    console.log('CREATE SELECT', nlastfaelle, el_select);
    draw_lastfall = 1

    const el_select_eigv = document.getElementById('id_select_eigenvalue') as HTMLSelectElement;

    while (el_select_eigv.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select_eigv.removeChild(el_select_eigv?.lastChild);
    }
    draw_eigenform = 1

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


        for (let i = 0; i < neigv; i++) {
            let option = document.createElement('option');

            option.value = String(+i + 1)
            option.textContent = 'Eigenform ' + (+i + 1);

            el_select_eigv.appendChild(option);
        }
    }

}

//--------------------------------------------------------------------------------------------------------
function wheel(ev: WheelEvent) {
    //----------------------------------------------------------------------------------------------------

    console.log('==========================in mousewheel', ev.deltaX, ev.deltaY, ev.offsetX, ev.offsetY)
    ev.preventDefault()
    if (ev.deltaY > 0) {
        wheel_factor += 0.1;
        if (wheel_factor > 2) wheel_factor = 2.0
    }
    else if (ev.deltaY < 0) {
        wheel_factor -= 0.1;
        if (wheel_factor < 0.1) wheel_factor = 0.1
    }
    //mouseOffsetX = ev.offsetX
    //mouseOffsetY = ev.offsetY
    mouseDx = 0.0
    mouseDz = 0.0

    drawsystem()
}

//--------------------------------------------------------------------------------------------------------
function mousedown(ev: any) {
    //----------------------------------------------------------------------------------------------------

    console.log('in mousedown', ev)
    ev.preventDefault()
    // if (ev.wheelDeltaY > 0) wheel_factor -= 0.1;
    // else if (ev.wheelDeltaY < 0) wheel_factor += 0.1;
    window.addEventListener('mousemove', mousemove, false);

    mouseOffsetX = ev.offsetX
    mouseOffsetY = ev.offsetY
    //mouseDx = 0.0
    //mouseDz = 0.0
    //wheel_factor=1.0
    //drawsystem()
}

//--------------------------------------------------------------------------------------------------------
function mousemove(ev: MouseEvent) {
    //----------------------------------------------------------------------------------------------------

    console.log('in mousemove', ev.movementX, ev.movementY, ev.offsetX, ev.offsetY)
    ev.preventDefault()
    // if (ev.wheelDeltaY > 0) wheel_factor -= 0.1;
    // else if (ev.wheelDeltaY < 0) wheel_factor += 0.1;

    //drawsystem()

    console.log("word", tr.xWorld(ev.offsetX), tr.zWorld(ev.offsetY))

    mouseDx += ev.offsetX - mouseOffsetX
    mouseDz += ev.offsetY - mouseOffsetY
    mouseOffsetX = ev.offsetX
    mouseOffsetY = ev.offsetY
    drawsystem()
}

//--------------------------------------------------------------------------------------------------------
function mouseup(ev: any) {
    //----------------------------------------------------------------------------------------------------

    console.log('in mouseup', ev)
    ev.preventDefault()
    // if (ev.wheelDeltaY > 0) wheel_factor -= 0.1;
    // else if (ev.wheelDeltaY < 0) wheel_factor += 0.1;
    window.removeEventListener('mousemove', mousemove, false);

    //drawsystem()
}

//--------------------------------------------------------------------------------------------------- d r a w s y s t e m

export function drawsystem() {

    var params = {
        fullscreen: false
    };


    if (domElement != null) {
        domElement.removeEventListener('wheel', wheel, false);
        domElement.removeEventListener('mousedown', mousedown, false);
        domElement.removeEventListener('mouseup', mousemove, false);

    }

    // for (let i = 0; i < two.scene.children.length; i++) {
    //     let child = two.scene.children[i];
    //     two.scene.remove(child);
    //     Two.Utils.dispose(child);
    // }

    console.log("__________________________________  G R A F I K  ___________")
    const elem = document.getElementById('artboard') as any; //HTMLDivElement;
    console.log("childElementCount", elem.childElementCount)

    if (elem.childElementCount > 0) elem.removeChild(elem?.lastChild);   // war > 2
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

    let opacity = 0.5

    let onlyLabels = !(show_normalkraftlinien || show_querkraftlinien || show_momentenlinien || show_schiefstellung || show_eigenformen || show_verformungen || show_stabvorverformung);

    const artboard = document.getElementById("artboard") as any;
    console.log("artboard", artboard)
    let two = new Two(params).appendTo(artboard);


    //console.log("document.documentElement", document.documentElement.clientHeight)

    //let ele = document.getElementById("id_tab_group") as any
    //let height = el.getBoundingClientRect().height
    //console.log("boundingRect", ele?.getBoundingClientRect().height)
    let height = document.documentElement.clientHeight //- el?.getBoundingClientRect()?.height;
    two.width = document.documentElement.clientWidth;
    //ele = document.querySelector('.footer'); //.getElementById("container")
    //console.log("container footer boundingRect", ele?.getBoundingClientRect())

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


    // xminw = xmin * (1 + wheel_factor) / 2. + xmax * (1. - wheel_factor) / 2.
    // xmaxw = xmin * (1 - wheel_factor) / 2. + xmax * (1. + wheel_factor) / 2.
    // zminw = zmin * (1 + wheel_factor) / 2. + zmax * (1. - wheel_factor) / 2.
    // zmaxw = zmin * (1 - wheel_factor) / 2. + zmax * (1. + wheel_factor) / 2.
    if (tr === undefined) {

        xminw = xmin
        xmaxw = xmax
        zminw = zmin
        zmaxw = zmax
    } else {
        let ax = tr.xWorld(mouseOffsetX)
        let az = tr.zWorld(mouseOffsetY)
        let dx = tr.World0(mouseDx)
        let dz = tr.World0(mouseDz)
        console.log("======= dx,dz", ax, az, dx, dz)


        xmint = xmin * (1 + wheel_factor) / 2. + xmax * (1. - wheel_factor) / 2.
        xmaxt = xmin * (1 - wheel_factor) / 2. + xmax * (1. + wheel_factor) / 2.
        zmint = zmin * (1 + wheel_factor) / 2. + zmax * (1. - wheel_factor) / 2.
        zmaxt = zmin * (1 - wheel_factor) / 2. + zmax * (1. + wheel_factor) / 2.

        xminw = xmint - dx
        xmaxw = xmaxt - dx
        zminw = zmint - dz
        zmaxw = zmaxt - dz
    }
    //     xminw = ax - wheel_factor * (xmax - xmin)/2
    //     xmaxw = ax + wheel_factor * (xmax - xmin)/2
    // }

    if (tr === undefined) {
        console.log("in undefined")
        tr = new CTrans(xminw, zminw, xmaxw, zmaxw, two.width, two.height)
    } else {
        tr.init(xminw, zminw, xmaxw, zmaxw, two.width, two.height);
    }

    let x1: number, x2: number, z1: number, z2: number


    // Verformungen

    if (show_verformungen) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, eta: number, sl: number, nenner: number
        let Nu: number[] = Array(2), Nw: number[] = Array(4)
        let u: number, w: number, uG: number, wG: number
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0

        let edispL: number[] = new Array(6)
        let iLastfall = draw_lastfall
        let scalefactor = 0
        if (THIIO_flag === 0) {
            if (maxValue_lf[iLastfall - 1].disp != 0.0) scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].disp * 1000.
        }
        else if (THIIO_flag === 1) {
            if (maxValue_komb[iLastfall - 1].disp != 0.0) scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].disp * 1000.
        }

        scalefactor *= scaleFactor_panel

        console.log("scalefaktor", scalefactor, slmax, maxValue_lf[iLastfall - 1].disp)

        for (let ielem = 0; ielem < nelem; ielem++) {
            maxU = 0.0

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL(edispL, iLastfall - 1)

            dx = element[ielem].sl / nelTeilungen
            eta = element[ielem].eta
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * eta * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
                u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];

                console.log("wx =", w, element[ielem].w_[iLastfall - 1][i])
                w += element[ielem].w_[iLastfall - 1][i]  // Anteil aus Elementlasten im Starrsystem

                uG = element[ielem].cosinus * u - element[ielem].sinus * w
                wG = element[ielem].sinus * u + element[ielem].cosinus * w

                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                if (i > 0) {
                    //console.log("line", xx1, zz1, xx2, zz2)
                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                    line.linewidth = 2;
                }

                dispG = Math.sqrt(uG * uG + wG * wG)
                if (dispG > maxU) {
                    maxU = dispG
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)
                }

                x = x + dx
            }

            if (show_labels && maxU > 0.0) {

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#111111'     //'#D3D3D3'

                const str = myFormat(maxU * 1000, 1, 1) + 'mm'
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

            }
        }
    }


    // Eigenformen

    if (show_eigenformen && (maxValue_eigv[draw_lastfall - 1][draw_eigenform - 1] > 0.0)) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, eta: number, sl: number, nenner: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

        let u: number, w: number, uG: number, wG: number
        let edispL: number[] = new Array(6)
        let ikomb = draw_lastfall
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0


        let scalefactor = 0.1 * slmax / maxValue_eigv[ikomb - 1][draw_eigenform - 1]    //maxValue_komb[iLastfall - 1].disp

        scalefactor *= scaleFactor_panel

        console.log("scalefaktor", scalefactor, slmax, maxValue_lf[draw_eigenform - 1].disp)
        console.log("draw_eigenform", draw_eigenform, ikomb)

        for (let ielem = 0; ielem < nelem; ielem++) {
            maxU = 0.0

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL_eigenform(edispL, ikomb, draw_eigenform)

            dx = element[ielem].sl / nelTeilungen
            eta = element[ielem].eta
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * eta * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
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

                dispG = Math.sqrt(uG * uG + wG * wG)

                if (dispG > maxU) {
                    maxU = dispG
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)
                }

                x = x + dx
            }

            if (show_labels && maxU > 0.0) {

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#D3D3D3'

                const str = myFormat(maxU, 1, 2)
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

            }

        }
    }


    // Schiefstellung

    if (show_schiefstellung && (maxValue_u0[draw_lastfall - 1].u0 > 0.0)) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, eta: number, sl: number, nenner: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

        let u: number, w: number, uG: number, wG: number
        let edispL: number[] = new Array(6)
        let ikomb = draw_lastfall
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0

        let scalefactor = 0.1 * slmax / maxValue_u0[ikomb - 1].u0

        scalefactor *= scaleFactor_panel

        console.log("scalefaktor", scalefactor, slmax, maxValue_u0[ikomb - 1].u0)
        console.log("draw_schiefstellung", ikomb)

        for (let ielem = 0; ielem < nelem; ielem++) {
            maxU = 0.0

            // x1 = Math.round(tr.xPix(element[ielem].x1));
            // z1 = Math.round(tr.zPix(element[ielem].z1));
            // x2 = Math.round(tr.xPix(element[ielem].x2));
            // z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL_schiefstellung(edispL, ikomb - 1)

            dx = element[ielem].sl / nelTeilungen
            eta = element[ielem].eta
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * eta * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
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

                dispG = Math.sqrt(uG * uG + wG * wG)

                if (dispG > maxU) {
                    maxU = dispG
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)

                }

                x = x + dx
            }

            if (show_labels && maxU > 0.0) {

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#D3D3D3'

                const str = myFormat(maxU * 1000, 1, 1) + 'mm'
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

            }

        }
    }


    // Stabvorverformung

    if (show_stabvorverformung && maxValue_w0 > 0.0) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, sl: number, nenner: number

        let uG: number, wG: number
        let ikomb = draw_lastfall
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0

        let scalefactor = 0.05 * slmax / maxValue_w0

        scalefactor *= scaleFactor_panel

        console.log("scalefaktor", scalefactor, slmax, maxValue_w0)
        console.log("draw_stabvorverformung", ikomb)

        maxU = 0.0

        for (let ielem = 0; ielem < nelem; ielem++) {
            sl = element[ielem].sl

            for (let i = 0; i < nstabvorverfomungen; i++) {
                if (stabvorverformung[i].element === ielem) {
                    //console.log("Element ", +i + 1, ' hat Stabvorverformungen')
                    let w0a = stabvorverformung[i].p[0]
                    let w0e = stabvorverformung[i].p[1]
                    let v0m = stabvorverformung[i].p[2]

                    dx = sl / nelTeilungen
                    x = 0.0; xx2 = 0.0; zz2 = 0.0
                    for (let iteil = 0; iteil <= nelTeilungen; iteil++) {


                        let w0x = (w0e - w0a) * x / sl + 4.0 * v0m * x / sl * (1.0 - x / sl)

                        uG = -element[ielem].sinus * w0x
                        wG = element[ielem].cosinus * w0x

                        xx1 = xx2; zz1 = zz2;
                        xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
                        zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
                        xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                        //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)
                        if (iteil > 0) {
                            //console.log("line", xx1, zz1, xx2, zz2)
                            let line = two.makeLine(xx1, zz1, xx2, zz2);
                            line.linewidth = 2;
                        }

                        dispG = Math.sqrt(uG * uG + wG * wG)

                        if (dispG > maxU) {
                            maxU = dispG
                            x_max = xx2
                            z_max = zz2
                            xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                            zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)

                        }
                        x = x + dx
                    }
                }

            }


            if (show_labels && maxU > 0.0) {

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#D3D3D3'

                const str = myFormat(maxU * 1000, 1, 1) + 'mm'
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

            }

        }
    }

    // Momentenlinien

    if (show_momentenlinien) {

        let xx1: number, zz1: number, xx2: number, zz2: number
        let dx: number, x: number, sl: number, vorzeichen: number, sgArea = 0.0
        let sgL: number, sgR: number, xL: number

        let iLastfall = draw_lastfall
        let scalefactor = 0
        //let poly: number[] = new Array(8)
        let maxM = 0.0, minM = 0.0, x_max = 0.0, z_max = 0.0, x0 = 0.0, z0 = 0.0, xn = 0.0, zn = 0.0, x_min = 0.0, z_min = 0.0


        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return
        if (THIIO_flag === 0) {
            scalefactor = 0.05 * slmax / maxValue_lf[iLastfall - 1].My
            console.log("MAX VALUES", iLastfall, maxValue_lf[iLastfall - 1].My, slmax)
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.05 * slmax / maxValue_komb[iLastfall - 1].My
            console.log("MAX VALUES", iLastfall, maxValue_komb[iLastfall - 1].My, slmax)
            //console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].My)
        }

        scalefactor *= scaleFactor_panel

        for (let ielem = 0; ielem < nelem; ielem++) {

            if (scalefactor === Infinity) break;

            const nelTeilungen = element[ielem].nTeilungen
            let Mx: number[] = new Array(nelTeilungen)

            element[ielem].get_elementSchnittgroesse_Moment(Mx, draw_lastfall - 1)
            console.log("GRAFIK  Mx", nelTeilungen, Mx)

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            sl = element[ielem].sl

            //let group = two.makeGroup();
            var vertices = [];
            vertices.push(new Two.Anchor(x1, z1));

            xx2 = 0.0; zz2 = 0.0
            sgL = Mx[0]
            xx1 = tr.xPix(element[ielem].x1 - element[ielem].sinus * Mx[0] * scalefactor)
            zz1 = tr.zPix(element[ielem].z1 + element[ielem].cosinus * Mx[0] * scalefactor)
            x0 = xx1
            z0 = zz1
            maxM = Mx[0]
            minM = Mx[0]
            vorzeichen = 1
            sgArea = 0.0

            for (let i = 1; i < nelTeilungen; i++) {

                x = element[ielem].x_[i]
                xL = element[ielem].x_[i - 1]
                dx = x - xL
                sgR = Mx[i]
                console.log("sigL und R", sgL, sgR)

                if (sgL >= 0.0 && sgR > 0.0) {
                    vertices.push(new Two.Anchor(xx1, zz1));
                    vorzeichen = 1
                    sgArea += (sgL + sgR) * dx / 2.
                } else if (sgL <= 0.0 && sgR < 0.0) {
                    vertices.push(new Two.Anchor(xx1, zz1));
                    vorzeichen = -1
                    sgArea += (sgL + sgR) * dx / 2.
                } else {   // Vorzeichenwechsel
                    console.log("Vorzeichenwechsel", sgL, sgR)

                    let dx0 = -sgL * dx / (sgR - sgL)
                    let xx0 = tr.xPix(element[ielem].x1 + (xL + dx0) * element[ielem].cosinus)
                    let zz0 = tr.zPix(element[ielem].z1 + (xL + dx0) * element[ielem].sinus)
                    vertices.push(new Two.Anchor(xx1, zz1));
                    console.log("dx0=", dx0, xx0, zz0)
                    vertices.push(new Two.Anchor(xx0, zz0));

                    // @ts-ignore
                    let flaeche = two.makePath(vertices);
                    if (sgArea > 0.0) flaeche.fill = '#00AEFF';
                    else flaeche.fill = '#AE0000';
                    flaeche.opacity = opacity

                    vertices.length = 0
                    sgArea = 0.0
                    sgL = 0.0
                    vertices.push(new Two.Anchor(xx0, zz0));
                }
                xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Mx[i] * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Mx[i] * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)


                //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)


                if (i === 0) {
                    maxM = Mx[i]
                    minM = Mx[i]
                    x0 = xx2
                    z0 = zz2
                }
                else {
                    if (Mx[i] > maxM) {
                        maxM = Mx[i]
                        x_max = xx2
                        z_max = zz2
                    }
                    if (Mx[i] < minM) {
                        minM = Mx[i]
                        x_min = xx2
                        z_min = zz2
                    }
                }
                if (i === nelTeilungen - 1) {
                    xn = xx2
                    zn = zz2
                }
                xx1 = xx2
                zz1 = zz2
                sgL = sgR
            }
            vertices.push(new Two.Anchor(xx2, zz2));
            vertices.push(new Two.Anchor(x2, z2));


            let flaeche = two.makePath(vertices);
            if (sgArea > 0.0) flaeche.fill = '#00AEFF';
            else flaeche.fill = '#AE0000';
            flaeche.opacity = opacity

            if (show_labels) {
                if (maxM > 0.0) {
                    const str = myFormat(Math.abs(maxM), 1, 2) + 'kNm'
                    const txt = two.makeText(str, x_max, z_max, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (minM < 0.0) {
                    const str = myFormat(Math.abs(minM), 1, 2) + 'kNm'
                    const txt = two.makeText(str, x_min, z_min, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }

                if (Math.abs(Mx[0]) > 0.000001) {
                    const str = myFormat(Math.abs(Mx[0]), 1, 2) + 'kNm'
                    const txt = two.makeText(str, x0, z0, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Mx[nelTeilungen - 1]) > 0.000001) {
                    const str = myFormat(Math.abs(Mx[nelTeilungen - 1]), 1, 2) + 'kNm'
                    const txt = two.makeText(str, xn, zn, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }

            }


        }
    }


    // Querkraftlinien

    if (show_querkraftlinien) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, sl: number, vorzeichen: number, sgArea = 0.0
        let sgL: number, sgR: number, xL: number


        let iLastfall = draw_lastfall
        let scalefactor = 0
        let maxV = 0.0, minV = 0.0, x_max = 0.0, z_max = 0.0, x0 = 0.0, z0 = 0.0, xn = 0.0, zn = 0.0, x_min = 0.0, z_min = 0.0

        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return

        if (THIIO_flag === 0) {
            scalefactor = 0.05 * slmax / maxValue_lf[iLastfall - 1].Vz
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].Vz
            //console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].Vz)
        }

        scalefactor *= scaleFactor_panel
        //console.log("scalefaktor",scalefactor)

        for (let ielem = 0; ielem < nelem; ielem++) {

            if (scalefactor === Infinity) break;

            const nelTeilungen = element[ielem].nTeilungen
            let Vx: number[] = new Array(nelTeilungen)

            element[ielem].get_elementSchnittgroesse_Querkraft(Vx, draw_lastfall - 1)
            console.log("GRAFIK  Vx", Vx)

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            sl = element[ielem].sl

            var vertices = [];
            vertices.push(new Two.Anchor(x1, z1));

            xx2 = 0.0; zz2 = 0.0
            sgL = Vx[0]
            xx1 = tr.xPix(element[ielem].x1 - element[ielem].sinus * Vx[0] * scalefactor)
            zz1 = tr.zPix(element[ielem].z1 + element[ielem].cosinus * Vx[0] * scalefactor)
            x0 = xx1
            z0 = zz1
            maxV = Vx[0]
            minV = Vx[0]
            vorzeichen = 1
            sgArea = 0.0

            for (let i = 1; i < nelTeilungen; i++) {
                x = element[ielem].x_[i]
                xL = element[ielem].x_[i - 1]
                dx = x - xL
                sgR = Vx[i]
                // console.log("Schnittgrößen rechts/links", sgL, sgR, sgArea)
                if (sgL >= 0.0 && sgR > 0.0) {
                    vertices.push(new Two.Anchor(xx1, zz1));
                    vorzeichen = 1
                    sgArea += (sgL + sgR) * dx / 2.
                } else if (sgL <= 0.0 && sgR < 0.0) {
                    vertices.push(new Two.Anchor(xx1, zz1));
                    vorzeichen = -1
                    sgArea += (sgL + sgR) * dx / 2.
                } else {   // Vorzeichenwechsel
                    // console.log("Vorzeichenwechsel", sgL, sgR)

                    let dx0 = -sgL * dx / (sgR - sgL)
                    let xx0 = tr.xPix(element[ielem].x1 + (xL + dx0) * element[ielem].cosinus)
                    let zz0 = tr.zPix(element[ielem].z1 + (xL + dx0) * element[ielem].sinus)
                    vertices.push(new Two.Anchor(xx1, zz1));
                    console.log("dx0=", dx0, xx0, zz0)
                    vertices.push(new Two.Anchor(xx0, zz0));


                    let flaeche = two.makePath(vertices);
                    if (sgArea > 0.0) flaeche.fill = '#00AEFF';
                    else flaeche.fill = '#AE0000';
                    flaeche.opacity = opacity

                    vertices.length = 0
                    sgArea = 0.0
                    sgL = 0.0
                    vertices.push(new Two.Anchor(xx0, zz0));
                }

                xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Vx[i] * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Vx[i] * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                if (i === 0) {
                    maxV = Math.abs(Vx[i])
                    x0 = xx2
                    z0 = zz2
                }
                else {
                    if (Vx[i] > maxV) {
                        maxV = Vx[i]
                        x_max = xx2
                        z_max = zz2
                    }
                    if (Vx[i] < minV) {
                        minV = Vx[i]
                        x_min = xx2
                        z_min = zz2
                    }
                }
                if (i === nelTeilungen - 1) {
                    xn = xx2
                    zn = zz2
                }
                xx1 = xx2
                zz1 = zz2
                sgL = sgR

            }
            vertices.push(new Two.Anchor(xx2, zz2));
            vertices.push(new Two.Anchor(x2, z2));

            let flaeche = two.makePath(vertices);
            if (sgArea > 0.0) flaeche.fill = '#00AEFF';
            else flaeche.fill = '#AE0000';
            flaeche.opacity = opacity



            if (show_labels) {
                if (maxV > 0.0) {
                    const str = myFormat(maxV, 1, 2) + 'kN'
                    const txt = two.makeText(str, x_max, z_max, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (minV < 0.0) {
                    const str = myFormat(Math.abs(minV), 1, 2) + 'kNm'
                    const txt = two.makeText(str, x_min, z_min, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Vx[0]) > 0.000001) {
                    const str = myFormat(Math.abs(Vx[0]), 1, 2) + 'kN'
                    const txt = two.makeText(str, x0, z0, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Vx[nelTeilungen - 1]) > 0.000001) {
                    const str = myFormat(Math.abs(Vx[nelTeilungen - 1]), 1, 2) + 'kN'
                    const txt = two.makeText(str, xn, zn, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }

            }


        }
    }


    // Normalkraftlinien

    if (show_normalkraftlinien) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, sl: number, vorzeichen: number, sgArea = 0.0
        let sgL: number, sgR: number, xL: number

        let iLastfall = draw_lastfall
        let scalefactor = 0
        let maxN = 0.0, minN = 0.0, x_max = 0.0, z_max = 0.0, x0 = 0.0, z0 = 0.0, xn = 0.0, zn = 0.0, x_min = 0.0, z_min = 0.0

        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return

        if (THIIO_flag === 0) {
            scalefactor = 0.05 * slmax / maxValue_lf[iLastfall - 1].N
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].N
            //console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].N)
        }

        scalefactor *= scaleFactor_panel

        for (let ielem = 0; ielem < nelem; ielem++) {

            if (scalefactor === Infinity) break;

            maxN = 0.0
            const nelTeilungen = element[ielem].nTeilungen
            let Nx: number[] = new Array(nelTeilungen)

            element[ielem].get_elementSchnittgroesse_Normalkraft(Nx, draw_lastfall - 1)
            console.log("GRAFIK  Nx", Nx)

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            sl = element[ielem].sl

            let vertices = [];
            vertices.push(new Two.Anchor(x1, z1));

            xx2 = 0.0; zz2 = 0.0
            sgL = Nx[0]
            xx1 = tr.xPix(element[ielem].x1 - element[ielem].sinus * Nx[0] * scalefactor)
            zz1 = tr.zPix(element[ielem].z1 + element[ielem].cosinus * Nx[0] * scalefactor)
            x0 = xx1
            z0 = zz1
            maxN = Nx[0]
            minN = Nx[0]
            vorzeichen = 1
            sgArea = 0.0

            // for (let i = 0; i < nelTeilungen; i++) {

            //     x = element[ielem].x_[i]
            //     console.log("x", i, x, ielem)
            //     xx1 = xx2; zz1 = zz2;
            //     xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Nx[i] * scalefactor
            //     zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Nx[i] * scalefactor
            //     xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
            //     vertices.push(new Two.Anchor(xx2, zz2));

            //     if (i === 0) {
            //         maxN = Math.abs(Nx[i])
            //         x0 = xx2
            //         z0 = zz2
            //     }
            //     else if (Math.abs(Nx[i]) > maxN) {
            //         maxN = Math.abs(Nx[i])
            //         x_max = xx2
            //         z_max = zz2
            //     }

            //     if (i === nelTeilungen - 1) {
            //         xn = xx2
            //         zn = zz2
            //     }

            // }


            // vertices.push(new Two.Anchor(x2, z2));

            for (let i = 1; i < nelTeilungen; i++) {
                x = element[ielem].x_[i]
                xL = element[ielem].x_[i - 1]
                dx = x - xL
                sgR = Nx[i]
                console.log("Schnittgrößen rechts/links", sgL, sgR, sgArea)
                if (sgL >= 0.0 && sgR > 0.0) {
                    vertices.push(new Two.Anchor(xx1, zz1));
                    vorzeichen = 1
                    sgArea += (sgL + sgR) * dx / 2.
                } else if (sgL <= 0.0 && sgR < 0.0) {
                    vertices.push(new Two.Anchor(xx1, zz1));
                    vorzeichen = -1
                    sgArea += (sgL + sgR) * dx / 2.
                } else {   // Vorzeichenwechsel
                    console.log("Vorzeichenwechsel", sgL, sgR)

                    let dx0 = -sgL * dx / (sgR - sgL)
                    let xx0 = tr.xPix(element[ielem].x1 + (xL + dx0) * element[ielem].cosinus)
                    let zz0 = tr.zPix(element[ielem].z1 + (xL + dx0) * element[ielem].sinus)
                    vertices.push(new Two.Anchor(xx1, zz1));
                    console.log("dx0=", dx0, xx0, zz0)
                    vertices.push(new Two.Anchor(xx0, zz0));


                    let flaeche = two.makePath(vertices);
                    if (sgArea > 0.0) flaeche.fill = '#00AEFF';
                    else flaeche.fill = '#AE0000';
                    flaeche.opacity = opacity

                    vertices.length = 0
                    sgArea = 0.0
                    sgL = 0.0
                    vertices.push(new Two.Anchor(xx0, zz0));
                }

                xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Nx[i] * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Nx[i] * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                if (i === 0) {
                    maxN = Math.abs(Nx[i])
                    x0 = xx2
                    z0 = zz2
                }
                else {
                    if (Nx[i] > maxN) {
                        maxN = Nx[i]
                        x_max = xx2
                        z_max = zz2
                    }
                    if (Nx[i] < minN) {
                        minN = Nx[i]
                        x_min = xx2
                        z_min = zz2
                    }
                }
                if (i === nelTeilungen - 1) {
                    xn = xx2
                    zn = zz2
                }
                xx1 = xx2
                zz1 = zz2
                sgL = sgR

            }
            vertices.push(new Two.Anchor(xx2, zz2));
            vertices.push(new Two.Anchor(x2, z2));

            let flaeche = two.makePath(vertices);
            if (sgArea > 0.0) flaeche.fill = '#00AEFF';
            else flaeche.fill = '#AE0000';
            flaeche.opacity = opacity

            if (show_labels) {
                if (maxN > 0.0) {
                    const str = myFormat(maxN, 1, 2) + 'kN'
                    const txt = two.makeText(str, x_max, z_max, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (minN < 0.0) {
                    const str = myFormat(Math.abs(minN), 1, 2) + 'kNm'
                    const txt = two.makeText(str, x_min, z_min, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Nx[0]) > 0.000001) {
                    const str = myFormat(Math.abs(Nx[0]), 1, 2) + 'kN'
                    const txt = two.makeText(str, x0, z0, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Nx[nelTeilungen - 1]) > 0.000001) {
                    const str = myFormat(Math.abs(Nx[nelTeilungen - 1]), 1, 2) + 'kN'
                    const txt = two.makeText(str, xn, zn, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
            }

        }
    }


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
            if (onlyLabels) line.linewidth = 10 / devicePixelRatio;
            else line.linewidth = 5 / devicePixelRatio;

            // gestrichelte Faser

            let dx = (element[ielem].x2 - element[ielem].x1) / 3
            let dz = (element[ielem].z2 - element[ielem].z1) / 3

            let abstand = 10 / devicePixelRatio
            let tmpX1 = tr.xPix(element[ielem].x1 + dx) - element[ielem].sinus * abstand
            let tmpZ1 = tr.zPix(element[ielem].z1 + dz) + element[ielem].cosinus * abstand
            let tmpX2 = tr.xPix(element[ielem].x2 - dx) - element[ielem].sinus * abstand
            let tmpZ2 = tr.zPix(element[ielem].z2 - dz) + element[ielem].cosinus * abstand
            //console.log("tmp", tmpX1, tmpZ1, tmpX2, tmpZ2)

            let line1 = two.makeLine(tmpX1, tmpZ1, tmpX2, tmpZ2);
            line1.linewidth = 1 / devicePixelRatio;
            line1.dashes = [5, 3]

            if (show_labels && onlyLabels) {

                let xm = (x1 + x2) / 2. + element[ielem].sinus * 7
                let zm = (z1 + z2) / 2. - element[ielem].cosinus * 7

                let circle = two.makeCircle(xm, zm, 14, 20)
                circle.fill = '#ffffff'

                let str = String(+ielem + 1)
                const txt = two.makeText(str, xm, zm, style_txt)
                txt.fill = '#000000'
                //txt.alignment = 'left'
                //txt.baseline = 'top'
            }
        }

        if (show_labels && onlyLabels) {

            for (let i = 0; i < nnodes; i++) {
                x1 = Math.round(tr.xPix(node[i].x)) + 10 / devicePixelRatio + 12;
                z1 = Math.round(tr.zPix(node[i].z)) + 10 / devicePixelRatio + 12;

                let rect = two.makeRoundedRectangle(x1, z1, 25, 25, 4)
                rect.fill = '#ffffff'
                rect.stroke = '#0000ff'

                let str = String(+i + 1)
                const txt = two.makeText(str, x1, z1, style_txt)
                txt.fill = '#000000'
            }
        }

    }

    draw_lager(two);
    draw_gelenke(two);

    if (show_lasten) {
        draw_elementlasten(two);
        draw_knotenkraefte(two);
    }
    if (show_lagerkraefte) draw_lagerkraefte(two);

    const styles = {
        family: 'system-ui, sans-serif',
        size: 50,
        fill: 'red',
        opacity: 0.33,
        //leading: 50
        weight: 'bold'
    };

    //const directions = two.makeText('Hallo welt', two.width / 2, two.height / 2, styles)
    //directions.rotation = 1.5708

    //draw_arrow(two, slmax / 10, slmax / 10, node[1].x, node[1].z, { linewidth: 10, b: 40, h: 20 })  // , style_pfeil

    //draw_arrow(two, 0, 0, node[1].x, node[1].z, style_pfeil_lager)  // , style_pfeil

    // Don’t forget to tell two to draw everything to the screen
    two.update();

    //el = document.querySelector('.footer'); //.getElementById("container")
    //console.log("nach update container footer boundingRect", el?.getBoundingClientRect())

    domElement = two.renderer.domElement;
    //svgElement = two.render
    //console.log("domElement", domElement)
    //domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('wheel', wheel, false);
    //domElement.addEventListener('wheel', mousewheel, false);
    domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('mouseup', mouseup, false);

}

//--------------------------------------------------------------------------------------------------------
function draw_elementlasten(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let x1: number, x2: number, z1: number, z2: number, si: number, co: number, xi: number, zi: number
    let dp: number, pMax: number, pMin: number
    let a: number, a_projektion: number
    let a_spalt: number
    let pL: number, pR: number
    let x = Array(4), z = Array(4), xtr = Array(4), ztr = Array(4)

    let xpix: number, zpix: number

    console.log("in draw_elementlasten", slmax)

    let scalefactor = slmax / 20 / maxValue_eload[draw_lastfall - 1]

    for (let ielem = 0; ielem < nelem; ielem++) {

        a = slmax / 100.
        a_spalt = a
        a_projektion = 0.0

        for (let ieload = 0; ieload < neloads; ieload++) {
            console.log("ielem,draw_lastfall", ielem, eload[ieload].element, draw_lastfall, eload[ieload].lf)
            if ((eload[ieload].element === ielem) && (eload[ieload].lf === draw_lastfall)) {

                if (eload[ieload].art === 0) {

                    x1 = element[ielem].x1;
                    z1 = element[ielem].z1;
                    x2 = element[ielem].x2;
                    z2 = element[ielem].z2;
                    si = element[ielem].sinus
                    co = element[ielem].cosinus
                    pL = eload[ieload].pL * scalefactor
                    pR = eload[ieload].pR * scalefactor

                    pMax = Math.max(0.0, pL, pR)
                    pMin = Math.min(0.0, pL, pR)

                    a += Math.abs(pMin)

                    x[0] = x1 + si * a; z[0] = z1 - co * a;
                    x[1] = x2 + si * a; z[1] = z2 - co * a;
                    x[2] = x[1] + si * pR; z[2] = z[1] - co * pR;
                    x[3] = x[0] + si * pL; z[3] = z[0] - co * pL;


                    console.log("pL...", pL, pR, x, z)

                    var vertices = [];
                    for (let i = 0; i < 4; i++) {
                        xtr[i] = tr.xPix(x[i])
                        ztr[i] = tr.zPix(z[i])
                        console.log()
                        vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                    }

                    let flaeche = two.makePath(vertices);
                    flaeche.fill = '#eeeeee';

                    if (Math.abs(pL) > 0.0) draw_arrow(two, x[3], z[3], x[0], z[0], style_pfeil)
                    if (Math.abs(pR) > 0.0) draw_arrow(two, x[2], z[2], x[1], z[1], style_pfeil)

                    xpix = xtr[3] + 5
                    zpix = ztr[3] - 5
                    let str = myFormat(Math.abs(eload[ieload].pL), 1, 2)
                    let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'left'
                    txt.baseline = 'top'

                    xpix = xtr[2] + 5
                    zpix = ztr[2] - 5
                    str = myFormat(Math.abs(eload[ieload].pR), 1, 2)
                    txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'left'
                    txt.baseline = 'top'

                    dp = pMax // - pMin
                    a = a + dp + a_spalt
                }

                else if (eload[ieload].art === 1) {      // Streckenlast z-Richtung

                    x1 = element[ielem].x1;
                    z1 = element[ielem].z1;
                    x2 = element[ielem].x2;
                    z2 = element[ielem].z2;
                    si = element[ielem].sinus
                    co = element[ielem].cosinus
                    pL = eload[ieload].pL * scalefactor
                    pR = eload[ieload].pR * scalefactor

                    pMax = Math.max(0.0, pL, pR)
                    pMin = Math.min(0.0, pL, pR)

                    a += Math.abs(pMin * co)

                    x[0] = x1; z[0] = z1 - a / co;
                    x[1] = x2; z[1] = z2 - a / co;
                    x[2] = x[1]; z[2] = z[1] - pR;
                    x[3] = x[0]; z[3] = z[0] - pL;


                    console.log("pL...", pL, pR, x, z)

                    var vertices = [];
                    for (let i = 0; i < 4; i++) {
                        xtr[i] = tr.xPix(x[i])
                        ztr[i] = tr.zPix(z[i])
                        console.log()
                        vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                    }

                    let flaeche = two.makePath(vertices);
                    flaeche.fill = '#eeeeee';

                    if (Math.abs(pL) > 0.0) draw_arrow(two, x[3], z[3], x[0], z[0], style_pfeil)
                    if (Math.abs(pR) > 0.0) draw_arrow(two, x[2], z[2], x[1], z[1], style_pfeil)

                    xpix = xtr[3] + 5
                    zpix = ztr[3] - 5
                    let str = myFormat(Math.abs(eload[ieload].pL), 1, 2)
                    let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'left'
                    txt.baseline = 'top'

                    xpix = xtr[2] + 5
                    zpix = ztr[2] - 5
                    str = myFormat(Math.abs(eload[ieload].pR), 1, 2)
                    txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'left'
                    txt.baseline = 'top'

                    dp = pMax * co // - pMin
                    a = a + dp + a_spalt
                }

                else if (eload[ieload].art === 2) {      // Streckenlast z-Richtung, Projektion

                    x1 = element[ielem].x1;
                    z1 = element[ielem].z1;
                    x2 = element[ielem].x2;
                    z2 = element[ielem].z2;
                    si = element[ielem].sinus
                    co = element[ielem].cosinus
                    pL = eload[ieload].pL * scalefactor
                    pR = eload[ieload].pR * scalefactor

                    let zm = (z1 + z2) / 2

                    pMax = Math.max(0.0, pL, pR)
                    pMin = Math.min(0.0, pL, pR)

                    a_projektion += Math.abs(pMin)

                    x[0] = x1; z[0] = zm - a_projektion;
                    x[1] = x2; z[1] = zm - a_projektion;
                    x[2] = x[1]; z[2] = z[1] - pR;
                    x[3] = x[0]; z[3] = z[0] - pL;


                    console.log("pL...", pL, pR, x, z)

                    var vertices = [];
                    for (let i = 0; i < 4; i++) {
                        xtr[i] = tr.xPix(x[i])
                        ztr[i] = tr.zPix(z[i])
                        console.log()
                        vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                    }

                    let flaeche = two.makePath(vertices);
                    flaeche.fill = '#eeeeee';

                    if (Math.abs(pL) > 0.0) draw_arrow(two, x[3], z[3], x[0], z[0], style_pfeil)
                    if (Math.abs(pR) > 0.0) draw_arrow(two, x[2], z[2], x[1], z[1], style_pfeil)

                    xpix = xtr[3] + 5
                    zpix = ztr[3] - 5
                    let str = myFormat(Math.abs(eload[ieload].pL), 1, 2)
                    let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'left'
                    txt.baseline = 'top'

                    xpix = xtr[2] + 5
                    zpix = ztr[2] - 5
                    str = myFormat(Math.abs(eload[ieload].pR), 1, 2)
                    txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'left'
                    txt.baseline = 'top'

                    dp = pMax
                    a_projektion += dp + a_spalt
                }
                else if (eload[ieload].art === 6) {      // Einzellast oder/und Moment

                    si = element[ielem].sinus
                    co = element[ielem].cosinus
                    x1 = element[ielem].x1;
                    z1 = element[ielem].z1;

                    let plength = 35, delta = 12

                    plength = tr.World0(2 * plength / devicePixelRatio)
                    delta = tr.World0(delta / devicePixelRatio)

                    if (eload[ieload].P != 0.0) {
                        let dpx = si * plength, dpz = co * plength
                        let ddx = si * delta, ddz = co * delta
                        let wert = eload[ieload].P
                        let xl = x1 + co * eload[ieload].x, zl = z1 + si * eload[ieload].x
                        console.log("GRAFIK Einzellast", xl, zl, wert)
                        if (wert < 0.0) {
                            draw_arrow(two, xl + ddx, zl - ddz, xl + ddx + dpx, zl - ddz - dpz, style_pfeil_knotenlast)
                        } else {
                            draw_arrow(two, xl + ddx + dpx, zl - ddz - dpz, xl + ddx, zl - ddz, style_pfeil_knotenlast)
                        }
                        xpix = tr.xPix(xl + ddx + dpx) + 4
                        zpix = tr.zPix(zl - ddz - dpz) - 4
                        const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
                        const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                        txt.alignment = 'left'
                        txt.baseline = 'top'
                    }
                    if (eload[ieload].M != 0.0) {
                        let wert = eload[ieload].M
                        let vorzeichen = Math.sign(wert)
                        let xl = x1 + co * eload[ieload].x, zl = z1 + si * eload[ieload].x
                        let radius = style_pfeil_moment.radius;
                        console.log("GRAFIK, Moment, radius ", wert, tr.World0(radius))
                        if (wert > 0.0) {
                            draw_moment_arrow(two, xl, zl, 1.0, radius, style_pfeil_moment)
                        } else {
                            draw_moment_arrow(two, xl, zl, -1.0, radius, style_pfeil_moment)
                        }

                        xpix = tr.xPix(xl) - 10 / devicePixelRatio
                        zpix = tr.zPix(zl) + vorzeichen * radius + 15 * vorzeichen / devicePixelRatio
                        const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
                        const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                        txt.alignment = 'right'
                    }
                }
            }
        }
    }


}

//--------------------------------------------------------------------------------------------------------
function draw_knotenkraefte(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let plength = 35 /*slmax / 20.*/, delta = 12 //slmax / 200.0
    let xpix: number, zpix: number
    let wert: number

    console.log("in draw_knotenkraefte, draw_lastfall", draw_lastfall)
    // const out = document.getElementById('output') as HTMLTextAreaElement;
    // if (out) {
    //     out.value += "plength= " + plength + "\n";
    //     out.scrollTop = element.scrollHeight; // focus on bottom
    // }

    plength = tr.World0(2 * plength / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    for (let i = 0; i < nloads; i++) {
        let inode = load[i].node
        let x = node[inode].x;
        let z = node[inode].z;
        //console.log("load[i]", i, load)
        if (load[i].p[0] != 0.0 && load[i].lf === draw_lastfall) {
            //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

            wert = load[i].p[0]
            if (wert > 0.0) {
                draw_arrow(two, x + delta, z, x + delta + plength, z, style_pfeil_knotenlast)
            } else {
                draw_arrow(two, x + delta + plength, z, x + delta, z, style_pfeil_knotenlast)
            }
            xpix = tr.xPix(x + delta + plength) + 5
            zpix = tr.zPix(z) - 5
            const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
            const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
            txt.alignment = 'left'
            txt.baseline = 'top'
        }
        if (load[i].p[1] != 0.0 && load[i].lf === draw_lastfall) {
            //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

            wert = load[i].p[1]
            if (wert > 0.0) {
                draw_arrow(two, x, z - delta - plength, x, z - delta, style_pfeil_knotenlast)
            } else {
                draw_arrow(two, x, z - delta, x, z - delta - plength, style_pfeil_knotenlast)
            }

            xpix = tr.xPix(x) + 5
            zpix = tr.zPix(z - delta - plength) + 5
            const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
            const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
            txt.alignment = 'left'
            txt.baseline = 'top'
        }
        if (load[i].p[2] != 0.0 && load[i].lf === draw_lastfall) {

            wert = load[i].p[2]
            let vorzeichen = Math.sign(wert)
            console.log("Moment ", +inode + 1, wert)
            if (wert > 0.0) {
                draw_moment_arrow(two, x, z, 1.0, slmax / 50, style_pfeil_moment)
            } else {
                draw_moment_arrow(two, x, z, -1.0, slmax / 50, style_pfeil_moment)
            }

            xpix = tr.xPix(x) - 10 / devicePixelRatio
            zpix = tr.zPix(z + vorzeichen * slmax / 50) + 15 * vorzeichen / devicePixelRatio
            const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
            const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
            txt.alignment = 'right'
            //txt.baseline = 'bottom'
        }

    }
}

//--------------------------------------------------------------------------------------------------------
function draw_lagerkraefte(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let plength = 35, delta = 30
    let xpix: number, zpix: number

    plength = tr.World0((style_pfeil_lager.a + style_pfeil_lager.b) / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    for (let i = 0; i < nnodes; i++) {
        let x = node[i].x;
        let z = node[i].z;
        let alpha = node[i].phi * Math.PI / 180.0

        let wert: number
        if (node[i].L[0] === -1 || node[i].kx > 0.0) {      // horizontales Lager

            wert = lagerkraefte._(i, 0, draw_lastfall - 1)
            console.log("wert", wert, draw_lastfall)

            if (wert >= 0.0) {
                //                draw_arrow(two, x + delta + plength, z, x + delta, z, style_pfeil_lager)
                draw_arrow_alpha(two, x + delta * Math.cos(-alpha), z + delta * Math.sin(-alpha), -alpha, 1.0, style_pfeil_lager)
            } else {
                //                draw_arrow(two, x + delta, z, x + delta + plength, z, style_pfeil_lager)
                draw_arrow_alpha(two, x + delta * Math.cos(-alpha), z + delta * Math.sin(-alpha), -alpha, -1.0, style_pfeil_lager)
            }

            xpix = tr.xPix(x + (delta + plength) * Math.cos(-alpha)) + 5
            zpix = tr.zPix(z + (delta + plength) * Math.sin(-alpha)) - 5
            const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
            const txt = two.makeText(str, xpix, zpix, style_txt_lager)
            txt.alignment = 'left'
            txt.baseline = 'top'
        }

        if (node[i].L[1] === -1 || node[i].kz > 0.0) {      // vertikales Lager

            wert = lagerkraefte._(i, 1, draw_lastfall - 1)
            console.log("wert", wert)

            if (wert >= 0.0) {
                //                draw_arrow(two, x, z + delta + plength, x, z + delta, style_pfeil_lager)
                draw_arrow_alpha(two, x + delta * Math.cos(-alpha + 1.5707963), z + delta * Math.sin(-alpha + 1.5707963), -alpha + 1.5707963, 1.0, style_pfeil_lager)

            } else {
                //                draw_arrow(two, x, z + delta, x, z + delta + plength, style_pfeil_lager)
                draw_arrow_alpha(two, x + delta * Math.cos(-alpha + 1.5707963), z + delta * Math.sin(-alpha + 1.5707963), -alpha + 1.5707963, -1.0, style_pfeil_lager)
            }

            xpix = tr.xPix(x + (delta + plength) * Math.cos(-alpha + 1.5707963)) + 5
            zpix = tr.zPix(z + (delta + plength) * Math.sin(-alpha + 1.5707963)) + 5
            const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
            const txt = two.makeText(str, xpix, zpix, style_txt_lager)
            txt.alignment = 'left'
            txt.baseline = 'top'
        }

        if (node[i].L[2] === -1 || node[i].kphi > 0.0) {      // Einspannung

            wert = lagerkraefte._(i, 2, draw_lastfall - 1)
            console.log("wert", wert)
            let vorzeichen = Math.sign(wert)
            let radius = style_pfeil_lager.radius;

            if (wert >= 0.0) {
                draw_moment_arrow(two, x, z, -1.0, radius, style_pfeil_lager)
            } else {
                draw_moment_arrow(two, x, z, 1.0, radius, style_pfeil_lager)
            }

            xpix = tr.xPix(x) - 10 / devicePixelRatio
            zpix = tr.zPix(z) + vorzeichen * (radius + 15) / devicePixelRatio
            const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
            const txt = two.makeText(str, xpix, zpix, style_txt_lager)
            txt.alignment = 'right'
            //txt.baseline = 'top'
        }
    }
}

//--------------------------------------------------------------------------------------------------------
function draw_lager(two: Two) {
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < nnodes; i++) {

        let x1 = Math.round(tr.xPix(node[i].x));
        let z1 = Math.round(tr.zPix(node[i].z));
        let phi = -node[i].phi * Math.PI / 180

        if (((node[i].L[0] === -1) && (node[i].L[1] === -1) && (node[i].L[2] === -1)) ||
            ((node[i].kx > 0.0) && (node[i].kz > 0.0) && (node[i].L[2] === -1))) {  // Volleinspannung oder mit zwei Translkationsfedern
            let rechteck = two.makeRectangle(x1, z1, 20, 20)
            rechteck.fill = '#dddddd';
            rechteck.scale = 1.0 / devicePixelRatio
            rechteck.rotation = phi
        }
        else if ((node[i].L[0] >= 0) && (node[i].L[1] === -1) && (node[i].L[2] === -1)) {  // Einspannung, verschieblich in x-Richtung

            let group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] === -1) && (node[i].L[1] >= 0) && (node[i].L[2] === -1)) {  // Einspannung, verschieblich in z-Richtung

            let group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio
            group.rotation = 1.5708 + phi
            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] >= 0) && (node[i].L[1] >= 0) && (node[i].L[2] === -1)) {  // Einspannung, verschieblich in x-, z-Richtung

            let group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 12, 15);
            line.linewidth = 2;
            group.add(line)

            let line2 = two.makeLine(15, -16, 15, 12);
            line2.linewidth = 2;
            group.add(line2)

            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] === -1) && (node[i].L[1] === -1) && (node[i].L[2] >= 0)) { // zweiwertiges Lager
            let group = two.makeGroup();
            console.log("in zweiwertiges Lager")
            var vertices = [];
            vertices.push(new Two.Vector(0, 0));
            vertices.push(new Two.Vector(-12, 20));
            vertices.push(new Two.Vector(12, 20));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 20, 18, 20);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] >= 0) && (node[i].L[1] === -1) && (node[i].L[2] >= 0)) { // einwertiges horizontal verschieblisches Lager
            let group = two.makeGroup();
            console.log("in einwertiges horizontal verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Vector(0, 0));
            vertices.push(new Two.Vector(-12, 20));
            vertices.push(new Two.Vector(12, 20));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] === -1) && (node[i].L[1] >= 0) && (node[i].L[2] >= 0)) { // einwertiges vertikal verschieblisches Lager
            let group = two.makeGroup();
            console.log("in einwertiges vertikales Lager")
            var vertices = [];
            vertices.push(new Two.Vector(0, 0));
            vertices.push(new Two.Vector(-12, 20));
            vertices.push(new Two.Vector(12, 20));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio


            group.rotation = -1.5708 + phi
            group.translation.set(x1, z1)

        }

        if (node[i].kx > 0.0) {
            draw_feder(two, node[i].x, node[i].z, -1.5707963 + phi)
        }

        if (node[i].kz > 0.0) {
            draw_feder(two, node[i].x, node[i].z, phi)
        }

        if (node[i].kphi > 0.0) {
            draw_drehfeder(two, node[i].x, node[i].z)
        }

    }
}


//--------------------------------------------------------------------------------------------------------
function draw_gelenke(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let x1: number, x2: number, z1: number, z2: number, dx: number, dz: number
    let radius = 10 / devicePixelRatio, a = 10 / devicePixelRatio

    for (let ielem = 0; ielem < nelem; ielem++) {

        if (element[ielem].nGelenke > 0) {

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            if (element[ielem].gelenk[2] > 0) {                         // Momentengelenk links
                dx = element[ielem].cosinus * (a + radius)
                dz = element[ielem].sinus * (a + radius)
                let kreis = two.makeCircle(x1 + dx, z1 + dz, radius, 10)
                kreis.fill = '#ffffff';

            }
            if (element[ielem].gelenk[5] > 0) {                         // Momentengelenk rechts
                dx = element[ielem].cosinus * (a + radius)
                dz = element[ielem].sinus * (a + radius)
                let kreis = two.makeCircle(x2 - dx, z2 - dz, radius, 10)
                kreis.fill = '#ffffff';

            }
        }
    }
}

//--------------------------------------------------------------------------------------------------------
function draw_arrow(two: Two, x1: number, z1: number, x2: number, z2: number, styles?: any) {
    //----------------------------------------------------------------------------------------------------

    let b = 20, h = 10, linewidth = 2, color = '#000000'
    let a = 0.0, calc_a = true

    if (styles) {
        console.log("styles", styles)
        if (styles.linewidth) linewidth = styles.linewidth
        if (styles.a) {
            a = styles.a / devicePixelRatio;
            calc_a = false
        }
        if (styles.b) b = styles.b
        if (styles.h) h = styles.h
        if (styles.color) color = styles.color
    }

    b = b / devicePixelRatio
    h = h / devicePixelRatio
    //b = slmax / 50.
    //h = slmax / 100.
    //linewidth = slmax / 400.

    //b = tr.Pix0(b)
    //h = tr.Pix0(h)
    //linewidth = tr.Pix0(linewidth)
    //write('linewidth: ', linewidth)
    linewidth = linewidth / devicePixelRatio

    let dx = x2 - x1, dz = z2 - z1
    let alpha = Math.atan2(dz, dx)

    let sl = Math.sqrt(dx * dx + dz * dz)
    console.log("sl", Math.round(tr.xPix(sl)));
    console.log("0.0", Math.round(tr.xPix(0.0)));

    if (calc_a) a = Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)) - b;
    // write('sl : ', sl)
    // write('tr.Pix0 : ', tr.Pix0(sl))
    // write('div', Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)))
    // write('a: ', a)
    // write('b: ', b)

    let x0 = Math.round(tr.xPix(x1));
    let z0 = Math.round(tr.zPix(z1));

    console.log("sl,a", sl, a, b, x0, z0)

    let group = two.makeGroup();
    let line = two.makeLine(0, 0, a, 0);
    line.linewidth = linewidth;
    line.stroke = color;

    group.add(line)

    var vertices = [];
    vertices.push(new Two.Vector(a, -h / 2));
    vertices.push(new Two.Vector(a + b, 0));
    vertices.push(new Two.Vector(a, h / 2));
    // @ts-ignore
    let dreieck = two.makePath(vertices);
    dreieck.fill = color;
    dreieck.stroke = color;
    dreieck.linewidth = 1;

    group.add(dreieck)
    group.rotation = alpha
    group.translation.set(x0, z0)

}

//--------------------------------------------------------------------------------------------------------
function draw_arrow_alpha(two: Two, x1: number, z1: number, alpha: number, vorzeichen: number, styles?: any) {
    //----------------------------------------------------------------------------------------------------

    let b = 25, h = 16, linewidth = 2, color = '#000000'
    let a = 35.0

    if (styles) {
        console.log("styles", styles)
        if (styles.linewidth) linewidth = styles.linewidth
        if (styles.a) a = styles.a
        if (styles.b) b = styles.b
        if (styles.h) h = styles.h
        if (styles.color) color = styles.color
    }

    b = b / devicePixelRatio
    h = h / devicePixelRatio
    a = a / devicePixelRatio;

    linewidth = linewidth / devicePixelRatio

    //alpha = alpha * Math.PI / 180.0

    let x0 = Math.round(tr.xPix(x1));
    let z0 = Math.round(tr.zPix(z1));

    let group = two.makeGroup();
    var vertices = [];
    let line: any
    if (vorzeichen === -1.0) {
        line = two.makeLine(0, 0, a, 0);
    } else {
        line = two.makeLine(b, 0, a + b, 0);
    }
    line.linewidth = linewidth;
    line.stroke = color;
    //line.dashes = [4,2]

    group.add(line)

    if (vorzeichen === -1.0) {
        vertices.push(new Two.Vector(a, -h / 2));
        vertices.push(new Two.Vector(a + b, 0));
        vertices.push(new Two.Vector(a, h / 2));
    } else {
        vertices.push(new Two.Vector(b, -h / 2));
        vertices.push(new Two.Vector(0, 0));
        vertices.push(new Two.Vector(b, h / 2));
    }
    // @ts-ignore
    let dreieck = two.makePath(vertices);
    dreieck.fill = color;
    dreieck.stroke = color;
    dreieck.linewidth = 1;

    group.add(dreieck)
    group.rotation = alpha
    group.translation.set(x0, z0)

}



//--------------------------------------------------------------------------------------------------------
function draw_moment_arrow(two: Two, x0: number, z0: number, vorzeichen: number, radius: number, styles?: any) {
    //----------------------------------------------------------------------------------------------------
    let b = 20, h = 10
    let x = 0.0, z = 0.0, linewidth = 2, color = '#000000'
    let alpha: number, dalpha: number, teilung = 12

    if (styles) {
        console.log("styles", styles)
        if (styles.linewidth) linewidth = styles.linewidth
        if (styles.radius) radius = styles.radius
        if (styles.b) b = styles.b
        if (styles.h) h = styles.h
        if (styles.color) color = styles.color
    }
    b /= devicePixelRatio
    h /= devicePixelRatio
    linewidth /= devicePixelRatio
    radius /= devicePixelRatio

    radius = tr.World0(radius)
    console.log('draw_moment_arrow, radius', radius, tr.Pix0(radius))

    let group = two.makeGroup();

    var vertices = [];

    if (vorzeichen > 0) {

        dalpha = Math.PI / (teilung + 1)
        alpha = 0.0
        for (let i = 0; i < teilung - 2; i++) {
            x = tr.Pix0(-radius * Math.sin(alpha))
            z = tr.Pix0(radius * Math.cos(alpha))
            vertices.push(new Two.Anchor(x, z));
            alpha += dalpha
        }


        let curve = new Two.Path(vertices, false, true)
        curve.linewidth = linewidth;
        curve.stroke = color;
        //curve.fill = '#00ffffff';
        //curve.opacity = 0;
        //curve.noFill()
        //curve.fillOpacity=0.25
        curve.fill="none"


        group.add(curve)

        vertices.length = 0;
        vertices.push(new Two.Vector(0, -h / 2 + tr.Pix0(radius)));
        vertices.push(new Two.Vector(0 + b, tr.Pix0(radius)));
        vertices.push(new Two.Vector(0, h / 2 + tr.Pix0(radius)));
        // @ts-ignore
        let dreieck = two.makePath(vertices);
        dreieck.fill = color;
        dreieck.stroke = color;
        dreieck.linewidth = 1;
        //    dreieck.translation.set(0.0,0.0) //tr.Pix0(radius))

        group.add(dreieck)
        group.rotation = Math.PI / 5
        group.translation.set(tr.xPix(x0), tr.zPix(z0))

    } else {

        dalpha = Math.PI / (teilung + 1)
        alpha = 0.0
        for (let i = 0; i < teilung - 2; i++) {
            x = tr.Pix0(-radius * Math.sin(alpha))
            z = tr.Pix0(-radius * Math.cos(alpha))
            vertices.push(new Two.Anchor(x, z));
            alpha += dalpha
        }


        let curve = new Two.Path(vertices, false, true)
        curve.linewidth = linewidth;
        curve.stroke = color;
        curve.noFill()

        group.add(curve)

        vertices.length = 0;
        vertices.push(new Two.Vector(0, -h / 2 - tr.Pix0(radius)));
        vertices.push(new Two.Vector(0 + b, -tr.Pix0(radius)));
        vertices.push(new Two.Vector(0, h / 2 - tr.Pix0(radius)));
        // @ts-ignore
        let dreieck = two.makePath(vertices);
        dreieck.fill = color;
        dreieck.stroke = color;
        dreieck.linewidth = 1;

        group.add(dreieck)
        group.rotation = -Math.PI / 5
        group.translation.set(tr.xPix(x0), tr.zPix(z0))
    }
}


//--------------------------------------------------------------------------------------------------------
function draw_feder(two: Two, x0: number, z0: number, alpha: number) {
    //----------------------------------------------------------------------------------------------------
    let x = Array(7)
    let z = Array(7)

    let a = 6
    let b = 4
    let c = 6
    let d = 10


    x[0] = 0.0
    z[0] = 0.0
    x[1] = x[0]
    z[1] = z[0] + d
    x[2] = x[1] + c
    z[2] = z[1] + b
    x[3] = x[2] + -2 * c
    z[3] = z[2] + b
    x[4] = x[3] + 2 * c
    z[4] = z[3] + b
    x[5] = x[4] - c
    z[5] = z[4] + b
    x[6] = x[5]
    z[6] = z[5] + a
    let x8 = x[6] + 2 * c
    let z8 = z[6]
    let x9 = x[6] - 2 * c
    let z9 = z[6]

    let group = two.makeGroup();

    var vertices = [];
    for (let i = 0; i < 7; i++) {
        vertices.push(new Two.Vector(x[i], z[i]));
    }
    // @ts-ignore
    let spring = two.makePath(vertices);
    spring.closed = false
    //dreieck.fill = color;
    //dreieck.stroke = color;
    spring.linewidth = 2;

    group.add(spring)

    let line = two.makeLine(x8, z8, x9, z9);
    line.linewidth = 2;

    group.add(line)
    group.scale = 1.0 / devicePixelRatio
    group.rotation = alpha
    group.translation.set(tr.xPix(x0), tr.zPix(z0))

}

//--------------------------------------------------------------------------------------------------------
function draw_drehfeder(two: Two, x0: number, z0: number) {
    //----------------------------------------------------------------------------------------------------

    let alpha: number, dalpha: number, teilung = 12
    let linewidth = 2
    let radius = 25 // devicePixelRatio
    let x: number, z: number

    let radiusW = tr.World0(radius)

    let group = two.makeGroup();

    var vertices = [];

    console.log("in draw_drehfeder", radius, x0, z0)

    dalpha = Math.PI / (teilung)
    alpha = 0.0
    for (let i = 0; i <= teilung; i++) {
        x = tr.Pix0(-radiusW * Math.sin(alpha))
        z = tr.Pix0(radiusW * Math.cos(alpha))
        console.log("DREHFEDER x,z ", x, z)
        vertices.push(new Two.Anchor(x, z));
        alpha += dalpha
    }


    let curve = new Two.Path(vertices, false, true)
    curve.linewidth = linewidth;
    //curve.stroke = color;
    curve.noFill()
    //curve.fill="rgba(255,0,0,50);"

    group.add(curve)

    let z1 = (25 - 8) // devicePixelRatio
    let z2 = (25 + 8) // devicePixelRatio
    let line = two.makeLine(0, z1, 0, z2);
    line.linewidth = linewidth;

    group.add(line)

    group.scale = 1.0 / devicePixelRatio
    group.translation.set(tr.xPix(x0), tr.zPix(z0 + radiusW / devicePixelRatio))
}



//--------------------------------------------------------------------------------------------------------
function draw_label_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_label_grafik");
    show_labels = !show_labels;

    drawsystem();
}
//--------------------------------------------------------------------------------------------------------
function draw_systemlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_systemlinien_grafik");
    show_systemlinien = !show_systemlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_verformungen_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_verformungen = !show_verformungen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_momentenlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_momentenlinien = !show_momentenlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_querkraftlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_querkraftlinien_grafik");
    show_querkraftlinien = !show_querkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_normalkraftlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_normalkraftlinien_grafik");
    show_normalkraftlinien = !show_normalkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_eigenformen_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_eigenformen = !show_eigenformen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_schiefstellung_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_schiefstellung_grafik");
    show_schiefstellung = !show_schiefstellung;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}
//--------------------------------------------------------------------------------------------------------
function draw_stabvorverformung_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_stabvorverformung_grafik");
    show_stabvorverformung = !show_stabvorverformung;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_lasten_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_lasten_grafik");
    show_lasten = !show_lasten;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_lagerkraefte_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_lagerkraefte_grafik");
    show_lagerkraefte = !show_lagerkraefte;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function scale_factor() {
    //--------------------------------------------------------------------------------------------------------

    scaleFactor_panel = get_scale_factor();
    console.log("stressFactor=", scaleFactor_panel)
    drawsystem();
}
//---------------------------------------------------------------------------------- a d d E v e n t L i s t e n e r

window.addEventListener('draw_label_grafik', draw_label_grafik);
window.addEventListener('draw_systemlinien_grafik', draw_systemlinien_grafik);
window.addEventListener('draw_verformungen_grafik', draw_verformungen_grafik);
window.addEventListener('draw_eigenformen_grafik', draw_eigenformen_grafik);
window.addEventListener('draw_momentenlinien_grafik', draw_momentenlinien_grafik);
window.addEventListener('draw_querkraftlinien_grafik', draw_querkraftlinien_grafik);
window.addEventListener('draw_normalkraftlinien_grafik', draw_normalkraftlinien_grafik);
window.addEventListener('draw_schiefstellung_grafik', draw_schiefstellung_grafik);
window.addEventListener('draw_stabvorverformung_grafik', draw_stabvorverformung_grafik);
window.addEventListener('draw_lasten_grafik', draw_lasten_grafik);
window.addEventListener('draw_lagerkraefte_grafik', draw_lagerkraefte_grafik);

window.addEventListener('scale_factor', scale_factor);


//---------------------------------------------------------------------------------------------------
export async function copy_svg() {
    //-----------------------------------------------------------------------------------------------

    //let svg = svgElement;
    //console.log("svg", svg)
    const elem = document.getElementById('artboard') as any;

    if (elem) {
        // svg = svg.replace(/\r?\n|\r/g, "").trim();
        // svg = svg.substring(0, svg.indexOf("</svg>")) + "</svg>";
        // // @ts-ignore
        // svg = svg.replaceAll("  ", "");

        // const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        // const svgBlob = new Blob([preface, svg], { type: "image/svg+xml;charset=utf-8" });

        const svgBlob = new Blob([elem.innerHTML], { type: "image/svg+xml;charset=utf-8" });

        let filename: any = 'd2beam.svg'

        if (app.hasFSAccess && app.isMac) {

            filename = window.prompt(
                "Name der Datei mit Extension, z.B. duennqs.svg\nDie Datei wird im Default Download Ordner gespeichert", 'd2beam.svg'
            );
        }
        else if (app.hasFSAccess) {

            try {
                // @ts-ignore
                const fileHandle = await window.showSaveFilePicker({
                    types: [{
                        description: "Text file",
                        accept: { "text/plain": [".svg"] }
                    }]
                });
                //console.log("fileHandle",fileHandle)

                const fileStream = await fileHandle.createWritable();
                //console.log("fileStream=",fileStream);

                // (C) WRITE FILE
                await fileStream.write(svgBlob);
                await fileStream.close();

            } catch (error: any) {
                //alert(error.name);
                alert(error.message);
            }

            return
        }

        // für den Rest des Feldes

        try {
            saveAs(svgBlob, filename);
        } catch (error: any) {
            alert(error.message);
        }
    }

}
