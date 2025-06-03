declare let Module: any;
import { app, nlastfaelle_init, opendialog, contextmenu_querschnitt, add_new_cross_section, nstabvorverfomungen_init } from "./haupt"
import { TFVector, TFArray2D, TFArray3D, TFArray3D_0 } from "./TFArray"

import { berechnungErfolgreich, berechnungErforderlich } from './globals'

import { testNumber, myFormat, write } from './utility'
//import {Module} from '../../d2beam_wasm.js'
// @ts-ignore
import { drButtonPM } from "../components/dr-button-pm";

import { gauss } from "./gauss"
import { cholesky, det_cholesky } from "./cholesky"
import { CTimoshenko_beam } from "./timoshenko_beam"
import { CTruss } from "./truss"
import { CSpring } from "./feder"
import { CKoppelfeder } from "./koppelfeder"
import { init_grafik, drawsystem, init_two } from "./grafik";
import { show_controller_THIIO, show_controller_bettung, show_controller_results, show_controller_truss } from "./mypanelgui"
import { ausgabe, ausgabe_kombinationen_Th_I_O, dyn_ausgabe } from "./ausgabe"
import { AlertDialog } from "../pages/confirm_dialog";
import { SlCheckbox } from "@shoelace-style/shoelace";

// import { read_daten } from "./dateien"

let fatal_error = false;

export let nnodes: number;
export let nelem: number;
export let nelem_Balken = 0;
export let nelem_Balken_Bettung = 0;      // Anzahl Balken mit Bettung
export let nelem_Federn = 0;
export let nelem_koppelfedern = 0;
export let nloads: number = 0;
export let neloads: number = 0;
export let ntotalEloads: number = 0;
export let nstabvorverfomungen = 0;
export let neq: number;
export let nnodesTotal: number = 0;
export let nelemTotal: number = 0;
export let nlastfaelle: number = 0;
export let nkombinationen: number = 0;
export let nelTeilungen = 10;
export let n_iterationen = 5;
export let ausgabe_gleichgewichtSG = true      // Ausgabe der Gleichgewichtsschnittgrößen
export let P_delta = false;
export let epsDisp_tol = 1.e-5
export let epsForce_tol = 1.e-8
export let nnodalMass: number = 0;
export let eigenform_dyn = [] as number[][]
export let maxValue_dyn_eigenform = [] as number[]
export let dyn_neigv = 1;

export let neigv: number = 2;
export let nNodeDisps = 0;
export let keineKonvergenzErreicht = false;
export let keineKonvergenzErreicht_eigv = false;
export let alpha_cr_2_low = false;

export let lagerkraft = [] as number[][];
export let disp_lf: TFArray3D;
export let disp_print: TFArray3D;
export let disp_print_kombi: TFArray3D;
export let eigenform_print: TFArray3D_0;
export let stabendkraefte: TFArray3D
export let lagerkraefte: TFArray3D
export let nodeDisp0Force: TFArray3D_0
export let lagerkraefte_kombi: TFArray3D
export let u_lf = [] as number[][]
export let u0_komb = [] as number[][]   // berechnete Schiefstellung
export let eigenform_container_node = [] as TFArray3D[]
export let eigenform_container_u = [] as TFArray2D[]
export let node = [] as TNode[]
export let element = [] as TElement[]
export let feder = [] as TSpring[]
export let nodeDisp0 = [] as TNodeDisp[]
export let load = [] as TLoads[]
export let eload = [] as TElLoads[]
export let stabvorverformung = [] as TStabvorverformung[]
export let querschnittset = [] as any[]
export let kombiTabelle = [] as number[][]
export let kombiTabelle_txt = [] as string[]
export let lastfall_bezeichnung = [] as string[]
export let alpha_cr = [] as number[][]
export let nodalmass = [] as TMass[]
export let dyn_omega = [] as number[]
export let maxU_schief = 0.03
export let maxU_node = -1
export let maxU_dir = 1

export let nQuerschnittSets = 0
export let querschnitts_zaehler = -1

export let nur_eingabe_ueberpruefen = false;

export let ndivsl = 3;
export let art = 1;
export let intArt = 2;
export let THIIO_flag = 0;
export let stadyn = 0;
export let System = 0;             // Stabwerk = 0, Fachwerk = 1
export let matprop_flag = 0;       // Materialeigenschaften 0=linear, 1=nichtlinear

export let el = [] as any

export let maxValue_lf = [] as TMaxValues[]
export let maxValue_komb = [] as TMaxValues[]
export let maxValue_eigv = [] as number[][]
export let maxValue_u0 = [] as TMaxU0[]
export let maxValue_eload = [] as number[]
export let maxValue_eload_komb = [] as number[]
export let maxValue_w0 = [] as number[]                // Stabvorverformung

export let max_S_kombi = [] as number[][] //  (3, nKombi)
export let max_disp_kombi = [] as number[]  //(nKombi)
export let max_press_kombi = [] as number[]  //(nKombi)

export let maxM_all = 0.0
export let maxV_all = 0.0
export let maxN_all = 0.0
export let maxdisp_all = 0.0
export let maxpress_all = 0.0

export let maxBettung = 0.0

export let xmin = -50.0, zmin = -50.0, xmax = 50.0, zmax = 50.0, slmax = 0.0;

export let nstreckenlasten = 0;
export let neinzellasten = 0;
export let ntemperaturlasten = 0;
export let nvorspannungen = 0;
export let nspannschloesser = 0;

export let stm = [] as number[][];
export let U_ = [] as number[];
export let R_ = [] as number[];

export let R_internal = [] as number[];

export let print_mass = [] as number[][];

export let stabvorverformung_komb = [] as TStabvorverformung_komb[][]

export let eig_solver = 1;
export let equation_solver = 3;  // 0 = cholesky Fortran, 1 = gauss, 3 = cholesky javascript
export let niter_neigv = 500;

// @ts-ignore
//var cmult = Module.cwrap("cmult", null, null);
//console.log("CMULT-------------", cmult)
//let c_d2beam1 = Module.cwrap("c_d2beam1", null, ["number", "number", "number", "number", "number", "number", "number", "number", "number"]);
//let c_d2beam2 = Module.cwrap("c_d2beam2", null, ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number"]);

let c_simvektoriteration: any
let c_gsl_eigenwert: any
let c_cholesky_decomp: any
let c_cholesky_2: any




//let result = Module.onRuntimeInitialized = () => {
c_simvektoriteration = Module.cwrap("c_simvektoriteration", "number", ["number", "number", "number", "number", "number", "number", "number"]);
c_gsl_eigenwert = Module.cwrap("gsl_eigenwert", "number", ["number", "number", "number"]);
c_cholesky_decomp = Module.cwrap("c_cholesky_decomp", "number", ["number", "number", "number"]);
c_cholesky_2 = Module.cwrap("c_cholesky_2", "number", ["number", "number", "number"]);
//}
write("c_cholesky_decomp= " + c_cholesky_decomp)

const bytes_8 = 8;
const bytes_4 = 4;

export const STABWERK = 0;
export const FACHWERK = 1;

//__________________________________________________________________________________________________

class TNode {
    x: number = 1.0                                 // Knotenkoordinaten bezogen auf Hilfskoordinatensystem
    z: number = 1.0

    L = [0, 0, 0]                                   // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    L_org = [0, 0, 0]                               // Lagerbedingung  bei Eingabe unverändert
    kx = 0.0
    kz = 0.0
    kphi = 0.0
    nel: number = 0                                 // Anzahl der Elemente, die an dem Knoten hängen

    is_used = false

    phi = 0.0                                       // Drehung des Lagers im Gegenuhrzeigersinn
    co = 1.0
    si = 0.0
    show_phi = true
    spring_index = -1                               // interne Federnummer , index in el[]
}


class TNodeDisp {                                   // Knotenzwangsverformungen, analog zu Knotenkräften
    node = 0                                        // werden aber mit TElDisp0 wie Elementlasten verarbeitet
    lf = 0
    dispx0 = 0.0                                    // Knotenvorverformungen gedreht in Richtung eines gedrehten Lagers
    dispz0 = 0.0
    phi0 = 0.0
    ux = 0.0                                        // Knotenvorverformungen in globale x-Richtung
    uz = 0.0                                        // Knotenvorverformungen in globale z-Richtung
    dispL = [false, false, false]                   // leere Zellen enthalten keine vorverformungen
    //dispzL = false
    //phiL = false
}

class TQuerschnittRechteck {
    name: string = ''
    id: string = ''
    model: number = 1
    className = 'QuerschnittRechteck'
    emodul: number = 30000.0
    Iy: number = 160000.0
    area: number = 1200.0
    zso: number = 0.2;
    height: number = 0.4
    width: number = 0.3
    wichte: number = 0.0
    alphaT: number = 0.0
    querdehnzahl: number = 0.0
    schubfaktor: number = 0.0
    definedQuerschnitt: number = 1
}

class TElement {
    qname: string = ''
    isActive = true;
    elTyp: number = 0           // 0 = 2 Knoten, 1 = Fachwerkstab, 3 = 3 Knoten, 3 = 4 Knoten
    nknoten: number = 2
    EModul: number = 0.0
    querdehnzahl: number = 0.3
    schubfaktor: number = 0.833
    gmodul: number = 0.0
    dicke: number = 0.0
    k_0 = 0.0                          // Bettungsmodul nach Winkler
    x1: number = 0.0
    x2: number = 0.0
    z1: number = 0.0
    z2: number = 0.0
    sl: number = 0.0                    // Stablänge
    aL = 0.0                             // starres Stabende limks (Stabanfang)
    aR = 0.0                            // starres Stabende rechts
    nod = [0, 0, 0, 0]                  // globale Knotennummer der Stabenden
    lm: number[] = []
    gelenk = [0, 0, 0, 0, 0, 0]
    nGelenke = 0
    estiff: number[][] = []
    estm: number[][] = []
    ksig: number[][] = []
    trans: number[][] = []
    F: number[] = Array(14)             // Stabendgrößen nach WGV im globalen Koordinatensystem
    FL: number[] = Array(14)            // Stabendgrößen nach KGV im lokalen Koordinatensystem
    F34 = [0.0, 0.0]
    cosinus: number = 0.0
    sinus: number = 0.0
    alpha: number = 0.0
    normalkraft: number = 0.0
    u: number[] = Array(14)
    prop_ptr: any
    npar_ptr: any
    xz_ptr: any
    brAbst_ptr: any
    stress_ptr: any

    mat_koppelfeder: number[] = Array(7)  // Eigenschaften der Koppelfeder
}

class TSpring {
    nod = -1
    kx = 0.0
    kz = 0.0
    kphi = 0.0

    constructor(node: number, kx: number, kz: number, kphi: number) {

        this.nod = node
        this.kx = kx
        this.kz = kz
        this.kphi = kphi
    }
    getNode() { return this.nod }
    getKx() { return this.kx }
    getKz() { return this.kz }
    getKphi() { return this.kphi }

}

class TLoads {
    node: number = -1
    lf: number = -1
    p = [0.0, 0.0, 0.0]
    Px = 0.0                                 // Last in globale x-Richtung
    Pz = 0.0                                 // Last in globale z-Richtung
}

class TMass {
    node: number = -1
    mass = 0.0
    theta = 0.0
}

class TElLoads {
    element: number = 0
    lf: number = 0
    art: number = 0
    pL: number = 0.0
    pR: number = 0.0
    x: number = 0.0
    P: number = 0.0
    M: number = 0.0
    Tu: number = 0.0
    To: number = 0.0
    kappa_dT: number = 0.0
    eps_Ts: number = 0.0
    sigmaV: number = 0.0
    delta_s: number = 0.0

    dispx0 = 0.0
    dispz0 = 0.0
    phi0 = 0.0
    node0 = 0
    dispL0: number[] = Array(6)
    ieq0 = [-1, -1, -1]                 // Gleichungsnummern für vordefinierte Knotenverformungen

    C1: number = 0.0                    // Integrationskonstante C1 für beidseitig eingespannt
    C2: number = 0.0                    // Integrationskonstante C2 für beidseitig eingespannt
    CwP: number = 0.0                   // Durchbiegung w infolge P beidseitig eingespannter Balken
    CphiP: number = 0.0                 // Verdrehung phi infolge P beidseitig eingespannter Balken
    CwM: number = 0.0                   // Durchbiegung w infolge M beidseitig eingespannter Balken
    CphiM: number = 0.0                 // Verdrehung phi infolge M beidseitig eingespannter Balken

    re: number[] = Array(6)             // Elementlastvektor lokal
    el_r: number[] = Array(10)          // Elementlastvektor im globalen Koordinatensystem, enthält Gelenke
}


class TStabvorverformung {
    element: number = -1
    lf: number = -1
    p = [0.0, 0.0, 0.0]
}

class TStabvorverformung_komb {
    w0a: number = 0
    w0e: number = 0
    w0m: number = 0
    defined = false
}

class TMaxValues {
    disp = 0.0
    N = 0.0
    Vz = 0.0
    My = 0.0
    eload = 0.0
    press = 0.0

    zero() {
        this.disp = 0.0
        this.N = 0.0
        this.Vz = 0.0
        this.My = 0.0
        this.eload = 0.0
        this.press = 0.0
    }
}

class TMaxU0 {
    ieq = -1
    u0 = 0.0
}

//---------------------------------------------------------------------------------------------------------------
export function setSystem(system: number) {
    //-----------------------------------------------------------------------------------------------------------
    System = system;

    if (system === 0) {
        show_controller_truss(true);
        showColumnsForStabwerk();
    } else {
        show_controller_truss(false);
        hideColumnsForFachwerk();
    }
}

//---------------------------------------------------------------------------------------------------------------
export function hideColumnsForFachwerk() {
    //---------------------------------------------------------------------------------------------------------------

    let el = document.getElementById("id_knoten_tabelle");
    el?.setAttribute("hide_column", String(5));
    el = document.getElementById("id_element_tabelle");
    for (let i = 5; i <= 13; i++)el?.setAttribute("hide_column", String(i));
    el?.setAttribute("hide_column", String(2));
    el = document.getElementById("id_knotenlasten_tabelle");
    el?.setAttribute("hide_column", String(5));

    el = document.getElementById("id_stabvorverfomungen_tabelle");
    el?.setAttribute("hide_column", String(4));
    el = document.getElementById("id_nnodedisps_tabelle");
    el?.setAttribute("hide_column", String(5));

    const checkbox_gelenk = document.getElementById("id_gelenke_anzeigen") as SlCheckbox;
    checkbox_gelenk.disabled = true;
    const checkbox_bettung = document.getElementById("id_bettung_anzeigen") as SlCheckbox;
    checkbox_bettung.disabled = true;
    const checkbox_starr = document.getElementById("id_starre_enden_anzeigen") as SlCheckbox;
    checkbox_starr.disabled = true;
}
//---------------------------------------------------------------------------------------------------------------
export function showColumnsForStabwerk() {
    //---------------------------------------------------------------------------------------------------------------

    let el = document.getElementById("id_knoten_tabelle");
    el?.setAttribute("show_column", String(5));
    el = document.getElementById("id_element_tabelle");
    for (let i = 13; i >= 5; i--)el?.setAttribute("show_column", String(i));
    el?.setAttribute("show_column", String(2));
    el = document.getElementById("id_knotenlasten_tabelle");
    el?.setAttribute("show_column", String(5));

    el = document.getElementById("id_stabvorverfomungen_tabelle");
    el?.setAttribute("show_column", String(4));
    el = document.getElementById("id_nnodedisps_tabelle");
    el?.setAttribute("show_column", String(5));

    const checkbox_gelenk = document.getElementById("id_gelenke_anzeigen") as SlCheckbox;
    checkbox_gelenk.disabled = false;
    const checkbox_bettung = document.getElementById("id_bettung_anzeigen") as SlCheckbox;
    checkbox_bettung.disabled = false;
    const checkbox_starr = document.getElementById("id_starre_enden_anzeigen") as SlCheckbox;
    checkbox_starr.disabled = false;
}


//---------------------------------------------------------------------------------------------------------------
export function incr_neq() {
    //-----------------------------------------------------------------------------------------------------------
    neq++;
}

//---------------------------------------------------------------------------------------------------------------
export function incr_querschnitts_zaehler() {
    //-----------------------------------------------------------------------------------------------------------
    querschnitts_zaehler++;
}

//---------------------------------------------------------------------------------------------------------------
export function set_querschnittszaehler() {
    //-----------------------------------------------------------------------------------------------------------

    for (let i = 0; i < nQuerschnittSets; i++) {
        let id = querschnittset[i].id
        let txtArray = id.split("-");
        console.log("txtArray", txtArray)
        if (Number(txtArray[1]) > querschnitts_zaehler) querschnitts_zaehler = Number(txtArray[1])
    }
    console.log("querschnitts_zaehler", querschnitts_zaehler)
}

//---------------------------------------------------------------------------------------------------------------
export function check_if_name_exists(name: string) {
    //-----------------------------------------------------------------------------------------------------------
    for (let i = 0; i < nQuerschnittSets; i++) {
        console.log("check_if_name_exists", i, name, querschnittset[i].name)
        if (name === querschnittset[i].name) return true;
    }
    console.log("exit check_if_name_exists")
    return false;
}

//---------------------------------------------------------------------------------------------------------------
export function incr_querschnittSets() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets++;
    querschnittset.push(new TQuerschnittRechteck())
}

//---------------------------------------------------------------------------------------------------------------
export function del_last_querschnittSet() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets--;
    querschnittset.pop();
}

//---------------------------------------------------------------------------------------------------------------
export function del_querschnittSet(qname: string) {
    //-----------------------------------------------------------------------------------------------------------

    for (let i = 0; i < nQuerschnittSets; i++) {
        if (qname === querschnittset[i].name) {
            console.log("lösche jetzt", i, qname)
            querschnittset.splice(i, 1);
            nQuerschnittSets--;
            break;
        }
    }

    let ele = document.getElementById("id_element_tabelle");
    ele?.setAttribute("option_deleted", qname);
}


//---------------------------------------------------------------------------------------------------------------
export function find_querschnittSet(qname: string) {
    //-----------------------------------------------------------------------------------------------------------

    let anzahl = 0;

    const el = document.getElementById('id_element_tabelle');
    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    let nRowTab = table.rows.length;

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        let qsname = (table.rows[izeile].cells[1].firstElementChild as HTMLSelectElement).value;

        if (qname === qsname) {
            console.log("find_querschnittSet, gefunden", izeile, qname)
            anzahl++;
            break;
        }
    }
    return anzahl;
}

