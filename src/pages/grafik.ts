
import Two from 'two.js'

import { CTrans } from './trans';
import { myFormat, write } from './utility'
//import { CTimoshenko_beam } from "./timoshenko_beam"
import { xmin, xmax, zmin, zmax, slmax, nlastfaelle, nkombinationen, neigv, nelTeilungen, load, maxValue_eload_komb, stadyn, nur_eingabe_ueberpruefen, matprop_flag, nelem_koppelfedern, nelem_Balken, maxBettung, maxpress_all, max_press_kombi } from "./rechnen";
import { el as element, node, nelem, nnodes, nloads, neloads, eload, nstabvorverfomungen, stabvorverformung } from "./rechnen";
import { element as stab } from "./rechnen"
import { maxValue_lf, maxValue_komb, maxValue_eigv, maxValue_u0, maxValue_eload, lagerkraefte, lagerkraefte_kombi, THIIO_flag, maxValue_w0 } from "./rechnen";
import { max_S_kombi, max_disp_kombi, maxM_all, maxV_all, maxN_all, maxdisp_all, kombiTabelle, nNodeDisps, nodeDisp0, System, STABWERK, FACHWERK } from "./rechnen";
import { maxValue_dyn_eigenform, eigenform_dyn, dyn_neigv, nnodalMass, nodalmass, stabvorverformung_komb } from "./rechnen";

//import { Pane } from 'tweakpane';
import { myPanel, get_scale_factor, draw_sg, draw_group } from './mypanelgui'
//import { colorToRgbNumber } from '@tweakpane/core';
import { app } from "./haupt";
import { saveAs } from 'file-saver';

export let svg_pdf_ratio = 1.0

let lastFileHandleSVG = 'documents';
let currentFilenameSVG = 'd2beam.svg'

console.log("in grafik")
let xmin0 = 0, xmax0 = 0, zmin0 = 0, zmax0 = 0

let mouseMoveIsActive = false
let needMouseMoveForInfo = false
let zoomIsActive = false

//let two: Two
let domElement: any = null
let svgElement: any = null;
let fullscreen = false;
let wheel_factor = 1.0
let wheel_factor_alt = 0.0
let mouseOffsetX = 0.0
let mouseOffsetY = 0.0
let mouseDx = 0.0
let mouseDz = 0.0
let nFingers = 0;
let touchLoop = 0;
let touchDx = 0.0
let touchDy = 0.0
let mouseCounter = 0;
let firstTouch = true
let curDiff = 0.0
let curDiff_alt = 0.0
let mouse_DownWX = 0.0
let mouse_DownWY = 0.0
let view_diagonale = 0.0
let isPen = false
let grafik_top = 0

let deltaXY = 0.0
let deltaXY_alt = 0.0

let centerX = 0.0
let centerY = 0.0
let centerX_last = 0.0
let centerY_last = 0.0

// Global vars to cache touch event state
const evCache: any = [];
let prevDiff = -1;

let two: any = null;

let xminw = 0.0, xmaxw = 0.0, zminw = 0.0, zmaxw = 0.0
let xmint = 0.0, xmaxt = 0.0, zmint = 0.0, zmaxt = 0.0

let tr: CTrans

let drawPanel = 0
let draw_lastfall = 1
let draw_eigenform = 1
let draw_dyn_eigenform = 1

let flag_eingabe = 1

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
let show_umriss = false;
let show_gesamtverformung = false;
let show_bodenpressung = false;

let show_lasten_temp = true;
let show_gleichgewichtSG = true;

let show_dyn_eigenformen = false;
let show_dyn_animate_eigenformen = false;
let animate_scale = 0.0;
let animate_scale_dx = 0.04;
let start_animation = false;
let show_knotenmassen = false;

class TWerte {
    x = 0.0
    z = 0.0
    wert = ''
    unit = 'mm'
}

let werte = [] as TWerte[];
let index_werte = 0

const draw_wert = {
    found: false,
    x: 0.0,
    y: 0.0,
    wert: ''
}

let opacity = 0.5

const style_txt = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: 'black',
    //opacity: 0.5,
    //leading: 50
    weight: 'normal'
};

const style_txt_werte = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: '#006666',
    //opacity: 0.5,
    //leading: 50
    weight: 'normal'
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

const style_txt_knotenlast_element = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: '#ba0000',
    weight: 'bold'
};