//---------------------------------------------------------------------------------------------------------------
export function rechnen(flag = 1) {
    //-----------------------------------------------------------------------------------------------------------

    console.log("in rechnen");

    (document.getElementById('output') as HTMLTextAreaElement).value = ''; // Textarea output löschewn

    fatal_error = false;

    let el = document.getElementById('id_button_nnodes') as any;
    nnodes = Number(el.nel);

    el = document.getElementById('id_button_nelem') as any;
    nelem = Number(el.nel);
    nelem_Balken = nelem;

    el = document.getElementById('id_button_nkoppelfedern') as any;
    nelem_koppelfedern = Number(el.nel);

    el = document.getElementById('id_button_nnodalloads') as any;
    nloads = Number(el.nel);

    el = document.getElementById('id_button_nstabvorverformungen') as any;
    nstabvorverfomungen = Number(el.nel);

    el = document.getElementById('id_button_nnodedisps') as any;
    nNodeDisps = Number(el.nel);

    el = document.getElementById('id_button_nlastfaelle') as any;
    nlastfaelle = Number(el.nel);

    el = document.getElementById('id_button_nkombinationen') as any;
    nkombinationen = Number(el.nel);
    /*
        el = document.getElementById('id_ndivsl') as HTMLInputElement;
        ndivsl = Number(el.value);

        el = document.getElementById('id_intart') as HTMLSelectElement;
        intArt = Number(el.value);

        el = document.getElementById('id_art') as HTMLSelectElement;
        art = Number(el.value);
    */

    el = document.getElementById('id_THIIO') as HTMLSelectElement;
    THIIO_flag = Number(el.value);

    el = document.getElementById('id_matprop') as HTMLSelectElement;
    matprop_flag = Number(el.value);

    el = document.getElementById('id_maxu_node') as HTMLInputElement;
    //console.log("id_maxu_node|",el.value,'|')
    maxU_node = Number(el.value);

    el = document.getElementById('id_maxu_dir') as HTMLSelectElement;
    maxU_dir = Number(el.value);

    el = document.getElementById('id_maxu_schief') as HTMLInputElement;
    maxU_schief = Number(el.value) / 1000.0;  // in m bzw. rad

    el = document.getElementById('id_neigv') as drButtonPM;
    neigv = Number(el.nel);

    el = document.getElementById('id_button_nteilungen') as any;
    nelTeilungen = Number(el.nel);

    el = document.getElementById('id_button_niter') as any;
    n_iterationen = Number(el.nel);

    el = document.getElementById('id_eps_disp_tol') as HTMLInputElement;
    epsDisp_tol = Number(el.value)

    el = document.getElementById('id_eps_force_tol') as HTMLInputElement;
    epsForce_tol = Number(el.value)

    el = document.getElementById('id_eig_solver_option') as any;
    eig_solver = Number(el.value);
    console.log("== id_eig_solver_option =", eig_solver)

    el = document.getElementById('id_ausgabe_SG_option') as any;
    if (el.value === '0') ausgabe_gleichgewichtSG = true;
    else ausgabe_gleichgewichtSG = false;
    console.log("== ausgabe_gleichgewichtSG =", eig_solver)

    el = document.getElementById('id_P_delta_option') as any;
    if (el.value === 'true') P_delta = true;
    else P_delta = false;
    console.log("== P_delta =", P_delta)

    const sel = document.getElementById("id_stadyn") as HTMLSelectElement;
    if (sel.value === '0') stadyn = 0;
    else {
        stadyn = 1;
        THIIO_flag = 0;   // Dynamik ist immer Th.I. Ordnung
    }
    console.log("== stadyn =", stadyn)


    el = document.getElementById('id_button_nnodalmass') as any;
    nnodalMass = Number(el.nel);

    el = document.getElementById('id_button_dyn_neigv') as any;
    dyn_neigv = Number(el.nel);

    el = document.getElementById('id_iter_neigv') as any;
    niter_neigv = Number(el.value);
    console.log("niter_neigv = ", niter_neigv)

    console.log("== THIIO_flag", THIIO_flag, nelTeilungen, n_iterationen)

    console.log("== intAt, art", intArt, art, ndivsl)
    console.log("== maxU", maxU_node, maxU_dir, maxU_schief, neigv)

    read_nodes();
    read_elements();
    read_kombinationen();

    read_nodal_loads();
    let status = 0;
    if ((status = read_element_loads()) < 0) {
        if (status === -1) write('\nEingabefehler , ein Element hat keinen Querschnitt')
    }
    read_stabvorverformungen();
    if (stadyn === 1) read_nodal_mass();

    if (flag === 1) {

        nur_eingabe_ueberpruefen = false

        let fehler = check_input();
        if (fatal_error || fehler > 0) {
            write('\nEingabefehler bitte erst beheben')
        } else {
            calculate();
            if (THIIO_flag === 0) show_controller_THIIO(false);
            else show_controller_THIIO(true);
            show_controller_results(true);
            if (nelem_Balken_Bettung > 0) show_controller_bettung(true); else show_controller_bettung(false);
        }
    } else {

        nur_eingabe_ueberpruefen = true

        calc_neq_and_springs();

        let fehler = check_input();

        if (fatal_error || fehler > 0) return;

        // für die Grafik

        xmin = 1.e30
        zmin = 1.e30
        xmax = -1.e30
        zmax = -1.e30

        for (let i = 0; i < nnodes; i++) {
            if (node[i].x < xmin) xmin = node[i].x;
            if (node[i].z < zmin) zmin = node[i].z;
            if (node[i].x > xmax) xmax = node[i].x;
            if (node[i].z > zmax) zmax = node[i].z;
        }

        slmax = Math.sqrt((xmax - xmin) ** 2 + (zmax - zmin) ** 2)

        init_grafik(0);
        init_two();

        show_controller_THIIO(false);
        show_controller_results(false);
        show_controller_bettung(false);

        drawsystem();

        write('Im Tab Grafik wurde das System soweit möglich gezeichnet');
    }

}

//---------------------------------------------------------------------------------------------------------------
function check_input() {
    //---------------------------------------------------------------------------------------------------------------


    let fehler = 0;

    if (nQuerschnittSets === 0) { write('Es muss mindestens 1 Querschnitt definiert sein\n'); fehler++; }
    if (nelem < 1) { write('Es muss mindestens 1 Element definiert sein'); fehler++; }
    if (nnodes < 2) { write('Es müssen mindestens 2 Knoten definiert sein'); fehler++; }

    if (THIIO_flag === 1) {
        if (nkombinationen < 1) { write('Es muss mindestens 1 Kombination definiert sein'); fehler++; }
    }

    if (fehler > 0) write(' ')
    for (let ielem = 0; ielem < nelem_Balken; ielem++) {
        if (element[ielem].qname === "") { write('Dem Element ' + (+ielem + 1) + ' ist kein Querschnitt zugeordnet'); fehler++; }
        // if (element[ielem].nod[0] < 0) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod a) muss größer 0 sein'); fehler++; }
        // if (element[ielem].nod[1] < 0) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod e) muss größer 0 sein'); fehler++; }
        // if (element[ielem].nod[0] > (nnodes - 1)) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod a) muss <= Anzahl Knoten sein'); fehler++; }
        // if (element[ielem].nod[1] > (nnodes - 1)) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod e) muss <= Anzahl Knoten sein'); fehler++; }
        // if (element[ielem].nod[0] === element[ielem].nod[1]) { write('Element ' + (+ielem + 1) + ': Knoteninzidenzen für (nod a) und (nod e) muessen unterschiedlich sein'); fehler++; }

        for (let i = 0; i < 6; i++) {
            if (!(element[ielem].gelenk[i] === 0 || element[ielem].gelenk[i] === 1)) {
                write('Element ' + (+ielem + 1) + ': für Gelenke nur 1 zulässig, kein Gelenk: 0 oder leere Zelle'); fehler++;
            }
        }
    }
    if (fehler > 0) write(' ')

    for (let i = 0; i < nloads; i++) {
        if (load[i].node < 0) { write('Knotenlast ' + (+i + 1) + ' Knotennummer muss größer 0 sein'); fehler++; }
        if (load[i].node > (nnodes - 1)) { write('Knotenlast ' + (+i + 1) + ' Knotennummer muss <= Anzahl Knoten sein'); fehler++; }
        if (load[i].lf < 1) { write('Knotenlast ' + (+i + 1) + ' Nummer des Lastfalls muss größer 1 sein'); fehler++; }
        if (load[i].lf > nlastfaelle) { write('Knotenlast ' + (+i + 1) + ' Nummer des Lastfalls muss <= Anzahl Lastfälle sein'); fehler++; }
    }
    if (fehler > 0) write(' ')

    for (let i = 0; i < nstreckenlasten; i++) {
        if (eload[i].art < 0 || eload[i].art > 4) { write('Streckenlast ' + (+i + 1) + ' Lastart muss zwischen 0 und 4 sein'); fehler++; }
    }
    if (fehler > 0) write(' ')

    for (let i = 0; i < neloads; i++) {
        if (eload[i].element < 0) { write('Elementlast ' + (+i + 1) + ': Elementnummer muss größer 0 sein'); fehler++; }
        if (eload[i].element > (nelem - 1)) { write('Elementlast ' + (+i + 1) + ': Knotennummer muss <= Anzahl Elemente sein'); fehler++; }
        if (eload[i].lf < 1) { write('Elementlast ' + (+i + 1) + ': Nummer des Lastfalls muss größer 1 sein'); fehler++; }
        if (eload[i].lf > nlastfaelle) { write('Elementlast ' + (+i + 1) + ' Nummer des Lastfalls muss <= Anzahl Lastfälle sein'); fehler++; }
    }

    if (fehler > 0) write(' ')

    for (let i = 0; i < nkombinationen; i++) {
        let anzahl = 0
        for (let j = 0; j < nlastfaelle; j++) {
            if (kombiTabelle[i][j] != 0.0) anzahl++;
        }
        if (anzahl === 0) { write('An Kombination ' + (+i + 1) + ' ist kein Lastfall beteiligt'); fehler++; }
    }

    if (maxU_node < 0) { write('Tab Vorverformungen, Schiefstellung: Knotennummer muss >= 0 sein') }
    if (maxU_node > nnodes) { write('Tab Vorverformungen, Schiefstellung: Knotennummer muss <= Anzahl Knoten sein') }

    for (let i = 0; i < nstabvorverfomungen; i++) {
        if (stabvorverformung[i].lf < 1) { write('Knotenlast ' + (+i + 1) + ' Nummer des Lastfalls muss größer 1 sein'); fehler++; }
        if (stabvorverformung[i].lf > nlastfaelle) { write('Knotenlast ' + (+i + 1) + ' Nummer des Lastfalls muss <= Anzahl Lastfälle sein'); fehler++; }

        if (stabvorverformung[i].element < 0) { write('Stabvorverformung ' + (+i + 1) + ': Elementnummer muss größer 0 sein'); fehler++; }
        if (stabvorverformung[i].element > (nelem - 1)) { write('Stabvorverformung ' + (+i + 1) + ': Elementnummer muss  <= Anzahl Elemente sein'); fehler++; }
    }

    for (let i = 0; i < nNodeDisps; i++) {
        if (nodeDisp0[i].node < 0) { write('(Tab Knoten) Knotenverformung ' + (+i + 1) + ': Knotennummer muss größer 0 sein'); fehler++; }
        if (nodeDisp0[i].node > (nnodes - 1)) { write('(Tab Knoten) Knotenvorverformung ' + (+i + 1) + ': Knotennummer muss  <= Anzahl Elemente sein'); fehler++; }
        if (nodeDisp0[i].lf < 1) { write('(Tab Knoten) Knotenverformung ' + (+i + 1) + ': Nummer des Lastfalls muss größer 1 sein'); fehler++; }
        if (nodeDisp0[i].lf > nlastfaelle) { write('(Tab Knoten) Knotenverformung ' + (+i + 1) + ' Nummer des Lastfalls muss <= Anzahl Lastfälle sein'); fehler++; }
    }

    write('_________________________________________________________')
    write('Es sind ' + fehler + ' Eingabefehler gefunden worden');

    return fehler;

}

//---------------------------------------------------------------------------------------------------------------
export function set_querschnittRechteck(name: string, id: string, emodul: number, Iy: number, area: number, height: number, width: number,
    definedQuerschnitt: number, wichte: number, schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number) {
    //-----------------------------------------------------------------------------------------------------------

    const index = nQuerschnittSets - 1;

    querschnittset[index].name = name;
    querschnittset[index].emodul = emodul;
    querschnittset[index].Iy = Iy;
    querschnittset[index].area = area;
    querschnittset[index].height = height;
    querschnittset[index].width = width;
    querschnittset[index].id = id;
    querschnittset[index].definedQuerschnitt = definedQuerschnitt;
    querschnittset[index].wichte = wichte;
    querschnittset[index].schubfaktor = schubfaktor;
    querschnittset[index].querdehnzahl = querdehnzahl;
    querschnittset[index].zso = zso;
    querschnittset[index].alphaT = alphaT;
    console.log("set_querschnittRechteck", index, emodul)
}


//---------------------------------------------------------------------------------------------------------------
export function update_querschnittRechteck(index: number, name: string, id: string, emodul: number, Iy: number, area: number,
    height: number, width: number, definedQuerschnitt: number, wichte: number, schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number) {
    //-----------------------------------------------------------------------------------------------------------

    querschnittset[index].name = name;
    querschnittset[index].emodul = emodul;
    querschnittset[index].Iy = Iy;
    querschnittset[index].area = area;
    querschnittset[index].height = height;
    querschnittset[index].width = width;
    querschnittset[index].id = id;
    querschnittset[index].definedQuerschnitt = definedQuerschnitt;
    querschnittset[index].wichte = wichte;
    querschnittset[index].schubfaktor = schubfaktor;
    querschnittset[index].querdehnzahl = querdehnzahl;
    querschnittset[index].zso = zso;
    querschnittset[index].alphaT = alphaT;

    console.log("update_querschnittRechteck", index, emodul)
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string, id: string, emodul: number, Iy: number, area: number, height: number, width: number, definedQuerschnitt: number, wichte: number
    let schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number

    console.log("index", index)
    name = querschnittset[index].name;
    emodul = querschnittset[index].emodul;
    Iy = querschnittset[index].Iy;
    area = querschnittset[index].area;
    height = querschnittset[index].height;
    width = querschnittset[index].width;
    id = querschnittset[index].id;
    definedQuerschnitt = querschnittset[index].definedQuerschnitt;
    wichte = querschnittset[index].wichte;
    schubfaktor = querschnittset[index].schubfaktor;
    querdehnzahl = querschnittset[index].querdehnzahl;
    zso = querschnittset[index].zso;
    alphaT = querschnittset[index].alphaT;

    console.log("get_querschnittRechteck", index, emodul)

    return [name, id, emodul, Iy, area, height, width, definedQuerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT]
}


//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck_name(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].name;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_classname(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].className;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_length(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let len = 0

    if (index >= 0) len = Object.keys(querschnittset[index]).length;
    console.log("get_querschnitt_length", querschnittset[index])

    return len;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_index(qname: string) {
    //-----------------------------------------------------------------------------------------------------------

    for (let index = 0; index < querschnittset.length; index++) {
        if (qname === querschnittset[index].name) {
            return index;
            break;
        }
    }
    return -1;
}

//---------------------------------------------------------------------------------------------------------------
function read_nodes() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    let el = document.getElementById('id_knoten_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    node.length = 0
    for (i = 0; i < nnodes; i++) {
        node.push(new TNode())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    let shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        let iz = izeile - 1
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) node[iz].x = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 2) node[iz].z = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) node[iz].L[0] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) node[iz].L[1] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) node[iz].L[2] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 6) node[iz].phi = Number(testNumber(wert, izeile, ispalte, shad));

            if (System === FACHWERK) node[iz].L[2] = 1;   // Drehfreiheitsgrad festhalten

            node[iz].L_org[0] = node[iz].L[0]
            node[iz].L_org[1] = node[iz].L[1]
            node[iz].L_org[2] = node[iz].L[2]
        }
    }



    nnodesTotal = nnodes;

    // definierte Knotenverformungen

    for (i = 0; i < nNodeDisps; i++) {
        nodeDisp0.push(new TNodeDisp)
    }

    el = document.getElementById('id_nnodedisps_tabelle');
    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;

    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        let iz = izeile - 1
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            console.log('NODE Knotenverformungen i:1', nnodes, izeile, ispalte, wert, wert.length);
            if (ispalte === 1) nodeDisp0[iz].node = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) nodeDisp0[iz].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) {
                if (wert.length === 0) nodeDisp0[iz].dispL[0] = false; else nodeDisp0[iz].dispL[0] = true;     // true=definierte Knotenverformung
                nodeDisp0[iz].dispx0 = Number(testNumber(wert, izeile, ispalte, shad));
            }
            else if (ispalte === 4) {
                if (wert.length === 0) nodeDisp0[iz].dispL[1] = false; else nodeDisp0[iz].dispL[1] = true;
                nodeDisp0[iz].dispz0 = Number(testNumber(wert, izeile, ispalte, shad));
            }
            else if (ispalte === 5) {
                if (wert.length === 0) nodeDisp0[iz].dispL[2] = false; else nodeDisp0[iz].dispL[2] = true;
                nodeDisp0[iz].phi0 = Number(testNumber(wert, izeile, ispalte, shad));
            }

        }
    }

}


//---------------------------------------------------------------------------------------------------------------
function read_nodal_loads() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_knotenlasten_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    load.length = 0
    for (i = 0; i < nloads; i++) {
        load.push(new TLoads())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) load[izeile - 1].node = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) load[izeile - 1].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) load[izeile - 1].Px = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) load[izeile - 1].Pz = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) load[izeile - 1].p[2] = Number(testNumber(wert, izeile, ispalte, shad));
        }
        if (load[izeile - 1].lf > nlastfaelle) {
            fatal_error = true;
            write('Knotenlast in Zeile ' + izeile + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
            //nlastfaelle = load[izeile - 1].lf
        }

        console.log("R", izeile, load[izeile - 1])
    }
}


//---------------------------------------------------------------------------------------------------------------
function read_nodal_mass() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_knotenmassen_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    nodalmass.length = 0
    for (i = 0; i < nnodalMass; i++) {
        nodalmass.push(new TMass())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) nodalmass[izeile - 1].node = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) nodalmass[izeile - 1].mass = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) nodalmass[izeile - 1].theta = Number(testNumber(wert, izeile, ispalte, shad));
        }

        console.log("nodalmass", izeile, nodalmass[izeile - 1])
    }
}

//---------------------------------------------------------------------------------------------------------------
function find_maxValues_eloads(ieload: number) {
    //-----------------------------------------------------------------------------------------------------------

    maxValue_eload.fill(0.0)

    for (let i = 0; i < ieload; i++) {
        let lf = eload[i].lf - 1
        let art = eload[i].art
        console.log("art=", art, lf)
        if (art >= 0 && art <= 4) {
            if (Math.abs(eload[i].pL) > maxValue_eload[lf]) maxValue_eload[lf] = Math.abs(eload[i].pL)
            if (Math.abs(eload[i].pR) > maxValue_eload[lf]) maxValue_eload[lf] = Math.abs(eload[i].pR)
        }
    }


    // jetzt die max. Streckenlasten bei Kombinationen bestimmen

    if (nkombinationen > 0) maxValue_eload_komb = new Array(nkombinationen).fill(0.0)

    for (let iKomb = 0; iKomb < nkombinationen; iKomb++) {
        for (let ilastf = 0; ilastf < nlastfaelle; ilastf++) {
            if (kombiTabelle[iKomb][ilastf] !== 0.0) {
                let fact = kombiTabelle[iKomb][ilastf];
                for (let i = 0; i < neloads; i++) {
                    let lf = eload[i].lf - 1
                    if (lf === ilastf) {

                        let art = eload[i].art
                        //console.log("art=", art, lf)
                        if (art >= 0 && art <= 4) {
                            if (Math.abs(eload[i].pL * fact) > maxValue_eload_komb[iKomb]) maxValue_eload_komb[iKomb] = Math.abs(eload[i].pL * fact)
                            if (Math.abs(eload[i].pR * fact) > maxValue_eload_komb[iKomb]) maxValue_eload_komb[iKomb] = Math.abs(eload[i].pR * fact)
                        }
                    }
                }
            }
        }
        console.log("@@@@   @@@ maxValue_eload_komb: ", iKomb, maxValue_eload_komb[iKomb])
    }
}

//---------------------------------------------------------------------------------------------------------------
function read_element_loads() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;


    let el = document.getElementById('id_button_nstreckenlasten') as any;
    nstreckenlasten = Number(el.nel);

    el = document.getElementById('id_button_neinzellasten') as any;
    neinzellasten = Number(el.nel);

    el = document.getElementById('id_button_ntemperaturlasten') as any;
    ntemperaturlasten = Number(el.nel);

    el = document.getElementById('id_button_nvorspannungen') as any;
    nvorspannungen = Number(el.nel);

    el = document.getElementById('id_button_nspannschloesser') as any;
    nspannschloesser = Number(el.nel);

    ntotalEloads = neloads = nstreckenlasten + neinzellasten + ntemperaturlasten + nvorspannungen + nspannschloesser + nelem_Balken

    console.log("NELOADS", neloads, nstreckenlasten, neinzellasten, ntemperaturlasten, nvorspannungen, nspannschloesser)

    eload.length = 0
    for (i = 0; i < neloads; i++) {
        eload.push(new TElLoads())
    }
    let ieload = 0

    // Eigengewicht

    let wichte = 0.0, area = 0.0
    for (let ielem = 0; ielem < nelem_Balken; ielem++) {
        let index = getMaterialIndex(ielem);
        if (index === -1) return index;
        if (querschnittset[index].className === 'QuerschnittRechteck') {   //  linear elastisch
            wichte = querschnittset[index].wichte
            area = querschnittset[index].area
        }
        eload[ieload].element = ielem
        eload[ieload].lf = 1
        eload[ieload].art = 1
        eload[ieload].pL = wichte * area / 10000.0   // richtige Werte werden in initialisiereElementdaten() gesetzt
        eload[ieload].pR = wichte * area / 10000.0
        ieload++;
    }

    // Streckenlasten

    el = document.getElementById('id_streckenlasten_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    let shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].art = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) eload[ieload].pL = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) eload[ieload].pR = Number(testNumber(wert, izeile, ispalte, shad));
        }
        if (eload[ieload].lf > nlastfaelle) {
            fatal_error = true;
            write('Elementstreckenlast in Zeile ' + izeile + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
        }

        console.log("eload", izeile, eload[ieload])
        ieload++;
    }

    maxValue_eload = new Array(nlastfaelle).fill(0.0)

    // jetzt die max. Streckenlasten bei Kombinationen bestimmen

    if (nkombinationen > 0) maxValue_eload_komb = new Array(nkombinationen).fill(0.0)

    find_maxValues_eloads(ieload);

    // Einzellasten

    el = document.getElementById('id_einzellasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) {
                eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
                let ele = eload[ieload].element
                if (ele < 0 || ele >= nelem_Balken) {
                    fatal_error = true;
                    write('Elementeinzellast in Zeile ' + izeile + ': unzulässsige Elementnummer');
                }
            }
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) {
                eload[ieload].x = Number(testNumber(wert, izeile, ispalte, shad));
                if (!fatal_error) {
                    let ele = eload[ieload].element
                    if (eload[ieload].x - 0.0001 > element[ele].sl) {
                        fatal_error = true;
                        write('Elementeinzellast in Zeile ' + izeile + ': Lastangriff x größer Stablänge');
                    } else {
                        if (eload[ieload].x > element[ele].sl) eload[ieload].x = element[ele].sl  // Rundungsärger eliminieren
                    }
                }
            }
            else if (ispalte === 4) eload[ieload].P = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) eload[ieload].M = Number(testNumber(wert, izeile, ispalte, shad));
            eload[ieload].art = 6;
        }
        // if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf
        if (eload[ieload].lf > nlastfaelle) {
            fatal_error = true;
            write('Elementeinzellast in Zeile ' + izeile + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
        }

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    // Temperatur

    el = document.getElementById('id_temperaturlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].Tu = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) eload[ieload].To = Number(testNumber(wert, izeile, ispalte, shad));
            eload[ieload].art = 5;
        }
        // if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf
        if (eload[ieload].lf > nlastfaelle) {
            fatal_error = true;
            write('Elementtemperaturlast in Zeile ' + izeile + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
        }

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    // Vorspannung

    el = document.getElementById('id_vorspannungen_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].sigmaV = Number(testNumber(wert, izeile, ispalte, shad)) * 1000.0; //von MN/m² in kN/m²
            eload[ieload].art = 9;
        }
        // if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf
        if (eload[ieload].lf > nlastfaelle) {
            fatal_error = true;
            write('Elementtemperaturlast in Zeile ' + izeile + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
        }

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    // Spannschloss

    el = document.getElementById('id_spannschloesser_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].delta_s = Number(testNumber(wert, izeile, ispalte, shad)) / 1000.;  // von mm in m
            eload[ieload].art = 10;
        }
        // if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf
        if (eload[ieload].lf > nlastfaelle) {
            fatal_error = true;
            write('Elementspannschlosslast in Zeile ' + izeile + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
        }

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    //for (i = 0; i < nlastfaelle; i++) console.log('maxValue_eload', i, maxValue_eload[i])
    console.log('maxValue_eload', maxValue_eload)

    return 0;

}


//---------------------------------------------------------------------------------------------------------------
function read_stabvorverformungen() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_stabvorverfomungen_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    stabvorverformung.length = 0
    for (i = 0; i < nstabvorverfomungen; i++) {
        stabvorverformung.push(new TStabvorverformung())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    //maxValue_w0 = 0.0

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) stabvorverformung[izeile - 1].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) stabvorverformung[izeile - 1].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) stabvorverformung[izeile - 1].p[0] = Number(testNumber(wert, izeile, ispalte, shad)) / 100.0;   // von cm in m
            else if (ispalte === 4) stabvorverformung[izeile - 1].p[1] = Number(testNumber(wert, izeile, ispalte, shad)) / 100.0;
            else if (ispalte === 5) stabvorverformung[izeile - 1].p[2] = Number(testNumber(wert, izeile, ispalte, shad)) / 100.0;
        }

        //maxValue_w0 = Math.max(maxValue_w0, Math.abs(stabvorverformung[izeile - 1].p[0]), Math.abs(stabvorverformung[izeile - 1].p[1]), Math.abs(stabvorverformung[izeile - 1].p[2]))
        console.log("stabvorverfomung", izeile, stabvorverformung[izeile - 1])
    }

    //console.log('nstabvorverfomungen, maxValue_w0', nstabvorverfomungen, maxValue_w0)
}

//---------------------------------------------------------------------------------------------------------------
function read_elements() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number, ielem: number, nod1: number, nod2: number, dx: number, dz: number;

    let el = document.getElementById('id_element_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    nelem_Balken_Bettung = 0

    element.length = 0
    for (i = 0; i < nelem; i++) {
        element.push(new TElement())
    }
    nelemTotal = nelem

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    let shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        element[izeile - 1].nGelenke = 0
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            if (ispalte === 1) {
                //console.log('iSpalte === 1',izeile, ispalte, table.rows[izeile].cells[ispalte].firstElementChild.value);
                wert = (table.rows[izeile].cells[ispalte].firstElementChild as HTMLSelectElement).value;
            } else {
                let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
                wert = child.value;
                //console.log('NODE i:1', nnodes, izeile, ispalte, wert, table.rows[izeile].cells[ispalte].textContent);
            }
            if (ispalte === 1) element[izeile - 1].qname = wert;
            else if (ispalte === 2) element[izeile - 1].elTyp = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) element[izeile - 1].nod[0] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 4) element[izeile - 1].nod[1] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte > 4 && ispalte <= 10) {
                element[izeile - 1].gelenk[ispalte - 5] = Number(testNumber(wert, izeile, ispalte, shad));
                if (element[izeile - 1].gelenk[ispalte - 5] > 0) element[izeile - 1].nGelenke++;
            }
            else if (ispalte === 11) element[izeile - 1].aL = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 12) element[izeile - 1].aR = Number(testNumber(wert, izeile, ispalte, shad));

            else if (ispalte === 13) {
                element[izeile - 1].k_0 = Number(testNumber(wert, izeile, ispalte, shad));   // in kN/m²
                if (element[izeile - 1].k_0 !== 0.0) {
                    nelem_Balken_Bettung++;
                    if (Math.abs(element[izeile - 1].k_0) > maxBettung) maxBettung = Math.abs(element[izeile - 1].k_0)
                }
            }
        }
        console.log("element", izeile, element[izeile - 1].qname, element[izeile - 1].nod[0], element[izeile - 1].nod[1])

        ielem = izeile - 1

        nod1 = element[ielem].nod[0];
        nod2 = element[ielem].nod[1];

        if (nod1 === -2 && nod2 === -2) element[ielem].isActive = false;
        if (element[ielem].elTyp === -1) element[ielem].isActive = false;

        console.log("isActive", (+ielem + 1), element[ielem].isActive, nod1, nod2)

        if (element[ielem].isActive) {

            let fehler = 0;
            if (nod1 < 0) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod a) muss größer 0 sein'); fehler++; }
            if (nod2 < 0) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod e) muss größer 0 sein'); fehler++; }
            if (nod1 > (nnodes - 1)) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod a) muss <= Anzahl Knoten sein'); fehler++; }
            if (nod2 > (nnodes - 1)) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod e) muss <= Anzahl Knoten sein'); fehler++; }
            if (nod1 === nod2) { write('Element ' + (+ielem + 1) + ': Knoteninzidenzen für (nod a) und (nod e) muessen unterschiedlich sein'); fehler++; }

            if (fehler > 0) {
                fatal_error = true;
                write('Fataler Eingabefehler für Element ' + (+ielem + 1) + ', bitte als Erstes beheben\n')
                continue;
            }


            node[nod1].is_used = true
            node[nod2].is_used = true

            element[ielem].x1 = node[nod1].x;
            element[ielem].x2 = node[nod2].x;
            element[ielem].z1 = node[nod1].z;
            element[ielem].z2 = node[nod2].z;


            const dx = element[ielem].x2 - element[ielem].x1;
            const dz = element[ielem].z2 - element[ielem].z1;
            element[ielem].sl = Math.sqrt(dx * dx + dz * dz);      // Stablänge

            if (element[ielem].sl < 1e-12) {
                write("Länge von Element " + String(ielem + 1) + " ist null")
                element[ielem].cosinus = 1.0
                element[ielem].sinus = 0.0
                element[ielem].alpha = 0.0
            } else {
                element[ielem].cosinus = dx / element[ielem].sl
                element[ielem].sinus = dz / element[ielem].sl
                element[ielem].alpha = Math.atan2(dz, dx)
            }

            if (element[ielem].elTyp === 3) {

                let x = (element[ielem].x2 + element[ielem].x1) / 2.0
                let z = (element[ielem].z2 + element[ielem].z1) / 2.0
                node.push(new TNode())
                node[nnodesTotal].x = x
                node[nnodesTotal].z = z
                element[ielem].nod[2] = nnodesTotal
                nnodesTotal++;
            }
            else if (element[ielem].elTyp === 4) {

                let dx = (element[ielem].x2 - element[ielem].x1) / 3.0
                let dz = (element[ielem].z2 - element[ielem].z1) / 3.0
                let x = element[ielem].x1 + dx
                let z = element[ielem].z1 + dz
                node.push(new TNode())
                node[nnodesTotal].x = x
                node[nnodesTotal].z = z
                element[ielem].nod[2] = nnodesTotal
                nnodesTotal++;

                x = x + dx
                z = z + dz
                node.push(new TNode())
                node[nnodesTotal].x = x
                node[nnodesTotal].z = z
                element[ielem].nod[3] = nnodesTotal
                nnodesTotal++;
            }
        }
    }

    // **********************************
    // Koppelfedern
    // **********************************

    el = document.getElementById('id_koppelfedern_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    for (i = 0; i < nelem_koppelfedern; i++) {
        element.push(new TElement())
    }
    nelemTotal += nelem_koppelfedern

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    ielem = nelem_Balken

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        element[ielem].qname = element[ielem].qname = 'koppelfeder';

        for (let ispalte = 1; ispalte < nColTab; ispalte++) {

            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert, table.rows[izeile].cells[ispalte].textContent);

            if (ispalte === 1) element[ielem].nod[0] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) element[ielem].nod[1] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte > 2) {
                element[ielem].mat_koppelfeder[ispalte - 3] = Number(testNumber(wert, izeile, ispalte, shad));
                console.log("MAT KOPPELFEDER", wert, element[ielem].mat_koppelfeder[ispalte - 3])
            }
        }
        console.log("element", izeile, element[ielem].qname, element[ielem].nod[0], element[ielem].nod[1])


        nod1 = element[ielem].nod[0];
        nod2 = element[ielem].nod[1];

        if (nod1 === -2 && nod2 === -2) element[ielem].isActive = false;

        console.log("isActive", (+ielem + 1), element[ielem].isActive, nod1, nod2)

        if (element[ielem].isActive) {

            let fehler = 0;
            if (nod1 < 0) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod a) muss größer 0 sein'); fehler++; }
            if (nod2 < 0) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod e) muss größer 0 sein'); fehler++; }
            if (nod1 > (nnodes - 1)) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod a) muss <= Anzahl Knoten sein'); fehler++; }
            if (nod2 > (nnodes - 1)) { write('Element ' + (+ielem + 1) + ': Knoteninzidenz (nod e) muss <= Anzahl Knoten sein'); fehler++; }
            if (nod1 === nod2) { write('Element ' + (+ielem + 1) + ': Knoteninzidenzen für (nod a) und (nod e) muessen unterschiedlich sein'); fehler++; }

            if (fehler > 0) {
                fatal_error = true;
                write('Fataler Eingabefehler für Element ' + (+ielem + 1) + ', bitte als Erstes beheben\n')
                continue;
            }

            node[nod1].is_used = true
            node[nod2].is_used = true

            element[ielem].x1 = node[nod1].x;
            element[ielem].x2 = node[nod2].x;
            element[ielem].z1 = node[nod1].z;
            element[ielem].z2 = node[nod2].z;

            element[ielem].sl = 1.0   // Stablänge

            element[ielem].cosinus = 1.0
            element[ielem].sinus = 0.0
            element[ielem].alpha = 0.0

        }

        ielem++;
    }


}


//---------------------------------------------------------------------------------------------------------------
function read_kombinationen() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_kombinationen_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    kombiTabelle = Array.from(Array(nkombinationen), () => new Array(nlastfaelle).fill(0.0));
    kombiTabelle_txt = Array(nkombinationen);

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            if (ispalte === 1) kombiTabelle_txt[izeile - 1] = wert;
            else kombiTabelle[izeile - 1][ispalte - 2] = Number(testNumber(wert, izeile, ispalte, shad));
        }

        console.log("kombiTabelle", izeile, kombiTabelle[izeile - 1])
    }

    lastfall_bezeichnung = new Array(nlastfaelle);

    {
        const el = document.getElementById('id_lastfaelle_tabelle');
        const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        let nRowTab = table.rows.length;
        let nColTab = table.rows[0].cells.length;
        let wert: any;
        const shad = el?.shadowRoot?.getElementById('mytable')

        for (let izeile = 1; izeile < nRowTab; izeile++) {
            for (let ispalte = 1; ispalte < nColTab; ispalte++) {
                let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
                wert = child.value;
                lastfall_bezeichnung[izeile - 1] = wert;
            }

            console.log("lastfaelle_tabelle", izeile, lastfall_bezeichnung[izeile - 1])
        }
    }
}


//---------------------------------------------------------------------------------------------------------------
export function add_rechteck_querschnitt(werte: any[]) {
    //-----------------------------------------------------------------------------------------------------------
    // Diese Methode darf nur von dateien.ts beim Einlesen aus Datei verwendet werden

    console.log('add_rechteck_querschnitt wert', werte)

    incr_querschnittSets();

    const qname = werte[0]
    const id = werte[1]
    const emodul = werte[2]
    const Iy = werte[3]
    const area = werte[4]
    const height = werte[5]
    const width = werte[6]
    const defquerschnitt = werte[7]
    const wichte = werte[8]
    const schubfaktor = werte[9]
    const querdehnzahl = werte[10]
    const zso = werte[11]
    const alphaT = werte[12]

    set_querschnittRechteck(
        qname,
        id,
        emodul,
        Iy,
        area,
        height,
        width,
        defquerschnitt,
        wichte,
        schubfaktor,
        querdehnzahl,
        zso,
        alphaT
    );

    add_new_cross_section(qname, id);

    // var tag = document.createElement('sl-tree-item');
    // var text = document.createTextNode(qname);
    // tag.appendChild(text);
    // tag.addEventListener('click', opendialog);
    // tag.addEventListener("contextmenu", contextmenu_querschnitt);

    // tag.id = id;
    // var element = document.getElementById('id_tree_LQ');
    // element?.appendChild(tag);
    // //console.log('child appendchild', element);

    // const ele = document.getElementById('id_element_tabelle');
    // //console.log('ELE: >>', ele);
    // ele?.setAttribute('add_new_option', '4');

}