const style_pfeil = {
    b: 20,
    h: 10,
    linewidth: 2,
    color: '#000000'
}
const style_pfeil_pix = {
    b: 15,
    h: 6,
    linewidth: 1,
    color: '#999999'
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

const style_pfeil_knotenlast_element = {
    a: 35,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#ba0000'
}

const style_pfeil_moment = {
    radius: 50,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#dc0000'
}


const style_pfeil_moment_element = {
    radius: 40,
    b: 22,
    h: 14,
    linewidth: 7,
    color: '#ba0000'
}

const style_pfeil_koord = {
    a: 35,
    b: 25,
    h: 16,
    linewidth: 4,
    color: '#006666'
}

//--------------------------------------------------------------------------------------------------------
export function reset_controlpanel_grafik() {
    //----------------------------------------------------------------------------------------------------
    scaleFactor_panel = 1.0
    show_labels = false;
    show_systemlinien = true;
    show_verformungen = false;
    show_eigenformen = false;
    show_momentenlinien = false;
    show_querkraftlinien = false;
    show_normalkraftlinien = false;
    show_schiefstellung = false;
    show_lasten = true;
    show_lagerkraefte = true;
    show_stabvorverformung = false;
    show_umriss = false;
    show_gesamtverformung = false;

    show_lasten_temp = true;
    show_gleichgewichtSG = true;

    show_dyn_eigenformen = false;
    show_dyn_animate_eigenformen = false;
    animate_scale = 0.0;
    animate_scale_dx = 0.04;
    start_animation = false;
    show_knotenmassen = false;
}

//--------------------------------------------------------------------------------------------------------
export function select_loadcase_changed() {
    //----------------------------------------------------------------------------------------------------

    //console.log("################################################ select_loadcase_changed")
    const el_select_loadcase = document.getElementById("id_select_loadcase") as HTMLSelectElement
    //console.log("select_loadcase_changed option", el_select_loadcase.value)
    draw_lastfall = Number(el_select_loadcase.value)
    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
export function select_eigenvalue_changed() {
    //----------------------------------------------------------------------------------------------------

    //console.log("################################################ select_eigenvalue_changed")
    const el_select_eigenvalue = document.getElementById("id_select_eigenvalue") as HTMLSelectElement
    //console.log("option", el_select_eigenvalue.value)
    draw_eigenform = Number(el_select_eigenvalue.value)
    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
export function select_dyn_eigenvalue_changed() {
    //----------------------------------------------------------------------------------------------------

    //console.log("################################################ select_eigenvalue_changed")
    const el_select_dyn_eigenvalue = document.getElementById("id_select_dyn_eigenvalue") as HTMLSelectElement
    //console.log("option", el_select_eigenvalue.value)
    draw_dyn_eigenform = Number(el_select_dyn_eigenvalue.value)
    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
export function click_zurueck_grafik() {
    //----------------------------------------------------------------------------------------------------

    let elb = document.getElementById("id_button_zurueck_grafik") as HTMLButtonElement
    let ele = document.getElementById("id_grafik") as HTMLDivElement

    if (fullscreen) {
        console.log("click_zurueck_grafik")
        let ele1 = document.getElementById("id_tab_group") as any
        console.log("HEIGHT id_tab_group boundingRect", ele1.getBoundingClientRect(), '|', ele1);

        ele.style.position = 'relative'
        fullscreen = false

        elb.innerHTML = "Fullscreen"
    }
    else {
        console.log("fullscreen")
        ele.style.position = 'absolute'
        fullscreen = true

        elb.innerHTML = "zurück"
    }

    elb.style.width = 'fit-content'

    drawsystem();


}
//--------------------------------------------------------------------------------------------------- i n i t _ t w o

export function init_two(svg_id = 'artboard') {


    if (two !== null) {
        // let parent = two.renderer.domElement.parentElement
        // console.log("Parent ", parent)

        two.unbind('update')
        two.pause()
        two.removeEventListener()
        two.clear()

        //two.bind('update')
        //        let parent = two.renderer.domElement.parentelement;
        //console.log("Parent ", parent)
        //if (parent) parent.removeChild(two.renderer.domElement);
    }

    if (domElement != null) {
        // domElement.removeEventListener('wheel', wheel, { passive: false });
        // domElement.removeEventListener('mousedown', mousedown, false);
        // domElement.removeEventListener('mouseup', mousemove, false);

        //console.log('domElement',domElement)
        let parent = domElement.parentElement
        //console.log("Parent ", parent)
        if (parent) parent.removeChild(domElement);

    }

    // const tab_group = document.getElementById('container') as any;
    // tab_group.hidden=true

    // for (let i = 0; i < two.scene.children.length; i++) {
    //     let child = two.scene.children[i];
    //     two.scene.remove(child);
    //     Two.Utils.dispose(child);
    // }

    console.log("__________________________________  G R A F I K  ___________")
    if (svg_id === 'svg_artboard') {
        const elem = document.getElementById(svg_id) as any; //HTMLDivElement;
        //console.log("childElementCount", elem.childElementCount)

        if (elem.childElementCount > 0) elem.removeChild(elem?.lastChild);   // war > 2
    }

    var params = {
        fullscreen: false,
        type: Two.Types.canvas
    };

    if (svg_id === 'svg_artboard') params.type = Two.Types.svg

    two = null;
    const artboard = document.getElementById(svg_id) as any;

    two = new Two(params).appendTo(artboard);

    if (svg_id === 'artboard') {
        domElement = two.renderer.domElement;
        //svgElement = two.render
        //console.log("domElement", domElement)
        //domElement.addEventListener('mousedown', mousedown, false);

        domElement.addEventListener('wheel', wheel, { passive: false });
        domElement.addEventListener('mousedown', mousedown, false);
        domElement.addEventListener('mouseup', mouseup, false);
        domElement.addEventListener('pointermove', pointermove, false);
        // domElement.addEventListener('mousemove', mousemove, false);

        domElement.addEventListener('touchstart', touchstart, { passive: false });
        domElement.addEventListener('touchmove', touchmove, { passive: false });
        //window.addEventListener('touchmove', touchmove, { passive: false });
        domElement.addEventListener('touchend', touchend, { passive: false });
    }

}

//--------------------------------------------------------------------------------------------------- i n i t _ g r a f i k

export function init_grafik(flag: number) {

    flag_eingabe = flag;   // 0 = Eingabe überprüfen

    mouseDx = 0.0
    mouseDz = 0.0
    wheel_factor = 0.0   // 1.0
    wheel_factor_alt = 0.0
    touchLoop = 0
    firstTouch = true
    curDiff_alt = 0.0
    mouse_DownWX = 0.0
    mouse_DownWY = 0.0

    mouseMoveIsActive = false
    needMouseMoveForInfo = false
    zoomIsActive = false
    draw_wert.found = false
    isPen = false

    centerX = 0.0
    centerY = 0.0
    centerX_last = 0.0
    centerY_last = 0.0

    if (drawPanel === 0) {
        myPanel();
        drawPanel = 1;
    }
    two = null;


    //window.addEventListener('wheel', wheel, { passive: false });

    // const el_container = document.getElementById('id_container') as HTMLDivElement
    // el_container.style.display = 'none'

    // const elw = document.getElementById('artboard') as any
    // elw.addEventListener('touchstart', touchstart,  { passive: false });
    // elw.addEventListener('touchmove', touchmove,  { passive: false });
    // elw.addEventListener('touchend', touchend,  { passive: false });

    devicePixelRatio = window.devicePixelRatio
    console.log('devicePixelRatio =  ', devicePixelRatio)

    const el_select = document.getElementById('id_select_loadcase') as HTMLSelectElement;

    while (el_select.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select.removeChild(el_select?.lastChild);
    }
    //el.style.width = '100%';   // 100px
    //console.log('CREATE SELECT', nlastfaelle, el_select);
    draw_lastfall = 1

    const el_select_eigv = document.getElementById('id_select_eigenvalue') as HTMLSelectElement;
    const el_select_dyn_eigv = document.getElementById('id_select_dyn_eigenvalue') as HTMLSelectElement;

    while (el_select_eigv.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select_eigv.removeChild(el_select_eigv?.lastChild);
    }
    draw_eigenform = 1

    while (el_select_dyn_eigv.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select_dyn_eigv.removeChild(el_select_dyn_eigv?.lastChild);
    }
    draw_dyn_eigenform = 1

    if (THIIO_flag === 0 && matprop_flag === 0) {

        let option: any
        for (let i = 0; i < nlastfaelle; i++) {
            option = document.createElement('option');
            option.value = String(+i + 1)
            option.textContent = 'Lastfall ' + (+i + 1);
            el_select.appendChild(option);
        }

        for (let i = 0; i < nkombinationen; i++) {
            option = document.createElement('option');
            option.value = String(+i + 1 + nlastfaelle)
            option.textContent = 'Kombination ' + (+i + 1);
            el_select.appendChild(option);
        }

        if (nkombinationen > 0) {

            option = document.createElement('option');
            option.value = String(+nkombinationen + 1 + nlastfaelle)
            option.textContent = 'alle Kombinationen';
            el_select.appendChild(option);
        }

        if (stadyn === 0) { // Statik
            el_select_dyn_eigv.style.display = "none"

            el_select_eigv.style.display = "block"

            for (let i = 0; i < neigv; i++) {
                let option = document.createElement('option');
                option.value = String(+i + 1)
                option.textContent = 'Knickfigur ' + (+i + 1);
                el_select_eigv.appendChild(option);
            }
        } else {    // Dynamik
            el_select_eigv.style.display = "none"

            el_select_dyn_eigv.style.display = "block"

            for (let i = 0; i < dyn_neigv; i++) {
                let option = document.createElement('option');
                option.value = String(+i + 1)
                option.textContent = 'Eigenform ' + (+i + 1);
                el_select_dyn_eigv.appendChild(option);
            }
        }

    } else if (THIIO_flag === 1 || matprop_flag > 0) {

        el_select_dyn_eigv.style.display = "none"

        let option: any
        for (let i = 0; i < nkombinationen; i++) {
            option = document.createElement('option');
            option.value = String(+i + 1)
            option.textContent = 'Kombination ' + (+i + 1);
            el_select.appendChild(option);
        }

        if (nkombinationen > 0) {

            option = document.createElement('option');
            option.value = String(+nkombinationen + 1)
            option.textContent = 'alle Kombinationen';
            el_select.appendChild(option);
        }

        el_select_eigv.style.display = "block"

        for (let i = 0; i < neigv; i++) {
            let option = document.createElement('option');
            option.value = String(+i + 1)
            option.textContent = 'Knickfigur ' + (+i + 1);
            el_select_eigv.appendChild(option);
        }
    }

}

//--------------------------------------------------------------------------------------------------------
function pointermove(ev: PointerEvent) {
    //----------------------------------------------------------------------------------------------------
    //console.log("in pointermove", ev);

    ev.preventDefault();

    switch (ev.pointerType) {
        case "mouse":
            isPen = false
            mousemove(ev);
            break;
        case "pen":
            isPen = true
            //mousemove(ev);
            break;
        // case "touch":
        //     touchmove(ev);
        //     break;
    }
}

//--------------------------------------------------------------------------------------------------------
function touchmove(ev: TouchEvent) {
    //----------------------------------------------------------------------------------------------------

    //console.log("in touchmove", ev);
    ev.preventDefault();

    if (ev.touches.length === 2) {

        let dx = ev.touches[0].clientX - ev.touches[1].clientX
        let dy = ev.touches[0].clientY - ev.touches[1].clientY
        curDiff = Math.sqrt(dx * dx + dy * dy) //* 0.25;

        let x = (ev.touches[0].clientX + ev.touches[1].clientX) / 2
        let y = (ev.touches[0].clientY + ev.touches[1].clientY) / 2

        mouseDx += x - touchDx
        mouseDz += y - touchDy
        // console.log("finger 1", mouseDx, mouseDz, touchLoop)
        touchDx = x
        touchDy = y

        centerX = centerX_last + tr.World0(mouseDx)
        centerY = centerY_last + tr.World0(mouseDz)

        if (touchLoop === 1) {

            // let factor = prevDiff / curDiff - 1.0 + wheel_factor_alt
            // if (factor > -1.3 && factor < 0.2) {
            //     wheel_factor = prevDiff / curDiff - 1.0 + wheel_factor_alt
            //     //write('wheel_factor ', wheel_factor)
            //     //console.log('wheelfaktor', wheel_factor)
            // }
            deltaXY = -tr.World0((curDiff - prevDiff)) + deltaXY_alt

            drawsystem()
        } else {
            touchLoop = 1
            if (firstTouch) {
                prevDiff = curDiff;
                firstTouch = false
            } else {
                prevDiff = curDiff;
            }

            touchDx = x
            touchDy = y
            mouseDx = 0.0
            mouseDz = 0.0

        }
    }
    else if (ev.touches.length === 1) {

        let x = (ev.touches[0].clientX)
        let y = (ev.touches[0].clientY)
        //        console.log("finger 1",dx,dy,touchLoop)
        if (isPen) {
            x = ev.touches[0].clientX
            y = ev.touches[0].clientY - grafik_top
            draw_werte(x, y);
        } else {

            if (touchLoop === 1) {
                mouseDx += x - touchDx
                mouseDz += y - touchDy
                // console.log("finger 1", mouseDx, mouseDz, touchLoop)
                touchDx = x
                touchDy = y

                centerX = centerX_last + tr.World0(mouseDx)
                centerY = centerY_last + tr.World0(mouseDz)
                drawsystem()
            } else {
                touchLoop = 1
                touchDx = x
                touchDy = y
                mouseDx = 0.0
                mouseDz = 0.0
            }
        }

    }
    isPen = false
}

//--------------------------------------------------------------------------------------------------------
function touchstart(ev: TouchEvent) {
    //--------------------------------------------------------------------------------------------------------
    ev.preventDefault();

    mouseOffsetX = ev.touches[0].clientX
    mouseOffsetY = ev.touches[0].clientY
    if (ev.touches.length === 1) {
        nFingers = 1
        touchLoop = 1
        touchDx = mouseOffsetX
        touchDy = mouseOffsetY
        mouseDx = 0.0
        mouseDz = 0.0
    }
    if (ev.touches.length === 2) {
        nFingers = 2
        touchLoop = 0

    }

    //console.log("in touchstart", nFingers);
}

//--------------------------------------------------------------------------------------------------------
function touchend(ev: TouchEvent) {
    //--------------------------------------------------------------------------------------------------------
    // console.log("in touchend", ev.touches.length);
    // write("in touchend " + ev.touches.length);
    ev.preventDefault();
    //prevDiff = 0.0
    if (ev.touches.length === 1) {
        nFingers = 1
        curDiff_alt = curDiff
        touchLoop = 0
    }
    if (ev.touches.length === 0) {
        nFingers = 0

        touchLoop = 0

        centerX_last = centerX
        centerY_last = centerY
    }
    touchLoop = 0
    //write("touchend " + mouse_DownWX + "|" + mouse_DownWY)

    wheel_factor_alt = wheel_factor

    deltaXY_alt = deltaXY

}



//--------------------------------------------------------------------------------------------------------
function wheel(ev: WheelEvent) {
    //----------------------------------------------------------------------------------------------------

    ev.preventDefault()

    if (ev.deltaY > 0) {       // Bild wird kleiner
        // if (mouseCounter < 40) {
        mouseCounter++;
        wheel_factor = mouseCounter / 60.    //0.025;
        deltaXY += tr.World0(30)

        // }
        //if (wheel_factor > 3) wheel_factor = 3.0
    }
    else if (ev.deltaY < 0) {   // zoom in, Detail
        //if (mouseCounter > -80) {
        mouseCounter--;
        wheel_factor = mouseCounter / 60.0;  //0.025;
        deltaXY -= tr.World0(30)

        //if (wheel_factor < 0.2) wheel_factor = 0.2
        // }
    }
    // console.log('==========================in mousewheel', ev.deltaX, ev.deltaY, ev.offsetX, ev.offsetY, mouseDx, mouseDz)


    // let startTime: any
    // let endTime: any
    // startTime = performance.now();
    // started = true
    drawsystem()
    // started = false
    // endTime = performance.now();
    // console.log("ev.deltaY", ev.deltaY, ev.deltaMode, (endTime - startTime), 'msec')
}

//--------------------------------------------------------------------------------------------------------
function mousedown(ev: any) {
    //----------------------------------------------------------------------------------------------------

    //console.log('in mousedown', ev)
    ev.preventDefault()

    // if (!mouseMoveIsActive) {
    //domElement.addEventListener('mousemove', mousemove, false);
    //     mouseMoveIsActive = true
    // }
    zoomIsActive = true

    mouseOffsetX = ev.offsetX
    mouseOffsetY = ev.offsetY

    mouseDx = 0.0
    mouseDz = 0.0

    //console.log("mouse_DownWX", mouse_DownWX, mouse_DownWY)
}

//--------------------------------------------------------------------------------------------------------
function mousemove(ev: MouseEvent) {
    //----------------------------------------------------------------------------------------------------

    // console.log('**********************************')
    // console.log('in mousemove', ev.movementX, ev.movementY, ev.offsetX, ev.offsetY)
    // console.log('**********************************')

    ev.preventDefault()


    // console.log("word", tr.xWorld(ev.offsetX), tr.zWorld(ev.offsetY))

    if (zoomIsActive) {
        mouseDx += ev.offsetX - mouseOffsetX
        mouseDz += ev.offsetY - mouseOffsetY
        mouseOffsetX = ev.offsetX
        mouseOffsetY = ev.offsetY
        centerX = centerX_last + tr.World0(mouseDx)
        centerY = centerY_last + tr.World0(mouseDz)
        drawsystem()
    }
    else {
        if (werte.length > 0) {
            let index = -1
            let x0 = ev.offsetX, z0 = ev.offsetY
            let mind = 1.e30
            //console.log("werte.length", werte.length,ev.clientX,ev.clientY,tr.xPix(0.0),tr.zPix(0.0))
            for (let i = 0; i < werte.length; i++) {
                let dx = x0 - werte[i].x
                let dz = z0 - werte[i].z
                let d = dx * dx + dz * dz

                if (d < mind && d < (view_diagonale / 10) ** 2) {
                    mind = d
                    index = i
                }
            }
            if (index > -1) {
                //console.log('gefunden', index, werte[index].wert, mind, view_diagonale/5)
                draw_wert.found = true
                draw_wert.x = werte[index].x
                draw_wert.y = werte[index].z
                draw_wert.wert = werte[index].wert
                drawsystem()
            }
            else {
                draw_wert.found = false
                drawsystem()
            }

        }
    }
}

//--------------------------------------------------------------------------------------------------------
function mouseup(ev: any) {
    //----------------------------------------------------------------------------------------------------

    // console.log('in mouseup', ev)
    ev.preventDefault()

    //if (!needMouseMoveForInfo) {
    //domElement.removeEventListener('mousemove', mousemove, false);
    //    mouseMoveIsActive = false
    // }
    zoomIsActive = false

    centerX_last = centerX
    centerY_last = centerY

}


//--------------------------------------------------------------------------------------------------------
function draw_werte(x0: number, z0: number) {
    //----------------------------------------------------------------------------------------------------
    if (werte.length > 0) {
        let index = -1
        //let x0 = ev.offsetX, z0 = ev.offsetY
        let mind = 1.e30
        //console.log("werte.length", werte.length,ev.clientX,ev.clientY,tr.xPix(0.0),tr.zPix(0.0))
        for (let i = 0; i < werte.length; i++) {
            let dx = x0 - werte[i].x
            let dz = z0 - werte[i].z
            let d = dx * dx + dz * dz

            if (d < mind && d < (view_diagonale / 10) ** 2) {
                mind = d
                index = i
            }
        }
        if (index > -1) {
            //console.log('gefunden', index, werte[index].wert, mind, view_diagonale/5)
            draw_wert.found = true
            draw_wert.x = werte[index].x
            draw_wert.y = werte[index].z
            draw_wert.wert = werte[index].wert
            drawsystem()
        }
        else {
            draw_wert.found = false
            drawsystem()
        }

    }
}
//---------------------------------------------------------- d r a w s y s t e m  -------------------
//---------------------------------------------------------- d r a w s y s t e m  -------------------
//---------------------------------------------------------- d r a w s y s t e m  -------------------
//---------------------------------------------------------- d r a w s y s t e m  -------------------

export function drawsystem(svg_id = 'artboard') {

    let show_selection = true;
    if (svg_id != 'artboard') show_selection = false;  // nur System für pdf-Ausgabe erzeugen

    let height = 0

    if (two) two.clear();

    // if (mouseMoveIsActive) {
    //     domElement.removeEventListener('mousemove', mousemove, false);
    //     mouseMoveIsActive = false
    // }
    needMouseMoveForInfo = false
    werte.length = 0
    index_werte = 0


    // var params = {
    //     fullscreen: false,
    //     //type: Two.Types.canvas
    // };

    //evCache.length = 0;

    //window.removeEventListener('wheel', wheel);
    // if (two !== null) {
    //     // let parent = two.renderer.domElement.parentElement
    //     // console.log("Parent ", parent)

    //     two.unbind('update')
    //     two.pause()
    //     two.removeEventListener()
    //     two.clear()

    //     //two.bind('update')
    //     //        let parent = two.renderer.domElement.parentelement;
    //     //console.log("Parent ", parent)
    //     //if (parent) parent.removeChild(two.renderer.domElement);
    // }

    // if (domElement != null) {
    //     // domElement.removeEventListener('wheel', wheel, { passive: false });
    //     // domElement.removeEventListener('mousedown', mousedown, false);
    //     // domElement.removeEventListener('mouseup', mousemove, false);

    //     //console.log('domElement',domElement)
    //     let parent = domElement.parentElement
    //     //console.log("Parent ", parent)
    //     if (parent) parent.removeChild(domElement);
    //     // domElement.removeEventListener('touchstart', touchstart, { passive: false });
    //     // domElement.removeEventListener('touchmove', touchmove, { passive: false });
    //     // domElement.removeEventListener('touchend', touchend, { passive: false });
    //     //domElement.removeEventListener();

    //     // domElement.removeEventListener('pointerdown', touchdownHandler, false);  // , false
    //     // domElement.removeEventListener('pointerup', touchupHandler, false);
    //     // domElement.removeEventListener('pointermove', touchmoveHandler, false);

    // }

    // // const tab_group = document.getElementById('container') as any;
    // // tab_group.hidden=true

    // // for (let i = 0; i < two.scene.children.length; i++) {
    // //     let child = two.scene.children[i];
    // //     two.scene.remove(child);
    // //     Two.Utils.dispose(child);
    // // }

    console.log("__________________________________  G R A F I K  ___________")
    // const elem = document.getElementById(svg_id) as any; //HTMLDivElement;
    // console.log("childElementCount", elem.childElementCount)

    // if (elem.childElementCount > 0) elem.removeChild(elem?.lastChild);   // war > 2


    let onlyLabels = !(show_normalkraftlinien || show_querkraftlinien || show_momentenlinien || show_schiefstellung || show_eigenformen || show_verformungen || show_stabvorverformung || show_dyn_eigenformen || show_bodenpressung);

    //console.log("O N L Y  L A B E L S", onlyLabels)

    const artboard = document.getElementById(svg_id) as any;
    // console.log("artboard", artboard)

    // if (two !== null) {
    //     // let parent = two.renderer.domElement.parentElement
    //     // console.log("Parent ", parent)

    //     two.unbind('update')
    //     two.pause()
    //     two.removeEventListener()
    //     two.clear()

    //     //two.bind('update')
    //     //        let parent = two.renderer.domElement.parentelement;
    //     //console.log("Parent ", parent)
    //     //if (parent) parent.removeChild(two.renderer.domElement);
    // } //else {


    // two = null;
    // two = new Two(params).appendTo(artboard);
    // //}
    // console.log("width,height from two.js ", two.width, two.height)

    //let el1 = document.getElementById("id_tab_group") as any   // id_tab_group
    //console.log("HEIGHT id_tab_group boundingRect", el1, el1.getBoundingClientRect());
    //write("height id_tab_group: ", el1.getBoundingClientRect().height)

    let ele = document.getElementById("id_grafik") as any
    if (fullscreen) {
        grafik_top = 0
        ele.style.position = 'absolute'
        height = document.documentElement.clientHeight - 4;
    } else {
        grafik_top = ele.getBoundingClientRect().top
        //console.log("HEIGHT id_grafik boundingRect", ele.getBoundingClientRect(), '|', ele);
        //write("grafik top: " + grafik_top)
        if (grafik_top === 0) grafik_top = 69
        height = document.documentElement.clientHeight - grafik_top - 4 - 17//- el?.getBoundingClientRect()?.height;
    }

    let breite: number
    let hoehe: number
    if (show_selection) {
        two.width = document.documentElement.clientWidth;
        two.height = height
        breite = two.width;
        hoehe = two.height;
    } else {
        two.width = breite = 1500;
        two.height = hoehe = 1500;
    }

    view_diagonale = Math.sqrt(breite * breite + hoehe * hoehe)

    show_lasten_temp = show_lasten;    // Bei Schnittgrößen werden Lasten temporär nicht gezeichnet


    //console.log("MAX", slmax, xmin, xmax, zmin, zmax)
    //console.log('maxValue_lf(komb)', maxValue_lf, maxValue_komb)


    // xminw = xmin * (1 + wheel_factor) / 2. + xmax * (1. - wheel_factor) / 2.
    // xmaxw = xmin * (1 - wheel_factor) / 2. + xmax * (1. + wheel_factor) / 2.
    // zminw = zmin * (1 + wheel_factor) / 2. + zmax * (1. - wheel_factor) / 2.
    // zmaxw = zmin * (1 - wheel_factor) / 2. + zmax * (1. + wheel_factor) / 2.

    //console.log("tr", tr)

    if (tr === undefined) {

        let dx = xmax - xmin;
        let dz = zmax - zmin;

        xmin0 = xmin - 0.2 * dx;
        xmax0 = xmax + 0.2 * dx;
        zmin0 = zmin - 0.2 * dz;
        zmax0 = zmax + 0.2 * dz;

        xminw = xmin0
        xmaxw = xmax0
        zminw = zmin0
        zmaxw = zmax0
        //console.log("xmin0", xmin0, xmax0, zmin0, zmax0)
    } else {
        // let ax = tr.xWorld(mouseOffsetX)
        // let az = tr.zWorld(mouseOffsetY)

        // get word koordinate of Center

        //   centerX = tr.xWorld(document.documentElement.clientWidth / 2)
        //   centerY = tr.zWorld(height/2)
        // centerX = tr.World0(mouseDx) + mouse_DownWX   //+ mouse_DownWX
        // centerY = tr.World0(mouseDz) + mouse_DownWY
        //centerX = 2.5
        //centerY = 2.5
        //centerX = tr.xWorld(mouseDx) //+ mouse_DownWX   //+ mouse_DownWX
        //centerY = tr.zWorld(mouseDz) //+ mouse_DownWY

        //console.log("centerX,centerY", centerX, centerY, mouseDx, mouseDz)

        let dx = xmax - xmin
        let dz = zmax - zmin

        xmin0 = xmin - 0.2 * dx - centerX;
        xmax0 = xmax + 0.2 * dx - centerX;
        zmin0 = zmin - 0.2 * dz - centerY;
        zmax0 = zmax + 0.2 * dz - centerY;
        //console.log("dx,dz",dx,dz)

        //console.log("======= dx,dz", mouseDx, mouseDz, dx, dz)


        // xmint = xmin * (1 + wheel_factor) / 2. + xmax * (1. - wheel_factor) / 2.
        // xmaxt = xmin * (1 - wheel_factor) / 2. + xmax * (1. + wheel_factor) / 2.
        // zmint = zmin * (1 + wheel_factor) / 2. + zmax * (1. - wheel_factor) / 2.
        // zmaxt = zmin * (1 - wheel_factor) / 2. + zmax * (1. + wheel_factor) / 2.
        //write('wheel_factor ', wheel_factor)
        //console.log('wheel_factor ', wheel_factor)

        // xmint = xmin0 - dx * wheel_factor / 2.
        // xmaxt = xmax0 + dx * wheel_factor / 2.
        // zmint = zmin0 - dz * wheel_factor / 2.
        // zmaxt = zmax0 + dz * wheel_factor / 2.

        xmint = xmin0 - deltaXY / 2.
        xmaxt = xmax0 + deltaXY / 2.
        zmint = zmin0 - deltaXY / 2.
        zmaxt = zmax0 + deltaXY / 2.

        // let ddx = (xmaxt - xmint)/2
        // let ddz = (zmaxt - zmint)/2
        // let ddx = (xmax0 + xmin0) / 2
        // let ddz = (zmax0 + zmin0) / 2
        //ddx = 0; ddz = 0;
        //console.log("xmint", wheel_factor, xmint, xmaxt, zmint, zmaxt, mouse_DownWX,  mouse_DownWY,ddx,ddz)
        //        dx = tr.World0(mouseDx) +  ddx - mouse_DownWX   //+ mouse_DownWX
        //        dz = tr.World0(mouseDz) + (ddz - mouse_DownWY)  //+ mouse_DownWY


        // dx = tr.World0(mouseDx) + mouse_DownWX   //+ mouse_DownWX
        // dz = tr.World0(mouseDz) + mouse_DownWY  //+ mouse_DownWY

        dx = 0; dz = 0
        xminw = xmint - dx
        xmaxw = xmaxt - dx
        zminw = zmint - dz
        zmaxw = zmaxt - dz
        //console.log("xminw", xminw, xmaxw, zminw, zmaxw)

    }
    //     xminw = ax - wheel_factor * (xmax - xmin)/2
    //     xmaxw = ax + wheel_factor * (xmax - xmin)/2
    // }


    if (tr === undefined) {
        console.log("in undefined")
        tr = new CTrans(xminw, zminw, xmaxw, zmaxw, breite, hoehe)
    } else {
        //if (init) {
        tr.init(xminw, zminw, xmaxw, zmaxw, breite, hoehe);

        //}
    }

    { // für Ausdruck des Systems in pdf-Datei
        const [x_min, x_max, z_min, z_max] = tr.getMinMax();
        svg_pdf_ratio = (x_max - x_min) / (z_max - z_min)
    }

    let x1: number, x2: number, z1: number, z2: number

    //                              B o d e n p r e s s u n g     B o d e n p r e s s u n g     B o d e n p r e s s u n g

    if (show_bodenpressung && show_selection && (flag_eingabe != 0)) {
        draw_bodenpressung();
    }


    //                              Verformungen   Verformungen   Verformungen   Verformungen

    if (show_verformungen && show_selection && (flag_eingabe != 0)) {

        let xx1, xx2, zz1, zz2, xp1, xp2, zp1, zp2
        let dx: number, x: number, eta: number, sl: number, nenner: number
        //let Nu: number[] = Array(2), Nw: number[] = Array(4)
        let uG: number, wG: number
        let nLoop = 1, lf_index = 0
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0

        //let edispL: number[] = new Array(6)
        let iLastfall = draw_lastfall
        let scalefactor = 0

        needMouseMoveForInfo = true

        if (THIIO_flag === 0 && matprop_flag === 0) {
            if (iLastfall <= nlastfaelle) {
                lf_index = iLastfall - 1
                if (maxValue_lf[iLastfall - 1].disp != 0.0) scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].disp * 1000.
            } else if (iLastfall <= nlastfaelle + nkombinationen) {
                lf_index = iLastfall - 1
                let ikomb = iLastfall - 1 - nlastfaelle
                scalefactor = 0.1 * slmax / max_disp_kombi[ikomb]
            } else {
                nLoop = nkombinationen
                lf_index = nlastfaelle
                scalefactor = 0.1 * slmax / maxdisp_all
            }
        }
        else if (THIIO_flag === 1 || matprop_flag > 0) {
            if (iLastfall <= nkombinationen) {
                lf_index = iLastfall - 1
                if (maxValue_komb[iLastfall - 1].disp != 0.0) scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].disp * 1000.
            } else {
                nLoop = nkombinationen
                lf_index = 0
                scalefactor = 0.05 * slmax / maxdisp_all
            }
        }

        scalefactor *= scaleFactor_panel

        //console.log("scalefaktor", scalefactor, slmax, maxValue_lf[iLastfall - 1].disp)

        for (let ielem = 0; ielem < nelem; ielem++) {

            if (!stab[ielem].isActive) continue

            maxU = 0.0

            const nelTeilungen = element[ielem].nTeilungen
            let uL: number[] = new Array(nelTeilungen)   // L = Verformung lokal
            let wL: number[] = new Array(nelTeilungen)
            let phiL: number[] = new Array(nelTeilungen)

            let umriss_x: number[] = new Array(2 * nelTeilungen)
            let umriss_z: number[] = new Array(2 * nelTeilungen)


            let aL = stab[ielem].aL
            let aR = stab[ielem].aR

            let si = stab[ielem].sinus
            let co = stab[ielem].cosinus


            let xs1 = stab[ielem].x1 + co * aL;
            let zs1 = stab[ielem].z1 + si * aL;
            let xs2 = stab[ielem].x2 - co * aR;
            let zs2 = stab[ielem].z2 - si * aR;

            x1 = Math.round(tr.xPix(xs1));
            z1 = Math.round(tr.zPix(zs1));
            x2 = Math.round(tr.xPix(xs2));
            z2 = Math.round(tr.zPix(zs2));

            let h = element[ielem].h / 2.

            dx = element[ielem].sl / nelTeilungen
            eta = element[ielem].eta
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * eta * sl

            for (let loop = 0; loop < nLoop; loop++) {

                element[ielem].get_elementSchnittgroesse_u_w_phi(uL, wL, phiL, lf_index + loop, show_gesamtverformung);
                // console.log("uL", uL)
                // console.log("wL", wL)
                // console.log("phiL", phiL)

                xx2 = 0.0; zz2 = 0.0
                for (let i = 0; i < nelTeilungen; i++) {
                    // Nu[0] = (1.0 - x / sl);
                    // Nu[1] = x / sl
                    // Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                    // Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                    // Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                    // Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
                    // u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                    // w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];

                    // //console.log("wx =", w, element[ielem].w_[iLastfall - 1][i])
                    // w += element[ielem].w_[iLastfall - 1][i]  // Anteil aus Elementlasten im Starrsystem

                    x = element[ielem].x_[i]

                    uG = element[ielem].cosinus * uL[i] - element[ielem].sinus * wL[i]
                    wG = element[ielem].sinus * uL[i] + element[ielem].cosinus * wL[i]

                    xx1 = xx2; zz1 = zz2;
                    xx2 = xs1 + x * element[ielem].cosinus + uG * scalefactor
                    zz2 = zs1 + x * element[ielem].sinus + wG * scalefactor
                    if (show_umriss) {
                        const phi = phiL[i]

                        // oben
                        let uoben = uL[i] + phi * h;   //Math.sin(phi) * h
                        let woben = wL[i] //- Math.cos(phi) * h

                        let uobenG = element[ielem].cosinus * uoben - element[ielem].sinus * woben
                        let wobenG = element[ielem].sinus * uoben + element[ielem].cosinus * woben

                        let xoben2 = xs1 + x * element[ielem].cosinus + element[ielem].sinus * h + uobenG * scalefactor
                        let zoben2 = zs1 + x * element[ielem].sinus - element[ielem].cosinus * h + wobenG * scalefactor
                        // console.log("NEU OBEN", x, uoben, woben, uobenG, wobenG, xoben2, zoben2)

                        umriss_x[i] = xp1 = tr.xPix(xoben2)
                        umriss_z[i] = zp1 = tr.zPix(zoben2)

                        let uunten = uL[i] - phi * h;  //Math.sin(phi) * h
                        let wunten = wL[i] //- Math.cos(phi) * h

                        let uuntenG = element[ielem].cosinus * uunten - element[ielem].sinus * wunten
                        let wuntenG = element[ielem].sinus * uunten + element[ielem].cosinus * wunten

                        let xunten2 = xs1 + x * element[ielem].cosinus - element[ielem].sinus * h + uuntenG * scalefactor
                        let zunten2 = zs1 + x * element[ielem].sinus + element[ielem].cosinus * h + wuntenG * scalefactor
                        umriss_x[2 * nelTeilungen - 1 - i] = xp2 = tr.xPix(xunten2)
                        umriss_z[2 * nelTeilungen - 1 - i] = zp2 = tr.zPix(zunten2)

                        //                        const phi = element[ielem].alpha - phiL[i] * scalefactor          // phiL im Gegenuhrzeigersinn positiv
                        //const phi = - phiL[i] * scalefactor          // phiL im Gegenuhrzeigersinn positiv
                        // console.log("p h i ", x, phi, phiL[i])
                        // umriss_x[i] = xp1 = tr.xPix(xx2 + phi * h)
                        // umriss_z[i] = zp1 = tr.zPix(zz2 - h)
                        // umriss_x[2 * nelTeilungen - 1 - i] = xp2 = tr.xPix(xx2 - phi * h)
                        // umriss_z[2 * nelTeilungen - 1 - i] = zp2 = tr.zPix(zz2 + h)

                        let line1 = two.makeLine(xp1, zp1, xp2, zp2);
                        line1.linewidth = 1;
                    }
                    xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                    if (i > 0) {
                        let line = two.makeLine(xx1, zz1, xx2, zz2);
                        line.linewidth = 5;
                    }

                    dispG = Math.sqrt(uG * uG + wG * wG)
                    if (dispG > maxU) {
                        maxU = dispG
                        x_max = xx2
                        z_max = zz2
                        xmem = tr.xPix(xs1 + x * element[ielem].cosinus)
                        zmem = tr.zPix(zs1 + x * element[ielem].sinus)
                    }

                    werte.push(new TWerte())
                    werte[index_werte].x = xx2
                    werte[index_werte].z = zz2
                    werte[index_werte].wert = myFormat(dispG * 1000, 1, 1) + '|' + myFormat(uG * 1000, 1, 1) + '|' + myFormat(wG * 1000, 1, 1) + 'mm'
                    index_werte++

                    x = x + dx
                }

                if (show_umriss) {
                    var vertices = [];
                    for (let i = 0; i < 2 * nelTeilungen; i++) {
                        vertices.push(new Two.Anchor(umriss_x[i], umriss_z[i]));
                    }
                    let umriss = two.makePath(vertices);
                    umriss.linewidth = 1;
                    umriss.fill = '#006600'
                    umriss.opacity = opacity
                }

            }

            if (show_labels && maxU > 0.0) {

                //const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                //pfeil.stroke = '#111111'     //'#D3D3D3'
                draw_arrowPix(two, xmem, zmem, x_max, z_max, style_pfeil_pix)

                const str = myFormat(maxU * 1000, 1, 1) + 'mm'
                const txt = two.makeText(str, x_max + 5, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

            }
        }
    }

    if (flag_eingabe != 0) {

        // Eigenformen

        if (show_eigenformen && show_selection && (maxValue_eigv[draw_lastfall - 1][draw_eigenform - 1] > 0.0)) {

            let xx1, xx2, zz1, zz2
            let dx: number, x: number, eta: number, sl: number, nenner: number
            let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

            let u = 0.0, w = 0.0, uG: number, wG: number
            let edispL: number[] = new Array(6)
            let ikomb = draw_lastfall
            let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
            let xmem = 0.0, zmem = 0.0


            let scalefactor = 0.1 * slmax / maxValue_eigv[ikomb - 1][draw_eigenform - 1]    //maxValue_komb[iLastfall - 1].disp

            scalefactor *= scaleFactor_panel

            //console.log("scalefaktor", scalefactor, slmax, maxValue_lf[draw_eigenform - 1].disp)
            //console.log("draw_eigenform", draw_eigenform, ikomb)

            for (let ielem = 0; ielem < nelem; ielem++) {

                if (!stab[ielem].isActive) continue

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
                    if (System === 0) {
                        //console.log("DRAW KNICKFIGUR", (+ielem + 1), stab[ielem].elTyp)
                        if (stab[ielem].elTyp === 0) {
                            Nu[0] = (1.0 - x / sl);
                            Nu[1] = x / sl
                            Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                            Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                            Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                            Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
                            u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                            w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];
                        } else if (stab[ielem].elTyp === 1) {
                            Nu[0] = (1.0 - x / sl);
                            Nu[1] = x / sl
                            u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                            w = Nu[0] * edispL[1] + Nu[1] * edispL[3]

                            // u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                            // w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                        }
                    } else {
                        Nu[0] = (1.0 - x / sl);
                        Nu[1] = x / sl
                        u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                        w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                    }
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
                        line.linewidth = 5;
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


        // Eigenformen aus Dynamik

        if (show_dyn_eigenformen && show_selection && (maxValue_dyn_eigenform[draw_dyn_eigenform - 1] > 0.0)) {

            let xx1, xx2, zz1, zz2
            let dx: number, x: number, eta: number, sl: number, nenner: number
            let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

            let u = 0.0, w = 0.0, uG: number, wG: number
            let edispL: number[] = new Array(6)
            let ikomb = draw_lastfall
            let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
            let xmem = 0.0, zmem = 0.0


            let scalefactor = 0.1 * slmax / maxValue_dyn_eigenform[draw_dyn_eigenform - 1]    //maxValue_komb[iLastfall - 1].disp

            scalefactor *= scaleFactor_panel

            if (show_dyn_animate_eigenformen) {

                animate_scale += animate_scale_dx

                if (animate_scale > 1.0) {

                    animate_scale = 1.0
                    animate_scale_dx = -animate_scale_dx

                } else if (animate_scale < -1.0) {
                    animate_scale = -1.0
                    animate_scale_dx = -animate_scale_dx
                }

                scalefactor *= animate_scale
            }

            //console.log("scalefaktor", scalefactor, slmax)
            //console.log("draw_dyn_eigenform", draw_dyn_eigenform)

            for (let ielem = 0; ielem < nelem; ielem++) {

                if (!stab[ielem].isActive) continue

                maxU = 0.0

                x1 = Math.round(tr.xPix(element[ielem].x1));
                z1 = Math.round(tr.zPix(element[ielem].z1));
                x2 = Math.round(tr.xPix(element[ielem].x2));
                z2 = Math.round(tr.zPix(element[ielem].z2));

                element[ielem].get_edispL_dyn_eigenform(edispL, draw_dyn_eigenform - 1)

                dx = element[ielem].sl / nelTeilungen
                eta = element[ielem].eta
                sl = element[ielem].sl
                nenner = sl ** 3 + 12 * eta * sl

                x = 0.0; xx2 = 0.0; zz2 = 0.0
                for (let i = 0; i <= nelTeilungen; i++) {
                    if (System === 0) {
                        //console.log("DRAW KNICKFIGUR", (+ielem + 1), stab[ielem].elTyp)
                        if (stab[ielem].elTyp === 0) {
                            Nu[0] = (1.0 - x / sl);
                            Nu[1] = x / sl
                            Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                            Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                            Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                            Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
                            u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                            w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];
                        } else if (stab[ielem].elTyp === 1) {
                            Nu[0] = (1.0 - x / sl);
                            Nu[1] = x / sl
                            u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                            w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                        }
                    } else {
                        Nu[0] = (1.0 - x / sl);
                        Nu[1] = x / sl
                        u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                        w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                    }
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
                        line.linewidth = 5;
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

        if (show_schiefstellung && show_selection && (maxValue_u0[draw_lastfall - 1].u0 > 0.0)) {

            let xx1, xx2, zz1, zz2
            let dx: number, x: number, eta: number, sl: number, nenner: number
            let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

            let u = 0.0, w = 0.0, uG: number, wG: number
            let edispL: number[] = new Array(6)
            let ikomb = draw_lastfall
            let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
            let xmem = 0.0, zmem = 0.0

            let scalefactor = 0.1 * slmax / maxValue_u0[ikomb - 1].u0

            scalefactor *= scaleFactor_panel

            //console.log("scalefaktor", scalefactor, slmax, maxValue_u0[ikomb - 1].u0)
            //console.log("draw_schiefstellung", ikomb)

            for (let ielem = 0; ielem < nelem; ielem++) {

                if (!stab[ielem].isActive) continue

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
                    if (System === 0) {
                        //console.log("DRAW KNICKFIGUR", (+ielem + 1), stab[ielem].elTyp)
                        if (stab[ielem].elTyp === 0) {
                            Nu[0] = (1.0 - x / sl);
                            Nu[1] = x / sl
                            Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                            Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                            Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                            Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
                            u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                            w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];
                        } else if (stab[ielem].elTyp === 1) {
                            Nu[0] = (1.0 - x / sl);
                            Nu[1] = x / sl
                            u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                            w = Nu[0] * edispL[1] + Nu[1] * edispL[3]

                            // u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                            // w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                        }
                    } else {
                        Nu[0] = (1.0 - x / sl);
                        Nu[1] = x / sl
                        u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                        w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                    }
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
                        line.linewidth = 5;
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
    }

    // Stabvorverformung

    if (show_stabvorverformung && show_selection) {

        draw_stabvorverformung(two);

    }

    if (flag_eingabe != 0) {
        // -----------------------------------------------------------------
        // Zustandslinien   Zustandslinien   Zustandslinien   Zustandslinien
        // -----------------------------------------------------------------

        if (show_selection) {
            if (show_momentenlinien || show_querkraftlinien || show_normalkraftlinien) {

                show_lasten_temp = false

                let xx1: number, zz1: number, xx2: number, zz2: number
                let dx: number, x: number, sl: number, vorzeichen: number, sgArea = 0.0
                let sgL: number, sgR: number, xL: number, index_sg = 0, max_all = 0.0
                let aL: number, aR: number
                let x3 = 0.0, x4 = 0.0, z3 = 0.0, z4 = 0.0

                let iLastfall = draw_lastfall
                let scalefactor = 0
                let x_max = 0.0, z_max = 0.0, x_min = 0.0, z_min = 0.0
                let x0_min = 0.0, z0_min = 0.0, xn_min = 0.0, zn_min = 0.0, x0_max = 0.0, z0_max = 0.0, xn_max = 0.0, zn_max = 0.0

                let nLoop = 1, lf_index = 0

                let unit: string
                if (show_momentenlinien) unit = 'kNm';
                else unit = 'kN';

                if (show_momentenlinien) { index_sg = 0; max_all = maxM_all; }
                else if (show_querkraftlinien) { index_sg = 1; max_all = maxV_all; }
                else if (show_normalkraftlinien) { index_sg = 2; max_all = maxN_all; }

                if (THIIO_flag === 0 && matprop_flag === 0) {
                    if (iLastfall <= nlastfaelle) {
                        lf_index = iLastfall - 1
                        if (show_momentenlinien) scalefactor = 0.05 * slmax / maxValue_lf[lf_index].My;
                        else if (show_querkraftlinien) scalefactor = 0.05 * slmax / maxValue_lf[lf_index].Vz;
                        else if (show_normalkraftlinien) scalefactor = 0.05 * slmax / maxValue_lf[lf_index].N;
                        //console.log("MAX VALUES, Lastfall=", iLastfall, maxValue_lf[lf_index].My)
                    } else if (iLastfall <= nlastfaelle + nkombinationen) {
                        lf_index = iLastfall - 1
                        let ikomb = iLastfall - 1 - nlastfaelle
                        scalefactor = 0.05 * slmax / max_S_kombi[index_sg][ikomb]
                        //console.log("MAX VALUES KOMBINATION ", iLastfall, max_S_kombi[index_sg][ikomb])

                    } else {
                        nLoop = nkombinationen
                        lf_index = nlastfaelle
                        scalefactor = 0.05 * slmax / max_all
                    }
                }
                else if (THIIO_flag === 1 || matprop_flag > 0) {
                    if (iLastfall <= nkombinationen) {
                        lf_index = iLastfall - 1
                        if (show_momentenlinien) scalefactor = 0.05 * slmax / maxValue_komb[lf_index].My;
                        else if (show_querkraftlinien) scalefactor = 0.05 * slmax / maxValue_komb[lf_index].Vz;
                        else if (show_normalkraftlinien) scalefactor = 0.05 * slmax / maxValue_komb[lf_index].N;
                        //console.log("MAX VALUES, maxValue_komb.Vz.My", iLastfall, maxValue_komb[lf_index].Vz, maxValue_komb[lf_index].My)
                    } else {
                        nLoop = nkombinationen
                        lf_index = 0
                        scalefactor = 0.05 * slmax / max_all
                    }
                }

                scalefactor *= scaleFactor_panel
                //console.log("SCALEFACTOR", 1. / scalefactor)

                for (let ielem = 0; ielem < nelem; ielem++) {

                    if (!stab[ielem].isActive) continue

                    if (scalefactor === Infinity || scalefactor > 1.e10) break;

                    const nelTeilungen = element[ielem].nTeilungen
                    let sg: number[] = new Array(nelTeilungen)


                    aL = stab[ielem].aL
                    aR = stab[ielem].aR

                    let si = stab[ielem].sinus
                    let co = stab[ielem].cosinus


                    let xs1 = stab[ielem].x1 + co * aL;
                    let zs1 = stab[ielem].z1 + si * aL;
                    let xs2 = stab[ielem].x2 - co * aR;
                    let zs2 = stab[ielem].z2 - si * aR;

                    x1 = Math.round(tr.xPix(xs1));
                    z1 = Math.round(tr.zPix(zs1));
                    x2 = Math.round(tr.xPix(xs2));
                    z2 = Math.round(tr.zPix(zs2));

                    sl = element[ielem].sl

                    let maxValuePos = -1e+30
                    let maxValueNeg = 1e+30
                    let valueLeftPos = -1e+30
                    let valueRightPos = -1e+30
                    let valueLeftNeg = 1e+30
                    let valueRightNeg = 1e+30

                    let foundPos = false
                    let foundNeg = false

                    for (let loop = 0; loop < nLoop; loop++) {

                        if (show_momentenlinien) element[ielem].get_elementSchnittgroesse_Moment(sg, lf_index + loop);
                        else if (show_querkraftlinien) element[ielem].get_elementSchnittgroesse_Querkraft(sg, lf_index + loop, show_gleichgewichtSG);
                        else if (show_normalkraftlinien) element[ielem].get_elementSchnittgroesse_Normalkraft(sg, lf_index + loop, show_gleichgewichtSG);
                        //console.log("GRAFIK  Mx,Vx or N", nelTeilungen, sg)

                        //let group = two.makeGroup();
                        let vertices = [];
                        vertices.push(new Two.Anchor(x1, z1));

                        xx2 = 0.0; zz2 = 0.0
                        sgL = sg[0]
                        xx1 = tr.xPix(xs1 - element[ielem].sinus * sg[0] * scalefactor)
                        zz1 = tr.zPix(zs1 + element[ielem].cosinus * sg[0] * scalefactor)
                        x3 = xx1   // nur für Bechriftung
                        z3 = zz1

                        werte.push(new TWerte())
                        werte[index_werte].x = xx1
                        werte[index_werte].z = zz1
                        werte[index_werte].wert = myFormat(sgL, 1, 1) + unit
                        index_werte++

                        if (sgL > valueLeftPos) {
                            valueLeftPos = sgL
                            x0_max = xx1
                            z0_max = zz1
                            if (sgL > maxValuePos) {
                                maxValuePos = sgL
                                x0_max = xx1
                                z0_max = zz1
                            }
                        }
                        if (sgL < valueLeftNeg) {
                            valueLeftNeg = sgL
                            x0_min = xx1
                            z0_min = zz1
                            if (sgL < maxValueNeg) {
                                maxValueNeg = sgL
                                x0_min = xx1
                                z0_min = zz1
                            }
                        }

                        vorzeichen = 1
                        sgArea = 0.0

                        for (let i = 1; i < nelTeilungen; i++) {

                            x = element[ielem].x_[i]
                            xL = element[ielem].x_[i - 1]
                            dx = x - xL
                            sgR = sg[i]
                            //console.log("ielem, sigL und R", ielem,i, nelTeilungen, sgL, sgR)

                            if (sgL === 0.0 && sgR === 0.0) {
                            } else if (sgL >= 0.0 && sgR > 0.0) {
                                vertices.push(new Two.Anchor(xx1, zz1));
                                vorzeichen = 1
                                sgArea += (sgL + sgR) * dx / 2.
                            } else if (sgL <= 0.0 && sgR < 0.0) {
                                vertices.push(new Two.Anchor(xx1, zz1));
                                vorzeichen = -1
                                sgArea += (sgL + sgR) * dx / 2.
                            } else {   // Vorzeichenwechsel
                                //console.log("Vorzeichenwechsel, ielem", ielem, sgL, sgR, sgArea)

                                let dx0 = -sgL * dx / (sgR - sgL)
                                let xx0 = tr.xPix(xs1 + (xL + dx0) * element[ielem].cosinus)
                                let zz0 = tr.zPix(zs1 + (xL + dx0) * element[ielem].sinus)
                                vertices.push(new Two.Anchor(xx1, zz1));
                                //console.log("dx0=", dx0, xx0, zz0)
                                vertices.push(new Two.Anchor(xx0, zz0));

                                let flaeche = two.makePath(vertices);
                                sgArea += sgL * dx0 / 2.0
                                if (sgArea > 0.0) flaeche.fill = '#00AEFF';
                                else flaeche.fill = '#FF0000';
                                flaeche.opacity = opacity

                                vertices.length = 0
                                let dx1 = dx - dx0
                                sgArea = sgR * dx1 / 2.0
                                sgL = 0.0
                                vertices.push(new Two.Anchor(xx0, zz0));
                            }
                            xx2 = xs1 + x * element[ielem].cosinus - element[ielem].sinus * sg[i] * scalefactor
                            zz2 = zs1 + x * element[ielem].sinus + element[ielem].cosinus * sg[i] * scalefactor
                            xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                            //console.log("ielem, i,nelTeilungen", ielem, i, nelTeilungen, sgR, valueRightPos, valueRightNeg, sgArea)

                            if (i === nelTeilungen - 1) {
                                if (sgR > valueRightPos) {
                                    valueRightPos = sgR
                                    xn_max = xx2
                                    zn_max = zz2
                                }
                                if (sgR < valueRightNeg) {
                                    valueRightNeg = sgR
                                    xn_min = xx2
                                    zn_min = zz2
                                }
                            } else {
                                if ((sgR > maxValuePos) && (sgR > valueLeftPos)) {  // (Math.abs(sgR) > Math.abs(valueLeftPos))
                                    foundPos = true
                                    maxValuePos = sgR
                                    x_max = xx2
                                    z_max = zz2
                                }
                                if ((sgR < maxValueNeg) && (sgR < valueLeftNeg)) {   //(Math.abs(sgR) < Math.abs(valueLeftNeg))
                                    //console.log("maxValueNeg", sgR, maxValueNeg, valueLeftNeg)
                                    foundNeg = true
                                    maxValueNeg = sgR
                                    x_min = xx2
                                    z_min = zz2
                                }
                            }

                            werte.push(new TWerte())
                            werte[index_werte].x = xx2
                            werte[index_werte].z = zz2
                            werte[index_werte].wert = myFormat(sgR, 1, 1) + unit
                            index_werte++

                            xx1 = xx2
                            zz1 = zz2
                            sgL = sgR
                        }
                        vertices.push(new Two.Anchor(xx2, zz2));
                        vertices.push(new Two.Anchor(x2, z2));
                        x4 = xx2
                        z4 = zz2

                        let flaeche = two.makePath(vertices);
                        if (sgArea > 0.0) flaeche.fill = '#00AEFF';
                        else flaeche.fill = '#FF0000';
                        flaeche.opacity = opacity

                    }

                    if (show_labels) {

                        //console.log("show_labels", ielem, foundPos, foundNeg, maxValuePos, maxValueNeg, valueLeftPos, valueRightPos, valueLeftNeg, valueRightNeg)
                        let zp = 0.0
                        if (!foundNeg && !foundPos && Math.abs(valueLeftPos - valueRightPos) < 0.0001) {
                            let xpix = (x1 + x2 + x3 + x4) / 4
                            let zpix = (z1 + z2 + z3 + z4) / 4
                            const str = myFormat(Math.abs(valueLeftPos), 1, 2) + unit
                            let txt = two.makeText(str, xpix, zpix, style_txt)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            txt.rotation = element[ielem].alpha
                        } else {
                            if (foundPos && (Math.abs(maxValuePos) > 0.00001) && (maxValuePos > valueRightPos)) {
                                const str = myFormat(Math.abs(maxValuePos), 1, 2) + unit
                                //if (maxValuePos > 0.0) zp = 14; else zp = 0.0;
                                const txt = two.makeText(str, x_max, z_max + zp, style_txt)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }
                            if (foundNeg && (Math.abs(maxValueNeg) > 0.00001) && (maxValueNeg < valueRightNeg)) {
                                const str = myFormat(Math.abs(maxValueNeg), 1, 2) + unit
                                //if (maxValuePos > 0.0) zp = 14; else zp = 0.0;
                                const txt = two.makeText(str, x_min, z_min + zp, style_txt)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }

                            if (Math.abs(valueLeftPos) > 0.00001) {
                                const str = myFormat(Math.abs(valueLeftPos), 1, 2) + unit
                                //if (maxValuePos > 0.0) zp = 14; else zp = 0.0;
                                const txt = two.makeText(str, x0_max, z0_max + zp, style_txt)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }
                            if (Math.abs(valueRightPos) > 0.00001) {
                                const str = myFormat(Math.abs(valueRightPos), 1, 2) + unit
                                //if (maxValuePos > 0.0) zp = 14; else zp = 0.0;
                                const txt = two.makeText(str, xn_max, zn_max + zp, style_txt)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }

                            if (Math.abs(valueLeftNeg) > 0.00001) {
                                const str = myFormat(Math.abs(valueLeftNeg), 1, 2) + unit
                                //if (maxValuePos > 0.0) zp = 14; else zp = 0.0;
                                const txt = two.makeText(str, x0_min, z0_min + zp, style_txt)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }
                            if (Math.abs(valueRightNeg) > 0.00001) {
                                const str = myFormat(Math.abs(valueRightNeg), 1, 2) + unit
                                //if (maxValuePos > 0.0) zp = 14; else zp = 0.0;
                                const txt = two.makeText(str, xn_min, zn_min + zp, style_txt)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }
                        }

                    }


                }
            }
        }

    }


    // ---------------------------  S Y S T E M L I N I E N  --------------------------
    // ---------------------------  S Y S T E M L I N I E N  --------------------------
    // ---------------------------  S Y S T E M L I N I E N  --------------------------


    if (show_systemlinien || !show_selection) {

        needMouseMoveForInfo = true

        for (let ielem = 0; ielem < nelem; ielem++) {

            if (!stab[ielem].isActive) continue

            if (flag_eingabe === 0) {
                x1 = Math.round(tr.xPix(stab[ielem].x1));
                z1 = Math.round(tr.zPix(stab[ielem].z1));
                x2 = Math.round(tr.xPix(stab[ielem].x2));
                z2 = Math.round(tr.zPix(stab[ielem].z2));

                let line = two.makeLine(x1, z1, x2, z2);
                if (onlyLabels) line.linewidth = 10 / devicePixelRatio;
                else line.linewidth = 5 / devicePixelRatio;

                // gestrichelte Faser

                let dx = (stab[ielem].x2 - stab[ielem].x1) / 3
                let dz = (stab[ielem].z2 - stab[ielem].z1) / 3

                let abstand = 10 / devicePixelRatio
                let tmpX1 = tr.xPix(stab[ielem].x1 + dx) - stab[ielem].sinus * abstand
                let tmpZ1 = tr.zPix(stab[ielem].z1 + dz) + stab[ielem].cosinus * abstand
                let tmpX2 = tr.xPix(stab[ielem].x2 - dx) - stab[ielem].sinus * abstand
                let tmpZ2 = tr.zPix(stab[ielem].z2 - dz) + stab[ielem].cosinus * abstand
                //console.log("tmp", tmpX1, tmpZ1, tmpX2, tmpZ2)

                let line1 = two.makeLine(tmpX1, tmpZ1, tmpX2, tmpZ2);
                line1.linewidth = 2 / devicePixelRatio;
                line1.dashes = [10, 4]


                if (stab[ielem].k_0 !== 0.0) draw_bettungsmodul(ielem, onlyLabels, show_selection)  // Bettung darstellen

            } else {

                x1 = Math.round(tr.xPix(element[ielem].x1));
                z1 = Math.round(tr.zPix(element[ielem].z1));
                x2 = Math.round(tr.xPix(element[ielem].x2));
                z2 = Math.round(tr.zPix(element[ielem].z2));


                if (show_umriss && !show_verformungen) {
                    let h = element[ielem].h / 2.
                    //console.log("HHHHHHHH", h)
                    let sih = element[ielem].sinus * h
                    let coh = element[ielem].cosinus * h
                    var vertices = [];
                    vertices.push(new Two.Anchor(tr.xPix(element[ielem].x1 + sih), tr.zPix(element[ielem].z1 - coh)));
                    vertices.push(new Two.Anchor(tr.xPix(element[ielem].x2 + sih), tr.zPix(element[ielem].z2 - coh)));
                    vertices.push(new Two.Anchor(tr.xPix(element[ielem].x2 - sih), tr.zPix(element[ielem].z2 + coh)));
                    vertices.push(new Two.Anchor(tr.xPix(element[ielem].x1 - sih), tr.zPix(element[ielem].z1 + coh)));

                    let flaeche = two.makePath(vertices);
                    flaeche.fill = '#dddddd';
                    flaeche.opacity = opacity;
                } else {
                    //console.log("element",ielem,element)
                    //console.log("x..", element[ielem].x1, element[ielem].z1, element[ielem].x2, element[ielem].z2)
                    //console.log("elem", ielem, x1, z1, x2, z2)

                    let line = two.makeLine(x1, z1, x2, z2);
                    if (onlyLabels) line.linewidth = 10 / devicePixelRatio;
                    else if (show_verformungen || show_eigenformen || show_dyn_eigenformen || show_schiefstellung || show_stabvorverformung) line.linewidth = 2 / devicePixelRatio;
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

                    if (stab[ielem].k_0 !== 0.0) draw_bettungsmodul(ielem, onlyLabels, show_selection)   // Bettung darstellen

                }
            }

            if ((show_labels && onlyLabels) || !show_selection || nur_eingabe_ueberpruefen) {

                let xm = (x1 + x2) / 2. + stab[ielem].sinus * 7 / devicePixelRatio
                let zm = (z1 + z2) / 2. - stab[ielem].cosinus * 7 / devicePixelRatio

                let circle = two.makeCircle(xm, zm, 14, 20)
                circle.fill = '#ffffff'

                let str = String(+ielem + 1)
                const txt = two.makeText(str, xm, zm, style_txt)
                txt.fill = '#000000'
                //txt.alignment = 'left'
                //txt.baseline = 'top'

                xm = (x1 + x2) / 2. + (stab[ielem].sinus * 11 + stab[ielem].cosinus * 17) // devicePixelRatio
                zm = (z1 + z2) / 2. - (stab[ielem].cosinus * 11 - stab[ielem].sinus * 17) // devicePixelRatio

                str = stab[ielem].qname
                const txt1 = two.makeText(str, xm, zm, style_txt)
                txt1.fill = '#000000'
                txt1.alignment = 'left'
                txt1.baseline = 'middle'
                txt1.rotation = stab[ielem].alpha
            }

        }



        if ((show_labels && onlyLabels) || !show_selection || nur_eingabe_ueberpruefen) {

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

            // Koordinatenursprung darstellen

            draw_arrow_alpha(two, 0.0, 0.0, 0.0, -1.0, { a: 55, b: 25, h: 12, linewidth: 4, color: '#ff0000' })
            let txt = two.makeText('x', tr.xPix(0.0) + 80 / devicePixelRatio, tr.zPix(0.0) - 10 / devicePixelRatio, style_txt)
            txt.fill = '#ff0000'
            draw_arrow_alpha(two, 0.0, 0.0, Math.PI / 2.0, -1.0, { a: 55, b: 25, h: 12, linewidth: 4, color: '#0000ff' })
            txt = two.makeText('z', tr.xPix(0.0) + 10 / devicePixelRatio, tr.zPix(0.0) + 80 / devicePixelRatio, style_txt)
            txt.fill = '#0000ff'

        }


        {
            //let xmin = 0.0, xmax = 0.0, zmin = 0.0, zmax = 0.0

            const [x_min, x_max, z_min, z_max] = tr.getMinMax();

            let dx = x_max - x_min
            let dz = z_max - z_min
            //console.log("min max", x_min, x_max, z_min, z_max, dx, dz)
            //console.log("LINKS", tr.xPix(x_min + dx * 0.1), tr.zPix(z_min + dz * 0.1), tr.xPix(x_min + dx * 0.1), tr.zPix(z_max - dz * 0.1))

            // linke Linie
            let rand = tr.World0(20 / devicePixelRatio)
            let xl = x_min + rand //dx * 0.05
            let zl = z_max - rand
            let line1 = two.makeLine(tr.xPix(xl), tr.zPix(z_min + dz * 0.05), tr.xPix(xl), tr.zPix(z_max - dz * 0.05));
            line1.linewidth = 1;

            let line2 = two.makeLine(tr.xPix(x_min), tr.zPix(0.0), tr.xPix(x_min + rand), tr.zPix(0.0));
            line2.linewidth = 1;
            let txt = two.makeText('0', tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(0.0), style_txt)
            txt.fill = '#000000'
            txt.baseline = 'middle'
            txt.alignment = 'left'

            //console.log('MYFORMAT',myFormat(zmin, 1, 2),myFormat(zmax, 1, 2))
            if (myFormat(zmin, 1, 2) !== myFormat(0.0, 1, 2)) {
                line2 = two.makeLine(tr.xPix(x_min), tr.zPix(zmin), tr.xPix(x_min + rand), tr.zPix(zmin));
                line2.linewidth = 1;
                txt = two.makeText(myFormat(zmin, 1, 2), tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(zmin), style_txt)
                txt.fill = '#000000'
                txt.baseline = 'middle'
                txt.alignment = 'left'
            }

            if (myFormat(zmax, 1, 2) != myFormat(0.0, 1, 2)) {
                line2 = two.makeLine(tr.xPix(x_min), tr.zPix(zmax), tr.xPix(x_min + rand), tr.zPix(zmax));
                line2.linewidth = 1;
                txt = two.makeText(myFormat(zmax, 1, 2), tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(zmax), style_txt)
                txt.fill = '#000000'
                txt.baseline = 'middle'
                txt.alignment = 'left'
            }

            //unten

            let line3 = two.makeLine(tr.xPix(x_min + dx * 0.05), tr.zPix(zl), tr.xPix(x_max - dx * 0.05), tr.zPix(zl));
            line3.linewidth = 1;
            let line4 = two.makeLine(tr.xPix(0.0), tr.zPix(z_max), tr.xPix(0.0), tr.zPix(z_max - rand));
            line4.linewidth = 1;
            let txt1 = two.makeText('0', tr.xPix(0.0), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
            txt1.fill = '#000000'
            txt1.baseline = 'baseline'
            txt1.alignment = 'center'

            if (myFormat(xmax, 1, 2) != myFormat(0.0, 1, 2)) {
                let line5 = two.makeLine(tr.xPix(xmax), tr.zPix(z_max), tr.xPix(xmax), tr.zPix(z_max - rand));
                line5.linewidth = 1;
                txt1 = two.makeText(myFormat(xmax, 1, 2), tr.xPix(xmax), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
                txt1.fill = '#000000'
                txt1.baseline = 'baseline'
                txt1.alignment = 'center'
            }

            if (myFormat(xmin, 1, 2) != myFormat(0.0, 1, 2)) {
                let line5 = two.makeLine(tr.xPix(xmin), tr.zPix(z_max), tr.xPix(xmin), tr.zPix(z_max - rand));
                line5.linewidth = 1;
                txt1 = two.makeText(myFormat(xmin, 1, 2), tr.xPix(xmin), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
                txt1.fill = '#000000'
                txt1.baseline = 'baseline'
                txt1.alignment = 'center'
            }

            {
                let xmean = (xminw + xmaxw) / 2
                //xmean = Number(xmean.toFixed(1))
                let line5 = two.makeLine(tr.xPix(xmean), tr.zPix(z_max), tr.xPix(xmean), tr.zPix(z_max - rand));
                line5.linewidth = 1;
                txt1 = two.makeText(myFormat(xmean, 1, 2), tr.xPix(xmean), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
                txt1.fill = '#000000'
                txt1.baseline = 'baseline'
                txt1.alignment = 'center'
            }

            {
                let zmean = (zminw + zmaxw) / 2
                //zmean = Number(zmean.toFixed(1))
                let line2 = two.makeLine(tr.xPix(x_min), tr.zPix(zmean), tr.xPix(x_min + rand), tr.zPix(zmean));
                line2.linewidth = 1;
                txt = two.makeText(myFormat(zmean, 1, 2), tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(zmean), style_txt)
                txt.fill = '#000000'
                txt.baseline = 'middle'
                txt.alignment = 'left'
            }
        }
    }


    if (show_knotenmassen && show_selection) draw_knotenmassen(two);

    draw_lager(two);

    if (show_systemlinien || !show_selection) {
        //if (flag_eingabe != 0 || nur_eingabe_ueberpruefen)
        draw_gelenke(two);
    }

    // Koppelfedern darstellen

    if (show_systemlinien || !show_selection) {

        let ielem = 0
        let radius = 8 / devicePixelRatio

        for (let iel = 0; iel < nelem_koppelfedern; iel++) {

            ielem = iel + nelem_Balken

            if (stab[ielem].isActive) {
                x1 = Math.round(tr.xPix(stab[ielem].x1));
                z1 = Math.round(tr.zPix(stab[ielem].z1));
                x2 = Math.round(tr.xPix(stab[ielem].x2));
                z2 = Math.round(tr.zPix(stab[ielem].z2));

                let kreis = two.makeCircle(x1, z1, radius, 10)
                kreis.fill = '#00aaff';
                kreis.linewidth = 2 / devicePixelRatio;
                kreis = two.makeCircle(x2, z2, radius, 10)
                kreis.fill = '#00aaff';
                kreis.linewidth = 2 / devicePixelRatio;
            }
        }
    }


    if (show_momentenlinien || show_querkraftlinien || show_normalkraftlinien) {
        if (flag_eingabe !== 0 && matprop_flag > 0) {  // plastifizierte nichtlineare Feder darstellen

            let ielem = nelem_Balken - 1
            let radius = 8 / devicePixelRatio
            for (let i = 0; i < nelem_koppelfedern; i++) {
                ielem++;
                if (!stab[ielem].isActive) continue
                if (element[ielem].kx_is_plastic || element[ielem].kz_is_plastic || element[ielem].kphi_is_plastic) {
                    //console.log('Koppelfeder ' + (+i + 1) + ' ist plastiziert')
                    let x1 = tr.xPix(stab[ielem].x1)
                    let z1 = tr.zPix(stab[ielem].z1)
                    let kreis = two.makeCircle(x1, z1, radius, 10)
                    kreis.fill = '#ff0000';
                    kreis.linewidth = 2 / devicePixelRatio;
                }
            }
        }
    }

    //console.log("++++ show_lasten_temp", show_lasten_temp)

    if (stadyn === 0) {
        if (show_lasten_temp && show_selection) {
            draw_elementlasten(two);
            draw_knotenkraefte(two);
            if (nNodeDisps > 0) draw_knotenverformungen(two);
        }
        if (show_selection) {
            if (!(show_labels && onlyLabels)) {
                if (show_lagerkraefte && flag_eingabe === 1) draw_lagerkraefte(two);
            }
        }
    }

    if (draw_wert.found) {      // Beschriftung Verformungen, Zustandslinien über MouseMove

        let rect = two.makeRectangle(draw_wert.x + 60 + 4, draw_wert.y - 7, 120, 20)
        rect.fill = 'white'
        rect.stroke = 'white'
        rect.linewidth = 1
        //rect.opacity = 0.1
        let txt = two.makeText(draw_wert.wert, draw_wert.x + 5, draw_wert.y - 5, style_txt_werte)
        txt.alignment = 'left'
        txt.baseline = 'middle'
        let box = txt.getBoundingClientRect()
        // console.log('getBoundingClientRect', box.width, box.height)
        rect.width = box.width
        // rect.x = 500
        rect.position.x = draw_wert.x + 4 + box.width / 2
        let radius = 4 / devicePixelRatio
        let kreis = two.makeCircle(draw_wert.x, draw_wert.y, radius, 10)
        kreis.fill = '#ff0000';
        draw_wert.found = false
    }

    //console.log("vor update")

    // Don’t forget to tell two to draw everything to the screen

    if (show_dyn_animate_eigenformen) {

        if (start_animation) {
            start_animation = false;
            two.bind('update', draw_dyn_eigenformen);

            two.play();
        }
    } else {
        two.update();
    }
    // if (svg_id === 'artboard') {
    //     if (needMouseMoveForInfo) {
    //         domElement.addEventListener('mousemove', mousemove, false);
    //         mouseMoveIsActive = true
    //     }
    // }

    //el = document.querySelector('.footer'); //.getElementById("container")
    //console.log("nach update container footer boundingRect", el?.getBoundingClientRect())

    // domElement = two.renderer.domElement;
    // //svgElement = two.render
    // //console.log("domElement", domElement)
    // //domElement.addEventListener('mousedown', mousedown, false);

    // domElement.addEventListener('wheel', wheel, { passive: false });
    // //window.addEventListener('wheel', wheel, { passive: false });
    // domElement.addEventListener('mousedown', mousedown, false);
    // domElement.addEventListener('mouseup', mouseup, false);

    // // domElement.addEventListener('pointerdown', touchdownHandler, false);
    // // domElement.addEventListener('pointerup', touchupHandler, false);
    // // domElement.addEventListener('pointercancel', touchupHandler, false);
    // // domElement.addEventListener('pointerout', touchupHandler, false);
    // // domElement.addEventListener('pointerleave', touchupHandler, false);
    // // domElement.addEventListener('pointermove', touchmoveHandler, false);


    // domElement.addEventListener('touchstart', touchstart, { passive: false });
    // domElement.addEventListener('touchmove', touchmove, { passive: false });
    // domElement.addEventListener('touchend', touchend, { passive: false });


}

//-----------------------------------------   E  N  D  E   ---------------------------------
//-----------------------------------------   E  N  D  E   ---------------------------------
//-----------------------------------------   E  N  D  E   ---------------------------------
//-----------------------------------------   E  N  D  E   ---------------------------------
//-----------------------------------------   E  N  D  E   ---------------------------------


//--------------------------------------------------------------------------------------------------------
function draw_dyn_eigenformen(_frameCount: any, _timeDelta: any) {
    //----------------------------------------------------------------------------------------------------

    //console.log("frameCount", frameCount, timeDelta)
    if (show_dyn_eigenformen && (maxValue_dyn_eigenform[draw_dyn_eigenform - 1] > 0.0)) {

        two.clear();

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, eta: number, sl: number, nenner: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

        let u: number, w: number, uG: number, wG: number
        let edispL: number[] = new Array(6)
        let ikomb = draw_lastfall
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0


        let scalefactor = 0.1 * slmax / maxValue_dyn_eigenform[draw_dyn_eigenform - 1]    //maxValue_komb[iLastfall - 1].disp

        scalefactor *= scaleFactor_panel

        if (show_dyn_animate_eigenformen) {

            animate_scale += animate_scale_dx

            if (animate_scale > 1.0) {

                animate_scale = 1.0
                animate_scale_dx = -animate_scale_dx

            } else if (animate_scale < -1.0) {
                animate_scale = -1.0
                animate_scale_dx = -animate_scale_dx
            }

            scalefactor *= animate_scale
        }

        //console.log("scalefaktor", scalefactor, slmax)
        //console.log("draw_dyn_eigenform", draw_dyn_eigenform)

        if (show_systemlinien) {
            for (let ielem = 0; ielem < nelem; ielem++) {

                if (!stab[ielem].isActive) continue

                let x1 = Math.round(tr.xPix(stab[ielem].x1));
                let z1 = Math.round(tr.zPix(stab[ielem].z1));
                let x2 = Math.round(tr.xPix(stab[ielem].x2));
                let z2 = Math.round(tr.zPix(stab[ielem].z2));

                //console.log("STAB x,z", x1, x2, z1, z2)
                let line = two.makeLine(x1, z1, x2, z2);
                line.linewidth = 2 / devicePixelRatio;
                line.stroke = '#aaaaaa';
            }
        }

        draw_lager(two);

        for (let ielem = 0; ielem < nelem; ielem++) {

            if (!stab[ielem].isActive) continue

            maxU = 0.0

            // let x1 = Math.round(tr.xPix(element[ielem].x1));
            // let z1 = Math.round(tr.zPix(element[ielem].z1));
            // let x2 = Math.round(tr.xPix(element[ielem].x2));
            // let z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL_dyn_eigenform(edispL, draw_dyn_eigenform - 1)

            dx = element[ielem].sl / nelTeilungen
            eta = element[ielem].eta
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * eta * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                if (System === 0) {
                    Nu[0] = (1.0 - x / sl);
                    Nu[1] = x / sl
                    Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x + sl ** 3 + 12 * eta * sl) / nenner;
                    Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * eta) * x ** 2 + (sl ** 3 + 6 * eta * sl) * x) / nenner);
                    Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * eta * x) / nenner);
                    Nw[3] = -((sl * x ** 3 + (6 * eta - sl ** 2) * x ** 2 - 6 * eta * sl * x) / nenner);
                    u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                    w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];
                } else {
                    Nu[0] = (1.0 - x / sl);
                    Nu[1] = x / sl
                    u = Nu[0] * edispL[0] + Nu[1] * edispL[2]
                    w = Nu[0] * edispL[1] + Nu[1] * edispL[3]
                }
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
                    line.linewidth = 5;
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

}


//--------------------------------------------------------------------------------------------------------
function draw_knotenmassen(two: Two) {
    //----------------------------------------------------------------------------------------------------
    for (let i = 0; i < nnodalMass; i++) {
        let inode = nodalmass[i].node
        let x = Math.round(tr.xPix(node[inode].x));
        let z = Math.round(tr.zPix(node[inode].z));
        let circle = two.makeCircle(x, z, 14, 20)
        circle.fill = '#ff3333'

    }
}

//--------------------------------------------------------------------------------------------------------
function draw_elementlasten(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let x1: number, x2: number, z1: number, z2: number, si: number, co: number, xi: number, zi: number
    let dp: number, pMax: number, pMin: number
    let a: number, ax_projektion: number, az_projektion: number
    let aL: number, aR: number
    let a_spalt: number
    let pL: number, pR: number
    let x = Array(4), z = Array(4), xtr = Array(4), ztr = Array(4)

    let xpix: number, zpix: number, scalefactor = 1.0, nLoop = 0   //  lf_index = 0
    let iLastfall = draw_lastfall
    let fact = Array(nlastfaelle)
    let lf_show = Array(nlastfaelle)

    const color_load = '#9ba4d0';

    if (THIIO_flag === 0) {
        if (iLastfall <= nlastfaelle) {
            //lf_index = iLastfall - 1
            nLoop = 1
            fact[0] = 1.0
            lf_show[0] = draw_lastfall - 1
            scalefactor = slmax / 20 / maxValue_eload[draw_lastfall - 1]

        } else if (iLastfall <= nlastfaelle + nkombinationen) {
            //lf_index = iLastfall - 1
            let ikomb = iLastfall - 1 - nlastfaelle
            console.log("Kombination THIO, ikomb: ", ikomb, maxValue_eload_komb[ikomb])
            scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
            nLoop = 0

            for (let i = 0; i < nlastfaelle; i++) {
                if (kombiTabelle[ikomb][i] !== 0.0) {
                    console.log("kombitabelle", i, ikomb, kombiTabelle[ikomb][i])
                    fact[nLoop] = kombiTabelle[ikomb][i];
                    lf_show[nLoop] = i
                    nLoop++;
                }
            }
        } else {
            nLoop = 0
        }
    }
    else if (THIIO_flag === 1) {

        if (iLastfall <= nkombinationen) {
            //lf_index = iLastfall - 1
            let ikomb = iLastfall - 1
            scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
            nLoop = 0

            for (let i = 0; i < nlastfaelle; i++) {
                if (kombiTabelle[ikomb][i] !== 0.0) {
                    fact[nLoop] = kombiTabelle[ikomb][i];
                    lf_show[nLoop] = i
                    nLoop++;
                }
            }

        } else {
            nLoop = 0
        }
    }

    // for (let i = 0; i < nLoop; i++) {
    //     console.log("°°°°°°° lf_show,fact", i, lf_show[i], fact[i])
    // }



    //console.log("++++ in draw_elementlasten", slmax, draw_lastfall)


    for (let ielem = 0; ielem < nelem; ielem++) {

        if (!stab[ielem].isActive) continue

        a = slmax / 100.
        a_spalt = a
        ax_projektion = 0.0
        az_projektion = 0.0

        aL = stab[ielem].aL
        aR = stab[ielem].aR

        //console.log("aL,aR", aL, aR)

        si = stab[ielem].sinus
        co = stab[ielem].cosinus

        x1 = stab[ielem].x1 + co * aL;
        z1 = stab[ielem].z1 + si * aL;
        x2 = stab[ielem].x2 - co * aR;
        z2 = stab[ielem].z2 - si * aR;

        for (let iLoop = 0; iLoop < nLoop; iLoop++) {
            //console.log("iLoop: ", iLoop)

            for (let ieload = 0; ieload < neloads; ieload++) {
                //console.log("ieload:", ieload)
                //console.log("ielem,draw_lastfall", ielem, eload[ieload].element, draw_lastfall, eload[ieload].lf - 1, lf_show[iLoop])

                if ((eload[ieload].element === ielem) && (eload[ieload].lf - 1 === lf_show[iLoop])) {

                    if (eload[ieload].art === 0) {

                        pL = eload[ieload].pL * scalefactor * fact[iLoop]
                        pR = eload[ieload].pR * scalefactor * fact[iLoop]

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        a += Math.abs(pMin)

                        x[0] = x1 + si * a; z[0] = z1 - co * a;
                        x[1] = x2 + si * a; z[1] = z2 - co * a;
                        x[2] = x[1] + si * pR; z[2] = z[1] - co * pR;
                        x[3] = x[0] + si * pL; z[3] = z[0] - co * pL;


                        //console.log("pL...", pL, pR, x, z)

                        var vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = two.makePath(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity

                        if (Math.abs(pL) > 0.0) draw_arrow(two, x[3], z[3], x[0], z[0], style_pfeil)
                        if (Math.abs(pR) > 0.0) draw_arrow(two, x[2], z[2], x[1], z[1], style_pfeil)

                        if (eload[ieload].pL === eload[ieload].pR) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = stab[ielem].alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(eload[ieload].pR * fact[iLoop]), 1, 2)
                            txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                        }

                        dp = pMax // - pMin
                        a = a + dp + a_spalt
                    }

                    else if (eload[ieload].art === 1) {      // Streckenlast z-Richtung
                        //console.log('Streckenlast in z-Richtung', eload[ieload].pL, eload[ieload].pL, scalefactor, fact[iLoop])

                        pL = eload[ieload].pL * scalefactor * fact[iLoop]
                        pR = eload[ieload].pR * scalefactor * fact[iLoop]

                        if (!(eload[ieload].lf === 1 && eload[ieload].pL === 0.0 && eload[ieload].pR === 0.0)) {

                            pMax = Math.max(0.0, pL, pR)
                            pMin = Math.min(0.0, pL, pR)

                            a += Math.abs(pMin)   //* co

                            x[0] = x1 + si * a; z[0] = z1 - a * co;    // /
                            x[1] = x2 + si * a; z[1] = z2 - a * co;
                            x[2] = x[1]; z[2] = z[1] - pR;
                            x[3] = x[0]; z[3] = z[0] - pL;


                            //console.log("pL...", pL, pR, pMax, pMin, x, z)

                            var vertices = [];
                            for (let i = 0; i < 4; i++) {
                                xtr[i] = tr.xPix(x[i])
                                ztr[i] = tr.zPix(z[i])
                                vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                            }

                            let flaeche = two.makePath(vertices);
                            flaeche.fill = color_load;
                            flaeche.opacity = opacity

                            if (Math.abs(pL) > 0.0) draw_arrow(two, x[3], z[3], x[0], z[0], style_pfeil)
                            if (Math.abs(pR) > 0.0) draw_arrow(two, x[2], z[2], x[1], z[1], style_pfeil)

                            if (eload[ieload].pL === eload[ieload].pR) {
                                xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                                zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                                let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                                let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                                txt.alignment = 'center'
                                txt.baseline = 'middle'
                                txt.rotation = stab[ielem].alpha

                            } else {
                                xpix = xtr[3] + 5
                                zpix = ztr[3] - 5
                                let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                                let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                                txt.alignment = 'left'
                                txt.baseline = 'top'

                                xpix = xtr[2] + 5
                                zpix = ztr[2] - 5
                                str = myFormat(Math.abs(eload[ieload].pR * fact[iLoop]), 1, 2)
                                txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                                txt.alignment = 'left'
                                txt.baseline = 'top'
                            }

                            dp = pMax * co // - pMin
                            a = a + dp + a_spalt
                        }
                    }

                    else if (eload[ieload].art === 2) {      // Streckenlast z-Richtung, Projektion

                        pL = eload[ieload].pL * scalefactor * fact[iLoop]
                        pR = eload[ieload].pR * scalefactor * fact[iLoop]

                        let zm = (z1 + z2) / 2

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        az_projektion += Math.abs(pMin)

                        x[0] = x1; z[0] = zm - az_projektion;
                        x[1] = x2; z[1] = zm - az_projektion;
                        x[2] = x[1]; z[2] = z[1] - pR;
                        x[3] = x[0]; z[3] = z[0] - pL;


                        //console.log("pL...", pL, pR, x, z)

                        var vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = two.makePath(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity

                        if (Math.abs(pL) > 0.0) draw_arrow(two, x[3], z[3], x[0], z[0], style_pfeil)
                        if (Math.abs(pR) > 0.0) draw_arrow(two, x[2], z[2], x[1], z[1], style_pfeil)

                        if (eload[ieload].pL === eload[ieload].pR) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            //txt.rotation = stab[ielem].alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(eload[ieload].pR * fact[iLoop]), 1, 2)
                            txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                        }

                        dp = pMax
                        az_projektion += dp + a_spalt
                    }

                    else if (eload[ieload].art === 3) {      // Streckenlast x-Richtung

                        pL = eload[ieload].pL * scalefactor * fact[iLoop]
                        pR = eload[ieload].pR * scalefactor * fact[iLoop]

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        console.log("S I N U S ", si)
                        if (si < 0.0) a += Math.abs(pMax * si);
                        else a += Math.abs(pMin * si);   //  * si

                        x[0] = x1 + a * si; z[0] = z1 - co * a;  // / si
                        x[1] = x2 + a * si; z[1] = z2 - co * a;
                        x[2] = x[1] + pR; z[2] = z[1];
                        x[3] = x[0] + pL; z[3] = z[0];


                        //console.log("pL...", pL, pR, x, z)

                        const vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = two.makePath(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity

                        let line = two.makeLine(xtr[0], ztr[0], xtr[1], ztr[1]);
                        line.linewidth = 2;

                        if (Math.abs(pL) > 0.0) draw_arrow(two, x[0], z[0], x[3], z[3], style_pfeil)
                        if (Math.abs(pR) > 0.0) draw_arrow(two, x[1], z[1], x[2], z[2], style_pfeil)

                        if (eload[ieload].pL === eload[ieload].pR) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = stab[ielem].alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(eload[ieload].pR * fact[iLoop]), 1, 2)
                            txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                        }

                        if (si < 0.0) dp = pMin * si;
                        else dp = pMax * si;
                        a = a + dp + a_spalt
                    }

                    else if (eload[ieload].art === 4) {      // Streckenlast x-Richtung, Projektion

                        pL = eload[ieload].pL * scalefactor * fact[iLoop]
                        pR = eload[ieload].pR * scalefactor * fact[iLoop]

                        let xm = (x1 + x2) / 2

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        ax_projektion += Math.abs(pMin)

                        x[0] = xm + ax_projektion; z[0] = z1;
                        x[1] = xm + ax_projektion; z[1] = z2;
                        x[2] = x[1] + pR; z[2] = z[1];
                        x[3] = x[0] + pL; z[3] = z[0];


                        //console.log("pL4...", ieload, pL, pR, scalefactor, x, z)

                        const vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = two.makePath(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity

                        if (Math.abs(pL) > 0.0) draw_arrow(two, x[0], z[0], x[3], z[3], style_pfeil)
                        if (Math.abs(pR) > 0.0) draw_arrow(two, x[1], z[1], x[2], z[2], style_pfeil)

                        if (eload[ieload].pL === eload[ieload].pR) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            //txt.rotation = stab[ielem].alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(eload[ieload].pL * fact[iLoop]), 1, 2)
                            let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(eload[ieload].pR * fact[iLoop]), 1, 2)
                            txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                        }

                        dp = pMax
                        ax_projektion += dp + a_spalt
                    }

                    else if (eload[ieload].art === 5 || eload[ieload].art === 9 || eload[ieload].art === 10) {      // Temperatur, Vorspannung, Spannschloss

                        pL = slmax / 20.
                        pR = slmax / 20.

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        a += Math.abs(pMin)

                        x[0] = x1 + si * a; z[0] = z1 - co * a;
                        x[1] = x2 + si * a; z[1] = z2 - co * a;
                        x[2] = x[1] + si * pR; z[2] = z[1] - co * pR;
                        x[3] = x[0] + si * pL; z[3] = z[0] - co * pL;

                        //console.log("pL TEMP ...", pL, pR, x, z)

                        const vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = two.makePath(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity;


                        xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4.
                        zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4.
                        let str: string;
                        if (eload[ieload].art === 5) str = "Tu= " + eload[ieload].Tu * fact[iLoop] + "°/To= " + eload[ieload].To * fact[iLoop] + "°";
                        else if (eload[ieload].art === 9) str = "σv= " + eload[ieload].sigmaV * fact[iLoop] / 1000 + " N/mm²";
                        else str = "Δs= " + eload[ieload].delta_s * fact[iLoop] * 1000 + " mm";
                        //str = myFormat(Math.abs(eload[ieload].pR), 1, 2)
                        let txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                        txt.alignment = 'center'
                        txt.baseline = 'middle'
                        txt.rotation = stab[ielem].alpha

                        dp = pMax // - pMin
                        a = a + dp + a_spalt
                    }
                    else if (eload[ieload].art === 6) {      // Einzellast oder/und Moment

                        let plength = 35, delta = 12

                        plength = tr.World0(2 * plength / devicePixelRatio)
                        delta = tr.World0(delta / devicePixelRatio)

                        if (eload[ieload].P != 0.0) {
                            let dpx = si * plength, dpz = co * plength
                            let ddx = si * delta, ddz = co * delta
                            let wert = eload[ieload].P * fact[iLoop]
                            let xl = x1 + co * eload[ieload].x, zl = z1 + si * eload[ieload].x
                            console.log("GRAFIK Einzellast", xl, zl, wert)
                            if (wert < 0.0) {
                                draw_arrow(two, xl + ddx, zl - ddz, xl + ddx + dpx, zl - ddz - dpz, style_pfeil_knotenlast_element)
                            } else {
                                draw_arrow(two, xl + ddx + dpx, zl - ddz - dpz, xl + ddx, zl - ddz, style_pfeil_knotenlast_element)
                            }
                            xpix = tr.xPix(xl + ddx + dpx) + 4
                            zpix = tr.zPix(zl - ddz - dpz) - 4
                            const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
                            const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast_element)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                        }
                        if (eload[ieload].M != 0.0) {
                            let wert = eload[ieload].M * fact[iLoop]
                            let vorzeichen = Math.sign(wert)
                            let xl = x1 + co * eload[ieload].x, zl = z1 + si * eload[ieload].x
                            let radius = style_pfeil_moment_element.radius;
                            console.log("GRAFIK, Moment, radius ", wert, tr.World0(radius))
                            if (wert > 0.0) {
                                draw_moment_arrow(two, xl, zl, 1.0, radius, style_pfeil_moment_element)
                            } else {
                                draw_moment_arrow(two, xl, zl, -1.0, radius, style_pfeil_moment_element)
                            }

                            xpix = tr.xPix(xl) - 10 / devicePixelRatio
                            zpix = tr.zPix(zl) + vorzeichen * radius + 12 * vorzeichen / devicePixelRatio
                            const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
                            const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast_element)
                            txt.alignment = 'right'
                        }
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
    let nLoop = 0

    let fact = Array(nlastfaelle)
    let lf_show = Array(nlastfaelle)

    //console.log("in draw_knotenkraefte, draw_lastfall", draw_lastfall, nloads)
    // const out = document.getElementById('output') as HTMLTextAreaElement;
    // if (out) {
    //     out.value += "plength= " + plength + "\n";
    //     out.scrollTop = element.scrollHeight; // focus on bottom
    // }

    plength = tr.World0(2 * plength / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    let iLastfall = draw_lastfall

    if (THIIO_flag === 0 && matprop_flag === 0) {
        if (iLastfall <= nlastfaelle) {
            //lf_index = iLastfall - 1
            nLoop = 1
            fact[0] = 1.0
            lf_show[0] = draw_lastfall - 1
            //scalefactor = slmax / 20 / maxValue_eload[draw_lastfall - 1]

        } else if (iLastfall <= nlastfaelle + nkombinationen) {
            //lf_index = iLastfall - 1
            let ikomb = iLastfall - 1 - nlastfaelle
            console.log("Kombination THIO, ikomb: ", ikomb, maxValue_eload_komb[ikomb])
            //scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
            nLoop = 0

            for (let i = 0; i < nlastfaelle; i++) {
                if (kombiTabelle[ikomb][i] !== 0.0) {
                    //console.log("kombitabelle", i, ikomb, kombiTabelle[ikomb][i])
                    fact[nLoop] = kombiTabelle[ikomb][i];
                    lf_show[nLoop] = i
                    nLoop++;
                }
            }
        } else {
            nLoop = 0
        }
    }
    else if (THIIO_flag === 1 || matprop_flag > 0) {

        if (iLastfall <= nkombinationen) {
            //lf_index = iLastfall - 1
            let ikomb = iLastfall - 1
            //scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
            nLoop = 0

            for (let i = 0; i < nlastfaelle; i++) {
                if (kombiTabelle[ikomb][i] !== 0.0) {
                    fact[nLoop] = kombiTabelle[ikomb][i];
                    lf_show[nLoop] = i
                    nLoop++;
                }
            }

        } else {
            nLoop = 0
        }
    }

    // for (let i = 0; i < nLoop; i++) {
    //     console.log("°°°°°°° lf_show,fact", i, lf_show[i], fact[i])
    // }

    for (let iLoop = 0; iLoop < nLoop; iLoop++) {
        //console.log("iLoop: ", iLoop)

        for (let i = 0; i < nloads; i++) {
            let inode = load[i].node
            let x = node[inode].x;
            let z = node[inode].z;
            //console.log("load[i]", i, load)
            if (load[i].Px != 0.0 && load[i].lf - 1 === lf_show[iLoop]) {
                //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

                wert = load[i].Px * fact[iLoop]
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
            if (load[i].Pz != 0.0 && load[i].lf - 1 === lf_show[iLoop]) {
                //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

                wert = load[i].Pz * fact[iLoop]
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
            if (load[i].p[2] != 0.0 && load[i].lf - 1 === lf_show[iLoop]) {

                wert = load[i].p[2] * fact[iLoop]
                let vorzeichen = Math.sign(wert)
                let radius = style_pfeil_moment.radius;
                //console.log("Moment ", +inode + 1, wert)
                if (wert > 0.0) {
                    draw_moment_arrow(two, x, z, 1.0, slmax / 50, style_pfeil_moment)
                } else {
                    draw_moment_arrow(two, x, z, -1.0, slmax / 50, style_pfeil_moment)
                }

                xpix = tr.xPix(x) - 10 / devicePixelRatio
                zpix = tr.zPix(z) + vorzeichen * radius + 15 * vorzeichen / devicePixelRatio
                //zpix = tr.zPix(z + vorzeichen * slmax / 50) + 15 * vorzeichen / devicePixelRatio
                const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
                const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                txt.alignment = 'right'
                //txt.baseline = 'bottom'
            }

        }
    }
}


//--------------------------------------------------------------------------------------------------------
function draw_knotenverformungen(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let plength = 35 /*slmax / 20.*/, delta = 12 //slmax / 200.0
    let xpix: number, zpix: number
    let wert: number
    let nLoop = 0

    let fact = Array(nlastfaelle)
    let lf_show = Array(nlastfaelle)

    //console.log("in draw_knotenverformungen, draw_lastfall, nNodeDisps", draw_lastfall, nNodeDisps)


    plength = tr.World0(2 * plength / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    let iLastfall = draw_lastfall

    if (THIIO_flag === 0) {
        if (iLastfall <= nlastfaelle) {
            //lf_index = iLastfall - 1
            nLoop = 1
            fact[0] = 1.0
            lf_show[0] = draw_lastfall - 1
            //scalefactor = slmax / 20 / maxValue_eload[draw_lastfall - 1]

        } else if (iLastfall <= nlastfaelle + nkombinationen) {
            //lf_index = iLastfall - 1
            let ikomb = iLastfall - 1 - nlastfaelle
            console.log("Kombination THIO, ikomb: ", ikomb, maxValue_eload_komb[ikomb])
            //scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
            nLoop = 0

            for (let i = 0; i < nlastfaelle; i++) {
                if (kombiTabelle[ikomb][i] !== 0.0) {
                    //console.log("kombitabelle", i, ikomb, kombiTabelle[ikomb][i])
                    fact[nLoop] = kombiTabelle[ikomb][i];
                    lf_show[nLoop] = i
                    nLoop++;
                }
            }
        } else {
            nLoop = 0
        }
    }
    else if (THIIO_flag === 1) {

        if (iLastfall <= nkombinationen) {
            //lf_index = iLastfall - 1
            let ikomb = iLastfall - 1
            //scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
            nLoop = 0

            for (let i = 0; i < nlastfaelle; i++) {
                if (kombiTabelle[ikomb][i] !== 0.0) {
                    fact[nLoop] = kombiTabelle[ikomb][i];
                    lf_show[nLoop] = i
                    nLoop++;
                }
            }

        } else {
            nLoop = 0
        }
    }

    // for (let i = 0; i < nLoop; i++) {
    //     console.log("°°°°°°° lf_show,fact", i, lf_show[i], fact[i])
    // }

    for (let iLoop = 0; iLoop < nLoop; iLoop++) {
        //console.log("iLoop: ", iLoop)

        for (let i = 0; i < nNodeDisps; i++) {
            let inode = nodeDisp0[i].node
            let x = node[inode].x;
            let z = node[inode].z;
            //console.log("nodeDisp0[i]", i, nodeDisp0)
            if (nodeDisp0[i].dispL[0] && nodeDisp0[i].lf - 1 === lf_show[iLoop]) {
                //console.log("Knotenverformung zu zeichnen am Knoten ", +inode + 1)

                wert = nodeDisp0[i].dispx0 * fact[iLoop]
                if (wert > 0.0) {
                    draw_arrow(two, x + delta, z, x + delta + plength, z, style_pfeil_knotenlast)
                } else {
                    draw_arrow(two, x + delta + plength, z, x + delta, z, style_pfeil_knotenlast)
                }
                xpix = tr.xPix(x + delta + plength) + 5
                zpix = tr.zPix(z) - 5
                const str = myFormat(Math.abs(wert), 1, 2) + 'mm'
                const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                txt.alignment = 'left'
                txt.baseline = 'top'
            }
            if (nodeDisp0[i].dispL[1] && nodeDisp0[i].lf - 1 === lf_show[iLoop]) {
                //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

                wert = nodeDisp0[i].dispz0 * fact[iLoop]
                if (wert > 0.0) {
                    draw_arrow(two, x, z - delta - plength, x, z - delta, style_pfeil_knotenlast)
                } else {
                    draw_arrow(two, x, z - delta, x, z - delta - plength, style_pfeil_knotenlast)
                }

                xpix = tr.xPix(x) + 5
                zpix = tr.zPix(z - delta - plength) + 5
                const str = myFormat(Math.abs(wert), 1, 2) + 'mm'
                const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                txt.alignment = 'left'
                txt.baseline = 'top'
            }
            if (nodeDisp0[i].dispL[2] && nodeDisp0[i].lf - 1 === lf_show[iLoop]) {

                wert = nodeDisp0[i].phi0 * fact[iLoop]
                let vorzeichen = Math.sign(wert)
                //console.log("phi0 ", +inode + 1, wert)
                if (wert > 0.0) {
                    draw_moment_arrow(two, x, z, 1.0, slmax / 50, style_pfeil_moment)
                } else {
                    draw_moment_arrow(two, x, z, -1.0, slmax / 50, style_pfeil_moment)
                }

                xpix = tr.xPix(x) - 10 / devicePixelRatio
                zpix = tr.zPix(z + vorzeichen * slmax / 50) + 15 * vorzeichen / devicePixelRatio
                const str = myFormat(Math.abs(wert), 1, 2) + 'mrad'
                const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast)
                txt.alignment = 'right'
                //txt.baseline = 'bottom'
            }

        }
    }
}
//--------------------------------------------------------------------------------------------------------
function draw_lagerkraefte(two: Two) {
    //----------------------------------------------------------------------------------------------------

    //console.log("draw_lastfall,nlastfaelle,nkombinationen", draw_lastfall, nlastfaelle, nkombinationen)
    if (THIIO_flag === 0 && matprop_flag === 0) if (draw_lastfall > nlastfaelle + nkombinationen) return;
    if (THIIO_flag === 1 || matprop_flag > 0) if (draw_lastfall > nkombinationen) return;

    let plength = 35, delta = 30
    let xpix: number, zpix: number

    plength = tr.World0((style_pfeil_lager.a + style_pfeil_lager.b) / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    for (let i = 0; i < nnodes; i++) {
        let x = node[i].x;
        let z = node[i].z;
        let alpha = node[i].phi * Math.PI / 180.0

        let wert = 0.0
        if (node[i].L_org[0] === 1 || node[i].kx > 0.0) {      // horizontales Lager

            if (THIIO_flag === 0 && matprop_flag === 0) {
                if (draw_lastfall <= nlastfaelle) {
                    wert = lagerkraefte._(i, 0, draw_lastfall - 1)
                } else if (draw_lastfall <= nlastfaelle + nkombinationen) {
                    wert = lagerkraefte_kombi._(i, 0, draw_lastfall - 1 - nlastfaelle)
                } else return;  // keine Lagerkraefte bei überlagerung

            } else {
                wert = lagerkraefte._(i, 0, draw_lastfall - 1)
            }
            //console.log("draw_lagerkraefte wert", wert, draw_lastfall)

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

        if (node[i].L_org[1] === 1 || node[i].kz > 0.0) {      // vertikales Lager
            if (THIIO_flag === 0 && matprop_flag === 0) {
                if (draw_lastfall <= nlastfaelle) {
                    wert = lagerkraefte._(i, 1, draw_lastfall - 1)
                } else if (draw_lastfall <= nlastfaelle + nkombinationen) {
                    wert = lagerkraefte_kombi._(i, 1, draw_lastfall - 1 - nlastfaelle)
                    //console.log("draw_lagerkraefte wert kombi", wert, draw_lastfall - 1 - nlastfaelle)
                }
            } else {
                wert = lagerkraefte._(i, 1, draw_lastfall - 1)
            }
            //wert = lagerkraefte._(i, 1, draw_lastfall - 1)
            //console.log("draw_lagerkraefte wert", wert)

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

        if (System === STABWERK) {
            if (node[i].L_org[2] === 1 || node[i].kphi > 0.0) {      // Einspannung

                if (THIIO_flag === 0 && matprop_flag === 0) {
                    if (draw_lastfall <= nlastfaelle) {
                        wert = lagerkraefte._(i, 2, draw_lastfall - 1)
                    } else if (draw_lastfall <= nlastfaelle + nkombinationen) {
                        wert = lagerkraefte_kombi._(i, 2, draw_lastfall - 1 - nlastfaelle)
                    }
                } else {
                    wert = lagerkraefte._(i, 2, draw_lastfall - 1)
                }
                // wert = lagerkraefte._(i, 2, draw_lastfall - 1)
                //console.log("draw_lagerkraefte wert", wert)

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
}

//--------------------------------------------------------------------------------------------------------
function draw_lager(two: Two) {
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < nnodes; i++) {

        let x1 = Math.round(tr.xPix(node[i].x));
        let z1 = Math.round(tr.zPix(node[i].z));
        let phi = -node[i].phi * Math.PI / 180

        if (System === STABWERK) {
            if (((node[i].L_org[0] === 1) && (node[i].L_org[1] === 1) && (node[i].L_org[2] === 1)) ||
                ((node[i].kx > 0.0) && (node[i].kz > 0.0) && (node[i].L[2] === -1))) {  // Volleinspannung oder mit zwei Translkationsfedern
                let rechteck = two.makeRectangle(x1, z1, 20, 20)
                rechteck.fill = '#dddddd';
                rechteck.scale = 1.0 / devicePixelRatio
                rechteck.rotation = phi
            }
            else if ((node[i].L[0] >= 0 || node[i].L_org[0] === -1) && (node[i].L_org[1] === 1) && (node[i].L_org[2] === 1)) {  // Einspannung, verschieblich in x-Richtung

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
            else if ((node[i].L_org[0] === 1) && (node[i].L[1] >= 0 || node[i].L_org[1] === -1) && (node[i].L_org[2] === 1)) {  // Einspannung, verschieblich in z-Richtung

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
            else if ((node[i].L[0] >= 0 || node[i].L_org[0] === -1) && (node[i].L[1] >= 0 || node[i].L_org[1] === -1) && (node[i].L_org[2] === 1)) {  // Einspannung, verschieblich in x-, z-Richtung

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
            else if ((node[i].L_org[0] === 1) && (node[i].L_org[1] === 1) && (node[i].L_org[2] === -1 || node[i].L[2] >= 0)) { // zweiwertiges Lager
                let group = two.makeGroup();
                //console.log("in zweiwertiges Lager")
                var vertices = [];
                vertices.push(new Two.Anchor(0, 0));
                vertices.push(new Two.Anchor(-12, 20));
                vertices.push(new Two.Anchor(12, 20));

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
            else if ((node[i].L[0] >= 0 || node[i].L_org[0] === -1) && (node[i].L_org[1] === 1) && (node[i].L[2] >= 0 || node[i].L_org[2] === -1)) { // einwertiges horizontal verschieblisches Lager
                let group = two.makeGroup();
                //console.log("in einwertiges horizontal verschieblisches Lager")
                var vertices = [];
                vertices.push(new Two.Anchor(0, 0));
                vertices.push(new Two.Anchor(-12, 20));
                vertices.push(new Two.Anchor(12, 20));

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
            else if ((node[i].L_org[0] === 1) && (node[i].L[1] >= 0 || node[i].L_org[1] === -1) && (node[i].L[2] >= 0 || node[i].L_org[2] === -1)) { // einwertiges vertikal verschieblisches Lager
                let group = two.makeGroup();
                //console.log("in einwertiges vertikales verschieblisches Lager")
                var vertices = [];
                vertices.push(new Two.Anchor(0, 0));
                vertices.push(new Two.Anchor(-12, 20));
                vertices.push(new Two.Anchor(12, 20));

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
        } else {                     // Fachwerk
            if ((node[i].L[0] === -1) && (node[i].L[1] === -1)) { // zweiwertiges Lager
                let group = two.makeGroup();
                //console.log("in zweiwertiges Lager")
                var vertices = [];
                vertices.push(new Two.Anchor(0, 0));
                vertices.push(new Two.Anchor(-12, 20));
                vertices.push(new Two.Anchor(12, 20));

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
            else if ((node[i].L[0] >= 0) && (node[i].L[1] === -1)) { // einwertiges horizontal verschieblisches Lager
                let group = two.makeGroup();
                //console.log("in einwertiges horizontal verschieblisches Lager")
                var vertices = [];
                vertices.push(new Two.Anchor(0, 0));
                vertices.push(new Two.Anchor(-12, 20));
                vertices.push(new Two.Anchor(12, 20));

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
            else if ((node[i].L[0] === -1) && (node[i].L[1] >= 0)) { // einwertiges vertikal verschieblisches Lager
                let group = two.makeGroup();
                //console.log("in einwertiges vertikales Lager")
                var vertices = [];
                vertices.push(new Two.Anchor(0, 0));
                vertices.push(new Two.Anchor(-12, 20));
                vertices.push(new Two.Anchor(12, 20));

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

        }

        if (node[i].kx > 0.0) {
            draw_feder(two, node[i].x, node[i].z, -1.5707963 + phi)
        }

        if (node[i].kz > 0.0) {
            draw_feder(two, node[i].x, node[i].z, phi)
        }

        if (System === STABWERK) {
            if (node[i].kphi > 0.0) {
                draw_drehfeder(two, node[i].x, node[i].z)
            }
        }

    }
}


//--------------------------------------------------------------------------------------------------------
function draw_gelenke(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let x1: number, x2: number, z1: number, z2: number, dx: number, dz: number, si: number, co: number
    let xp1: number, zp1: number, xp2: number, zp2: number, dist: number, aa: number, distL: number, distR: number
    let radius = 8 / devicePixelRatio, a = 10 / devicePixelRatio, l_n = 20 / devicePixelRatio

    for (let ielem = 0; ielem < nelem; ielem++) {

        if (!stab[ielem].isActive) continue

        if (stab[ielem].nGelenke > 0) {

            let aL = stab[ielem].aL
            let aR = stab[ielem].aR

            if (aL > 0.0) distL = radius;
            else distL = a + radius;
            if (aR > 0.0) distR = radius;
            else distR = a + radius;


            si = stab[ielem].sinus
            co = stab[ielem].cosinus

            x1 = Math.round(tr.xPix(stab[ielem].x1 + co * aL));
            z1 = Math.round(tr.zPix(stab[ielem].z1 + si * aL));
            x2 = Math.round(tr.xPix(stab[ielem].x2 - co * aR));
            z2 = Math.round(tr.zPix(stab[ielem].z2 - si * aR));

            if (stab[ielem].gelenk[2] > 0) {                         // Momentengelenk links
                dx = co * distL; //(a + radius)
                dz = si * distL; //(a + radius)
                let kreis = two.makeCircle(x1 + dx, z1 + dz, radius, 10)
                kreis.fill = '#ffffff';
                kreis.linewidth = 2 / devicePixelRatio;
                distL += radius

            }
            if (stab[ielem].gelenk[5] > 0) {                         // Momentengelenk rechts
                dx = stab[ielem].cosinus * distR; //(a + radius)
                dz = stab[ielem].sinus * distR; //(a + radius)
                let kreis = two.makeCircle(x2 - dx, z2 - dz, radius, 10)
                kreis.fill = '#ffffff';
                kreis.linewidth = 2 / devicePixelRatio;
                distR += radius

            }
            if (stab[ielem].gelenk[1] > 0) {                  // Querkraftgelenk links
                dist = distL + 3 / devicePixelRatio
                dx = co * dist
                dz = si * dist

                aa = 16 / devicePixelRatio
                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 - aa * si + dx
                zp2 = z1 + aa * co + dz
                let line = two.makeLine(xp1, zp1, xp2, zp2);
                line.linewidth = 4 / devicePixelRatio;
                line.stroke = '#ffffff';               // weißer Strich Mitte

                dist = distL
                dx = co * dist
                dz = si * dist

                //aa = 16 / devicePixelRatio
                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 - aa * si + dx
                zp2 = z1 + aa * co + dz
                let line2 = two.makeLine(xp1, zp1, xp2, zp2);
                line2.linewidth = 2 / devicePixelRatio;
                line2.stroke = '#000000';         // schwarzer Strich links


                dist = distL + 4 / devicePixelRatio
                dx = co * dist
                dz = si * dist

                //aa = 16 / devicePixelRatio
                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 - aa * si + dx
                zp2 = z1 + aa * co + dz
                let line3 = two.makeLine(xp1, zp1, xp2, zp2);
                line3.linewidth = 2 / devicePixelRatio;
                line3.stroke = '#000000';        // schwarzer Strich rechts

                distL += 6 / devicePixelRatio
            }
            if (stab[ielem].gelenk[4] > 0) {                  // Querkraftgelenk rechts
                dist = distR + 3 / devicePixelRatio
                dx = co * dist
                dz = si * dist

                aa = 16 / devicePixelRatio
                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 - aa * si - dx
                zp2 = z2 + aa * co - dz
                let line = two.makeLine(xp1, zp1, xp2, zp2);
                line.linewidth = 4 / devicePixelRatio;
                line.stroke = '#ffffff';

                dist = distR
                dx = co * dist
                dz = si * dist

                aa = 16 / devicePixelRatio
                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 - aa * si - dx
                zp2 = z2 + aa * co - dz
                let line2 = two.makeLine(xp1, zp1, xp2, zp2);
                line2.linewidth = 2 / devicePixelRatio;
                line2.stroke = '#000000';


                dist = distR + 4 / devicePixelRatio
                dx = co * dist
                dz = si * dist

                aa = 16 / devicePixelRatio
                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 - aa * si - dx
                zp2 = z2 + aa * co - dz
                let line3 = two.makeLine(xp1, zp1, xp2, zp2);
                line3.linewidth = 2 / devicePixelRatio;
                line3.stroke = '#000000';

                distR += 6 / devicePixelRatio

            }
            if (stab[ielem].gelenk[0] > 0) {                  // Normalkraftgelenk links

                dist = distL
                dx = co * dist
                dz = si * dist

                aa = 0
                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 + aa * si + dx + l_n * co
                zp2 = z1 - aa * co + dz + l_n * si
                let line0 = two.makeLine(xp1, zp1, xp2, zp2);
                line0.linewidth = 10 / devicePixelRatio;
                line0.stroke = '#000000';    //schwarz

                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 + aa * si + dx + 0.8 * l_n * co
                zp2 = z1 - aa * co + dz + 0.8 * l_n * si
                let line = two.makeLine(xp1, zp1, xp2, zp2);
                line.linewidth = 10 / devicePixelRatio;
                line.stroke = '#ffffff';    //weiss

                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 + aa * si + dx + 0.5 * l_n * co
                zp2 = z1 - aa * co + dz + 0.5 * l_n * si
                let line4 = two.makeLine(xp1, zp1, xp2, zp2);
                line4.linewidth = 5 / devicePixelRatio;
                line4.stroke = '#000000';    //schwarz


                //dist = 2 * radius + a
                // dx = co * dist
                // dz = si * dist

                aa = 8 / devicePixelRatio
                xp1 = x1 + aa * si + dx
                zp1 = z1 - aa * co + dz
                xp2 = x1 + aa * si + dx + l_n * co
                zp2 = z1 - aa * co + dz + l_n * si
                let line2 = two.makeLine(xp1, zp1, xp2, zp2);
                line2.linewidth = 6 / devicePixelRatio;
                line2.stroke = '#000000';


                //dist = 2 * radius + a
                // dx = co * dist
                // dz = si * dist

                //aa = 16
                xp1 = x1 - aa * si + dx
                zp1 = z1 + aa * co + dz
                xp2 = x1 - aa * si + dx + l_n * co
                zp2 = z1 + aa * co + dz + l_n * si
                let line3 = two.makeLine(xp1, zp1, xp2, zp2);
                line3.linewidth = 6 / devicePixelRatio;
                line3.stroke = '#000000';
            }
            if (stab[ielem].gelenk[3] > 0) {                  // Normalkraftgelenk rechts

                dist = distR
                dx = co * dist
                dz = si * dist

                aa = 0
                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 + aa * si - dx - l_n * co
                zp2 = z2 - aa * co - dz - l_n * si
                let line0 = two.makeLine(xp1, zp1, xp2, zp2);
                line0.linewidth = 10 / devicePixelRatio;
                line0.stroke = '#000000';    //schwarz

                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 + aa * si - dx - 0.8 * l_n * co
                zp2 = z2 - aa * co - dz - 0.8 * l_n * si
                let line = two.makeLine(xp1, zp1, xp2, zp2);
                line.linewidth = 10 / devicePixelRatio;
                line.stroke = '#ffffff';    //weiss

                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 + aa * si - dx - 0.5 * l_n * co
                zp2 = z2 - aa * co - dz - 0.5 * l_n * si
                let line4 = two.makeLine(xp1, zp1, xp2, zp2);
                line4.linewidth = 5 / devicePixelRatio;
                line4.stroke = '#000000';    //schwarz


                //dist = 2 * radius + a
                // dx = co * dist
                // dz = si * dist

                aa = 8 / devicePixelRatio
                xp1 = x2 + aa * si - dx
                zp1 = z2 - aa * co - dz
                xp2 = x2 + aa * si - dx - l_n * co
                zp2 = z2 - aa * co - dz - l_n * si
                let line2 = two.makeLine(xp1, zp1, xp2, zp2);
                line2.linewidth = 6 / devicePixelRatio;
                line2.stroke = '#000000';


                //dist = 2 * radius + a
                // dx = co * dist
                // dz = si * dist

                //aa = 16
                xp1 = x2 - aa * si - dx
                zp1 = z2 + aa * co - dz
                xp2 = x2 - aa * si - dx - l_n * co
                zp2 = z2 + aa * co - dz - l_n * si
                let line3 = two.makeLine(xp1, zp1, xp2, zp2);
                line3.linewidth = 6 / devicePixelRatio;
                line3.stroke = '#000000';
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
        //console.log("styles", styles)
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
    //console.log("sl", Math.round(tr.xPix(sl)));
    //console.log("0.0", Math.round(tr.xPix(0.0)));

    if (calc_a) a = Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)) - b;
    // write('sl : ', sl)
    // write('tr.Pix0 : ', tr.Pix0(sl))
    // write('div', Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)))
    // write('a: ', a)
    // write('b: ', b)

    let x0 = Math.round(tr.xPix(x1));
    let z0 = Math.round(tr.zPix(z1));

    //console.log("sl,a", sl, a, b, x0, z0)

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
        //console.log("styles", styles)
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
        //console.log("styles", styles)
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
    //console.log('draw_moment_arrow, radius', radius, tr.Pix0(radius))

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
        curve.fill = "none"
        //curve.fill="rgba(0,0,0,0)"


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
function draw_arrowPix(two: Two, x1: number, z1: number, x2: number, z2: number, styles?: any) {
    //----------------------------------------------------------------------------------------------------

    let b = 20, h = 10, linewidth = 1, color = '#000000'
    let a = 0.0, calc_a = true

    if (styles) {
        //console.log("draw_arrowPix, styles", styles)
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

    linewidth = linewidth / devicePixelRatio

    let dx = x2 - x1, dz = z2 - z1
    let alpha = Math.atan2(dz, dx)

    let sl = Math.sqrt(dx * dx + dz * dz)
    //console.log("sl", sl, calc_a);
    //console.log("0.0", Math.round(tr.xPix(0.0)));

    if (calc_a) a = sl - b;
    // write('sl : ', sl)
    // write('tr.Pix0 : ', tr.Pix0(sl))
    // write('div', Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)))
    // write('a: ', a)
    // write('b: ', b)

    let x0 = x1;
    let z0 = z1;

    //console.log("sl,a", sl, a, b, x0, z0)

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
function draw_stabvorverformung(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let xx1, xx2, zz1, zz2
    let dx: number, x: number, sl: number, nenner: number


    let uG: number, wG: number
    let ikomb = draw_lastfall - 1
    let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
    let xmem = 0.0, zmem = 0.0

    if (maxValue_w0[ikomb] === 0.0) return;

    let scalefactor = 0.05 * slmax / maxValue_w0[ikomb]

    scalefactor *= scaleFactor_panel

    //console.log("scalefaktor", scalefactor, slmax, maxValue_w0[ikomb])
    //console.log("draw_stabvorverformung", ikomb + 1)

    maxU = 0.0

    for (let ielem = 0; ielem < nelem; ielem++) {

        if (!stab[ielem].isActive) continue

        if (stabvorverformung_komb[ielem][ikomb].defined) {

            sl = element[ielem].sl

            let w0a = stabvorverformung_komb[ielem][ikomb].w0a
            let w0e = stabvorverformung_komb[ielem][ikomb].w0e
            let v0m = stabvorverformung_komb[ielem][ikomb].w0m

            dx = sl / nelTeilungen
            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let iteil = 0; iteil <= nelTeilungen; iteil++) {


                let w0x = w0a + (w0e - w0a) * x / sl + 4.0 * v0m * x / sl * (1.0 - x / sl)

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
                    line.linewidth = 5;
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

            // for (let i = 0; i < nstabvorverfomungen; i++) {
            //     if (stabvorverformung[i].element === ielem) {
            //         //console.log("Element ", +i + 1, ' hat Stabvorverformungen')
            //         let w0a = stabvorverformung[i].p[0]
            //         let w0e = stabvorverformung[i].p[1]
            //         let v0m = stabvorverformung[i].p[2]

            //         dx = sl / nelTeilungen
            //         x = 0.0; xx2 = 0.0; zz2 = 0.0
            //         for (let iteil = 0; iteil <= nelTeilungen; iteil++) {


            //             let w0x = w0a + (w0e - w0a) * x / sl + 4.0 * v0m * x / sl * (1.0 - x / sl)

            //             uG = -element[ielem].sinus * w0x
            //             wG = element[ielem].cosinus * w0x

            //             xx1 = xx2; zz1 = zz2;
            //             xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
            //             zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
            //             xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
            //             //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)
            //             if (iteil > 0) {
            //                 //console.log("line", xx1, zz1, xx2, zz2)
            //                 let line = two.makeLine(xx1, zz1, xx2, zz2);
            //                 line.linewidth = 5;
            //             }

            //             dispG = Math.sqrt(uG * uG + wG * wG)

            //             if (dispG > maxU) {
            //                 maxU = dispG
            //                 x_max = xx2
            //                 z_max = zz2
            //                 xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
            //                 zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)

            //             }
            //             x = x + dx
            //         }
            //     }

            // }


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

    //console.log("in draw_drehfeder", radius, x0, z0)

    dalpha = Math.PI / (teilung)
    alpha = 0.0
    for (let i = 0; i <= teilung; i++) {
        x = tr.Pix0(-radiusW * Math.sin(alpha))
        z = tr.Pix0(radiusW * Math.cos(alpha))
        //console.log("DREHFEDER x,z ", x, z)
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

    //console.log("in draw_label_grafik");
    show_labels = !show_labels;

    if (!show_dyn_animate_eigenformen) drawsystem();
}
//--------------------------------------------------------------------------------------------------------
function draw_systemlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_systemlinien_grafik");
    show_systemlinien = !show_systemlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_verformungen_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_verformungen_grafik");
    show_verformungen = !show_verformungen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_momentenlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_momentenlinien_grafik", draw_sg.My, show_momentenlinien);
    show_momentenlinien = draw_sg.My  //!show_momentenlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (show_dyn_animate_eigenformen) return;
    else if (!draw_group) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_querkraftlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_querkraftlinien_grafik", draw_sg.Vz, show_querkraftlinien);
    show_querkraftlinien = draw_sg.Vz //!show_querkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (show_dyn_animate_eigenformen) return;
    else if (!draw_group) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_normalkraftlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_normalkraftlinien_grafik", draw_sg.N, show_normalkraftlinien);
    show_normalkraftlinien = draw_sg.N   //!show_normalkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (show_dyn_animate_eigenformen) return;
    else if (!draw_group) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_eigenformen_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_verformungen_grafik");
    show_eigenformen = !show_eigenformen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_schiefstellung_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_schiefstellung_grafik");
    show_schiefstellung = !show_schiefstellung;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}
//--------------------------------------------------------------------------------------------------------
function draw_stabvorverformung_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_stabvorverformung_grafik");
    show_stabvorverformung = !show_stabvorverformung;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_lasten_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_lasten_grafik");
    show_lasten = !show_lasten;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_lagerkraefte_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_lagerkraefte_grafik");
    show_lagerkraefte = !show_lagerkraefte;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_umriss_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_umriss_grafik");
    show_umriss = !show_umriss;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_gesamtverformung_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_gesamtverformung_grafik");
    show_gesamtverformung = !show_gesamtverformung;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_gleichgewicht_SG_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_gleichgewicht_SG_grafik");
    show_gleichgewichtSG = !show_gleichgewichtSG;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    if (!show_dyn_animate_eigenformen) drawsystem();
}


//--------------------------------------------------------------------------------------------------------
function draw_bettungsmodul(ielem: number, onlyLabels: boolean, show_selection: boolean) {
    //----------------------------------------------------------------------------------------------------

    if (onlyLabels) {

        let x = Array(4), z = Array(4), xtr = Array(4), ztr = Array(4)
        let si = stab[ielem].sinus
        let co = stab[ielem].cosinus
        let a = -slmax / 150.
        let p = stab[ielem].k_0 * slmax / 40 / maxBettung
        const color_load = '#ffc680';

        let x1 = stab[ielem].x1;
        let z1 = stab[ielem].z1;
        let x2 = stab[ielem].x2;
        let z2 = stab[ielem].z2;
        x[0] = x1 + si * a; z[0] = z1 - co * a;
        x[1] = x2 + si * a; z[1] = z2 - co * a;
        x[2] = x[1] - si * p; z[2] = z[1] + co * p;
        x[3] = x[0] - si * p; z[3] = z[0] + co * p;

        var vertices = [];
        for (let i = 0; i < 4; i++) {
            xtr[i] = tr.xPix(x[i])
            ztr[i] = tr.zPix(z[i])
            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
        }

        let flaeche = two.makePath(vertices);
        flaeche.fill = color_load;
        flaeche.opacity = opacity

        if ((show_labels && onlyLabels) || !show_selection || nur_eingabe_ueberpruefen) {

            let xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
            let zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
            let str = myFormat(Math.abs(stab[ielem].k_0), 1, 2) + ' kN/m²'
            let txt = two.makeText(str, xpix, zpix, style_txt)
            txt.alignment = 'center'
            txt.baseline = 'middle'
            txt.rotation = stab[ielem].alpha
        }
    }
}


//--------------------------------------------------------------------------------------------------------
function draw_bodenpressung() {
    //----------------------------------------------------------------------------------------------------


    //                              B o d e n p r e s s u n g     B o d e n p r e s s u n g


    let xx1, xx2, zz1, zz2, xp1, xp2, zp1, zp2
    let dx: number, x: number, eta: number, sl: number, nenner: number

    let uG: number, wG: number
    let nLoop = 1, lf_index = 0
    let maxPress = 0.0, x_max = 0.0, z_max = 0.0, dispG: number, maxPressSign = 0.0
    let xmem = 0.0, zmem = 0.0

    //let edispL: number[] = new Array(6)
    let iLastfall = draw_lastfall
    let scalefactor = 0

    if (THIIO_flag === 0) {
        if (iLastfall <= nlastfaelle) {
            lf_index = iLastfall - 1
            if (maxValue_lf[iLastfall - 1].press != 0.0) scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].press
        } else if (iLastfall <= nlastfaelle + nkombinationen) {
            lf_index = iLastfall - 1
            let ikomb = iLastfall - 1 - nlastfaelle
            scalefactor = 0.1 * slmax / max_press_kombi[ikomb]
        } else {
            nLoop = nkombinationen
            lf_index = nlastfaelle
            scalefactor = 0.1 * slmax / maxpress_all
        }
    }
    else if (THIIO_flag === 1) {
        if (iLastfall <= nkombinationen) {
            lf_index = iLastfall - 1
            if (maxValue_komb[iLastfall - 1].press != 0.0) scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].press
        } else {
            nLoop = nkombinationen
            lf_index = 0
            scalefactor = 0.05 * slmax / maxpress_all
        }
    }

    scalefactor *= scaleFactor_panel

    //console.log("scalefaktor", scalefactor, slmax, maxValue_lf[iLastfall - 1].disp)

    for (let ielem = 0; ielem < nelem_Balken; ielem++) {

        if (!stab[ielem].isActive) continue
        if (stab[ielem].k_0 === 0.0) continue

        maxPress = 0.0

        const nelTeilungen = element[ielem].nTeilungen
        let press: number[] = new Array(nelTeilungen)   // L = Verformung lokal


        // let umriss_x: number[] = new Array(2 * nelTeilungen)
        // let umriss_z: number[] = new Array(2 * nelTeilungen)


        let aL = stab[ielem].aL
        let aR = stab[ielem].aR

        let si = stab[ielem].sinus
        let co = stab[ielem].cosinus


        let xs1 = stab[ielem].x1 + co * aL;
        let zs1 = stab[ielem].z1 + si * aL;
        let xs2 = stab[ielem].x2 - co * aR;
        let zs2 = stab[ielem].z2 - si * aR;

        let x1 = Math.round(tr.xPix(xs1));
        let z1 = Math.round(tr.zPix(zs1));
        let x2 = Math.round(tr.xPix(xs2));
        let z2 = Math.round(tr.zPix(zs2));

        let h = element[ielem].h / 2.

        dx = element[ielem].sl / nelTeilungen
        eta = element[ielem].eta
        sl = element[ielem].sl
        nenner = sl ** 3 + 12 * eta * sl

        for (let loop = 0; loop < nLoop; loop++) {

            element[ielem].get_elementSchnittgroesse_bettung(press, lf_index + loop);
            console.log("press", press)

            xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i < nelTeilungen; i++) {

                x = element[ielem].x_[i]

                uG = - element[ielem].sinus * press[i] * (-1.0)
                wG = element[ielem].cosinus * press[i] * (-1.0)

                xx1 = xx2; zz1 = zz2;
                xx2 = xs1 + x * element[ielem].cosinus + uG * scalefactor
                zz2 = zs1 + x * element[ielem].sinus + wG * scalefactor

                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                // if (i > 0) {
                //     let line = two.makeLine(xx1, zz1, xx2, zz2);
                //     line.linewidth = 1;
                // }

                dispG = Math.sqrt(uG * uG + wG * wG)
                if (Math.abs(press[i]) > maxPress) {
                    maxPress = dispG
                    maxPressSign = press[i]
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(xs1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(zs1 + x * element[ielem].sinus)
                }

                werte.push(new TWerte())
                werte[index_werte].x = xx2
                werte[index_werte].z = zz2
                werte[index_werte].wert = myFormat(press[i], 1, 2) + 'kN/m'
                index_werte++

                x = x + dx
            }

            var vertices = [];
            vertices.push(new Two.Anchor(x1, z1));
            vertices.push(new Two.Anchor(x2, z2));
            vertices.push(new Two.Anchor(xx2, zz2));
            vertices.push(new Two.Anchor(xx1, zz1));

            let umriss = two.makePath(vertices);
            umriss.linewidth = 2;
            umriss.fill = '#006600'
            umriss.opacity = 0.2  //  opacity

        }

        draw_arrowPix(two, x_max, z_max, xmem, zmem, style_pfeil_pix)

        if (show_labels && maxPress > 0.0) {

            //const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
            //pfeil.stroke = '#111111'     //'#D3D3D3'

            const str = myFormat(maxPressSign, 1, 1) + 'kN/m'
            const txt = two.makeText(str, x_max + 5, z_max, style_txt)
            txt.alignment = 'left'
            txt.baseline = 'bottom'

        }
    }
}

//--------------------------------------------------------------------------------------------------------
function scale_factor() {
    //--------------------------------------------------------------------------------------------------------

    scaleFactor_panel = get_scale_factor();
    //console.log("stressFactor=", scaleFactor_panel)
    if (!show_dyn_animate_eigenformen) drawsystem();
}
//--------------------------------------------------------------------------------------------------------
function reset_grafik() {
    //--------------------------------------------------------------------------------------------------------

    mouseDx = 0.0
    mouseDz = 0.0
    touchLoop = 0
    mouseCounter = 0;
    show_dyn_eigenformen = false;
    mouse_DownWX = 0.0
    mouse_DownWY = 0.0

    wheel_factor = 0.0
    wheel_factor_alt = 0.0
    deltaXY = 0.0
    deltaXY_alt = 0.0

    centerX = 0.0
    centerY = 0.0
    centerX_last = 0.0
    centerY_last = 0.0

    //console.log("reset_grafik=")
    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_dyn_eigenformen_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_dyn_verformungen_grafik");
    show_dyn_eigenformen = !show_dyn_eigenformen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_dyn_animate_eigenformen_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_dyn_animate_eigenformen_grafik");
    show_dyn_animate_eigenformen = !show_dyn_animate_eigenformen;
    animate_scale = 0.0
    if (show_dyn_animate_eigenformen) start_animation = true;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_knotenmassen_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_knotenmassen_grafik");
    show_knotenmassen = !show_knotenmassen;

    if (!show_dyn_animate_eigenformen) drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_bodenpressung_grafik() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_bodenpressung_grafik");
    show_bodenpressung = !show_bodenpressung;

    if (!show_dyn_animate_eigenformen) drawsystem();
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
window.addEventListener('draw_umriss_grafik', draw_umriss_grafik);
window.addEventListener('draw_gesamtverformung_grafik', draw_gesamtverformung_grafik);
window.addEventListener('draw_gleichgewicht_SG_grafik', draw_gleichgewicht_SG_grafik);
window.addEventListener('draw_bodenpressung_grafik', draw_bodenpressung_grafik);

window.addEventListener('draw_dyn_eigenformen_grafik', draw_dyn_eigenformen_grafik);
window.addEventListener('draw_dyn_animate_eigenformen_grafik', draw_dyn_animate_eigenformen_grafik);
window.addEventListener('draw_knotenmassen_grafik', draw_knotenmassen_grafik);

window.addEventListener('scale_factor', scale_factor);
window.addEventListener('reset_webgl', reset_grafik);


//---------------------------------------------------------------------------------------------------
export async function copy_svg() {
    //-----------------------------------------------------------------------------------------------

    //let svg = svgElement;
    //console.log("svg", svg)
    const elem1 = document.getElementById('artboard') as any;

    if (elem1) {


        init_two('svg_artboard');
        drawsystem()
        const elem = document.getElementById('svg_artboard') as any;


        // svg = svg.replace(/\r?\n|\r/g, "").trim();
        // svg = svg.substring(0, svg.indexOf("</svg>")) + "</svg>";
        // // @ts-ignore
        // svg = svg.replaceAll("  ", "");

        // const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        // const svgBlob = new Blob([preface, svg], { type: "image/svg+xml;charset=utf-8" });

        const svgBlob = new Blob([elem.innerHTML], { type: "image/svg+xml;charset=utf-8" });  //

        console.log("svgBlob.type", svgBlob.type)

        navigator.clipboard.writeText(elem.innerHTML)   // für inkscape

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
                    suggestedName: currentFilenameSVG,
                    startIn: lastFileHandleSVG,
                    types: [{
                        description: "svg file",
                        accept: { "text/plain": [".svg"] }   //   image/svg+xml (.svg)
                    }]
                });
                console.log("fileHandle SVG", fileHandle)
                lastFileHandleSVG = fileHandle
                currentFilenameSVG = fileHandle.name

                const fileStream = await fileHandle.createWritable();
                //console.log("fileStream=",fileStream);

                // (C) WRITE FILE
                await fileStream.write(svgBlob);
                await fileStream.close();

            } catch (error: any) {
                //alert(error.name);
                alert(error.message);
            }

            // Zeichnung auf Bildschirm wieder herstellen

            //console.log("redraw screen artboard")
            init_two('artboard');
            drawsystem();

            return
        }

        // für den Rest des Feldes

        try {
            saveAs(svgBlob, filename);
        } catch (error: any) {
            alert(error.message);
        }

        // Zeichnung auf Bildschirm wieder herstellen

        //console.log("redraw screen artboard")
        init_two('artboard');
        drawsystem();
    }

}