//---------------------------------------------------------------------------------------------------------------
export function init_tabellen() {
    //-----------------------------------------------------------------------------------------------------------



    // Querschnitt hinzufügen
    {

        incr_querschnittSets();
        querschnitts_zaehler = 0;

        const qname = 'R 40x30'
        const id = 'mat-' + querschnitts_zaehler;
        const emodul = 30000.
        const Iy = 160000.
        const area = 1200.
        const height = 40.
        const width = 30.
        const defquerschnitt = 1
        const wichte = 0.0
        const schubfaktor = 0.0
        const querdehnzahl = 0.2
        const zso = 20.0;
        const alphaT = 1.e-5

        set_querschnittRechteck(
            qname,
            id,
            emodul,
            Iy,
            area,
            height,
            width,
            defquerschnitt,
            wichte,
            schubfaktor,
            querdehnzahl,
            zso,
            alphaT
        );

        add_new_cross_section(qname, id);

    }

    let el = document.getElementById('id_element_tabelle');

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '0';
    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '2';

    (table.rows[2].cells[2].firstElementChild as HTMLInputElement).value = '0';
    (table.rows[2].cells[3].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[2].cells[4].firstElementChild as HTMLInputElement).value = '3';

    // el?.setAttribute("hide_column", String(9));
    // el?.setAttribute("hide_column", String(8));
    // el?.setAttribute("hide_column", String(6));
    // el?.setAttribute("hide_column", String(5));

    //(table.rows[2].cells[3].firstElementChild as HTMLInputElement).value = '2';
    //(table.rows[2].cells[4].firstElementChild as HTMLInputElement).value = '3';

    el = document.getElementById('id_knoten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '1';
    //(table.rows[1].cells[5].firstElementChild as HTMLInputElement).value = '1';

    (table.rows[2].cells[2].firstElementChild as HTMLInputElement).value = '-5';

    (table.rows[3].cells[1].firstElementChild as HTMLInputElement).value = '5';
    (table.rows[3].cells[2].firstElementChild as HTMLInputElement).value = '-5';
    (table.rows[3].cells[4].firstElementChild as HTMLInputElement).value = '1';


    el = document.getElementById('id_knotenlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[1].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '50';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '600';


    el = document.getElementById('id_streckenlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[1].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '5';
    (table.rows[1].cells[5].firstElementChild as HTMLInputElement).value = '5';

    el = document.getElementById('id_kombinationen_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    for (let i = 1; i <= Number(nlastfaelle_init); i++) {
        (table.rows[i].cells[i + 1].firstElementChild as HTMLInputElement).value = '1';

    }

    let elh = document.getElementById("id_koppelfedern_tabelle");   // Drehwinkel bei Koppelfedern nicht anzeigen
    elh?.setAttribute("hide_column", String(9));

    //  const eingabedaten = '{"version":0,"nnodes":5,"nelem":4,"nloads":1,"nstreckenlasten":3,"neinzellasten":1,"ntempload":0,"nloadcases":4,"ncombinations":1,"nquerschnittsets":1,"nstabvorverfomungen":0,"nelteilungen":10,"n_iter":11,"THIIO_flag":"1","maxU_node":"","maxU_dir":"1","maxU_schief":"","neigv":"1","nNodeDisps":0,"elem":[["IPE 400","","1","2","","","","","",""],["IPE 400","","2","3","","","","","","1"],["IPE 400","","3","4","","","","","",""],["IPE 400","","4","5","","","","","",""]],"node":[["-1","2","1","1","",""],["","-5","","","",""],["4","-6","","","",""],["8","-5","","","",""],["8","","1","1","",""]],"nodalLoad":[["2","1","50","500",""]],"streckenlasten":[["1","3","","5","5"],["2","2","2","6","5"],["3","2","2","5","6"]],"einzellasten":[["4","4","3","50",""]],"tempLoad":[],"stabvorverformung":[],"loadcases":[["Knotenlasten"],["Streckenlasten Projektion"],["Streckenlasten senkrecht"],["Elementeinzellast"]],"combination":[["","2","2","2","3"]],"qsclassname":["QuerschnittRechteck"],"qswerte":[["IPE 400","mat-0",210000,23130,84.5,40,18,3,78.5,0.4,0.3,20,0.0000012]],"nodeDisp0":[]}'
    //  read_daten(eingabedaten);
}

//---------------------------------------------------------------------------------------------------------------

function calc_neq_and_springs() {

    //-----------------------------------------------------------------------------------------------------------

    let i: number, j: number

    el.length = 0
    feder.length = 0

    // Berechnung der Gleichungsnummern bestimmen der Federn

    nelem_Federn = 0

    for (i = 0; i < nnodesTotal; i++) {

        let kx = 0.0, kz = 0.0, kphi = 0.0
        if (node[i].L[0] > 1.0) kx = node[i].L[0];
        if (node[i].L[1] > 1.0) kz = node[i].L[1];
        if (node[i].L[2] > 1.0) kphi = node[i].L[2];

        node[i].kx = kx
        node[i].kz = kz
        node[i].kphi = kphi

        // for (j = 0; j < 3; j++) {
        //     if (Math.abs(node[i].L[j]) === 1) {
        //         node[i].L[j] = -1;
        //     } else {
        //         node[i].L[j] = neq;
        //         neq = neq + 1;
        //     }
        // }

        let phi = node[i].phi * Math.PI / 180.0
        node[i].co = Math.cos(phi)
        node[i].si = Math.sin(phi)


        if (kx > 1.0 || kz > 1.0 || kphi > 1.0) {
            // neue feder einführen
            console.log("neue Feder gefunden", i, node[i].L, kx, kz, kphi)

            feder.push(new TSpring(i, kx, kz, kphi))
            node[i].spring_index = nelem + nelem_Federn;                  // index in el[]
            node[i].is_used = true
            nelemTotal++;
            nelem_Federn++;

        }
    }

    neq = 0;
    for (i = 0; i < nnodesTotal; i++) {

        if (node[i].is_used) {   // nur Knoten berücksichtigen, an denen Stäbe oder Federn hängen

            for (j = 0; j < 3; j++) {
                if (Math.abs(node[i].L[j]) === 1) {
                    node[i].L[j] = -1;
                } else {
                    node[i].L[j] = neq;
                    neq = neq + 1;
                }
            }
        } else {
            for (j = 0; j < 3; j++) node[i].L[j] = -1;
            write('\nWarnung: An Knoten ' + (+i + 1) + ' hängt kein Element')
        }
    }

    // Knotenlasten wirken in globalen Richtungen, auch bei gedrehten Lagern

    for (i = 0; i < nloads; i++) {
        let kn = load[i].node
        if (kn < nnodes) {
            load[i].p[0] = node[kn].co * load[i].Px - node[kn].si * load[i].Pz
            load[i].p[1] = node[kn].si * load[i].Px + node[kn].co * load[i].Pz
        }
    }

}

//---------------------------------------------------------------------------------------------------------------
function getMaterialIndex(ielem: number) {
    //---------------------------------------------------------------------------------------------------------------
    let j: number

    const qname = element[ielem].qname
    console.log("qname", qname, nQuerschnittSets)
    let index = -1;
    for (j = 0; j < nQuerschnittSets; j++) {
        console.log("qname", querschnittset[j].name)
        if (querschnittset[j].name === qname) {
            index = j;
            break;
        }
    }

    if (index === -1) {
        alert('element ' + ielem + ' hat keinen Querschnitt');
        return -1;
    }
    console.log("typeOf ", index, querschnittset[index].className)

    return index;
}

//---------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------

async function calculate() {


    //-----------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------

    let i: number, j: number

    let ielem: number

    //(document.getElementById('output') as HTMLTextAreaElement).value = ''; // Textarea output löschewn

    keineKonvergenzErreicht = false;
    keineKonvergenzErreicht_eigv = false;
    alpha_cr_2_low = false;

    let startTime: any
    let endTime: any
    //write('start read_daten')
    startTime = performance.now();


    const elem_darstellen = document.getElementById('id_element_darstellen') as HTMLSelectElement;

    while (elem_darstellen.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        elem_darstellen.removeChild(elem_darstellen?.lastChild);
    }

    let option: any
    for (let i = 0; i < nelem; i++) {
        option = document.createElement('option');
        option.value = String(i)
        option.textContent = 'Element ' + (+i + 1);
        elem_darstellen.appendChild(option);
    }

    calc_neq_and_springs();



    // vorgegebene Knotenverformungen den Elementlasten zuordnen

    let nElNodeDisps = 0
    for (i = 0; i < nNodeDisps; i++) {
        for (j = 0; j < nelem_Balken + nelem_koppelfedern; j++) {
            if (nodeDisp0[i].node === element[j].nod[0] || nodeDisp0[i].node === element[j].nod[1]) {
                nElNodeDisps = nElNodeDisps + 1
                eload.push(new TElLoads())
                eload[ntotalEloads].art = 8
                eload[ntotalEloads].element = j
                eload[ntotalEloads].dispx0 = nodeDisp0[i].dispx0 / 1000.0   // von mm in m
                eload[ntotalEloads].dispz0 = nodeDisp0[i].dispz0 / 1000.0
                eload[ntotalEloads].phi0 = nodeDisp0[i].phi0 / 1000.0       // von mrad in rad
                eload[ntotalEloads].node0 = nodeDisp0[i].node
                eload[ntotalEloads].lf = nodeDisp0[i].lf

                if (nodeDisp0[i].dispx0 !== 0) eload[ntotalEloads].ieq0[0] = node[nodeDisp0[i].node].L[0];
                if (nodeDisp0[i].dispz0 !== 0) eload[ntotalEloads].ieq0[1] = node[nodeDisp0[i].node].L[1];
                if (nodeDisp0[i].phi0 !== 0) eload[ntotalEloads].ieq0[2] = node[nodeDisp0[i].node].L[2];

                ntotalEloads++;
            }
        }
    }
    for (i = 0; i < nNodeDisps; i++) {
        for (j = 0; j < nelem_Federn; j++) {
            if (nodeDisp0[i].node === feder[j].nod) {
                nElNodeDisps = nElNodeDisps + 1
                eload.push(new TElLoads())
                eload[ntotalEloads].art = 8
                eload[ntotalEloads].element = j + nelem
                eload[ntotalEloads].dispx0 = nodeDisp0[i].dispx0 / 1000.0   // von mm in m
                eload[ntotalEloads].dispz0 = nodeDisp0[i].dispz0 / 1000.0
                eload[ntotalEloads].phi0 = nodeDisp0[i].phi0 / 1000.0       // von mrad in rad
                eload[ntotalEloads].node0 = nodeDisp0[i].node
                eload[ntotalEloads].lf = nodeDisp0[i].lf

                if (nodeDisp0[i].dispx0 !== 0) eload[ntotalEloads].ieq0[0] = node[nodeDisp0[i].node].L[0];
                if (nodeDisp0[i].dispz0 !== 0) eload[ntotalEloads].ieq0[1] = node[nodeDisp0[i].node].L[1];
                if (nodeDisp0[i].phi0 !== 0) eload[ntotalEloads].ieq0[2] = node[nodeDisp0[i].node].L[2];

                ntotalEloads++;
            }
        }
    }

    neloads = ntotalEloads;

    if (THIIO_flag === 1 || matprop_flag === 1) {

        stabvorverformung_komb.length = 0
        stabvorverformung_komb = Array(nelem);
        for (i = 0; i < nelem; i++) {
            stabvorverformung_komb[i] = Array(nkombinationen);
            for (j = 0; j < nkombinationen; j++) {
                stabvorverformung_komb[i][j] = new TStabvorverformung_komb;
            }
        }
        maxValue_w0.length = 0
        maxValue_w0 = Array(nkombinationen).fill(0.0)

        //console.log("stabvorverformung_komb", stabvorverformung_komb[0])
        for (ielem = 0; ielem < nelem; ielem++) {
            for (let ikomb = 0; ikomb < nkombinationen; ikomb++) {
                stabvorverformung_komb[ielem][ikomb].w0a = 0.0
                stabvorverformung_komb[ielem][ikomb].w0e = 0.0
                stabvorverformung_komb[ielem][ikomb].w0m = 0.0
                for (i = 0; i < nstabvorverfomungen; i++) {

                    if (stabvorverformung[i].element === ielem) {
                        const index = stabvorverformung[i].lf - 1
                        //console.log("kombiTabelle",ielem,ikomb,i,index,kombiTabelle[ikomb][index])
                        stabvorverformung_komb[ielem][ikomb].w0a += stabvorverformung[i].p[0] * kombiTabelle[ikomb][index]
                        stabvorverformung_komb[ielem][ikomb].w0e += stabvorverformung[i].p[1] * kombiTabelle[ikomb][index]
                        stabvorverformung_komb[ielem][ikomb].w0m += stabvorverformung[i].p[2] * kombiTabelle[ikomb][index]
                    }
                }
            }
        }

        for (ielem = 0; ielem < nelem; ielem++) {
            for (let ikomb = 0; ikomb < nkombinationen; ikomb++) {
                if (stabvorverformung_komb[ielem][ikomb].w0a != 0.0 || stabvorverformung_komb[ielem][ikomb].w0e != 0.0 || stabvorverformung_komb[ielem][ikomb].w0m != 0.0) {
                    stabvorverformung_komb[ielem][ikomb].defined = true;
                } else {
                    stabvorverformung_komb[ielem][ikomb].defined = false;
                }
                let wm = (stabvorverformung_komb[ielem][ikomb].w0a + stabvorverformung_komb[ielem][ikomb].w0e) / 2.0 + stabvorverformung_komb[ielem][ikomb].w0m;
                maxValue_w0[ikomb] = Math.max(maxValue_w0[ikomb], Math.abs(stabvorverformung_komb[ielem][ikomb].w0a), Math.abs(stabvorverformung_komb[ielem][ikomb].w0e), Math.abs(wm))
            }
        }

        // for (i = 0; i < nelem; i++) {
        //     for (j = 0; j < nkombinationen; j++) console.log('stabvorverformung_komb, ielem, ikomb',i,j,stabvorverformung_komb[i][j]);
        // }
        // console.log("stabvorverformung_komb[i][j]",stabvorverformung_komb)
    }


    // für die Grafik

    xmin = 1.e30
    zmin = 1.e30
    xmax = -1.e30
    zmax = -1.e30

    for (i = 0; i < nnodes; i++) {
        if (node[i].x < xmin) xmin = node[i].x;
        if (node[i].z < zmin) zmin = node[i].z;
        if (node[i].x > xmax) xmax = node[i].x;
        if (node[i].z > zmax) zmax = node[i].z;
    }

    slmax = Math.sqrt((xmax - xmin) ** 2 + (zmax - zmin) ** 2)

    for (i = 0; i < nlastfaelle; i++) {
        maxValue_lf.push(new TMaxValues());
        maxValue_lf[i].zero();
    }

    for (i = 0; i < nkombinationen; i++) {
        maxValue_komb.push(new TMaxValues());
        maxValue_komb[i].zero();
        maxValue_u0.push(new TMaxU0);
    }

    console.log("N E I G V", neigv)
    if (nkombinationen > 0) maxValue_eigv = Array.from(Array(nkombinationen), () => new Array(neigv).fill(0.0));

    console.log("Anzahl Gleichungen: ", neq)

    let emodul: number = 0.0, ks: number = 0.0, wichte: number = 0.0, definedQuerschnitt = 1
    let querdehnzahl: number = 0.3, schubfaktor: number = 0.833, zso: number = 0.0, alphaT = 0.0
    let nfiber: number = 2, maxfiber: number = 5, offset_abstand: number = 0.0, height: number = 0.0, width = 0.0
    let Iy: number = 0.0, area: number = 0.0, b: number;
    let lmj: number = 0, nod1: number, nodi: number

    let breite: number[] = Array(2)
    let abstand: number[] = Array(2)

    console.log("NELEM=", nelem)
    for (ielem = 0; ielem < nelem; ielem++) {

        // get material data

        // const qname = element[ielem].qname
        // console.log("qname", qname, nQuerschnittSets)
        // let index = -1;
        // for (j = 0; j < nQuerschnittSets; j++) {
        //     console.log("qname", querschnittset[j].name)
        //     if (querschnittset[j].name === qname) {
        //         index = j;
        //         break;
        //     }
        // }

        // if (index === -1) {
        //     alert('element ' + ielem + ' hat keinen Querschnitt');
        //     return -1;
        // }
        // console.log("typeOf ", index, querschnittset[index].className)

        let index = getMaterialIndex(ielem);
        if (index === -1) return index;

        if (querschnittset[index].className === 'QuerschnittRechteck') {   //  linear elastisch
            console.log('es ist ein Rechteck')
            emodul = querschnittset[index].emodul * 1000.0   // in kN/m²
            wichte = querschnittset[index].wichte
            definedQuerschnitt = querschnittset[index].definedQuerschnitt
            querdehnzahl = querschnittset[index].querdehnzahl
            schubfaktor = querschnittset[index].schubfaktor
            zso = querschnittset[index].zso / 100.0   // von cm in m
            alphaT = querschnittset[index].alphaT

            nfiber = 2
            maxfiber = 3 * (nfiber - 1)
            height = querschnittset[index].height / 100.0     // in m
            width = querschnittset[index].width / 100.0     // in m
            if (definedQuerschnitt === 1) {
                b = width
                area = width * height
                Iy = area * height * height / 12.0
                console.log("A, Iy", area, Iy)
            } else {
                Iy = querschnittset[index].Iy / 100000000.0
                area = querschnittset[index].area / 10000.0
                b = Math.sqrt(area * area * area / Iy / 12.0)      // in m
                console.log("BREITE=", b, Iy)
            }
            breite[0] = b
            breite[1] = b
            abstand[0] = 0.0
            abstand[1] = height
            offset_abstand = height / 2.0       // in m

        }

        if (System === STABWERK) {
            if (element[ielem].elTyp === 1) el.push(new CTruss());
            else el.push(new CTimoshenko_beam());

        } else el.push(new CTruss());

        el[ielem].setQuerschnittsdaten(emodul, Iy, area, wichte, ks, querdehnzahl, schubfaktor, height, zso, alphaT)
        el[ielem].initialisiereElementdaten(ielem)
    }


    // Koppelfedern addieren

    for (let ifeder = 0; ifeder < nelem_koppelfedern; ifeder++) {
        el.push(new CKoppelfeder(element[ifeder + nelem_Balken].mat_koppelfeder));
        el[ifeder + nelem_Balken].initialisiereElementdaten(ifeder + nelem_Balken)
    }
    find_maxValues_eloads(neloads);  // Skalierung für grafiache Darstellung der Streckenlasten, jetzt mit Eigengewicht

    // Federn addieren

    for (let ifeder = 0; ifeder < nelem_Federn; ifeder++) {
        el.push(new CSpring(feder[ifeder].getNode(), feder[ifeder].getKx(), feder[ifeder].getKz(), feder[ifeder].getKphi()))
        el[ifeder + nelem_Balken + nelem_koppelfedern].initialisiereElementdaten(ielem)
    }

    console.log("TOTALS,nelemTotal,nnodesTotal ", nelemTotal, nnodesTotal)
    for (ielem = 0; ielem < el.length; ielem++) {
        el[ielem].ich_bin(ielem);
    }

    const stiff = Array.from(Array(neq), () => new Array(neq).fill(0.0));
    stm = Array.from(Array(neq), () => new Array(neq));    // Gleichungssystem für Ausdruck
    R_ = Array(neq);
    U_ = Array(neq);

    R_internal = Array(neq);

    const R = Array(neq);
    const u = Array(neq);

    lagerkraft = Array.from(Array(nnodesTotal), () => new Array(3).fill(0.0));

    if (stadyn === 1) {
        print_mass = Array.from(Array(neq), () => new Array(neq));    // Gesamtmassenmatrix für Ausdruck
    }

    if (nkombinationen > 0) {
        max_S_kombi = Array.from(Array(3), () => new Array(nkombinationen).fill(0.0));
        max_disp_kombi = Array(nkombinationen).fill(0.0)
        max_press_kombi = Array(nkombinationen).fill(0.0)
    }

    //------------------------------------------------------------------------   alte Ausgabe löschen
    let elem = document.getElementById('id_newDiv');
    if (elem !== null) elem.parentNode?.removeChild(elem);

    const myResultDiv = document.getElementById("id_results");  //in div
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", "id_newDiv");
    myResultDiv?.appendChild(newDiv);
    //------------------------------------------------------------------------

    if (stadyn === 0) {


        if (matprop_flag === 1) {   // nichtlineare Berechnung
            nonlinear(stiff, R, u, newDiv)
        }

        else if (THIIO_flag === 0) { // Theorie I.Ordnung

            disp_lf = new TFArray3D(1, nnodesTotal, 1, 3, 1, nlastfaelle);   // nlastfaelle
            disp_print = new TFArray3D(1, nnodesTotal, 1, 3, 1, nlastfaelle);   // nlastfaelle
            console.log("nlastfaelle", nlastfaelle)
            stabendkraefte = new TFArray3D(1, 6, 1, nelemTotal, 1, nlastfaelle);   // nlastfaelle
            lagerkraefte = new TFArray3D(0, nnodes - 1, 0, 2, 0, nlastfaelle - 1);
            if (nNodeDisps > 0) { nodeDisp0Force = new TFArray3D_0(nNodeDisps, 3, nlastfaelle); nodeDisp0Force.zero(); }
            u_lf = Array.from(Array(neq), () => new Array(nlastfaelle).fill(0.0));

            for (let iLastfall = 1; iLastfall <= nlastfaelle; iLastfall++) {

                for (i = 0; i < neq; i++) stiff[i].fill(0.0);

                R.fill(0.0);
                u.fill(0.0);
                R_internal.fill(0.0)

                for (i = 0; i < nnodesTotal; i++) lagerkraft[i].fill(0.0)

                for (ielem = 0; ielem < nelemTotal; ielem++) {

                    if (el[ielem].isActive) {

                        el[ielem].berechneElementsteifigkeitsmatrix(0);
                        el[ielem].addiereElementsteifigkeitmatrix(stiff)

                        for (let ieload = 0; ieload < neloads; ieload++) {
                            //console.log("********************************", ielem, ieload, eload[ieload].element)
                            if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastfall)) {
                                el[ielem].berechneElementlasten(ieload)
                            }
                        }
                    }
                }

                // for (j = 0; j < neq; j++) {
                //     console.log('stiff[]', stiff[j])
                // }

                // Aufstellen der rechte Seite, Einzellasten


                for (i = 0; i < nloads; i++) {
                    if (load[i].lf === iLastfall) {
                        nod1 = load[i].node
                        for (j = 0; j < 3; j++) {
                            lmj = node[nod1].L[j]
                            if (lmj >= 0) {
                                R[lmj] = R[lmj] + load[i].p[j]
                            }
                        }
                    }
                }

                //  und jetzt noch die normalen Elementlasten

                for (ielem = 0; ielem < nelem_Balken + nelem_koppelfedern; ielem++) {

                    if (el[ielem].isActive) {

                        for (let ieload = 0; ieload < neloads; ieload++) {
                            if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastfall)) {
                                for (j = 0; j < el[ielem].neqeG; j++) {
                                    lmj = el[ielem].lm[j]
                                    if (lmj >= 0) {
                                        R[lmj] = R[lmj] - eload[ieload].el_r[j]
                                    }
                                }
                            }
                        }
                    }
                }

                // wenn mindestens eine vorgegebene Knotenverschiebung im Lastfall vorhanden ist,
                // dann für diese Freiheitsgrade Zeilen und Spalten bearbeiten

                for (let ieload = 0; ieload < neloads; ieload++) {

                    if ((eload[ieload].art === 8) && (eload[ieload].lf === iLastfall)) {
                        console.log("VORDEFINIERTE VERFORMUNGEN", eload[ieload].ieq0)

                        for (let k = 0; k < 3; k++) {

                            if (eload[ieload].ieq0[k] >= 0) {
                                let ieq = eload[ieload].ieq0[k]
                                console.log("I E Q ", ieq)
                                for (i = 0; i < neq; i++) {
                                    stiff[i][ieq] = 0.0   // Spalte streichen
                                    stiff[ieq][i] = 0.0   // Zeile streichen
                                }
                                stiff[ieq][ieq] = 1000.0
                                R[ieq] = 0.0
                            }
                        }
                    }
                }

                // for (j = 0; j < neq; j++) {
                //     console.log('stiff[]', stiff[j])
                // }
                for (i = 0; i < neq; i++) {  // merken für Ausdruck in Tab Pro
                    for (j = 0; j < neq; j++) {
                        stm[i][j] = stiff[i][j]
                    }
                }


                for (i = 0; i < neq; i++) {
                    //console.log("R", i, R[i])
                    R_[i] = R[i];
                }

                // Gleichungssystem lösen

                let error = -1
                if (equation_solver === 1) {
                    error = gauss(neq, stiff, R);
                } else {
                    error = cholesky_solve_equation(stiff, R);
                }
                if (error != 0) {
                    //window.alert("Gleichungssystem singulär");

                    const dialogAlert = new AlertDialog({
                        trueButton_Text: "ok",
                        question_Text: "Steifigkeitsmatrix nicht positiv definit. " +
                            "Mögliche Ursache: das System ist vermutlich kinematisch.",
                    });
                    await dialogAlert.confirm();

                    return 1;
                }

                for (i = 0; i < neq; i++) u[i] = R[i];
                for (i = 0; i < neq; i++) U_[i] = R[i];

                for (i = 0; i < neq; i++) {
                    console.log("U", i, u[i] * 1000.0)    // in mm, mrad
                    u_lf[i][iLastfall - 1] = u[i]
                }

                // ----------- R ü c k r e c h n u n g -----------


                let force: number[] = Array(6)
                //console.log("LAGERKRAFT 0 rechnen", lagerkraft)

                for (ielem = 0; ielem < nelemTotal; ielem++) {

                    if (el[ielem].isActive) {

                        force = el[ielem].berechneInterneKraefte(ielem, iLastfall, 0, u);
                        //console.log("force", el[ielem].neqe, force)
                        for (i = 0; i < el[ielem].neqe; i++) stabendkraefte.set(i + 1, ielem + 1, iLastfall, force[i]);

                        el[ielem].berechneLagerkraefte();
                        //console.log("LAGERKRAFT rechnen", lagerkraft)
                        //for (i = 0; i < nnodes; i++) console.log("LAger", lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
                    }
                }

                {

                    for (let ieload = 0; ieload < neloads; ieload++) {

                        if ((eload[ieload].art === 8) && (eload[ieload].lf === iLastfall)) {
                            //console.log("VORDEFINIERTE VERFORMUNGEN", eload[ieload].ieq0)

                            for (let k = 0; k < 3; k++) {

                                if (eload[ieload].ieq0[k] >= 0) {
                                    let ieq = eload[ieload].ieq0[k]
                                    //console.log("I E Q ", ieq)
                                    R_internal[ieq] = 0.0
                                }
                            }
                        }
                    }

                    let zaehler = 0.0, nenner = 0.0
                    for (let i = 0; i < neq; i++) {
                        zaehler += (R_[i] - R_internal[i]) ** 2
                        nenner += R_[i] * R_[i]
                        //console.log("R_internal -- ", iLastfall, i, R_[i], R_internal[i], R_[i] - R_internal[i])
                    }
                    zaehler = Math.sqrt(zaehler)
                    nenner = Math.sqrt(nenner)
                    let eps_force = 0.0
                    if (nenner !== 0.0) eps_force = zaehler / nenner;
                    write('Toleranz eps_force in Lastfall ' + iLastfall + ' = ' + myFormat(eps_force, 5, 5, 1))

                    if (eps_force < epsForce_tol) {
                        write('Toleranz bei den Kräften eingehalten')
                    } else {
                        write('++++ geforderte Genauigkeit bei den Kräften nicht erreicht, das System auf mögliche Kinematiken überprüfen')
                        keineKonvergenzErreicht = true
                    }
                }

                let disp = Array(3)
                for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                    for (j = 0; j < 3; j++) {
                        let ieq = node[i].L[j]
                        if (ieq === -1) {
                            disp[j] = 0
                        } else {
                            disp[j] = u[ieq] * 1000     // Umrechnung in mm und mrad
                        }
                    }

                    for (j = 0; j < 3; j++) {
                        disp_lf.set(i + 1, j + 1, iLastfall, disp[j])
                        if (Math.abs(disp[j]) > maxValue_lf[iLastfall - 1].disp) maxValue_lf[iLastfall - 1].disp = Math.abs(disp[j])
                    }

                    // Knotenverformungen wieder einarbeiten

                    for (j = 0; j < nNodeDisps; j++) {
                        if (nodeDisp0[j].node === i && nodeDisp0[j].lf === iLastfall) {
                            console.log("<<<<<<<<<<<<<<< nNodeDisps >>>>>>>>>>>>>", i, nodeDisp0[j].lf, iLastfall)
                            if (nodeDisp0[j].dispx0 !== 0) {
                                disp[0] = nodeDisp0[j].dispx0 // 1000.0
                            }
                            if (nodeDisp0[j].dispz0 !== 0) {
                                disp[1] = nodeDisp0[j].dispz0 // 1000.0
                            }
                            if (nodeDisp0[j].phi0 !== 0) {
                                disp[2] = nodeDisp0[j].phi0   // 1000.
                            }

                        }
                    }
                    for (j = 0; j < 3; j++) disp_print.set(i + 1, j + 1, iLastfall, disp[j])

                }

                // for (i = 0; i < nnodes; i++) {
                //     console.log("lagerkraft", lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
                // }

                for (i = 0; i < nloads; i++) {                          // Knotenlasten am Knoten abziehen
                    if (load[i].lf === iLastfall) {
                        nodi = load[i].node
                        lagerkraft[nodi][0] = lagerkraft[nodi][0] + load[i].p[0]
                        lagerkraft[nodi][1] = lagerkraft[nodi][1] + load[i].p[1]
                        lagerkraft[nodi][2] = lagerkraft[nodi][2] + load[i].p[2]
                    }
                }

                if (nNodeDisps > 0) {
                    for (let k = 0; k < nNodeDisps; k++) {
                        for (let j = 0; j < 3; j++) {
                            if (nodeDisp0[k].dispL[j] && nodeDisp0[k].lf === iLastfall) {
                                nodi = nodeDisp0[k].node
                                //console.log("~~~~~ nodeDisp0Force", k, j, iLastfall, nodi, lagerkraft[nodi][j])
                                nodeDisp0Force.set(k, j, iLastfall - 1, -lagerkraft[nodi][j]);
                                if (node[nodi].L_org[j] !== 1) lagerkraft[nodi][j] = 0.0   // kein starres Lager
                            }
                        }
                    }

                }


                if (nelem_Federn > 0) {                        // Federkraefte in lagerkraft[] Tabelle eintragen
                    for (i = 0; i < nelem_Federn; i++) {

                        let iFeder = i + nelem_Balken + nelem_koppelfedern
                        //console.log("FEDER hängt an Knoten", el[iFeder].nod)
                        nodi = el[iFeder].nod
                        for (let j = 0; j < 3; j++) {
                            // Federkräfte in Lagerkraft[] eintragen
                            if (node[nodi].L_org[j] > 1) {
                                lagerkraft[nodi][j] = stabendkraefte._(j + 1, iFeder + 1, iLastfall)
                            }
                        }
                    }
                }

                for (let inode = 0; inode < nnodes; inode++) {
                    lagerkraefte.set(inode, 0, iLastfall - 1, lagerkraft[inode][0]);
                    lagerkraefte.set(inode, 1, iLastfall - 1, lagerkraft[inode][1]);
                    lagerkraefte.set(inode, 2, iLastfall - 1, lagerkraft[inode][2]);
                }

                //for (i = 0; i < nnodesTotal; i++) {
                //    console.log("Lager", i + 1, lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
                //}

                for (ielem = 0; ielem < nelem_Balken + nelem_koppelfedern; ielem++) {
                    if (el[ielem].isActive) el[ielem].berechneElementSchnittgroessen(ielem, iLastfall - 1);
                }


                ausgabe(iLastfall, newDiv)

            }   //ende iLastfall

            if (nkombinationen > 0) {
                lagerkraefte_kombi = new TFArray3D(0, nnodes - 1, 0, 2, 0, nkombinationen - 1);
                disp_print_kombi = new TFArray3D(1, nnodesTotal, 1, 3, 1, nkombinationen);
                berechne_kombinationen();
                ausgabe_kombinationen_Th_I_O(newDiv);
            }
        }


        // -------------------------------------------------------------------------------------------------------  T H  II.  O R D N U N G

        else if (THIIO_flag === 1) {

            let eps_disp = 1.0, eps_force = 0.0, iter = 0

            if (nkombinationen < 1) {
                window.alert("Es muss mindestens eine Kombination definiert sein");

                let element = document.getElementById("id_tab_kombi"); // id_eingabe
                element?.click();

                return 1;
            }

            const stiff_sig = Array.from(Array(neq), () => new Array(neq).fill(0.0));

            disp_lf = new TFArray3D(1, nnodesTotal, 1, 3, 1, nkombinationen);
            disp_print = new TFArray3D(1, nnodesTotal, 1, 3, 1, nkombinationen);
            u_lf = Array.from(Array(neq), () => new Array(nkombinationen).fill(0.0));
            u0_komb = Array.from(Array(neq), () => new Array(nkombinationen).fill(0.0));

            const u_last = Array(neq);

            //console.log("nkombinationen", nkombinationen)
            stabendkraefte = new TFArray3D(1, 6, 1, nelemTotal, 1, nkombinationen);
            lagerkraefte = new TFArray3D(0, nnodes - 1, 0, 2, 0, nkombinationen - 1);
            if (nNodeDisps > 0) { nodeDisp0Force = new TFArray3D_0(nNodeDisps, 3, nkombinationen); nodeDisp0Force.zero(); }
            eigenform_container_node.length = 0
            eigenform_container_u.length = 0
            for (let i = 0; i < nkombinationen; i++) {
                let a = new TFArray3D(1, nnodesTotal, 1, 3, 1, neigv)
                eigenform_container_node.push(a)

                let b = new TFArray2D(0, neq - 1, 1, neigv)
                eigenform_container_u.push(b)
            }
            alpha_cr = Array.from(Array(nkombinationen), () => new Array(neigv).fill(0.0));

            for (ielem = 0; ielem < nelem; ielem++) {
                if (el[ielem].isActive) {
                    for (let ieload = 0; ieload < neloads; ieload++) {
                        if ((eload[ieload].element === ielem) && (eload[ieload].art !== 8)) el[ielem].berechneElementlasten(ieload)
                    }
                }
            }


            let pg = new Array(neq)

            for (let iKomb = 1; iKomb <= nkombinationen; iKomb++) {

                pg.fill(0.0)
                u_last.fill(0.0);

                for (ielem = 0; ielem < nelemTotal; ielem++) {
                    if (el[ielem].isActive) {
                        el[ielem].reset_element();
                    }
                }

                console.log("\n***************  K O M B I N A T I O N ", iKomb, "\n\n")
                write("\n***************  K O M B I N A T I O N   " + iKomb + "\n")

                for (iter = 0; iter < n_iterationen; iter++) {

                    console.log("_________________  I T E R  = ", iter, " ___________________")

                    //console.log("^^^^^^^^^^^^ P G ", pg)

                    for (i = 0; i < neq; i++) stiff[i].fill(0.0);
                    for (i = 0; i < nnodesTotal; i++) lagerkraft[i].fill(0.0)

                    R.fill(0.0);
                    u.fill(0.0);
                    R_internal.fill(0.0)

                    for (ielem = 0; ielem < nelemTotal; ielem++) {

                        if (el[ielem].isActive) {

                            el[ielem].berechneElementsteifigkeitsmatrix(iter);
                            el[ielem].addiereElementsteifigkeitmatrix(stiff)
                            /*
                                                for (let ieload = 0; ieload < neloads; ieload++) {
                                                    if ((eload[ieload].element === ielem) && (eload[ieload].lf === iKomb)) {
                                                        el[ielem].berechneElementlasten(ieload)
                                                    }
                                                }
                            */
                        }
                    }

                    // for (j = 0; j < neq; j++) {
                    //     console.log('stiff[]', stiff[j])
                    // }

                    // Aufstellen der rechte Seite, Einzellasten


                    for (i = 0; i < nloads; i++) {
                        const index = load[i].lf - 1
                        if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                            nod1 = load[i].node
                            for (j = 0; j < 3; j++) {
                                lmj = node[nod1].L[j]
                                if (lmj >= 0) {
                                    R[lmj] = R[lmj] + load[i].p[j] * kombiTabelle[iKomb - 1][index]
                                }
                            }
                        }
                    }
                    // console.log("R Einzellasten", R)

                    //  und jetzt noch die normalen Elementlasten

                    for (ielem = 0; ielem < nelemTotal; ielem++) {

                        if (el[ielem].isActive) {

                            console.log("ELEMENTLASTEN,ielem", ielem)
                            for (let ieload = 0; ieload < neloads; ieload++) {
                                if (eload[ieload].element === ielem) {
                                    const index = eload[ieload].lf - 1
                                    console.log("elem kombi index,art", index, kombiTabelle[iKomb - 1][index], eload[ieload].art)
                                    if (kombiTabelle[iKomb - 1][index] !== 0.0) {

                                        if (eload[ieload].art === 8) el[ielem].berechneElementlasten(ieload)

                                        for (j = 0; j < el[ielem].neqeG; j++) {
                                            lmj = el[ielem].lm[j]
                                            if (lmj >= 0) {
                                                R[lmj] = R[lmj] - eload[ieload].el_r[j] * kombiTabelle[iKomb - 1][index]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // console.log("R mit Elementlasten", R)

                    //for (i = 0; i < neq; i++) R[i] -= pg[i]   // Schiefstellung

                    if (iter > 0) {

                        let pel = new Array(10).fill(0.0)
                        //let FeStabvor = new Array(10).fill(0.0)   // Stabvorverformungen

                        for (ielem = 0; ielem < nelem; ielem++) {
                            if (el[ielem].isActive) {
                                el[ielem].berechneElementlasten_Vorverformung(pel, pg, iKomb - 1)
                                //console.log("P E L", ielem, pel)

                                for (j = 0; j < el[ielem].neqeG; j++) {
                                    lmj = el[ielem].lm[j]
                                    if (lmj >= 0) {
                                        R[lmj] = R[lmj] - pel[j]
                                    }
                                }
                            }
                        }
                    }


                    // wenn mindestens eine vorgegebenen Knotenverschiebung im der Kombination vorhanden ist,
                    // dann für diese Freiheitsgrade Zeilen und Spalten bearbeiten

                    for (let ieload = 0; ieload < neloads; ieload++) {
                        const index = eload[ieload].lf - 1
                        if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                            if ((eload[ieload].art === 8)) {         // && (eload[ieload].lf === iLastfall)
                                console.log("VORDEFINIERTE VERFORMUNGEN", eload[ieload].ieq0)

                                for (let k = 0; k < 3; k++) {

                                    if (eload[ieload].ieq0[k] >= 0) {
                                        let ieq = eload[ieload].ieq0[k]
                                        console.log("I E Q ", ieq)
                                        for (i = 0; i < neq; i++) {
                                            stiff[i][ieq] = 0.0   // Spalte streichen
                                            stiff[ieq][i] = 0.0   // Zeile streichen
                                        }
                                        stiff[ieq][ieq] = 1000.0
                                        R[ieq] = 0.0
                                    }
                                }
                            }
                        }
                    }



                    for (i = 0; i < neq; i++) {
                        console.log("R", i, R[i])
                        R_[i] = R[i];
                    }

                    for (i = 0; i < neq; i++) {
                        for (j = 0; j < neq; j++) {
                            stm[i][j] = stiff[i][j]
                        }
                    }

                    // Gleichungssystem lösen

                    let error = -1
                    if (equation_solver === 1) {
                        error = gauss(neq, stiff, R);
                    } else {
                        error = cholesky_solve_equation(stiff, R);
                    }
                    if (error != 0) {
                        //window.alert("Gleichungssystem singulär");

                        const dialogAlert = new AlertDialog({
                            trueButton_Text: "ok",
                            question_Text: "Steifigkeitsmatrix nicht positiv definit in Kombination " + iKomb + ". " +
                                "Mögliche Ursachen: Lasten zu hoch in dieser Kombination. Tritt die Meldung auch bei einer Berechnung " +
                                "nach Th. I. Ordnung auf, dann ist das System kinematisch.",
                        });
                        await dialogAlert.confirm();

                        return 1;
                    }
                    // let error = gauss(neq, stiff, R);
                    // if (error != 0) {
                    //     window.alert("Gleichungssystem singulär");
                    //     return 1;
                    // }

                    for (i = 0; i < neq; i++) u[i] = R[i];
                    for (i = 0; i < neq; i++) U_[i] = R[i];

                    for (i = 0; i < neq; i++) {
                        console.log("U", i, u[i] * 1000.0)    // in mm, mrad
                        u_lf[i][iKomb - 1] = u[i]
                    }

                    // Rückrechnung

                    let force: number[] = Array(6)

                    for (ielem = 0; ielem < nelemTotal; ielem++) {
                        if (el[ielem].isActive) {
                            force = el[ielem].berechneInterneKraefte(ielem, iKomb, iter, u);
                            //console.log("force", force)
                            for (i = 0; i < 6; i++) stabendkraefte.set(i + 1, ielem + 1, iKomb, force[i]);

                            el[ielem].berechneLagerkraefte();
                        }
                    }

                       for (let ieload = 0; ieload < neloads; ieload++) {
                        const index = eload[ieload].lf - 1
                        if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                            if ((eload[ieload].art === 8)) {

                                for (let k = 0; k < 3; k++) {

                                    if (eload[ieload].ieq0[k] >= 0) {
                                        let ieq = eload[ieload].ieq0[k]
                                        R_internal[ieq] = 0.0
                                    }
                                }
                            }
                        }
                    }

                    // Überprüfe Konvergenz der Verformungen und Kräfte

                    {
                        let zaehler = 0.0, nenner = 0.0
                        for (let i = 0; i < neq; i++) {
                            zaehler += (u[i] - u_last[i]) ** 2
                            nenner += u[i] * u[i]
                        }
                        zaehler = Math.sqrt(zaehler)
                        nenner = Math.sqrt(nenner)
                        if (nenner === 0.0) eps_disp = 0.0;
                        else eps_disp = zaehler / nenner;
                        //write('Toleranz eps in Iterationsschritt ' + iter + ' = ' + eps_disp)

                        for (let i = 0; i < neq; i++) u_last[i] = u[i];

                        zaehler = 0.0; nenner = 0.0
                        for (let i = 0; i < neq; i++) {
                            zaehler += (R_[i] - R_internal[i]) ** 2
                            nenner += R_[i] * R_[i]
                        }
                        zaehler = Math.sqrt(zaehler)
                        nenner = Math.sqrt(nenner)
                        eps_force = 0.0
                        if (nenner !== 0.0) eps_force = zaehler / nenner;
                        //write('Toleranz eps_force in Iterationsschritt ' + iter + ' = ' + eps_force)
                        write('Toleranz in Iterationsschritt ' + iter + ', eps_disp = ' + myFormat(eps_disp,5,5,1) + ', eps_force = ' + myFormat(eps_force,5,5,51))


                    }

                    if ((iter === n_iterationen - 1) || (eps_disp < epsDisp_tol)) {
                        let disp = [3]
                        for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                            for (j = 0; j < 3; j++) {
                                let ieq = node[i].L[j]
                                if (ieq === -1) {
                                    disp[j] = 0
                                } else {
                                    disp[j] = u[ieq] * 1000     // Umrechnung in mm und mrad
                                }
                            }

                            for (j = 0; j < 3; j++) {
                                disp_lf.set(i + 1, j + 1, iKomb, disp[j])
                                if (Math.abs(disp[j]) > maxValue_komb[iKomb - 1].disp) maxValue_komb[iKomb - 1].disp = Math.abs(disp[j])
                            }

                            // Knotenverformungen wieder einarbeiten

                            for (j = 0; j < nNodeDisps; j++) {
                                for (let ieload = 0; ieload < neloads; ieload++) {
                                    const index = eload[ieload].lf - 1
                                    if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                                        if (nodeDisp0[j].node === i) {
                                            //console.log("<<<<<<<<<<<<<<< nNodeDisps >>>>>>>>>>>>>", i, nodeDisp0[j].lf, iKomb)
                                            if (nodeDisp0[j].dispx0 !== 0) {
                                                disp[0] = nodeDisp0[j].dispx0 * kombiTabelle[iKomb - 1][index]
                                            }
                                            if (nodeDisp0[j].dispz0 !== 0) {
                                                disp[1] = nodeDisp0[j].dispz0 * kombiTabelle[iKomb - 1][index]
                                            }
                                            if (nodeDisp0[j].phi0 !== 0) {
                                                disp[2] = nodeDisp0[j].phi0 * kombiTabelle[iKomb - 1][index]
                                            }

                                        }
                                    }
                                }
                            }
                            for (j = 0; j < 3; j++) disp_print.set(i + 1, j + 1, iKomb, disp[j])

                        }
                    }
                    if (iter === 0) {     // Schiefstellung

                        eigenwertberechnung(iKomb, stiff, stiff_sig, u, 0)

                        let umax = 0.0, ieq = -1
                        if (maxU_node === 0 || maxU_node > nnodes) {

                            for (i = 0; i < neq; i++) {
                                if (Math.abs(u[i]) > umax) {
                                    umax = Math.abs(u[i]);
                                    ieq = i;
                                }
                            }
                            console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU umax=", umax)

                        } else {
                            ieq = node[maxU_node - 1].L[maxU_dir]
                            console.log("schief", ieq, u[ieq])
                            umax = Math.abs(u[ieq])
                        }

                        let pg_max = 0.0
                        if (umax > 0.0) {
                            let vorzeichen_U = Math.sign(u_lf[ieq][iKomb - 1])
                            if (vorzeichen_U === 0.0) vorzeichen_U = 1.0
                            let vorzeichen_umax = Math.sign(u[ieq])
                            let faktor = vorzeichen_U * vorzeichen_umax * maxU_schief / umax
                            console.log("vorzeichen", vorzeichen_U, vorzeichen_umax, faktor)
                            for (i = 0; i < neq; i++) {
                                pg[i] = u[i] * faktor
                                if (Math.abs(pg[i]) > pg_max) pg_max = Math.abs(pg[i])
                            }
                        } else {
                            pg.fill(0.0)
                        }

                        for (i = 0; i < neq; i++) {
                            u0_komb[i][iKomb - 1] = pg[i]
                        }
                        maxValue_u0[iKomb - 1].ieq = ieq
                        maxValue_u0[iKomb - 1].u0 = pg_max

                        //console.log("pg", pg)


                    }

                    if (eps_disp < epsDisp_tol && eps_force < epsForce_tol) break;

                }  // ende iter

                if (maxValue_u0[iKomb - 1].ieq >= 0) {
                    console.log("==== pg_max", maxValue_u0[iKomb - 1].ieq, maxValue_u0[iKomb - 1].u0, u0_komb[maxValue_u0[iKomb - 1].ieq][iKomb - 1])
                }

                for (ielem = 0; ielem < nelem_Balken + nelem_koppelfedern; ielem++) {
                    if (el[ielem].isActive) el[ielem].berechneElementSchnittgroessen(ielem, iKomb - 1);
                }


                for (i = 0; i < nloads; i++) {                          // Knotenlasten am Knoten abziehen

                    const index = load[i].lf - 1
                    if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                        nodi = load[i].node
                        lagerkraft[nodi][0] = lagerkraft[nodi][0] + load[i].p[0] * kombiTabelle[iKomb - 1][index]
                        lagerkraft[nodi][1] = lagerkraft[nodi][1] + load[i].p[1] * kombiTabelle[iKomb - 1][index]
                        lagerkraft[nodi][2] = lagerkraft[nodi][2] + load[i].p[2] * kombiTabelle[iKomb - 1][index]
                    }
                }

                if (nNodeDisps > 0) {
                    for (let k = 0; k < nNodeDisps; k++) {
                        let index = nodeDisp0[k].lf - 1
                        console.log("nodeDisp0 index", k, index, iKomb, kombiTabelle[iKomb - 1][index])
                        if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                            for (let j = 0; j < 3; j++) {
                                if (nodeDisp0[k].dispL[j]) {
                                    nodi = nodeDisp0[k].node
                                    console.log("nodeDisp0Force", k, j, iKomb, lagerkraft[nodi][j])
                                    nodeDisp0Force.set(k, j, iKomb - 1, -lagerkraft[nodi][j]);
                                    if (node[nodi].L_org[j] !== 1) lagerkraft[nodi][j] = 0.0   // kein starres Lager
                                }
                            }
                        }
                    }
                }

                if (nelem_Federn > 0) {                        // Federkraefte in lagerkraft[] Tabelle eintragen
                    for (i = 0; i < nelem_Federn; i++) {

                        let iFeder = i + nelem_Balken
                        console.log("FEDER hängt an Knoten", el[iFeder].nod)
                        nodi = el[iFeder].nod
                        for (let j = 0; j < 3; j++) {
                            // if (nNodeDisps > 0) {
                            //     for (let k = 0; k < nNodeDisps; k++) {
                            //         if (nodeDisp0[k].node === nodi && nodeDisp0[k].lf === iKomb) {
                            //             console.log("nodeDisp0Force", k, j, iKomb, lagerkraft[nodi][j])
                            //             nodeDisp0Force.set(k, j, iKomb - 1, -lagerkraft[nodi][j]);
                            //         }
                            //     }
                            // }
                            if (node[nodi].L_org[j] > 1) lagerkraft[nodi][j] = stabendkraefte._(j + 1, iFeder + 1, iKomb);
                        }
                    }
                }


                for (let inode = 0; inode < nnodes; inode++) {
                    lagerkraefte.set(inode, 0, iKomb - 1, lagerkraft[inode][0]);
                    lagerkraefte.set(inode, 1, iKomb - 1, lagerkraft[inode][1]);
                    lagerkraefte.set(inode, 2, iKomb - 1, lagerkraft[inode][2]);
                }
                //for (i = 0; i < nnodesTotal; i++) {
                //    console.log("Lager", i + 1, lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
                //}

                // Berechnung alpha_cr, Knickformen

                eigenwertberechnung(iKomb, stiff, stiff_sig, u, 1)

                ausgabe(iKomb, newDiv)

                if (eps_disp < epsDisp_tol) {
                    write('Konvergenz bei den Verformungen erreicht, iter = ' + iter)
                } else {
                    write('++++ keine Konvergenz bei den Verformungen erreicht, Anzahl der Iterationen erhöhen ++++')
                    keineKonvergenzErreicht = true
                }

                if (eps_force < epsForce_tol) {
                    write('Konvergenz bei den Kräften erreicht, iter = ' + iter)
                } else {
                    write('++++ keine Konvergenz bei den Kräften erreicht, Anzahl der Iterationen erhöhen ++++')
                    keineKonvergenzErreicht = true
                }


            }   //ende iKomb

        }
    } else if (stadyn === 1) {
        const mass_matrix = Array.from(Array(neq), () => new Array(neq).fill(0.0));
        dyn_eigenwert(stiff, mass_matrix);
        dyn_ausgabe(newDiv)

    }


    endTime = performance.now();
    write('\nElapsed calculation time: ' + myFormat(endTime - startTime, 2, 2) + ' msec')
    startTime = performance.now();

    init_grafik(0);
    init_two('svg_artboard');
    drawsystem('svg_artboard');

    init_grafik(1);
    init_two();
    drawsystem();

    endTime = performance.now();
    write('Elapsed drawing time: ' + myFormat(endTime - startTime, 2, 2) + ' msec')

    const checkbox = document.getElementById("id_glsystem_darstellen") as HTMLInputElement;
    if (checkbox.checked) show_gleichungssystem(true);

    write('______________________________')
    if (keineKonvergenzErreicht && (THIIO_flag === 0) && (matprop_flag === 0)) {    // TH I. Ordnung linear
        write('Ꚛ FEHLER - In mindestens einem Lastfall wurde die Krafttoleranz nicht eingehalten')

        const dialogAlert = new AlertDialog({
            trueButton_Text: "ok",
            question_Text: "In mindestens einem Lastfall wurde die Krafttoleranz nicht eingehalten. " +
                "Mögliche Ursache: Das System ist kinematisch. " +
                "Die Ergebnisse sind wahrscheinlich nicht brauchbar!",
        });
        await dialogAlert.confirm();
    }
    else if (keineKonvergenzErreicht || alpha_cr_2_low || keineKonvergenzErreicht_eigv) {
        if (keineKonvergenzErreicht) {
            write('Ꚛ FEHLER - Es gab in mindestens einer Kombination keine Konvergenz der Verformungen/Kräfte')

            const dialogAlert = new AlertDialog({
                trueButton_Text: "ok",
                question_Text: "In mindestens einer Kombination keine Konvergenz der Verformungen/Kräfte erreicht. " +
                    "Mögliche Lösungen: Iterationen erhöhen oder Lasten reduzieren oder Querschnitte vergrößern. Kinematiken überprüfen. " +
                    "Die Ergebnisse sind wahrscheinlich nicht brauchbar!",
            });
            await dialogAlert.confirm();
        }
        if (keineKonvergenzErreicht_eigv) {
            write('Ꚛ FEHLER - Es gab in mindestens einer Kombination keine Konvergenz der Eigenwerte')

            const dialogAlert = new AlertDialog({
                trueButton_Text: "ok",
                question_Text: "In mindestens einer Kombination keine Konvergenz der Eigenwerte erreicht. " +
                    "Mögliche Lösungen: Anderen Eigenwertlöser probieren, und/oder Anzahl der Eigenwerte reduzieren, siehe Tab Pro. " +
                    "Die Ergebnisse sind wahrscheinlich nicht brauchbar!",
            });
            await dialogAlert.confirm();
        }
        if (alpha_cr_2_low) {
            write('Ꚛ FEHLER - In mindestens einer Kombination war alpha_cr < 1')

            const dialogAlert = new AlertDialog({
                trueButton_Text: "ok",
                question_Text: "In mindestens einer Kombination war alpha_cr < 1. " +
                    "Mögliche Lösungen: Lasten reduzieren oder Querschnitte vergrößern. " +
                    "Die Ergebnisse sind nicht brauchbar!",
            });
            await dialogAlert.confirm();
        }
        berechnungErfolgreich(false);
        berechnungErforderlich(true);

    } else {
        write('Berechnung erfolgreich beendet ✔')
        berechnungErfolgreich(true);
    }

    return 0;
}

/**
 *
 * @param stiff
 * @param mass_matrix
 */
//---------------------------------------------------------------------------------------------------------------
function dyn_eigenwert(stiff: number[][], mass_matrix: number[][]) {
    //---------------------------------------------------------------------------------------------------------------

    let i: number, j: number, ielem: number

    dyn_omega = new Array(dyn_neigv);
    eigenform_print = new TFArray3D_0(nnodesTotal, 3, dyn_neigv);

    for (i = 0; i < neq; i++) stiff[i].fill(0.0);


    for (ielem = 0; ielem < nelemTotal; ielem++) {
        if (el[ielem].isActive) {
            el[ielem].berechneElementsteifigkeitsmatrix(0);
            el[ielem].addiereElementsteifigkeitmatrix(stiff)

            el[ielem].berechneElementmassenmatrix();
            el[ielem].addiereElementmassmatrix(mass_matrix)
        }
    }


    // Knotenmassen addieren

    let lmj: number
    for (i = 0; i < nnodalMass; i++) {
        let nod1 = nodalmass[i].node
        lmj = node[nod1].L[0]
        if (lmj >= 0) mass_matrix[lmj][lmj] += nodalmass[i].mass;
        lmj = node[nod1].L[1]
        if (lmj >= 0) mass_matrix[lmj][lmj] += nodalmass[i].mass;
        lmj = node[nod1].L[2]
        if (lmj >= 0) mass_matrix[lmj][lmj] += nodalmass[i].theta;
    }


    for (i = 0; i < neq; i++) {  // merken für Ausdruck in Tab Pro
        for (j = 0; j < neq; j++) {
            stm[i][j] = stiff[i][j]
            print_mass[i][j] = mass_matrix[i][j]
        }
    }

    let kstiff_array = new Float64Array(neq * neq);
    let k = 0
    for (let ispalte = 0; ispalte < neq; ispalte++) {
        for (let izeile = 0; izeile < neq; izeile++) {
            kstiff_array[k] = stiff[izeile][ispalte];
            k++;
        }
    }
    let kstiff_ptr = Module._malloc(kstiff_array.length * bytes_8);
    Module.HEAPF64.set(kstiff_array, kstiff_ptr / bytes_8);

    let mass_array = new Float64Array(neq * neq);
    k = 0
    for (let ispalte = 0; ispalte < neq; ispalte++) {
        for (let izeile = 0; izeile < neq; izeile++) {
            mass_array[k] = mass_matrix[izeile][ispalte];
            k++;
        }
    }
    let mass_ptr = Module._malloc(mass_array.length * bytes_8);
    Module.HEAPF64.set(mass_array, mass_ptr / bytes_8);

    let eigenform_ptr = Module._malloc(neq * dyn_neigv * bytes_8);
    let omega_ptr = Module._malloc(dyn_neigv * bytes_8);

    let status = 0
    if (eig_solver === 0) {
        status = c_gsl_eigenwert(mass_ptr, kstiff_ptr, omega_ptr, eigenform_ptr, neq, dyn_neigv)
    } else if (eig_solver === 1) {
        status = c_simvektoriteration(kstiff_ptr, mass_ptr, omega_ptr, eigenform_ptr, neq, dyn_neigv, niter_neigv);
    }
    write("Status der Eigenwertberechnung = " + status)
    if (status !== 0) keineKonvergenzErreicht_eigv = true
    //c_simvektoriteration(kstiff_ptr, mass_ptr, omega_ptr, eigenform_ptr, neq, dyn_neigv);

    let omega_array = new Float64Array(Module.HEAPF64.buffer, omega_ptr, dyn_neigv);
    console.log("omega_array", omega_array);

    for (i = 0; i < dyn_neigv; i++) dyn_omega[i] = omega_array[i]

    for (i = 0; i < dyn_neigv; i++) {
        console.log("omega", +i + 1, dyn_omega[i], dyn_omega[i] / 2 / Math.PI)
    }

    let eigenform_array = new Float64Array(Module.HEAPF64.buffer, eigenform_ptr, neq * dyn_neigv);

    eigenform_dyn.length = 0;
    eigenform_dyn = Array.from(Array(dyn_neigv), () => new Array(neq).fill(0.0));
    maxValue_dyn_eigenform.length = 0
    maxValue_dyn_eigenform = new Array(dyn_neigv).fill(0.0)

    let offset = 0
    for (let ieigv = 0; ieigv < dyn_neigv; ieigv++) {

        for (i = 0; i < neq; i++) {
            eigenform_dyn[ieigv][i] = eigenform_array[i + offset]
            if (Math.abs(eigenform_array[i + offset]) > maxValue_dyn_eigenform[ieigv]) maxValue_dyn_eigenform[ieigv] = Math.abs(eigenform_array[i + offset]);
        }
        offset = offset + neq
        console.log(" maxValue_dyn_eigenform[ieigv+1] = ", +ieigv + 1, maxValue_dyn_eigenform[ieigv])


        let disp = Array(3)
        for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
            for (j = 0; j < 3; j++) {
                let ieq = node[i].L[j]
                if (ieq === -1) {
                    disp[j] = 0
                } else {
                    disp[j] = eigenform_dyn[ieigv][ieq]
                }
            }

            for (j = 0; j < 3; j++) eigenform_print.set(i, j, ieigv, disp[j]);

        }



    }

}

//---------------------------------------------------------------------------------------------------------------
function eigenwertberechnung(iKomb: number, stiff: number[][], stiff_sig: number[][], u: number[], flag: number) {
    //---------------------------------------------------------------------------------------------------------------
    {

        let i: number, j: number, ielem: number

        for (i = 0; i < neq; i++) stiff[i].fill(0.0);
        for (i = 0; i < neq; i++) stiff_sig[i].fill(0.0);

        //R.fill(0.0);
        //u.fill(0.0);
        //const help = Array.from(Array(6), () => new Array(6));

        for (ielem = 0; ielem < nelemTotal; ielem++) {
            if (el[ielem].isActive) {
                el[ielem].berechneElementsteifigkeitsmatrix(0);
                el[ielem].addiereElementsteifigkeitmatrix(stiff)

                el[ielem].berechneElementsteifigkeitsmatrix_Ksig();
                el[ielem].addiereElementsteifigkeitmatrix_ksig(stiff_sig)
            }
        }

        // for (i = 0; i < neq; i++) {
        //     console.log("stiff_sig", stiff_sig[i])
        // }

        let kstiff_array = new Float64Array(neq * neq);
        let k = 0
        for (let ispalte = 0; ispalte < neq; ispalte++) {
            for (let izeile = 0; izeile < neq; izeile++) {
                kstiff_array[k] = stiff[izeile][ispalte];
                k++;
            }
        }
        let kstiff_ptr = Module._malloc(kstiff_array.length * bytes_8);
        Module.HEAPF64.set(kstiff_array, kstiff_ptr / bytes_8);

        let kstiff_sig_array = new Float64Array(neq * neq);
        k = 0
        for (let ispalte = 0; ispalte < neq; ispalte++) {
            for (let izeile = 0; izeile < neq; izeile++) {
                kstiff_sig_array[k] = stiff_sig[izeile][ispalte];
                k++;
            }
        }
        let kstiff_sig_ptr = Module._malloc(kstiff_sig_array.length * bytes_8);
        Module.HEAPF64.set(kstiff_sig_array, kstiff_sig_ptr / bytes_8);

        let eigenform_ptr = Module._malloc(neq * neigv * bytes_8);
        let omega_ptr = Module._malloc(neigv * bytes_8);

        let status = 0;
        if (eig_solver === 0) {
            status = c_gsl_eigenwert(kstiff_sig_ptr, kstiff_ptr, omega_ptr, eigenform_ptr, neq, dyn_neigv)
        } else if (eig_solver === 1) {
            status = c_simvektoriteration(kstiff_ptr, kstiff_sig_ptr, omega_ptr, eigenform_ptr, neq, neigv, niter_neigv);
        }
        write("Status der Eigenwertberechnung = " + status)
        if (status !== 0) keineKonvergenzErreicht_eigv = true

        //c_simvektoriteration(kstiff_ptr, kstiff_sig_ptr, omega_ptr, eigenform_ptr, neq, neigv);

        let omega_array = new Float64Array(Module.HEAPF64.buffer, omega_ptr, neigv);
        console.log("omega", omega_array[0], omega_array[1]);

        for (i = 0; i < neigv; i++) {
            let alphaCr = omega_array[i] ** 2
            if ((alphaCr > 0.01) && (alphaCr < 1.0)) alpha_cr_2_low = true;
            alpha_cr[iKomb - 1][i] = alphaCr
        }

        let eigenform_array = new Float64Array(Module.HEAPF64.buffer, eigenform_ptr, neq * neigv);
        //console.log("eigenform_array", eigenform_array);

        if (flag === 0) {

            for (i = 0; i < neq; i++) u[i] = eigenform_array[i]

        } else {

            let disp = [3]
            let offset = 0
            for (let ieigv = 1; ieigv <= neigv; ieigv++) {

                for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                    for (j = 0; j < 3; j++) {
                        let ieq = node[i].L[j]
                        if (ieq === -1) {
                            disp[j] = 0
                        } else {
                            disp[j] = eigenform_array[ieq + offset]
                        }
                    }

                    for (j = 0; j < 3; j++) {
                        // console.log("eigenform_container_node[iKomb]", eigenform_container_node[iKomb-1])
                        eigenform_container_node[iKomb - 1].set(i + 1, j + 1, ieigv, disp[j])
                        if (Math.abs(disp[j]) > maxValue_eigv[iKomb - 1][ieigv - 1]) maxValue_eigv[iKomb - 1][ieigv - 1] = Math.abs(disp[j])
                    }
                }

                for (i = 0; i < neq; i++) {
                    eigenform_container_u[iKomb - 1].set(i, ieigv, eigenform_array[i + offset])
                }
                offset = offset + neq
                console.log(" maxValue_eigv[iKomb - 1][ieigv-1] = ", maxValue_eigv[iKomb - 1][ieigv - 1])
            }
        }

        Module._free(kstiff_ptr);
        Module._free(kstiff_sig_ptr);
        Module._free(eigenform_ptr);
        Module._free(omega_ptr);
    }

}


//---------------------------------------------------------------------------------------------------------------
function cholesky_solve_equation(stiff: number[][], R: number[]) {
    //---------------------------------------------------------------------------------------------------------------
    {
        let error = 0

        if (equation_solver === 0) {

            //write('in cholesky')
            //write("c_cholesky_decomp= " + c_cholesky_decomp)
            // Module.onRuntimeInitialized = () => {
            //     write("Module.onRuntimeInitialized = " + Module.onRuntimeInitialized)
            // }
            //write("Module.onRuntimeInitialized = " + Module.onRuntimeInitialized)


            let kstiff_array = new Float64Array(neq * neq);
            let k = 0
            for (let ispalte = 0; ispalte < neq; ispalte++) {
                for (let izeile = 0; izeile < neq; izeile++) {
                    kstiff_array[k] = stiff[izeile][ispalte];
                    k++;
                }
            }
            let R_array = new Float64Array(neq);

            for (let i = 0; i < neq; i++) {
                R_array[i] = R[i];
            }

            let kstiff_ptr = Module._malloc(kstiff_array.length * bytes_8);
            Module.HEAPF64.set(kstiff_array, kstiff_ptr / bytes_8);

            let R_vector_ptr = Module._malloc(neq * bytes_8);
            Module.HEAPF64.set(R_array, R_vector_ptr / bytes_8);

            let L_matrix_ptr = Module._malloc(neq * neq * bytes_8);

            error = c_cholesky_decomp(kstiff_ptr, L_matrix_ptr, neq);

            if (error === 0) {
                c_cholesky_2(L_matrix_ptr, R_vector_ptr, neq);

                let U_array = new Float64Array(Module.HEAPF64.buffer, R_vector_ptr, neq);
                for (let i = 0; i < neq; i++) R[i] = U_array[i];
            }

            Module._free(kstiff_ptr);
            Module._free(L_matrix_ptr);
            Module._free(R_vector_ptr);
        }
        else {
            error = cholesky(stiff, R, neq, 1);
            if (error === 0) {
                let det = det_cholesky(stiff, neq)
                write('Determinante = ' + det)
                error = cholesky(stiff, R, neq, 2);
            }
        }
        return error;
    }
}

//--------------------------------------------------------------------------------------------
//------------------------------- K O M B I N A T I O N E N ---------------------------------
//--------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------
function berechne_kombinationen() {
    //-----------------------------------------------------------------------------------------------------------

    console.log("++++   in berechne_kombinationen   ++++")

    let mom = 0.0
    let quer = 0.0
    let norm = 0.0
    let ug = 0.0
    let wg = 0.0
    let phi = 0.0
    let press = 0.0

    let delta = 0.0

    maxM_all = 0.0; maxV_all = 0.0; maxN_all = 0.0; maxdisp_all = 0.0; maxpress_all = 0.0

    //console.log("...", nkombinationen, nelem_Balken, nlastfaelle)

    for (let i = 0; i < 3; i++) max_S_kombi[i].fill(0.0);
    max_disp_kombi.fill(0.0)
    max_press_kombi.fill(0.0)

    for (let iKomb = 0; iKomb < nkombinationen; iKomb++) {

        for (let ielem = 0; ielem < nelem_Balken + nelem_koppelfedern; ielem++) {
            if (el[ielem].isActive) {
                //console.log("nTeilungen", el[ielem].nTeilungen)
                for (let iteil = 0; iteil < el[ielem].nTeilungen; iteil++) {

                    mom = 0.0
                    quer = 0.0
                    norm = 0.0
                    ug = 0.0
                    wg = 0.0
                    phi = 0.0
                    press = 0.0

                    for (let iLastfall = 0; iLastfall < nlastfaelle; iLastfall++) {

                        mom += el[ielem].M_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall]
                        quer += el[ielem].V_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall]
                        norm += el[ielem].N_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall]
                        ug += el[ielem].u_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall]
                        wg += el[ielem].w_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall]
                        phi += el[ielem].phi_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall]
                        if (System === 0) {
                            if (ielem < nelem_Balken) press += el[ielem].bettung_[iLastfall][iteil] * kombiTabelle[iKomb][iLastfall];
                        }
                        //console.log("mom...", iteil, iLastfall, mom, quer, norm)
                    }

                    maxM_all = Math.max(Math.abs(mom), maxM_all)
                    maxV_all = Math.max(Math.abs(quer), maxV_all)
                    maxN_all = Math.max(Math.abs(norm), maxN_all)
                    delta = Math.sqrt(ug * ug + wg * wg)
                    maxdisp_all = Math.max(Math.abs(delta), maxdisp_all)
                    maxpress_all = Math.max(Math.abs(press), maxpress_all)

                    el[ielem].M_komb[iKomb][iteil] = mom
                    el[ielem].V_komb[iKomb][iteil] = quer
                    el[ielem].N_komb[iKomb][iteil] = norm
                    el[ielem].u_komb[iKomb][iteil] = ug
                    el[ielem].w_komb[iKomb][iteil] = wg
                    el[ielem].phi_komb[iKomb][iteil] = phi
                    if (System === 0) {
                        if (ielem < nelem_Balken) el[ielem].bettung_komb[iKomb][iteil] = press
                    }

                    max_S_kombi[0][iKomb] = Math.max(Math.abs(mom), max_S_kombi[0][iKomb])
                    max_S_kombi[1][iKomb] = Math.max(Math.abs(quer), max_S_kombi[1][iKomb])
                    max_S_kombi[2][iKomb] = Math.max(Math.abs(norm), max_S_kombi[2][iKomb])
                    max_disp_kombi[iKomb] = Math.max(Math.abs(delta), max_disp_kombi[iKomb])
                    max_press_kombi[iKomb] = Math.max(Math.abs(press), max_press_kombi[iKomb])
                }
            }
        }

        //console.log("max_S_kombi, iKomb=", iKomb, max_S_kombi[0][iKomb], max_S_kombi[1][iKomb], max_S_kombi[2][iKomb], max_disp_kombi[iKomb])
    }

    //console.log("MAX_ALL", maxM_all, maxV_all, maxN_all, maxdisp_all, maxpress_all)


    // jetzt die Auflagerkombinationen

    for (let iKomb = 0; iKomb < nkombinationen; iKomb++) {
        for (let inode = 0; inode < nnodes; inode++) {
            let Ax = 0.0
            let Az = 0.0
            let My = 0.0
            for (let iLastfall = 0; iLastfall < nlastfaelle; iLastfall++) {
                Ax += lagerkraefte._(inode, 0, iLastfall) * kombiTabelle[iKomb][iLastfall]
                Az += lagerkraefte._(inode, 1, iLastfall) * kombiTabelle[iKomb][iLastfall]
                My += lagerkraefte._(inode, 2, iLastfall) * kombiTabelle[iKomb][iLastfall]
            }
            lagerkraefte_kombi.set(inode, 0, iKomb, Ax);
            lagerkraefte_kombi.set(inode, 1, iKomb, Az);
            lagerkraefte_kombi.set(inode, 2, iKomb, My);

        }
    }


    // jetzt die Knotenverformungen

    for (let iKomb = 0; iKomb < nkombinationen; iKomb++) {
        for (let inode = 1; inode <= nnodes; inode++) {
            let ux = 0.0
            let wz = 0.0
            let phi = 0.0
            for (let iLastfall = 0; iLastfall < nlastfaelle; iLastfall++) {
                ux += disp_print._(inode, 1, iLastfall + 1) * kombiTabelle[iKomb][iLastfall]
                wz += disp_print._(inode, 2, iLastfall + 1) * kombiTabelle[iKomb][iLastfall]
                phi += disp_print._(inode, 3, iLastfall + 1) * kombiTabelle[iKomb][iLastfall]
            }
            disp_print_kombi.set(inode, 1, iKomb + 1, ux);
            disp_print_kombi.set(inode, 2, iKomb + 1, wz);
            disp_print_kombi.set(inode, 3, iKomb + 1, phi);

        }
    }


}

//---------------------------------------------------------------------------------------------------------------
export function show_gleichungssystem(checked: boolean) {
    //-----------------------------------------------------------------------------------------------------------

    const elem_darstellen = document.getElementById('id_element_darstellen') as HTMLSelectElement;
    let draw_element = Number(elem_darstellen.value)
    console.log("§§§§§§§§§§§§§§§ draw_element", draw_element)

    const eq_div = document.getElementById('id_gleichungssystem') as HTMLDivElement

    while (eq_div.hasChildNodes()) {  // alte Tabellen entfernen
        // @ts-ignore
        eq_div.removeChild(eq_div?.lastChild);
    }

    const elem_stiff_darstellen = document.getElementById('id_elementsteifigkeit') as HTMLSelectElement;

    while (elem_stiff_darstellen.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        elem_stiff_darstellen.removeChild(elem_stiff_darstellen?.lastChild);
    }

    if (checked) {
        console.log("show_gleichungssystem")

        let tag = document.createElement("p");
        let text = document.createTextNode("Elementsteifigkeitsmatrix");
        tag.appendChild(text);
        tag.innerHTML = "<b>Elementsteifigkeitsmatrix [k] im lokalen Koordinatensystem, nur Anteil Th. I. Ordnung, Einheit: kN und kNm, für Element " + (+draw_element + 1) + "</b>"
        eq_div?.appendChild(tag);

        {
            const table = document.createElement('table');
            eq_div.appendChild(table);
            table.id = 'element_table';

            let thead = table.createTHead();
            //console.log('thead', thead);
            let row = thead.insertRow();
            for (let i = 0; i <= el[draw_element].neqe; i++) {
                if (System === 0) {
                    if (table.tHead) {
                        const th0 = table.tHead.appendChild(document.createElement('th'));
                        if (i === 0) th0.innerHTML = '';
                        else if (i === 1) th0.innerHTML = 'u<sub>a</sub>';
                        else if (i === 2) th0.innerHTML = 'w<sub>a</sub>';
                        else if (i === 3) th0.innerHTML = 'φ<sub>a</sub>';
                        else if (i === 4) th0.innerHTML = 'u<sub>e</sub>';
                        else if (i === 5) th0.innerHTML = 'w<sub>e</sub>';
                        else if (i === 6) th0.innerHTML = 'φ<sub>e</sub>';
                        th0.style.padding = '5px';
                        th0.style.margin = '0px';
                        th0.style.textAlign = 'center';
                        //th0.setAttribute('title', 'Hilfe')
                        row.appendChild(th0);
                    }
                } else {
                    if (table.tHead) {
                        const th0 = table.tHead.appendChild(document.createElement('th'));
                        if (i === 0) th0.innerHTML = '';
                        else if (i === 1) th0.innerHTML = 'u<sub>a</sub>';
                        else if (i === 2) th0.innerHTML = 'w<sub>a</sub>';
                        else if (i === 3) th0.innerHTML = 'u<sub>e</sub>';
                        else if (i === 4) th0.innerHTML = 'w<sub>e</sub>';
                        th0.style.padding = '5px';
                        th0.style.margin = '0px';
                        th0.style.textAlign = 'center';
                        //th0.setAttribute('title', 'Hilfe')
                        row.appendChild(th0);
                    }
                }
            }

            let tbody = table.createTBody();

            for (let iZeile = 1; iZeile <= el[draw_element].neqe; iZeile++) {
                let newRow = tbody.insertRow(-1);

                for (let iSpalte = 0; iSpalte <= el[draw_element].neqe; iSpalte++) {
                    let newCell, newText;

                    newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                    if (iSpalte === 0) newText = document.createTextNode(String(iZeile));
                    else newText = document.createTextNode(myFormat(el[draw_element].estm[iZeile - 1][iSpalte - 1], 0, 2));
                    newCell.style.textAlign = 'center';
                    //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                    newCell.style.padding = '5px';
                    newCell.style.margin = '0px';
                    if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                    newCell.appendChild(newText);
                }
            }
        }

        if (stadyn === 1) {

            let tag = document.createElement("p");
            let text = document.createTextNode("Elementmassenmatrix");
            tag.appendChild(text);
            tag.innerHTML = "<b>Elementmassenmatrix [m] im lokalen Koordinatensystem, Einheit: t und tm², für Element " + (+draw_element + 1) + "</b>"
            eq_div?.appendChild(tag);

            {
                const table = document.createElement('table');
                eq_div.appendChild(table);
                table.id = 'element_mass_table';

                let thead = table.createTHead();
                //console.log('thead', thead);
                let row = thead.insertRow();
                for (let i = 0; i <= el[draw_element].neqe; i++) {
                    if (System === 0) {
                        if (table.tHead) {
                            const th0 = table.tHead.appendChild(document.createElement('th'));
                            if (i === 0) th0.innerHTML = '';
                            else if (i === 1) th0.innerHTML = 'ü<sub>a</sub>';
                            else if (i === 2) th0.innerHTML = 'ẅ<sub>a</sub>';
                            else if (i === 3) th0.innerHTML = 'φ<sub>a</sub>';
                            else if (i === 4) th0.innerHTML = 'ü<sub>e</sub>';
                            else if (i === 5) th0.innerHTML = 'ẅ<sub>e</sub>';
                            else if (i === 6) th0.innerHTML = 'φ<sub>e</sub>';
                            th0.style.padding = '5px';
                            th0.style.margin = '0px';
                            th0.style.textAlign = 'center';
                            //th0.setAttribute('title', 'Hilfe')
                            row.appendChild(th0);
                        }
                    } else {
                        if (table.tHead) {
                            const th0 = table.tHead.appendChild(document.createElement('th'));
                            if (i === 0) th0.innerHTML = '';
                            else if (i === 1) th0.innerHTML = 'ü<sub>a</sub>';
                            else if (i === 2) th0.innerHTML = 'ẅ<sub>a</sub>';
                            else if (i === 3) th0.innerHTML = 'ü<sub>e</sub>';
                            else if (i === 4) th0.innerHTML = 'ẅ<sub>e</sub>';
                            th0.style.padding = '5px';
                            th0.style.margin = '0px';
                            th0.style.textAlign = 'center';
                            //th0.setAttribute('title', 'Hilfe')
                            row.appendChild(th0);
                        }
                    }
                }

                let tbody = table.createTBody();

                for (let iZeile = 1; iZeile <= el[draw_element].neqe; iZeile++) {
                    let newRow = tbody.insertRow(-1);

                    for (let iSpalte = 0; iSpalte <= el[draw_element].neqe; iSpalte++) {
                        let newCell, newText;

                        newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                        if (iSpalte === 0) newText = document.createTextNode(String(iZeile));
                        else newText = document.createTextNode(myFormat(el[draw_element].emass[iZeile - 1][iSpalte - 1], 0, 4));
                        newCell.style.textAlign = 'center';
                        //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                        newCell.style.padding = '5px';
                        newCell.style.margin = '0px';
                        if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                        newCell.appendChild(newText);
                    }
                }
            }
        }


        tag = document.createElement("p");
        text = document.createTextNode("Transformationsmatrix");
        tag.appendChild(text);
        tag.innerHTML = "<b>Transformationsmatrix T, von global nach lokal ( {u}=[T]∙{U} ) für Element " + (+draw_element + 1) + "</b>"
        eq_div?.appendChild(tag);


        {
            const table = document.createElement('table');
            eq_div.appendChild(table);
            table.id = 'element_table';

            let thead = table.createTHead();
            //console.log('thead', thead);
            let row = thead.insertRow();
            for (let i = 0; i <= el[draw_element].neqeG; i++) {
                if (table.tHead) {
                    const th0 = table.tHead.appendChild(document.createElement('th'));
                    if (i === 0) th0.innerHTML = 'lm';
                    else th0.innerHTML = String(+el[draw_element].lm[i - 1] + 1);
                    //th0.title = "Elementnummer"
                    th0.style.padding = '5px';
                    th0.style.margin = '0px';
                    th0.style.textAlign = 'center';
                    //th0.setAttribute('title', 'Hilfe')
                    row.appendChild(th0);
                }
            }

            let tbody = table.createTBody();

            for (let iZeile = 1; iZeile <= el[draw_element].neqe; iZeile++) {
                let newRow = tbody.insertRow(-1);

                for (let iSpalte = 0; iSpalte <= el[draw_element].neqeG; iSpalte++) {
                    let newCell, newText;

                    newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                    if (iSpalte === 0) newText = document.createTextNode(String(iZeile));
                    else newText = document.createTextNode(myFormat(el[draw_element].transU[iZeile - 1][iSpalte - 1], 0, 2));
                    newCell.style.textAlign = 'center';
                    //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                    newCell.style.padding = '5px';
                    newCell.style.margin = '0px';
                    if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                    newCell.appendChild(newText);
                }
            }

        }




        tag = document.createElement("p");
        text = document.createTextNode("Elementsteifigkeitsmatrix");
        tag.appendChild(text);
        tag.innerHTML = "<b>Elementsteifigkeitsmatrix [k]<sub>G</sub>=[T]<sup>T</sup>∙[k]∙[T] im globalen Koordinatensystem für Element " + (+draw_element + 1) + "</b>"
        eq_div?.appendChild(tag);

        {
            const table = document.createElement('table');
            eq_div.appendChild(table);
            table.id = 'element_table';

            let thead = table.createTHead();
            //console.log('thead', thead);
            let row = thead.insertRow();
            for (let i = 0; i <= el[draw_element].neqeG; i++) {
                if (table.tHead) {
                    const th0 = table.tHead.appendChild(document.createElement('th'));
                    if (i === 0) th0.innerHTML = 'lm';
                    else th0.innerHTML = String(+el[draw_element].lm[i - 1] + 1);
                    //th0.title = "Elementnummer"
                    th0.style.padding = '5px';
                    th0.style.margin = '0px';
                    th0.style.textAlign = 'center';
                    //th0.setAttribute('title', 'Hilfe')
                    row.appendChild(th0);
                }
            }

            let tbody = table.createTBody();
            //      tbody.addEventListener('mousemove', this.POINTER_MOVE);

            for (let iZeile = 1; iZeile <= el[draw_element].neqeG; iZeile++) {
                let newRow = tbody.insertRow(-1);

                for (let iSpalte = 0; iSpalte <= el[draw_element].neqeG; iSpalte++) {
                    let newCell, newText;

                    newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                    if (iSpalte === 0) newText = document.createTextNode(String(+el[draw_element].lm[iZeile - 1] + 1));
                    else newText = document.createTextNode(myFormat(el[draw_element].estiffG[iZeile - 1][iSpalte - 1], 0, 2));
                    newCell.style.textAlign = 'center';
                    //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                    newCell.style.padding = '5px';
                    newCell.style.margin = '0px';
                    if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                    newCell.appendChild(newText);
                }
            }

            for (let iZeile = 0; iZeile < el[draw_element].neqeG; iZeile++) {

                let lmi = el[draw_element].lm[iZeile]
                if (lmi >= 0) {
                    for (let iSpalte = 0; iSpalte < el[draw_element].neqeG; iSpalte++) {
                        let lmj = el[draw_element].lm[iSpalte]
                        if (lmj >= 0) {
                            let cell = table.rows[+iZeile + 1].cells[+iSpalte + 1]
                            //console.log("child", cell.innerText)
                            //cell.style.fontWeight = 'bold'
                            cell.style.color = 'blue'
                        }
                    }
                }
            }

        }

        //                                                              Gesamtsteifigkeit

        //console.log("U_",U_)
        //console.log("R_",R_)

        if (stadyn === 0) {

            tag = document.createElement("p");
            text = document.createTextNode("Gesamtsteifigkeitsmatrix");
            tag.appendChild(text);
            tag.innerHTML = "<b>Gesamtsteifigkeitsbeziehung [K]*{U}={R}</b>"
            eq_div?.appendChild(tag);

            {
                const table = document.createElement('table');
                eq_div.appendChild(table);
                table.id = 'equation_table';

                let thead = table.createTHead();
                //console.log('thead', thead);
                let row = thead.insertRow();
                for (let i = 0; i <= neq + 2; i++) {
                    if (table.tHead) {
                        const th0 = table.tHead.appendChild(document.createElement('th'));
                        if (i === 0) th0.innerHTML = '[K]';
                        else if (i <= neq) th0.innerHTML = String(i);
                        else if (i === neq + 1) th0.innerHTML = '{U}';
                        else th0.innerHTML = '{R}';
                        //th0.title = "Elementnummer"
                        th0.style.padding = '5px';
                        th0.style.margin = '0px';
                        th0.style.textAlign = 'center';
                        //th0.setAttribute('title', 'Hilfe')
                        row.appendChild(th0);
                    }
                }

                let tbody = table.createTBody();

                for (let iZeile = 1; iZeile <= neq; iZeile++) {
                    let newRow = tbody.insertRow(-1);

                    for (let iSpalte = 0; iSpalte <= +neq + 2; iSpalte++) {
                        let newCell, newText;

                        newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                        if (iSpalte === 0) newText = document.createTextNode(String(iZeile));
                        else if (iSpalte <= neq) newText = document.createTextNode(myFormat(stm[iZeile - 1][iSpalte - 1], 0, 2));
                        else if (iSpalte === +neq + 1) newText = document.createTextNode(myFormat(U_[iZeile - 1], 0, 5));
                        else newText = document.createTextNode(myFormat(R_[iZeile - 1], 0, 3));
                        newCell.style.textAlign = 'center';
                        //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                        newCell.style.padding = '5px';
                        newCell.style.margin = '0px';
                        if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                        newCell.appendChild(newText);
                    }
                }

                for (let iZeile = 0; iZeile < el[draw_element].neqeG; iZeile++) {

                    let lmi = el[draw_element].lm[iZeile]
                    if (lmi >= 0) {
                        for (let iSpalte = 0; iSpalte < el[draw_element].neqeG; iSpalte++) {
                            let lmj = el[draw_element].lm[iSpalte]
                            if (lmj >= 0) {
                                let cell = table.rows[+lmi + 1].cells[+lmj + 1]
                                //console.log("child", cell.innerText)
                                //cell.style.fontWeight = 'bold'
                                cell.style.color = 'blue'
                            }
                        }
                    }
                }
            }
        }
        else if (stadyn === 1) {   // Dynamik


            tag = document.createElement("p");
            text = document.createTextNode("Gesamtsteifigkeitsmatrix");
            tag.appendChild(text);
            tag.innerHTML = "<b>Gesamtsteifigkeitsmatrix [K]</b>"
            eq_div?.appendChild(tag);

            {
                const table = document.createElement('table');
                eq_div.appendChild(table);
                table.id = 'equation_table';

                let thead = table.createTHead();
                //console.log('thead', thead);
                let row = thead.insertRow();
                for (let i = 0; i <= neq; i++) {
                    if (table.tHead) {
                        const th0 = table.tHead.appendChild(document.createElement('th'));
                        if (i === 0) th0.innerHTML = '[K]';
                        else /*if (i <= neq)*/ th0.innerHTML = String(i);
                        // else if (i === neq + 1) th0.innerHTML = '{U}';
                        // else th0.innerHTML = '{R}';
                        //th0.title = "Elementnummer"
                        th0.style.padding = '5px';
                        th0.style.margin = '0px';
                        th0.style.textAlign = 'center';
                        //th0.setAttribute('title', 'Hilfe')
                        row.appendChild(th0);
                    }
                }

                let tbody = table.createTBody();

                for (let iZeile = 1; iZeile <= neq; iZeile++) {
                    let newRow = tbody.insertRow(-1);

                    for (let iSpalte = 0; iSpalte <= neq; iSpalte++) {
                        let newCell, newText;

                        newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                        if (iSpalte === 0) newText = document.createTextNode(String(iZeile));
                        else /*if (iSpalte <= neq)*/ newText = document.createTextNode(myFormat(stm[iZeile - 1][iSpalte - 1], 0, 2));
                        // else if (iSpalte === +neq + 1) newText = document.createTextNode(myFormat(U_[iZeile - 1], 0, 5));
                        // else newText = document.createTextNode(myFormat(R_[iZeile - 1], 0, 3));
                        newCell.style.textAlign = 'center';
                        //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                        newCell.style.padding = '5px';
                        newCell.style.margin = '0px';
                        if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                        newCell.appendChild(newText);
                    }
                }

                for (let iZeile = 0; iZeile < el[draw_element].neqeG; iZeile++) {

                    let lmi = el[draw_element].lm[iZeile]
                    if (lmi >= 0) {
                        for (let iSpalte = 0; iSpalte < el[draw_element].neqeG; iSpalte++) {
                            let lmj = el[draw_element].lm[iSpalte]
                            if (lmj >= 0) {
                                let cell = table.rows[+lmi + 1].cells[+lmj + 1]
                                //console.log("child", cell.innerText)
                                //cell.style.fontWeight = 'bold'
                                cell.style.color = 'blue'
                            }
                        }
                    }
                }
            }


            tag = document.createElement("p");
            text = document.createTextNode("Gesamtmassenmatrix");
            tag.appendChild(text);
            tag.innerHTML = "<b>Gesamtmassenmatrix [M]</b>"
            eq_div?.appendChild(tag);

            {
                const table = document.createElement('table');
                eq_div.appendChild(table);
                table.id = 'mass_equation_table';

                let thead = table.createTHead();
                //console.log('thead', thead);
                let row = thead.insertRow();
                for (let i = 0; i <= neq; i++) {
                    if (table.tHead) {
                        const th0 = table.tHead.appendChild(document.createElement('th'));
                        if (i === 0) th0.innerHTML = '[M]';
                        else /*if (i <= neq)*/ th0.innerHTML = String(i);
                        // else if (i === neq + 1) th0.innerHTML = '{U}';
                        // else th0.innerHTML = '{R}';
                        //th0.title = "Elementnummer"
                        th0.style.padding = '5px';
                        th0.style.margin = '0px';
                        th0.style.textAlign = 'center';
                        //th0.setAttribute('title', 'Hilfe')
                        row.appendChild(th0);
                    }
                }

                let tbody = table.createTBody();

                for (let iZeile = 1; iZeile <= neq; iZeile++) {
                    let newRow = tbody.insertRow(-1);

                    for (let iSpalte = 0; iSpalte <= neq; iSpalte++) {
                        let newCell, newText;

                        newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                        if (iSpalte === 0) newText = document.createTextNode(String(iZeile));
                        else /*if (iSpalte <= neq)*/ newText = document.createTextNode(myFormat(print_mass[iZeile - 1][iSpalte - 1], 0, 4));
                        // else if (iSpalte === +neq + 1) newText = document.createTextNode(myFormat(U_[iZeile - 1], 0, 5));
                        // else newText = document.createTextNode(myFormat(R_[iZeile - 1], 0, 3));
                        newCell.style.textAlign = 'center';
                        //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
                        newCell.style.padding = '5px';
                        newCell.style.margin = '0px';
                        if (iZeile === iSpalte) newCell.style.fontWeight = 'bold'
                        newCell.appendChild(newText);
                    }
                }

                for (let iZeile = 0; iZeile < el[draw_element].neqeG; iZeile++) {

                    let lmi = el[draw_element].lm[iZeile]
                    if (lmi >= 0) {
                        for (let iSpalte = 0; iSpalte < el[draw_element].neqeG; iSpalte++) {
                            let lmj = el[draw_element].lm[iSpalte]
                            if (lmj >= 0) {
                                let cell = table.rows[+lmi + 1].cells[+lmj + 1]
                                //console.log("child", cell.innerText)
                                //cell.style.fontWeight = 'bold'
                                cell.style.color = 'blue'
                            }
                        }
                    }
                }
            }

        }
    }

}

//---------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------
//-------------------- N  O  N  L  I  N  E  A  R  ---------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------

function nonlinear(stiff: number[][], R: number[], u: number[], newDiv: HTMLDivElement) {

    //---------------------------------------------------------------------------------------------------------------

    let ielem: number, i: number, j: number
    let nod1: number, nodi: number, lmj: number

    const dR = Array(neq);
    const du = Array(neq);

    let eps_disp = 1.0, iter = 0
    let eps_force = 0.0

    if (nkombinationen < 1) {
        window.alert("Es muss mindestens eine Kombination definiert sein");

        let element = document.getElementById("id_tab_kombi"); // id_eingabe
        element?.click();

        return 1;
    }

    const stiff_sig = Array.from(Array(neq), () => new Array(neq).fill(0.0));

    disp_lf = new TFArray3D(1, nnodesTotal, 1, 3, 1, nkombinationen);
    disp_print = new TFArray3D(1, nnodesTotal, 1, 3, 1, nkombinationen);
    u_lf = Array.from(Array(neq), () => new Array(nkombinationen).fill(0.0));
    u0_komb = Array.from(Array(neq), () => new Array(nkombinationen).fill(0.0));

    const u_last = Array(neq);

    //console.log("nkombinationen", nkombinationen)
    stabendkraefte = new TFArray3D(1, 6, 1, nelemTotal, 1, nkombinationen);
    lagerkraefte = new TFArray3D(0, nnodes - 1, 0, 2, 0, nkombinationen - 1);
    if (nNodeDisps > 0) { nodeDisp0Force = new TFArray3D_0(nNodeDisps, 3, nkombinationen); nodeDisp0Force.zero(); }
    eigenform_container_node.length = 0
    eigenform_container_u.length = 0
    for (let i = 0; i < nkombinationen; i++) {
        let a = new TFArray3D(1, nnodesTotal, 1, 3, 1, neigv)
        eigenform_container_node.push(a)

        let b = new TFArray2D(0, neq - 1, 1, neigv)
        eigenform_container_u.push(b)
    }
    alpha_cr = Array.from(Array(nkombinationen), () => new Array(neigv).fill(0.0));

    for (ielem = 0; ielem < nelem; ielem++) {
        if (el[ielem].isActive) {
            for (let ieload = 0; ieload < neloads; ieload++) {
                if ((eload[ieload].element === ielem) && (eload[ieload].art !== 8)) el[ielem].berechneElementlasten(ieload)
            }
        }
    }


    let pg = new Array(neq)
    let u_gesamt = new Array(neq)
    let R_last = new Array(neq)


    for (let iKomb = 1; iKomb <= nkombinationen; iKomb++) {

        pg.fill(0.0)
        u_last.fill(0.0);
        R_internal.fill(0.0)
        u.fill(0.0);
        R_last.fill(0.0)
        u_gesamt.fill(0.0)

        for (ielem = 0; ielem < nelemTotal; ielem++) {
            if (el[ielem].isActive) {
                el[ielem].reset_element();
            }
        }

        console.log("\n***************  K O M B I N A T I O N ", iKomb, "\n\n")
        write("\n***************  K O M B I N A T I O N   " + iKomb + "\n")

        for (iter = 0; iter < n_iterationen; iter++) {

            console.log("_________________  I T E R  = ", iter, " ___________________")

            for (i = 0; i < neq; i++) stiff[i].fill(0.0);
            for (i = 0; i < nnodesTotal; i++) lagerkraft[i].fill(0.0)

            R.fill(0.0);
            //R_internal.fill(0.0)

            for (ielem = 0; ielem < nelemTotal; ielem++) {

                if (el[ielem].isActive) {

                    el[ielem].berechneElementsteifigkeitsmatrix(iter);
                    el[ielem].addiereElementsteifigkeitmatrix(stiff)
                    /*
                                        for (let ieload = 0; ieload < neloads; ieload++) {
                                            if ((eload[ieload].element === ielem) && (eload[ieload].lf === iKomb)) {
                                                el[ielem].berechneElementlasten(ieload)
                                            }
                                        }
                    */
                }
            }

            // for (j = 0; j < neq; j++) {
            //     console.log('stiff[]', stiff[j])
            // }

            // Aufstellen der rechte Seite, Einzellasten


            for (i = 0; i < nloads; i++) {
                const index = load[i].lf - 1
                if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                    nod1 = load[i].node
                    for (j = 0; j < 3; j++) {
                        lmj = node[nod1].L[j]
                        if (lmj >= 0) {
                            R[lmj] = R[lmj] + load[i].p[j] * kombiTabelle[iKomb - 1][index]
                        }
                    }
                }
            }
            // console.log("R Einzellasten", R)

            //  und jetzt noch die normalen Elementlasten

            for (ielem = 0; ielem < nelemTotal; ielem++) {

                if (el[ielem].isActive) {

                    //console.log("ELEMENTLASTEN,ielem", ielem)
                    for (let ieload = 0; ieload < neloads; ieload++) {
                        if (eload[ieload].element === ielem) {
                            const index = eload[ieload].lf - 1
                            //console.log("elem kombi index,art", index, kombiTabelle[iKomb - 1][index], eload[ieload].art)
                            if (kombiTabelle[iKomb - 1][index] !== 0.0) {

                                if (eload[ieload].art === 8) el[ielem].berechneElementlasten(ieload)

                                for (j = 0; j < el[ielem].neqeG; j++) {
                                    lmj = el[ielem].lm[j]
                                    if (lmj >= 0) {
                                        R[lmj] = R[lmj] - eload[ieload].el_r[j] * kombiTabelle[iKomb - 1][index]
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // console.log("R mit Elementlasten", R)

            //for (i = 0; i < neq; i++) R[i] -= pg[i]   // Schiefstellung

            if (iter > 0) {

                let pel = new Array(10).fill(0.0)
                //let FeStabvor = new Array(10).fill(0.0)   // Stabvorverformungen

                for (ielem = 0; ielem < nelem; ielem++) {
                    if (el[ielem].isActive) {
                        el[ielem].berechneElementlasten_Vorverformung(pel, pg, iKomb - 1)
                        console.log("P E L", ielem, pel)

                        for (j = 0; j < el[ielem].neqeG; j++) {
                            lmj = el[ielem].lm[j]
                            if (lmj >= 0) {
                                R[lmj] = R[lmj] - pel[j]
                            }
                        }
                    }
                }
            }


            // wenn mindestens eine vorgegebenen Knotenverschiebung in der Kombination vorhanden ist,
            // dann für diese Freiheitsgrade Zeilen und Spalten bearbeiten

            for (let ieload = 0; ieload < neloads; ieload++) {
                const index = eload[ieload].lf - 1
                if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                    if ((eload[ieload].art === 8)) {         // && (eload[ieload].lf === iLastfall)
                        console.log("VORDEFINIERTE VERFORMUNGEN", eload[ieload].ieq0)

                        for (let k = 0; k < 3; k++) {

                            if (eload[ieload].ieq0[k] >= 0) {
                                let ieq = eload[ieload].ieq0[k]
                                console.log("I E Q ", ieq)
                                for (i = 0; i < neq; i++) {
                                    stiff[i][ieq] = 0.0   // Spalte streichen
                                    stiff[ieq][i] = 0.0   // Zeile streichen
                                }
                                stiff[ieq][ieq] = 1000.0
                                R[ieq] = 0.0
                            }
                        }
                    }
                }
            }



            for (i = 0; i < neq; i++) {
                dR[i] = R[i] - R_internal[i]
                R_[i] = R[i];
                //console.log("R,Ri,dR", i, R[i], R_internal[i], dR[i], u[i])
            }
            console.log("dR[]", dR)
            console.log("R[]", R)
            console.log("R_internal[]", R_internal)

            for (i = 0; i < neq; i++) {
                for (j = 0; j < neq; j++) {
                    stm[i][j] = stiff[i][j]
                }
            }

            // Gleichungssystem lösen

            let error = -1
            if (equation_solver === 1) {
                error = gauss(neq, stiff, dR);
            } else {
                error = cholesky_solve_equation(stiff, dR);
            }
            if (error != 0) {
                //window.alert("Gleichungssystem singulär");

                const question_Text = "Steifigkeitsmatrix nicht positiv definit in Kombination " + iKomb + ". " +
                    "Mögliche Ursachen: Lasten zu hoch in dieser Kombination. Tritt die Meldung auch bei einer Berechnung " +
                    "nach Th. I. Ordnung auf, dann ist das System kinematisch."

                alertdialog('ok', question_Text);

                return 1;
            }


            for (i = 0; i < neq; i++) {
                du[i] = dR[i];
                u[i] = u_gesamt[i] = u_gesamt[i] + du[i];
                U_[i] = du[i];
            }

            for (i = 0; i < neq; i++) {
                //console.log("U", i, u[i] * 1000.0)    // in mm, mrad
                u_lf[i][iKomb - 1] = u[i]
            }
            console.log("U[]", u)
            console.log("dU[]", U_)
            // Rückrechnung

            let force: number[] = Array(6)
            R_internal.fill(0.0)


            for (ielem = 0; ielem < nelemTotal; ielem++) {
                if (el[ielem].isActive) {
                    force = el[ielem].berechneInterneKraefte(ielem, iKomb, iter, u);
                    console.log("force", force)
                    for (i = 0; i < 6; i++) stabendkraefte.set(i + 1, ielem + 1, iKomb, force[i]);

                    el[ielem].berechneLagerkraefte();
                }
            }

            // Überprüfe Konvergenz der Verformungen und Kräfte

            {
                let zaehler = 0.0, nenner = 0.0
                for (let i = 0; i < neq; i++) {
                    zaehler += (u[i] - u_last[i]) ** 2
                    nenner += u[i] * u[i]
                }
                zaehler = Math.sqrt(zaehler)
                nenner = Math.sqrt(nenner)
                if (nenner === 0.0) eps_disp = 0.0;
                else eps_disp = zaehler / nenner;
                //write('Toleranz eps in Iterationsschritt ' + iter + ' = ' + eps_disp)

                for (let i = 0; i < neq; i++) u_last[i] = u[i];


                for (let ieload = 0; ieload < neloads; ieload++) {
                    const index = eload[ieload].lf - 1
                    if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                        if ((eload[ieload].art === 8)) {
                            for (let k = 0; k < 3; k++) {
                                if (eload[ieload].ieq0[k] >= 0) {
                                    let ieq = eload[ieload].ieq0[k]
                                    R_internal[ieq] = 0.0
                                }
                            }
                        }
                    }
                }

                zaehler = 0.0; nenner = 0.0
                for (let i = 0; i < neq; i++) {
                    zaehler += (R_[i] - R_internal[i]) ** 2
                    nenner += R_[i] * R_[i]
                }
                zaehler = Math.sqrt(zaehler)
                nenner = Math.sqrt(nenner)
                eps_force = 0.0
                if (nenner !== 0.0) eps_force = zaehler / nenner;

                write('Toleranz in Iterationsschritt ' + iter + ', eps_disp = ' + myFormat(eps_disp,5,5,1) + ', eps_force = ' + myFormat(eps_force,5,5,1))

                //for (let i = 0; i < neq; i++) R_internal[i] = R_[i];

            }

            if ((iter === n_iterationen - 1) || (eps_disp < epsDisp_tol)) {
                let disp = [3]
                for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                    for (j = 0; j < 3; j++) {
                        let ieq = node[i].L[j]
                        if (ieq === -1) {
                            disp[j] = 0
                        } else {
                            disp[j] = u[ieq] * 1000     // Umrechnung in mm und mrad
                        }
                    }

                    for (j = 0; j < 3; j++) {
                        disp_lf.set(i + 1, j + 1, iKomb, disp[j])
                        if (Math.abs(disp[j]) > maxValue_komb[iKomb - 1].disp) maxValue_komb[iKomb - 1].disp = Math.abs(disp[j])
                    }

                    // Knotenverformungen wieder einarbeiten

                    for (j = 0; j < nNodeDisps; j++) {
                        for (let ieload = 0; ieload < neloads; ieload++) {
                            const index = eload[ieload].lf - 1
                            if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                                if (nodeDisp0[j].node === i) {
                                    //console.log("<<<<<<<<<<<<<<< nNodeDisps >>>>>>>>>>>>>", i, nodeDisp0[j].lf, iKomb)
                                    if (nodeDisp0[j].dispx0 !== 0) {
                                        disp[0] = nodeDisp0[j].dispx0 * kombiTabelle[iKomb - 1][index]
                                    }
                                    if (nodeDisp0[j].dispz0 !== 0) {
                                        disp[1] = nodeDisp0[j].dispz0 * kombiTabelle[iKomb - 1][index]
                                    }
                                    if (nodeDisp0[j].phi0 !== 0) {
                                        disp[2] = nodeDisp0[j].phi0 * kombiTabelle[iKomb - 1][index]
                                    }

                                }
                            }
                        }
                    }
                    for (j = 0; j < 3; j++) disp_print.set(i + 1, j + 1, iKomb, disp[j])

                }
            }
            if (iter === 0) {     // Schiefstellung

                if (THIIO_flag === 0) {
                    pg.fill(0.0)
                    for (i = 0; i < neq; i++) {
                        u0_komb[i][iKomb - 1] = pg[i]
                    }
                    maxValue_u0[iKomb - 1].ieq = 0
                    maxValue_u0[iKomb - 1].u0 = 0.0

                } else {

                    eigenwertberechnung(iKomb, stiff, stiff_sig, u, 0)

                    let umax = 0.0, ieq = -1
                    if (maxU_node === 0 || maxU_node > nnodes) {

                        for (i = 0; i < neq; i++) {
                            if (Math.abs(u[i]) > umax) {
                                umax = Math.abs(u[i]);
                                ieq = i;
                            }
                        }
                        console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU umax=", umax)

                    } else {
                        ieq = node[maxU_node - 1].L[maxU_dir]
                        console.log("schief", ieq, u[ieq])
                        umax = Math.abs(u[ieq])
                    }

                    let pg_max = 0.0
                    if (umax > 0.0) {
                        let vorzeichen_U = Math.sign(u_lf[ieq][iKomb - 1])
                        if (vorzeichen_U === 0.0) vorzeichen_U = 1.0
                        let vorzeichen_umax = Math.sign(u[ieq])
                        let faktor = vorzeichen_U * vorzeichen_umax * maxU_schief / umax
                        console.log("vorzeichen", vorzeichen_U, vorzeichen_umax, faktor)
                        for (i = 0; i < neq; i++) {
                            pg[i] = u[i] * faktor
                            if (Math.abs(pg[i]) > pg_max) pg_max = Math.abs(pg[i])
                        }
                    } else {
                        pg.fill(0.0)
                    }

                    for (i = 0; i < neq; i++) {
                        u0_komb[i][iKomb - 1] = pg[i]
                    }
                    maxValue_u0[iKomb - 1].ieq = ieq
                    maxValue_u0[iKomb - 1].u0 = pg_max

                    //console.log("pg", pg)

                }
            }

            if (eps_disp < epsDisp_tol && eps_force < epsForce_tol) break;

        }  // ende iter

        if (maxValue_u0[iKomb - 1].ieq >= 0) {
            console.log("==== pg_max", maxValue_u0[iKomb - 1].ieq, maxValue_u0[iKomb - 1].u0, u0_komb[maxValue_u0[iKomb - 1].ieq][iKomb - 1])
        }

        for (ielem = 0; ielem < nelem_Balken + nelem_koppelfedern; ielem++) {
            if (el[ielem].isActive) el[ielem].berechneElementSchnittgroessen(ielem, iKomb - 1);
        }


        for (i = 0; i < nloads; i++) {                          // Knotenlasten am Knoten abziehen

            const index = load[i].lf - 1
            if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                nodi = load[i].node
                lagerkraft[nodi][0] = lagerkraft[nodi][0] + load[i].p[0] * kombiTabelle[iKomb - 1][index]
                lagerkraft[nodi][1] = lagerkraft[nodi][1] + load[i].p[1] * kombiTabelle[iKomb - 1][index]
                lagerkraft[nodi][2] = lagerkraft[nodi][2] + load[i].p[2] * kombiTabelle[iKomb - 1][index]
            }
        }

        if (nNodeDisps > 0) {
            for (let k = 0; k < nNodeDisps; k++) {
                let index = nodeDisp0[k].lf - 1
                console.log("nodeDisp0 index", k, index, iKomb, kombiTabelle[iKomb - 1][index])
                if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                    for (let j = 0; j < 3; j++) {
                        if (nodeDisp0[k].dispL[j]) {
                            nodi = nodeDisp0[k].node
                            console.log("nodeDisp0Force", k, j, iKomb, lagerkraft[nodi][j])
                            nodeDisp0Force.set(k, j, iKomb - 1, -lagerkraft[nodi][j]);
                            if (node[nodi].L_org[j] !== 1) lagerkraft[nodi][j] = 0.0   // kein starres Lager
                        }
                    }
                }
            }
        }

        if (nelem_Federn > 0) {                        // Federkraefte in lagerkraft[] Tabelle eintragen
            for (i = 0; i < nelem_Federn; i++) {

                let iFeder = i + nelem_Balken + nelem_koppelfedern
                console.log("FEDER hängt an Knoten", el[iFeder].nod)
                nodi = el[iFeder].nod
                for (let j = 0; j < 3; j++) {
                    if (node[nodi].L_org[j] > 1) lagerkraft[nodi][j] = stabendkraefte._(j + 1, iFeder + 1, iKomb);
                }
            }
        }


        for (let inode = 0; inode < nnodes; inode++) {
            lagerkraefte.set(inode, 0, iKomb - 1, lagerkraft[inode][0]);
            lagerkraefte.set(inode, 1, iKomb - 1, lagerkraft[inode][1]);
            lagerkraefte.set(inode, 2, iKomb - 1, lagerkraft[inode][2]);
        }
        //for (i = 0; i < nnodesTotal; i++) {
        //    console.log("Lager", i + 1, lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
        //}

        // Berechnung alpha_cr, Knickformen

        if (THIIO_flag > 0) eigenwertberechnung(iKomb, stiff, stiff_sig, u, 1)

        ausgabe(iKomb, newDiv)

        if (eps_disp < epsDisp_tol) {
            write('Konvergenz bei den Verformungen erreicht, iter = ' + iter)
        } else {
            write('++++ keine Konvergenz bei den Verformungen erreicht, Anzahl der Iterationen erhöhen ++++')
            keineKonvergenzErreicht = true
        }

        if (eps_force < epsForce_tol) {
            write('Konvergenz bei den Kräften erreicht, iter = ' + iter)
        } else {
            write('++++ keine Konvergenz bei den Kräften erreicht, Anzahl der Iterationen erhöhen ++++')
            keineKonvergenzErreicht = true
        }



    }   //ende iKomb

    return 0;
}

//---------------------------------------------------------------------------------------------------------------
async function alertdialog(trueButton_text: string, question_text: string) {
    //-----------------------------------------------------------------------------------------------------------

    const dialogAlert = new AlertDialog({
        trueButton_Text: trueButton_text,
        question_Text: question_text,
        // "Steifigkeitsmatrix nicht positiv definit in Kombination " + iKomb + ". " +
        //     "Mögliche Ursachen: Lasten zu hoch in dieser Kombination. Tritt die Meldung auch bei einer Berechnung " +
        //     "nach Th. I. Ordnung auf, dann ist das System kinematisch.",
    });
    await dialogAlert.confirm();

    return 1;

}