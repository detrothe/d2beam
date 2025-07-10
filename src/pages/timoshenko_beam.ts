import { CElement } from "./element"

import {
    node, element, eload, lagerkraft, neloads, kombiTabelle, THIIO_flag, incr_neq, neq, u_lf, u0_komb, eigenform_container_u,
    nelTeilungen, ntotalEloads, nlastfaelle, nkombinationen, maxValue_komb, maxValue_lf, nstabvorverfomungen, stabvorverformung, P_delta,
    stadyn, eigenform_dyn, stabvorverformung_komb,
    R_internal,
    matprop_flag
} from "./rechnen"

import { BubbleSort } from "./lib"

export class CTimoshenko_beam extends CElement {

    neqe = 6

    neqeG = 6

    ielem = -1
    nknoten = 2
    isActive = true
    emodul = 0.0
    gmodul = 0.0
    querdehnzahl = 0.0
    schubfaktor = 0.0
    k_0 = 0.0           // Bettungsmodul nach Winkler in kN/m²
    wichte = 0.0
    stabgewicht = 0.0   // Area * Wichte
    ks = 0.0
    Iy = 0.0
    area = 0.0
    zso = 0.0
    alphaT = 0.0
    h = 0.0
    psi = 0.0
    eta = 0.0
    nod1 = -1
    nod2 = -1
    nod = [0, 0]
    x1 = 0.0
    x2 = 0.0
    z1 = 0.0
    z2 = 0.0
    sl = 0.0
    sl0 = 0.0   // Stablänge gesamt mit starren Enden
    aL = 0.0   // starres Ende Links
    aR = 0.0   // starres Ende rechts
    dx = 0.0
    dz = 0.0
    normalkraft = 0.0
    lm: number[] = Array(10).fill(-2)
    gelenk: number[] = [0, 0, 0, 0, 0, 0]
    nGelenke = 0
    cosinus = 0.0
    sinus = 0.0
    alpha = 0.0
    //estiff: number[][] = []
    estiff_sig: number[][] = []
    estiff_sig_global: number[][] = []
    estm: number[][] = []
    estmL2: number[][] = []       // lokale Elementsteifigkeitsmatrix incl. TH.II.O., für Lastvektor von Knotenverformungen
    ksig: number[][] = []
    //trans: number[][] = []
    emass: number[][] = []
    mue = 0.0                     // Dichte * Area für Dynamik Massenmatrix
    mass_gesamt = 0.0             // Gesamtmasse des Elementes

    transU: number[][] = []       // Transformation von global nach lokal
    transF: number[][] = []       // Transformation von lokal nach global = transU ^T
    TfG2L: number[][] = []        // Transformation der Kraefte von global nach lokal

    estiffG: number[][] = []      // globale Elementsteigkeitsmatrix mit Berücksichtigung der Gelenke
    emassG: number[][] = []      // globale Elementmassenmatrix mit Berücksichtigung der Gelenke


    u: number[] = Array(10)        // Verformungen global
    edispL: number[] = Array(6)    // Verformungen lokal
    edisp0: number[] = Array(6).fill(0.0)   // Vorverformungen
    edispv0: number[] = Array(6).fill(0.0)   // Stabvorverformungen

    F: number[] = Array(10)        // Stabendgrößen nach WGV im globalen Koordinatensystem
    FL: number[] = Array(6)        // Stabendgrößen nach KGV im lokalen Koordinatensystem
    Fe: number[] = Array(10)       // Vorverformungen aus Schiefstellung 1. Eigenwert
    FeVor: number[] = Array(10)    // Vorverformungen aus Stabschiefstellung

    N_ = [] as number[][]          // Schnittgrößen entlang Stab, lokal
    V_ = [] as number[][]
    M_ = [] as number[][]
    u_ = [] as number[][]          // Verformungen entlang Stab, lokale Richtung
    w_ = [] as number[][]
    phi_ = [] as number[][]
    bettung_ = [] as number[][]

    N_komb = [] as number[][]         // Schnittgrößen entlang Stab, lokal, aus Kombinationen
    V_komb = [] as number[][]
    M_komb = [] as number[][]
    u_komb = [] as number[][]         // Verformungen entlang Stab, lokale Richtung
    uG_komb = [] as number[][]         // Verformungen entlang Stab, lokale Richtung
    w_komb = [] as number[][]
    wG_komb = [] as number[][]
    phi_komb = [] as number[][]
    phiG_komb = [] as number[][]
    bettung_komb = [] as number[][]

    Nb_komb = [] as number[][]         // Bemessungs(Nachweis)-Schnittgrößen entlang Stab, lokal, aus Kombinationen
    Vb_komb = [] as number[][]

    NL: number = 0.0
    VL: number = 0.0
    ML: number = 0.0
    uL: number = 0.0
    wL: number = 0.0
    phiL: number = 0.0
    NR = 0.0

    nTeilungen = 10;
    x_: number[] = []


    ich_bin(ielem: number) {
        console.log("Ich bin ein Timoshenko Element , No ", ielem)
    }


    //---------------------------------------------------------------------------------------------
    reset_element(): void {   // zu Beginn jeder Kombination aufrufen
        this.normalkraft = 0.0
    }

    //---------------------------------------------------------------------------------------------
    setQuerschnittsdaten(emodul: number, Iy: number, area: number, wichte: number, ks: number, querdehnzahl: number, schubfaktor: number,
        height: number, zso: number, alphaT: number) {

        this.emodul = emodul
        this.Iy = Iy
        this.area = area
        this.wichte = wichte
        this.ks = ks
        this.querdehnzahl = querdehnzahl
        this.schubfaktor = schubfaktor
        this.h = height
        this.zso = zso
        this.alphaT = alphaT
    }

    //---------------------------------------------------------------------------------------------
    initialisiereElementdaten(ielem: number) {

        let x1, x2, z1, z2

        let n: number

        this.ielem = ielem

        if (THIIO_flag === 0) n = nlastfaelle;
        else n = nkombinationen;

        this.isActive = element[ielem].isActive
        if (!this.isActive) return;

        this.nod1 = element[ielem].nod[0];
        this.nod2 = element[ielem].nod[1];
        this.nod[0] = this.nod1
        this.nod[1] = this.nod2

        this.x1 = x1 = node[this.nod1].x;
        this.x2 = x2 = node[this.nod2].x;
        this.z1 = z1 = node[this.nod1].z;
        this.z2 = z2 = node[this.nod2].z;

        this.aL = element[ielem].aL
        this.aR = element[ielem].aR
        this.k_0 = element[ielem].k_0

        this.dx = x2 - x1;
        this.dz = z2 - z1;
        this.sl0 = Math.sqrt(this.dx * this.dx + this.dz * this.dz)
        this.sl = Math.sqrt(this.dx * this.dx + this.dz * this.dz) - this.aL - this.aR;      // elastische Stablänge

        if (this.sl < 1e-12) {
            alert("Länge von Element " + String(ielem + 1) + " ist null")
            return;
        }


        this.cosinus = this.dx / this.sl0
        this.sinus = this.dz / this.sl0

        this.alpha = Math.atan2(this.dz, this.dx) // *180.0/Math.PI
        console.log("sl = ", ielem, this.sl, this.alpha)

        this.normalkraft = 0.0

        this.lm[0] = node[this.nod1].L[0];
        this.lm[1] = node[this.nod1].L[1];
        this.lm[2] = node[this.nod1].L[2];
        this.lm[3] = node[this.nod2].L[0];
        this.lm[4] = node[this.nod2].L[1];
        this.lm[5] = node[this.nod2].L[2];

        this.nGelenke = 0
        let ind = 0;
        for (let i = 0; i < 6; i++) {
            this.gelenk[i] = element[ielem].gelenk[i]
            if (this.gelenk[i] > 0) {
                this.nGelenke++;
                // if (i === 2 || i === 5) { this.lm[i] = neq; }
                // else {
                ind++;
                this.neqeG++;
                this.lm[ind + 5] = neq;
                // }
                incr_neq();
            }
        }

        console.log("neqeG ", this.neqeG)
        console.log("lm() von Element ", ielem, this.lm)

        this.estm = Array.from(Array(6), () => new Array(6));
        this.estmL2 = Array.from(Array(6), () => new Array(6));
        this.ksig = Array.from(Array(6), () => new Array(6));
        //this.trans = Array.from(Array(6), () => new Array(6).fill(0.0));
        //this.estiff = Array.from(Array(6), () => new Array(6));
        this.estiff_sig = Array.from(Array(this.neqeG), () => new Array(this.neqeG));

        this.transU = Array.from(Array(6), () => new Array(this.neqeG).fill(0.0));
        this.transF = Array.from(Array(this.neqeG), () => new Array(6).fill(0.0));
        this.TfG2L = Array.from(Array(6), () => new Array(this.neqe).fill(0.0));

        this.estiffG = Array.from(Array(this.neqeG), () => new Array(this.neqeG));

        if (stadyn > 0) {
            this.emass = Array.from(Array(6), () => new Array(6));
            this.emassG = Array.from(Array(this.neqeG), () => new Array(this.neqeG));
            this.mue = this.wichte * this.area / 10   // in Tonnen/m
            this.mass_gesamt = this.mue * this.sl
        }

        let cophi = node[this.nod1].co
        let siphi = node[this.nod1].si

        let t00 = this.cosinus * cophi - this.sinus * siphi    //this.cosinus
        let t01 = this.sinus * cophi + this.cosinus * siphi    //this.sinus
        let t10 = -t01
        let t11 = t00

        ind = 5;
        if (this.gelenk[0] > 0) {
            ind++;
            this.transU[0][ind] = 1.0
            this.transF[ind][0] = 1.0
        } else {
            this.transU[0][0] = t00 // this.cosinus
            this.transU[0][1] = t01 // this.sinus
            this.transF[0][0] = t00 // this.cosinus
            this.transF[1][0] = t01 // this.sinus
            this.TfG2L[0][0] = t00
            this.TfG2L[1][0] = t10
            this.TfG2L[2][0] = this.aL * t10
        }
        if (this.gelenk[1] > 0) {
            ind++;
            this.transU[1][ind] = 1.0
            this.transF[ind][1] = 1.0
        } else {
            this.transU[1][0] = t10  // -this.sinus
            this.transU[1][1] = t11  // this.cosinus
            this.transF[0][1] = t10  // -this.sinus
            this.transF[1][1] = t11  // this.cosinus
            this.transU[1][2] = -this.aL
            this.transF[2][1] = -this.aL
            this.TfG2L[0][1] = t01
            this.TfG2L[1][1] = t11
            this.TfG2L[2][1] = this.aL * t11
        }
        if (this.gelenk[2] > 0) {
            ind++;
            this.transU[2][ind] = 1.0
            this.transF[ind][2] = 1.0
            // this.transU[1][2] = -this.aL
            // this.transF[2][1] = -this.aL
            this.TfG2L[2][2] = 1.0
        } else {
            this.transU[2][2] = 1.0
            // this.transU[1][2] = -this.aL
            this.transF[2][2] = 1.0
            // this.transF[2][1] = -this.aL
            this.TfG2L[2][2] = 1.0
        }
        // this.transU[2][2] = 1.0
        // this.transF[2][2] = 1.0


        cophi = node[this.nod2].co
        siphi = node[this.nod2].si

        let t33 = this.cosinus * cophi - this.sinus * siphi    //this.cosinus
        let t34 = this.sinus * cophi + this.cosinus * siphi    //this.sinus
        let t43 = -t34
        let t44 = t33


        if (this.gelenk[3] > 0) {
            ind++;
            this.transU[3][ind] = 1.0
            this.transF[ind][3] = 1.0
        } else {
            this.transU[3][3] = t33  // this.cosinus
            this.transU[3][4] = t34  // this.sinus
            this.transF[3][3] = t33  // this.cosinus
            this.transF[4][3] = t34  // this.sinus
            this.TfG2L[3][3] = t33
            this.TfG2L[4][3] = t43
            this.TfG2L[5][3] = -this.aR * t43
        }
        if (this.gelenk[4] > 0) {
            ind++;
            this.transU[4][ind] = 1.0
            this.transF[ind][4] = 1.0

        } else {
            this.transU[4][3] = t43  // -this.sinus
            this.transU[4][4] = t44  // this.cosinus
            this.transF[3][4] = t43  // -this.sinus
            this.transF[4][4] = t44  // this.cosinus
            this.transU[4][5] = this.aR
            this.transF[5][4] = this.aR
            this.TfG2L[3][4] = t34
            this.TfG2L[4][4] = t44
            this.TfG2L[5][4] = -this.aR * t44

        }
        if (this.gelenk[5] > 0) {
            ind++;
            this.transU[5][ind] = 1.0
            this.transF[ind][5] = 1.0
            // this.transU[4][5] = this.aR
            // this.transF[5][4] = this.aR
            this.TfG2L[5][5] = 1.0
        } else {
            this.transU[5][5] = 1.0
            // this.transU[4][5] = this.aR
            this.transF[5][5] = 1.0
            // this.transF[5][4] = this.aR
            this.TfG2L[5][5] = 1.0
        }
        // this.transU[5][5] = 1.0
        // this.transF[5][5] = 1.0

        // for (let j = 0; j < 6; j++) {
        //     console.log("this.transU", (ielem + 1), this.transU[j])
        //     //console.log("this.TfG2L. ielem", (ielem + 1), this.TfG2L[j])
        // }

        // ind = 5;
        // if (this.gelenk[0] > 0) {
        //     ind++;
        //     this.transF[ind][0] = 1.0
        // } else {
        //     this.transF[0][0] = this.cosinus
        //     this.transF[1][0] = this.sinus
        // }
        // if (this.gelenk[1] > 0) {
        //     ind++;
        //     this.transF[ind][1] = 1.0
        // } else {
        //     this.transF[0][1] = -this.sinus
        //     this.transF[1][1] = this.cosinus
        // }
        // this.transF[2][2] = 1.0

        // if (this.gelenk[3] > 0) {
        //     ind++;
        //     this.transF[ind][3] = 1.0
        // } else {
        //     this.transF[3][3] = this.cosinus
        //     this.transF[4][3] = this.sinus
        // }
        // if (this.gelenk[4] > 0) {
        //     ind++;
        //     this.transF[ind][4] = 1.0
        // } else {
        //     this.transF[3][4] = -this.sinus
        //     this.transF[4][4] = this.cosinus
        // }
        // this.transF[5][5] = 1.0

        // for (let j = 0; j < this.neqeG; j++) {
        //     console.log("this.transF", this.transF[j])
        // }

        // Drehung der Lager berücksichtigen

        // let cophi = node[this.nod1].co
        // let siphi = node[this.nod1].si

        // this.trans[0][0] = this.cosinus * cophi - this.sinus * siphi    //this.cosinus
        // this.trans[0][1] = this.sinus * cophi + this.cosinus * siphi    //this.sinus
        // this.trans[1][0] = -this.trans[0][1]
        // this.trans[1][1] = this.trans[0][0]
        // this.trans[2][2] = 1.0


        // cophi = node[this.nod2].co
        // siphi = node[this.nod2].si

        // this.trans[3][3] = this.cosinus * cophi - this.sinus * siphi   //this.cosinus
        // this.trans[3][4] = this.sinus * cophi + this.cosinus * siphi   //this.sinus
        // this.trans[4][3] = -this.trans[3][4]
        // this.trans[4][4] = this.trans[3][3]
        // this.trans[5][5] = 1.0

        if (this.k_0 > 0.0) {
            this.nTeilungen = 2
            this.x_ = Array(this.nTeilungen)
            this.x_[0] = 0.0
            this.x_[1] = this.sl
        }
        else {
            this.nTeilungen = nelTeilungen    // übernahme der Voreinstellung

            this.x_ = Array(this.nTeilungen + 1)

            const delta_x = this.sl / this.nTeilungen                    //erstmal normal mit nTeilungen Stab teilen
            let xx = 0.0
            let j = 1
            for (let i = 0; i <= this.nTeilungen; i++) {
                this.x_[i] = xx
                xx = xx + delta_x
            }

            let sort = 0
            let nelTeilungenNeu = this.nTeilungen + 1
            for (let ieload = 0; ieload < ntotalEloads; ieload++) {                   //jetzt zusaetzliche Teilungspunkte fuer die jeweilige Einzellast, falls xP in x_ nicht enthalten ist
                if (eload[ieload].element === ielem && (eload[ieload].art === 6)) {

                    if (Math.abs(this.x_[0] - eload[ieload].x) < 0.0000001) continue;  // nichts zu tun wenn Last am Anfang oder Ende des Stabs angreift
                    if (Math.abs(this.x_[this.nTeilungen] - eload[ieload].x) < 0.0000001) continue;

                    let nn = 0
                    for (j = 0; j < nelTeilungenNeu; j++) {     // bei erster und letzter Stelle braucht nichts eingefügt zu werden
                        if (Math.abs(this.x_[j] - eload[ieload].x) < 0.0000001) { //xP schon in x_ enthalten, also xP nur 1mal hinzufuegen
                            nn = 1
                        }
                    }

                    if (nn === 1) {
                        for (j = this.nTeilungen; j < nelTeilungenNeu; j++) {
                            if (Math.abs(this.x_[j] - eload[ieload].x) < 0.0000001) { //xP schon 2mal in x_ enthalten
                                nn = 0
                            }
                        }
                        if (nn === 1) {
                            nelTeilungenNeu++;
                            this.x_.push(eload[ieload].x)
                            sort = 1
                        }
                    }
                    else if (nn === 0) {                   //xP war nicht enthalten,deshalb jetzt xP 2mal zu x_ dazu fuegen
                        nn = 2
                        nelTeilungenNeu += 2
                        this.x_.push(eload[ieload].x)
                        this.x_.push(eload[ieload].x)
                        sort = 1
                    }

                }
            }
            console.log("vor BUBBLESORT", this.x_)

            if (sort > 0) BubbleSort(this.x_);

            console.log("nach BUBBLESORT", this.x_)

            this.nTeilungen = nelTeilungenNeu
        }

        if (THIIO_flag === 0) {
            this.N_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.V_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.M_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.u_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.w_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.phi_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.bettung_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
        }

        if (nkombinationen > 0) {
            this.N_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.V_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.M_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.u_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.uG_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.w_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.wG_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.phi_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.phiG_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.bettung_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));

            this.Nb_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.Vb_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
        }

        this.berechneLokaleElementsteifigkeitmatrix()

        // Eigengewicht
        this.stabgewicht = this.area * this.wichte
        eload[ielem].pL = this.stabgewicht
        eload[ielem].pR = this.stabgewicht

        if (stadyn > 0) this.berechneLokaleElementmassenmatrix();
    }



    //---------------------------------------------------------------------------------------------
    berechneLokaleElementsteifigkeitmatrix() {

        const sl = this.sl
        const L2 = sl * sl
        const L3 = L2 * sl

        let area_s: number
        let EAL = this.emodul * this.area / sl
        const EI = this.emodul * this.Iy
        this.gmodul = this.emodul / 2.0 / (1.0 + this.querdehnzahl)

        if (this.schubfaktor === 0.0) {  // schubstarr
            area_s = this.area
            this.psi = 1.0
            this.eta = 0.0
        } else {
            area_s = this.schubfaktor * this.area
            this.psi = 1.0 / (1.0 + 12.0 * EI / this.gmodul / area_s / L2)
            this.eta = EI / this.gmodul / area_s
        }
        const psi = this.psi

        console.log("psi", this.psi)

        this.estm[0][0] = EAL
        this.estm[0][1] = 0.0
        this.estm[0][2] = 0.0
        this.estm[0][3] = -EAL
        this.estm[0][4] = 0.0
        this.estm[0][5] = 0.0
        this.estm[1][0] = 0.0
        this.estm[1][1] = 12 * EI * psi / L3
        this.estm[1][2] = -6 * EI * psi / L2
        this.estm[1][3] = 0.0
        this.estm[1][4] = -12 * EI * psi / L3
        this.estm[1][5] = -6 * EI * psi / L2
        this.estm[2][0] = 0.0
        this.estm[2][1] = -6 * EI * psi / L2
        this.estm[2][2] = (1.0 + 3.0 * psi) * EI / sl
        this.estm[2][3] = 0.0
        this.estm[2][4] = 6 * EI * psi / L2
        this.estm[2][5] = (3.0 * psi - 1.0) * EI / sl
        this.estm[3][0] = -EAL
        this.estm[3][1] = 0.0
        this.estm[3][2] = 0.0
        this.estm[3][3] = EAL
        this.estm[3][4] = 0.0
        this.estm[3][5] = 0.0
        this.estm[4][0] = 0.0
        this.estm[4][1] = -12 * EI * psi / L3
        this.estm[4][2] = 6 * EI * psi / L2
        this.estm[4][3] = 0.0
        this.estm[4][4] = 12 * EI * psi / L3
        this.estm[4][5] = 6 * EI * psi / L2
        this.estm[5][0] = 0.0
        this.estm[5][1] = -6 * EI * psi / L2
        this.estm[5][2] = (3.0 * psi - 1.0) * EI / sl
        this.estm[5][3] = 0.0
        this.estm[5][4] = 6 * EI * psi / L2
        this.estm[5][5] = (1.0 + 3.0 * psi) * EI / sl

        if (this.k_0 > 0.0) {

            const L4 = L3 * sl
            const nenner2 = (1.0 + 12. * this.eta / L2) ** 2
            const eta = this.eta
            const eta2 = eta * eta

            console.log("ielem, k_0", this.ielem, this.k_0, nenner2)

            this.estm[1][1] += this.k_0 * (13. * L4 + 295. * eta + 1680. * eta2) / (35. * nenner2 * L3)
            this.estm[1][2] += -this.k_0 * (11. * L4 + 231. * eta * L2 + 1260. * eta2) / (210. * nenner2 * L2)
            this.estm[1][4] += this.k_0 * (9. * L4 + 252. * eta * L2 + 1680. * eta2) / (70. * nenner2 * L3)
            this.estm[1][5] += this.k_0 * (13. * L4 + 378. * eta * L2 + 2520. * eta2) / (420. * nenner2 * L2)
            this.estm[2][2] += this.k_0 * (L4 + 21. * eta * L2 + 126 * eta2) / (105. * nenner2 * sl)
            this.estm[2][4] += -this.k_0 * (13. * L4 + 378. * eta * L2 + 2520. * eta2) / (420. * nenner2 * L2)
            this.estm[2][5] += -this.k_0 * (L4 + 28. * eta * L2 + 168. * eta2) / (140. * nenner2 * sl)
            this.estm[4][4] += this.k_0 * (13. * L4 + 295. * eta + 1680. * eta2) / (35. * nenner2 * L3)
            this.estm[4][5] += this.k_0 * (11. * L4 + 231. * eta * L2 + 1260. * eta2) / (210. * nenner2 * L2)
            this.estm[5][5] += this.k_0 * (L4 + 21. * eta * L2 + 126. * eta2) / (105. * nenner2 * sl)

            this.estm[2][1] = this.estm[1][2]
            this.estm[4][1] = this.estm[1][4]
            this.estm[5][1] = this.estm[1][5]
            this.estm[4][2] = this.estm[2][4]
            this.estm[5][2] = this.estm[2][5]
            this.estm[5][4] = this.estm[4][5]
        }

        if (P_delta) {
            for (let i = 0; i < 6; i++) this.ksig[i].fill(0.0);
            EAL = 1.0 / sl

            this.ksig[1][1] = EAL
            this.ksig[1][4] = -EAL
            this.ksig[4][1] = -EAL
            this.ksig[4][4] = EAL

        } else {
            EAL = 0.0
            const fact = 1.0 / 60.0 / sl
            const psi2 = psi * psi

            this.ksig[0][0] = EAL
            this.ksig[0][1] = 0.0
            this.ksig[0][2] = 0.0
            this.ksig[0][3] = -EAL
            this.ksig[0][4] = 0.0
            this.ksig[0][5] = 0.0
            this.ksig[1][0] = 0.0
            this.ksig[1][1] = (60.0 + 12.0 * psi2) * fact
            this.ksig[1][2] = -6. * psi2 * fact * sl
            this.ksig[1][3] = 0.0
            this.ksig[1][4] = -(60. + 12. * psi2) * fact
            this.ksig[1][5] = -6. * psi2 * fact * sl
            this.ksig[2][0] = 0.0
            this.ksig[2][1] = -6. * psi2 * fact * sl
            this.ksig[2][2] = (5. + 3. * psi2) * fact * L2
            this.ksig[2][3] = 0.0
            this.ksig[2][4] = 6. * psi2 * fact * sl
            this.ksig[2][5] = (3. * psi2 - 5.) * fact * L2
            this.ksig[3][0] = -EAL
            this.ksig[3][1] = 0.0
            this.ksig[3][2] = 0.0
            this.ksig[3][3] = EAL
            this.ksig[3][4] = 0.0
            this.ksig[3][5] = 0.0
            this.ksig[4][0] = 0.0
            this.ksig[4][1] = -(60.0 + 12.0 * psi2) * fact
            this.ksig[4][2] = 6. * psi2 * fact * sl
            this.ksig[4][3] = 0.0
            this.ksig[4][4] = (60.0 + 12.0 * psi2) * fact
            this.ksig[4][5] = 6. * psi2 * fact * sl
            this.ksig[5][0] = 0.0
            this.ksig[5][1] = -6. * psi2 * fact * sl
            this.ksig[5][2] = (3. * psi2 - 5.) * fact * L2
            this.ksig[5][3] = 0.0
            this.ksig[5][4] = 6. * psi2 * fact * sl
            this.ksig[5][5] = (5. + 3. * psi2) * fact * L2
        }

    }



    //---------------------------------------------------------------------------------------------
    berechneLokaleElementmassenmatrix() {


        const sl = this.sl
        const L2 = sl * sl

        let fac = this.mue * sl / 840
        let EAL = this.mue * sl / 6

        const psi = this.psi
        const psi2 = psi * psi

        this.emass[0][0] = 2 * EAL
        this.emass[0][1] = 0.0
        this.emass[0][2] = 0.0
        this.emass[0][3] = EAL
        this.emass[0][4] = 0.0
        this.emass[0][5] = 0.0
        this.emass[1][0] = 0.0
        this.emass[1][1] = fac * (280 + 28 * psi + 4 * psi2)
        this.emass[1][2] = -fac * sl * (35 + 7 * psi + 2 * psi2)
        this.emass[1][3] = 0.0
        this.emass[1][4] = fac * (140 - 28 * psi - 4 * psi2)
        this.emass[1][5] = fac * sl * (35 - 7 * psi - 2 * psi2)
        this.emass[2][0] = 0.0
        this.emass[2][1] = this.emass[1][2]
        this.emass[2][2] = fac * L2 * (7 + psi2)
        this.emass[2][3] = 0.0
        this.emass[2][4] = -fac * sl * (35 - 7 * psi - 2 * psi2)
        this.emass[2][5] = -fac * L2 * (7 - psi2)
        this.emass[3][0] = EAL
        this.emass[3][1] = 0.0
        this.emass[3][2] = 0.0
        this.emass[3][3] = 2 * EAL
        this.emass[3][4] = 0.0
        this.emass[3][5] = 0.0
        this.emass[4][0] = 0.0
        this.emass[4][1] = this.emass[1][4]
        this.emass[4][2] = this.emass[2][4]
        this.emass[4][3] = 0.0
        this.emass[4][4] = this.emass[1][1]
        this.emass[4][5] = fac * sl * (35 + 7 * psi + 2 * psi2)
        this.emass[5][0] = 0.0
        this.emass[5][1] = this.emass[1][5]
        this.emass[5][2] = this.emass[2][5]
        this.emass[5][3] = 0.0
        this.emass[5][4] = this.emass[4][5]
        this.emass[5][5] = this.emass[2][2]


        // for (let j = 0; j < 6; j++) {
        //     console.log("this.emass", this.emass[j])
        // }
    }

    //---------------------------------------------------------------------------------------------
    berechneElementsteifigkeitsmatrix(theorie: number) {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(this.neqeG));

        console.log("berechneElementsteifigkeitsmatrix", theorie, this.normalkraft)

        if (theorie === 0) {

            for (j = 0; j < 6; j++) {
                for (k = 0; k < this.neqeG; k++) {
                    sum = 0.0
                    for (let l = 0; l < 6; l++) {
                        // sum = sum + this.estm[j][l] * this.trans[l][k]
                        sum = sum + this.estm[j][l] * this.transU[l][k]

                    }
                    help[j][k] = sum
                }
            }


            for (j = 0; j < 6; j++) {
                for (k = 0; k < 6; k++) {
                    this.estmL2[j][k] = this.estm[j][k]
                }
            }

        } else {

            //const estm = Array.from(Array(6), () => new Array(6));

            for (j = 0; j < 6; j++) {
                for (k = 0; k < 6; k++) {
                    this.estmL2[j][k] = this.estm[j][k] + this.normalkraft * this.ksig[j][k]
                }
            }

            //for (j = 0; j < 6; j++) console.log('this.estmL2[]', this.estm[j]);

            for (j = 0; j < 6; j++) {
                for (k = 0; k < this.neqeG; k++) {
                    sum = 0.0
                    for (let l = 0; l < 6; l++) {
                        // sum = sum + this.estmL2[j][l] * this.trans[l][k]
                        sum = sum + this.estmL2[j][l] * this.transU[l][k]
                    }
                    help[j][k] = sum
                }
            }

        }

        for (j = 0; j < this.neqeG; j++) {
            for (k = 0; k < this.neqeG; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.transU[l][j] * help[l][k]   // 31.12.
                    //sum = sum + this.transF[j][l] * help[l][k]
                }
                // this.estiff[j][k] = sum
                this.estiffG[j][k] = sum
            }
        }

        // for (j = 0; j < this.neqeG; j++) {
        //     console.log("this.estiffG", this.estiffG[j])
        // }
    }

    //---------------------------------------------------------------------------------------------
    addiereElementsteifigkeitmatrix(stiff: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < this.neqeG; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < this.neqeG; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        // stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiff[i][j];
                        stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiffG[i][j];
                    }
                }
            }
        }

    }


    //---------------------------------------------------------------------------------------------
    berechneElementmassenmatrix() {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(this.neqeG));

        console.log("berechneElementmassenmatrix")


        for (j = 0; j < 6; j++) {
            for (k = 0; k < this.neqeG; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    // sum = sum + this.estm[j][l] * this.trans[l][k]
                    sum = sum + this.emass[j][l] * this.transU[l][k]

                }
                help[j][k] = sum
            }
        }


        // for (j = 0; j < 6; j++) {
        //     for (k = 0; k < 6; k++) {
        //         this.estmL2[j][k] = this.estm[j][k]
        //     }
        // }



        for (j = 0; j < this.neqeG; j++) {
            for (k = 0; k < this.neqeG; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.transU[l][j] * help[l][k]   // 31.12.
                    //sum = sum + this.transF[j][l] * help[l][k]
                }
                // this.estiff[j][k] = sum
                this.emassG[j][k] = sum
            }
        }

        // for (j = 0; j < this.neqeG; j++) {
        //     console.log("this.emassG", this.emassG[j])
        // }
    }


    //---------------------------------------------------------------------------------------------
    addiereElementmassmatrix(mass: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < this.neqeG; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < this.neqeG; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        // stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiff[i][j];
                        mass[lmi][lmj] = mass[lmi][lmj] + this.emassG[i][j];
                    }
                }
            }
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneElementsteifigkeitsmatrix_Ksig() {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(this.neqeG));

        for (j = 0; j < 6; j++) {
            for (k = 0; k < this.neqeG; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.ksig[j][l] * this.transU[l][k]
                }
                help[j][k] = sum
            }
        }


        for (j = 0; j < this.neqeG; j++) {
            for (k = 0; k < this.neqeG; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.transU[l][j] * help[l][k]
                    // sum = sum + this.transF[j][l] * help[l][k]
                }
                this.estiff_sig[j][k] = -sum * this.normalkraft
            }
        }
        console.log("NORMALKRAFT", this.normalkraft)
    }

    //---------------------------------------------------------------------------------------------
    addiereElementsteifigkeitmatrix_ksig(stiff: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < this.neqeG; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < this.neqeG; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiff_sig[i][j];
                    }
                }
            }
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneInterneKraefte(ielem: number, iLastf: number, iter: number, u: number[]) {

        let ieq: number, i: number, j: number, k: number
        let sum: number

        for (j = 0; j < this.neqeG; j++) {                           // Stabverformungen
            ieq = this.lm[j]
            if (ieq === -1) {
                this.u[j] = 0
            } else {
                this.u[j] = u[ieq]
            }
        }

        //console.log("this.u[]", this.neqeG, this.u)

        for (j = 0; j < this.neqeG; j++) {
            sum = 0.0
            for (k = 0; k < this.neqeG; k++) {
                sum += this.estiffG[j][k] * this.u[k]
            }
            this.F[j] = sum
        }

        //console.log("this.F[]", this.F)


        // internen Kraftvektor berechnen für Iterationen

        for (j = 0; j < this.neqeG; j++) {
            ieq = this.lm[j]
            if (ieq >= 0) {
                R_internal[ieq] += this.F[j]
            }
        }

        // normale Elementlasten hinzufügen

        if (THIIO_flag === 0) {

            for (let ieload = 0; ieload < neloads; ieload++) {
                if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastf)) {
                    //if (eload[ieload].art !== 8) {
                    for (i = 0; i < this.neqeG; i++) {
                        this.F[i] = this.F[i] + eload[ieload].el_r[i]
                    }
                    //}
                }
            }
        }
        else if (THIIO_flag === 1) { // ikomb=iLastf

            for (let ieload = 0; ieload < neloads; ieload++) {
                if (eload[ieload].element === ielem) {
                    const index = eload[ieload].lf - 1
                    //console.log("elem kombi index", index, kombiTabelle[iLastf - 1][index])
                    if (kombiTabelle[iLastf - 1][index] !== 0.0) {

                        for (i = 0; i < this.neqeG; i++) {
                            this.F[i] = this.F[i] + eload[ieload].el_r[i] * kombiTabelle[iLastf - 1][index]
                        }
                    }
                }
            }

            if (iter > 0) {
                for (i = 0; i < this.neqeG; i++) {                            // Schiefstellung
                    this.F[i] = this.F[i] + this.Fe[i]// + this.FeVor[i]        // FeVor enthält kombiTabelle
                }
            }

        }

        //console.log("element F global ", this.F)


        // TODO ?? Bei gedrehten Lagern erst ins x,z Koordinatensystem zurückdrehen, siehe Excel ab Zeile 434

        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < this.neqe; j++) {
                // sum += this.transU[i][j] * this.F[j]   // falsch
                sum += this.TfG2L[i][j] * this.F[j]
            }
            this.FL[i] = sum
        }


        for (i = 0; i < 3; i++) this.FL[i] = -this.FL[i];  // Linke Seite Vorzeichen nach KGV

        if (THIIO_flag === 0) {
            this.normalkraft = 0.0
        } else {
            this.normalkraft = (this.FL[0] + this.FL[3]) / 2.0
            if (this.normalkraft > 0.0) this.normalkraft = 0.0           // keine Zugversteifung
        }

        console.log("N O R M A L K R A F T von Element ", ielem, " = ", this.normalkraft)

        for (i = 0; i < 6; i++) { // Verformungen lokal
            sum = 0.0
            for (j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * this.u[j]
            }
            this.edispL[i] = sum
        }

        this.NL = this.FL[0]                               // Verformungen, Schnittgrößen am Stabanfang für Zustandslinien
        this.VL = this.FL[1]
        this.ML = this.FL[2]
        this.uL = this.edispL[0]
        this.wL = this.edispL[1]
        this.phiL = this.edispL[2]
        this.NR = this.FL[3]

        return this.FL;
    }

    //---------------------------------------------------------------------------------------------
    berechneLagerkraefte() {

        let nodi: number

        //console.log("Lagerkräfte d2beam",this.F)

        for (let i = 0; i < 2; i++) {
            nodi = this.nod[i]
            //console.log("nodi", i, nodi)
            lagerkraft[nodi][0] = lagerkraft[nodi][0] - this.F[3 * i]
            lagerkraft[nodi][1] = lagerkraft[nodi][1] - this.F[3 * i + 1]
            lagerkraft[nodi][2] = lagerkraft[nodi][2] - this.F[3 * i + 2]
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneElementlasten(ieload: number) {

        const sl = this.sl
        const sl2 = sl * sl
        const sl3 = sl2 * sl

        if (eload[ieload].art === 0) {                          // Trapezstreckenlast senkrecht auf Stab

            //console.log("STRECKENLAST SENKRECHT")
            const p1 = -sl * (eload[ieload].pR + eload[ieload].pL) / 2.0 / 60.0
            const p2 = -sl * (eload[ieload].pR - eload[ieload].pL) / 2.0 / 60.0
            eload[ieload].re[0] = 0
            eload[ieload].re[3] = 0

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2

            let qL = eload[ieload].pL
            let mq = (eload[ieload].pR - eload[ieload].pL) / sl;
            let psi = this.eta
            eload[ieload].C1 = ((120 * sl * psi + 10 * sl ** 3) * qL + 40 * sl ** 2 * mq * psi + 3 * sl ** 4 * mq) / (240 * psi + 20 * sl ** 2);
            eload[ieload].C2 = -((60 * sl ** 2 * psi + 5 * sl ** 4) * qL + 30 * sl ** 3 * mq * psi + 2 * sl ** 5 * mq) / (720 * psi + 60 * sl ** 2);

        }
        else if (eload[ieload].art === 1) {                     // Trapezstreckenlast z-Richtung

            let pL = eload[ieload].pL
            let pR = eload[ieload].pR

            let pzL = this.cosinus * pL                         // Lastanteil senkrecht auf Stab
            let pzR = this.cosinus * pR
            let pxL = this.sinus * pL                           // Lastanteil parallel zum Stab
            let pxR = this.sinus * pR

            const p1 = -sl * (pzR + pzL) / 2.0 / 60.0
            const p2 = -sl * (pzR - pzL) / 2.0 / 60.0

            eload[ieload].re[0] = -sl * (2 * pxL + pxR) / 6
            eload[ieload].re[3] = -sl * (pxL + 2 * pxR) / 6

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2

            let qL = pzL
            let mq = (pzR - pzL) / sl;
            let psi = this.eta
            eload[ieload].C1 = ((120 * sl * psi + 10 * sl ** 3) * qL + 40 * sl ** 2 * mq * psi + 3 * sl ** 4 * mq) / (240 * psi + 20 * sl ** 2);
            eload[ieload].C2 = -((60 * sl ** 2 * psi + 5 * sl ** 4) * qL + 30 * sl ** 3 * mq * psi + 2 * sl ** 5 * mq) / (720 * psi + 60 * sl ** 2);

        }
        else if (eload[ieload].art === 2) {                     // Trapezstreckenlast z-Richtung, Projektion

            let pL = eload[ieload].pL * this.dx / this.sl0
            let pR = eload[ieload].pR * this.dx / this.sl0

            let pzL = this.cosinus * pL                         // Lastanteil senkrecht auf Stab
            let pzR = this.cosinus * pR
            let pxL = this.sinus * pL                           // Lastanteil parallel zum Stab
            let pxR = this.sinus * pR

            const p1 = -sl * (pzR + pzL) / 2.0 / 60.0
            const p2 = -sl * (pzR - pzL) / 2.0 / 60.0

            eload[ieload].re[0] = -sl * (2 * pxL + pxR) / 6
            eload[ieload].re[3] = -sl * (pxL + 2 * pxR) / 6

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2

            let qL = pzL
            let mq = (pzR - pzL) / sl;
            let psi = this.eta
            eload[ieload].C1 = ((120 * sl * psi + 10 * sl ** 3) * qL + 40 * sl ** 2 * mq * psi + 3 * sl ** 4 * mq) / (240 * psi + 20 * sl ** 2);
            eload[ieload].C2 = -((60 * sl ** 2 * psi + 5 * sl ** 4) * qL + 30 * sl ** 3 * mq * psi + 2 * sl ** 5 * mq) / (720 * psi + 60 * sl ** 2);

        }
        else if (eload[ieload].art === 3) {                     // Trapezstreckenlast x-Richtung

            let pL = eload[ieload].pL
            let pR = eload[ieload].pR

            let pzL = -this.sinus * pL                          // Lastanteil senkrecht auf Stab
            let pzR = -this.sinus * pR
            let pxL = this.cosinus * pL                         // Lastanteil parallel zum Stab
            let pxR = this.cosinus * pR

            const p1 = -sl * (pzR + pzL) / 2.0 / 60.0
            const p2 = -sl * (pzR - pzL) / 2.0 / 60.0

            eload[ieload].re[0] = -sl * (2 * pxL + pxR) / 6
            eload[ieload].re[3] = -sl * (pxL + 2 * pxR) / 6

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2

            let qL = pzL
            let mq = (pzR - pzL) / sl;
            let psi = this.eta
            eload[ieload].C1 = ((120 * sl * psi + 10 * sl ** 3) * qL + 40 * sl ** 2 * mq * psi + 3 * sl ** 4 * mq) / (240 * psi + 20 * sl ** 2);
            eload[ieload].C2 = -((60 * sl ** 2 * psi + 5 * sl ** 4) * qL + 30 * sl ** 3 * mq * psi + 2 * sl ** 5 * mq) / (720 * psi + 60 * sl ** 2);

        }
        else if (eload[ieload].art === 4) {                     // Trapezstreckenlast x-Richtung, Projektion

            let pL = eload[ieload].pL * this.dz / sl
            let pR = eload[ieload].pR * this.dz / sl

            let pzL = -this.sinus * pL                          // Lastanteil senkrecht auf Stab
            let pzR = -this.sinus * pR
            let pxL = this.cosinus * pL                         // Lastanteil parallel zum Stab
            let pxR = this.cosinus * pR

            const p1 = -sl * (pzR + pzL) / 2.0 / 60.0
            const p2 = -sl * (pzR - pzL) / 2.0 / 60.0

            eload[ieload].re[0] = -sl * (2 * pxL + pxR) / 6
            eload[ieload].re[3] = -sl * (pxL + 2 * pxR) / 6

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2

            let qL = pzL
            let mq = (pzR - pzL) / sl;
            let psi = this.eta
            eload[ieload].C1 = ((120 * sl * psi + 10 * sl ** 3) * qL + 40 * sl ** 2 * mq * psi + 3 * sl ** 4 * mq) / (240 * psi + 20 * sl ** 2);
            eload[ieload].C2 = -((60 * sl ** 2 * psi + 5 * sl ** 4) * qL + 30 * sl ** 3 * mq * psi + 2 * sl ** 5 * mq) / (720 * psi + 60 * sl ** 2);

        }
        else if (eload[ieload].art === 5) {              // Temperatur

            eload[ieload].kappa_dT = this.alphaT * (eload[ieload].Tu - eload[ieload].To) / this.h
            eload[ieload].eps_Ts = this.alphaT * ((eload[ieload].Tu - eload[ieload].To) * this.zso / this.h + eload[ieload].To)
            //console.log("Temperatur", this.alphaT, eload[ieload].Tu, eload[ieload].To, this.h, this.emodul * this.area)

            eload[ieload].re[0] = this.emodul * this.area * eload[ieload].eps_Ts
            eload[ieload].re[3] = -this.emodul * this.area * eload[ieload].eps_Ts

            eload[ieload].re[1] = 0.0
            eload[ieload].re[4] = 0.0

            eload[ieload].re[2] = this.emodul * this.Iy * eload[ieload].kappa_dT
            eload[ieload].re[5] = -this.emodul * this.Iy * eload[ieload].kappa_dT
        }
        else if (eload[ieload].art === 6) {              // Einzellast ooder Moment

            const x = eload[ieload].x
            const P = eload[ieload].P
            const M = eload[ieload].M
            const eta = this.eta
            const EI = this.emodul * this.Iy
            const alf = 12 * sl * eta + sl3
            //console.log("Einzellast", x, P, M)

            eload[ieload].CwP = -((36 * x ** 2 - 36 * sl * x) * P * eta ** 2 + (-3 * x ** 4 + 6 * sl * x ** 3 - 3 * sl3 * x) * P * eta + (x ** 6 - 3 * sl * x ** 5 + 3 * sl2 * x ** 4 - sl3 * x ** 3) * P) / 3 / alf / EI;
            eload[ieload].CphiP = ((2 * x ** 5 - 5 * sl * x ** 4 + 4 * sl2 * x ** 3 - sl3 * x ** 2) * P) / 2 / alf / EI;
            //console.log("EINZELLAST P, C1, C2 in [mm, mrad]", eload[ieload].CwP * 1000., eload[ieload].CphiP * 1000.)
            eload[ieload].CwM = ((2 * x ** 5 - 5 * sl * x ** 4 + 4 * sl2 * x ** 3 - sl3 * x ** 2) * M) / 2 / alf / EI
            eload[ieload].CphiM = -((12 * x ** 2 - 12 * sl * x) * M * eta + (3 * x ** 4 - 6 * sl * x ** 3 + 4 * sl2 * x ** 2 - sl3 * x) * M) / alf / EI
            //console.log("EINZELMOMENT M, C1, C2 in [mm, mrad]", eload[ieload].CwM * 1000., eload[ieload].CphiM * 1000.)

            eload[ieload].re[0] = 0.0
            eload[ieload].re[3] = 0.0


            //eload[ieload].re[1] = (12 * (x - sl) * P * eta + (-2 * x ** 3 + 3 * sl * x ** 2 - sl3) * P) / alf
            //eload[ieload].re[4] = -eload[ieload].re[1] - P

            //eload[ieload].re[2] = -(6 * (x - sl) * x * P * eta + (-sl * x ** 3 + 2 * sl2 * x ** 2 - sl3 * x) * P) / alf
            //eload[ieload].re[5] = eload[ieload].re[4] * sl + P * x - eload[ieload].re[2]

            const VL_P = (12 * (x - sl) * P * eta + (-2 * x ** 3 + 3 * sl * x ** 2 - sl3) * P) / alf
            const VR_P = -VL_P - P

            const ML_P = -(6 * (x - sl) * x * P * eta + (-sl * x ** 3 + 2 * sl2 * x ** 2 - sl3 * x) * P) / alf
            const MR_P = VR_P * sl + P * x - ML_P

            //console.log("EINZELLAST", VL_P, VR_P, ML_P, MR_P)

            const VL_M = (6 * (x ** 2 - sl * x) * M) / alf
            const VR_M = -VL_M

            const ML_M = (12 * (x - sl) * M * eta + (-3 * sl * x ** 2 + 4 * sl2 * x - sl3) * M) / alf
            const MR_M = -ML_M - M - VL_M * sl
            //console.log("EINZELMOMENT", VL_M, VR_M, ML_M, MR_M)

            eload[ieload].re[1] = VL_P + VL_M
            eload[ieload].re[4] = VR_P + VR_M

            eload[ieload].re[2] = ML_P + ML_M
            eload[ieload].re[5] = MR_P + MR_M

            //console.log("EINZELLAST + MOMENT", eload[ieload].re[1], eload[ieload].re[4], eload[ieload].re[2], eload[ieload].re[5])
        }

        else if (eload[ieload].art === 8) {              // Knotenverformungen

            if (eload[ieload].node0 === this.nod1) {
                eload[ieload].dispL0[0] = this.transU[0][0] * eload[ieload].dispx0 + this.transU[0][1] * eload[ieload].dispz0
                eload[ieload].dispL0[1] = this.transU[1][0] * eload[ieload].dispx0 + this.transU[1][1] * eload[ieload].dispz0
                eload[ieload].dispL0[2] = eload[ieload].phi0
                eload[ieload].dispL0[3] = 0.0
                eload[ieload].dispL0[4] = 0.0
                eload[ieload].dispL0[5] = 0.0
            } else {
                eload[ieload].dispL0[0] = 0.0
                eload[ieload].dispL0[1] = 0.0
                eload[ieload].dispL0[2] = 0.0
                eload[ieload].dispL0[3] = this.transU[3][3] * eload[ieload].dispx0 + this.transU[3][4] * eload[ieload].dispz0
                eload[ieload].dispL0[4] = this.transU[4][3] * eload[ieload].dispx0 + this.transU[4][4] * eload[ieload].dispz0
                eload[ieload].dispL0[5] = eload[ieload].phi0

            }
            for (let j = 0; j < 6; j++) {
                let sum = 0.0
                for (let k = 0; k < 6; k++) {
                    sum += this.estmL2[j][k] * eload[ieload].dispL0[k]
                }
                eload[ieload].re[j] = sum
            }
            //console.log("LASTVEKTOR 8 ", eload[ieload].re)
            //console.log("dispL0", eload[ieload].dispL0)
        }

        else if (eload[ieload].art === 9) {              // zentrische Vorspannung

            eload[ieload].re[0] = -this.area * eload[ieload].sigmaV
            eload[ieload].re[3] = this.area * eload[ieload].sigmaV

            eload[ieload].re[1] = 0.0
            eload[ieload].re[4] = 0.0
            eload[ieload].re[2] = 0.0
            eload[ieload].re[5] = 0.0
        }
        else if (eload[ieload].art === 10) {              // Spannschloss

            eload[ieload].re[0] = -this.emodul * this.area * eload[ieload].delta_s / sl
            eload[ieload].re[3] = this.emodul * this.area * eload[ieload].delta_s / sl

            eload[ieload].re[1] = 0.0
            eload[ieload].re[4] = 0.0
            eload[ieload].re[2] = 0.0
            eload[ieload].re[5] = 0.0
        }

        // eload[ieload].el_r[0] = this.trans[0][0] * eload[ieload].re[0] + this.trans[1][0] * eload[ieload].re[1] // !! mit [T]^T multiplizieren
        // eload[ieload].el_r[1] = this.trans[0][1] * eload[ieload].re[0] + this.trans[1][1] * eload[ieload].re[1]
        // eload[ieload].el_r[2] = eload[ieload].re[2]
        // eload[ieload].el_r[3] = this.trans[3][3] * eload[ieload].re[3] + this.trans[4][3] * eload[ieload].re[4]
        // eload[ieload].el_r[4] = this.trans[3][4] * eload[ieload].re[3] + this.trans[4][4] * eload[ieload].re[4]
        // eload[ieload].el_r[5] = eload[ieload].re[5]


        for (let j = 0; j < this.neqeG; j++) {
            let sum = 0.0
            for (let k = 0; k < 6; k++) {
                // sum += this.transF[j][k] * eload[ieload].re[k]
                sum += this.transU[k][j] * eload[ieload].re[k]
            }
            eload[ieload].el_r[j] = sum
        }

        //console.log("elementload global ", eload[ieload].el_r)

    }

    //---------------------------------------------------------------------------------------------
    berechneElementlasten_Vorverformung(Fe: number[], u: number[], ikomb: number) {

        let ieq: number, i: number, j: number, k: number
        let sum: number

        let dispL = Array(6), dispG = Array(10), FeL = Array(6)
        let v0 = Array(6).fill(0.0)

        for (j = 0; j < this.neqeG; j++) {                           // Stabverformungen
            ieq = this.lm[j]
            if (ieq === -1) {
                dispG[j] = 0
            } else {
                dispG[j] = u[ieq]
            }
        }

        //console.log("dispG", dispG)

        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * dispG[j]
            }
            this.edisp0[i] = sum
        }

        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.normalkraft * this.ksig[j][k] * this.edisp0[k]    // this.normalkraft *
            }
            FeL[j] = sum     // lokal
        }


        // for (i = 0; i < this.neqeG; i++) {
        //     sum = 0.0
        //     for (j = 0; j < 6; j++) {
        //         sum += this.transU[j][i] * FeL[j]
        //         //sum += this.transF[i][j] * FeL[j]
        //     }
        //     this.Fe[i] = Fe[i] = sum          // global
        // }

        // jetzt noch die Anteile aus Stabvorverformungen

        // console.log("ßßßßßßßßßßßßßßßßßßßßßßßßßßßßßß   nstabvorverfomungen", nstabvorverfomungen)

        // FeL.fill(0.0)
        // FeStabvor.fill(0.0)

        // for (i = 0; i < nstabvorverfomungen; i++) {

        //     if (stabvorverformung[i].element === this.ielem) {
        //         console.log("Element ", +i + 1, ' hat Stabvorverformungen')
        //         v0.fill(0.0)

        //         const index = stabvorverformung[i].lf - 1

        //         v0[1] = stabvorverformung[i].p[0]
        //         v0[4] = stabvorverformung[i].p[1]

        //         v0[2] = -(v0[4] - v0[1] / this.sl)
        //         v0[5] = v0[2]

        //         let v0m = stabvorverformung[i].p[2]
        //         v0[2] = v0[2] - 4.0 * v0m / this.sl
        //         v0[5] = v0[5] + 4.0 * v0m / this.sl

        //         for (j = 0; j < 6; j++) {
        //             sum = 0.0
        //             for (k = 0; k < 6; k++) {
        //                 sum += this.normalkraft * this.ksig[j][k] * v0[k] * kombiTabelle[iKomb - 1][index]
        //             }
        //             FeL[j] += sum     // lokal
        //         }

        //         // wird nicht benutzt
        //         for (j = 0; j < 6; j++) this.edispv0[j] += v0[j] * kombiTabelle[iKomb - 1][index];   // TO DO geht so nicht
        //     }
        // }

        //console.log(" stabvorverformung_komb[this.ielem][ikomb]", this.ielem, ikomb, stabvorverformung_komb[this.ielem][ikomb])
        v0[1] = stabvorverformung_komb[this.ielem][ikomb].w0a
        v0[4] = stabvorverformung_komb[this.ielem][ikomb].w0e

        v0[2] = -(v0[4] - v0[1] / this.sl)
        v0[5] = v0[2]

        let v0m = stabvorverformung_komb[this.ielem][ikomb].w0m
        v0[2] = v0[2] - 4.0 * v0m / this.sl
        v0[5] = v0[5] + 4.0 * v0m / this.sl

        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.normalkraft * this.ksig[j][k] * v0[k]
            }
            FeL[j] += sum     // lokal
        }

        for (i = 0; i < this.neqeG; i++) {
            sum = 0.0
            for (j = 0; j < 6; j++) {
                sum += this.transU[j][i] * FeL[j]
                //sum += this.transF[i][j] * FeL[j]
            }
            this.Fe[i] = Fe[i] = sum          // global
        }

    }


    /*
        //---------------------------------------------------------------------------------------------
        stmglenk(estm: number[][], zeile: number) {

            let iz: number, i: number, j: number
            const estm_neu = Array.from(Array(6), () => new Array(6));
            let div: number

            div = estm[zeile][zeile]
            for (iz = 0; iz < 6; iz++) {
                for (i = 0; i < 6; i++) {
                    estm_neu[iz][i] = estm[iz][i] - estm[iz][zeile] * estm[zeile][i] / div
                }
            }

            for (i = 0; i < 6; i++) {
                for (j = 0; j < 6; j++) {
                    estm[i][j] = estm_neu[i][j]
                }
            }

        }

        //---------------------------------------------------------------------------------------------
        elrglenk(estm: number[][], el_r: number[], zeile: number) {

            let iz: number, i: number
            let elr_neu = new Array(6)
            let div: number


            div = estm[zeile][zeile]
            for (iz = 0; iz < 6; iz++) {
                elr_neu[iz] = el_r[iz] - estm[iz][zeile] * el_r[zeile] / div
            }

            for (i = 0; i < 6; i++) {
                el_r[i] = elr_neu[i]
            }

        }
    */
    //---------------------------------------------------------------------------------------------
    get_edispL(edispL: number[], iLastfall: number) {

        let edisp: number[] = new Array(10)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = u_lf[ieq][iLastfall]              // in m, rad
            } else {
                edisp[j] = 0.0
            }
        }
        console.log("disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        console.log("dispL", edispL)
    }


    //---------------------------------------------------------------------------------------------
    get_edispL_schiefstellung(edispL: number[], iKomb: number) {

        let edisp: number[] = new Array(10)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = u0_komb[ieq][iKomb]
            } else {
                edisp[j] = 0.0
            }
        }
        console.log("disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        console.log("dispL", edispL)
    }

    //---------------------------------------------------------------------------------------------
    get_edispL_eigenform(edispL: number[], iKomb: number, ieigv: number) {

        let edisp: number[] = new Array(10)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = eigenform_container_u[iKomb - 1]._(ieq, ieigv)
            } else {
                edisp[j] = 0.0
            }
        }
        //console.log("eigen, disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        //console.log("eigen, dispL", edispL)
    }


    //---------------------------------------------------------------------------------------------
    get_edispL_dyn_eigenform(edispL: number[], ieigv: number) {

        let edisp: number[] = new Array(10)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = eigenform_dyn[ieigv][ieq]
            } else {
                edisp[j] = 0.0
            }
        }
        //console.log("eigen, disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        // console.log("eigen, dispL", edispL)
    }

    //---------------------------------------------------------------------------------------------

    berechneElementSchnittgroessen(ielem: number, iLastf: number) {
        //-----------------------------------------------------------------------------------------

        let Mx: number, Vx: number, Nx: number, ux: number, wx: number, phix: number, phixG: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4), Nphi: number[] = new Array(4)
        let u: number, wL: number = 0.0, wLG = 0.0, disp = 0.0, dwx = 0.0, wxG = 0.0, uxG = 0.0, dwxG = 0.0
        let Nm = 0.0, press = 0.0
        let edisp: number[] = Array(6)
        let edispG: number[] = Array(6).fill(0.0)

        let EI = this.emodul * this.Iy
        let EA = this.emodul * this.area

        //console.log("________________________________________________________________")
        //console.log("class element: berechneElementSchnittgroessen von ", ielem, iLastf)

        const eta = this.eta
        const sl = this.sl
        const sl2 = sl * sl
        const sl3 = sl2 * sl
        const nenner = sl3 + 12. * eta * sl

        //console.log("ETA", eta)

        if (THIIO_flag === 0 && matprop_flag === 0) {      // Theorie I. Ordnung
            for (let i = 0; i < 6; i++) edisp[i] = this.edispL[i]
        }
        else {      // Theorie II. Ordnung

            for (let i = 0; i < 6; i++) edisp[i] = this.edispL[i] // Verformung
            for (let i = 0; i < 6; i++) edispG[i] = this.edispL[i] + this.edisp0[i]  // Verformung + Schiefstellung
            //console.log(" 1 edisp", edisp)

            wL = this.wL
            wLG = this.wL + this.edisp0[1]
            Nm = (this.NL + this.NR) / 2

            for (let ieload = 0; ieload < neloads; ieload++) {

                if (eload[ieload].element === ielem) {
                    const index = eload[ieload].lf - 1
                    if (kombiTabelle[iLastf][index] !== 0.0) {

                        if (eload[ieload].art === 8) {         // Knotenverformung
                            wL += eload[ieload].dispL0[1] * kombiTabelle[iLastf][index];
                            for (let i = 0; i < 6; i++)  edisp[i] += eload[ieload].dispL0[i] * kombiTabelle[iLastf][index];
                            wLG += eload[ieload].dispL0[1] * kombiTabelle[iLastf][index];
                            for (let i = 0; i < 6; i++)  edispG[i] += eload[ieload].dispL0[i] * kombiTabelle[iLastf][index];
                        }
                    }
                }
            }

            // console.log("wL = ", wL)
            // console.log("edisp", edisp)
            // console.log("edispL", this.edispL)
            // console.log("edisp0", this.edisp0)
        }

        if (this.k_0 > 0.0) { // gebetteter Balken, nur Anfangs- und Endwerte werden ausgegeben

            console.log("k0 > 0, el teilungen", this.nTeilungen)

            for (let iteil = 0; iteil < 2; iteil++) {
                if (THIIO_flag === 0 && matprop_flag === 0) {

                    Nx = this.FL[3 * iteil]
                    Vx = this.FL[3 * iteil + 1]
                    Mx = this.FL[3 * iteil + 2]
                    ux = this.edispL[3 * iteil]
                    wx = this.edispL[3 * iteil + 1]
                    phix = -this.edispL[3 * iteil + 2]

                    for (let ieload = 0; ieload < neloads; ieload++) {
                        if ((eload[ieload].element === ielem) && (eload[ieload].lf - 1 === iLastf)) {

                            if (eload[ieload].art === 8) {         // Knotenverformung
                                let edisp0 = Array(6)
                                for (let i = 0; i < 6; i++) edisp0[i] = eload[ieload].dispL0[i];
                                let x = this.x_[iteil]
                                const x2 = x * x
                                Nu[0] = (1.0 - x / sl);
                                Nu[1] = x / sl
                                Nw[0] = (2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x + sl ** 3 + 12. * eta * sl) / nenner;
                                Nw[1] = -((sl * x ** 3 + (-2. * sl ** 2 - 6. * eta) * x ** 2 + (sl ** 3 + 6. * eta * sl) * x) / nenner);
                                Nw[2] = -((2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x) / nenner);
                                Nw[3] = -((sl * x ** 3 + (6. * eta - sl ** 2) * x ** 2 - 6. * eta * sl * x) / nenner);
                                ux += Nu[0] * edisp0[0] + Nu[1] * edisp0[3]
                                wx += Nw[0] * edisp0[1] + Nw[1] * edisp0[2] + Nw[2] * edisp0[4] + Nw[3] * edisp0[5];

                                Nphi[0] = 6.0 * (sl * x - x2) / nenner
                                Nphi[1] = (3 * sl * x2 + (-12 * eta - 4 * sl2) * x + 12 * sl * eta + sl3) / nenner
                                Nphi[2] = -6.0 * (sl * x - x2) / nenner
                                Nphi[3] = (3 * sl * x2 + (12 * eta - 2 * sl2) * x) / nenner
                                phix -= Nphi[0] * edisp0[1] + Nphi[1] * edisp0[2] + Nphi[2] * edisp0[4] + Nphi[3] * edisp0[5];  // im Uhrzeigersinn
                            }
                        }
                    }

                    press = -wx * this.k_0

                    disp = Math.sqrt(ux * ux + wx * wx) * 1000.0      // in mm

                    if (Math.abs(Nx) > maxValue_lf[iLastf].N) maxValue_lf[iLastf].N = Math.abs(Nx)
                    if (Math.abs(Vx) > maxValue_lf[iLastf].Vz) maxValue_lf[iLastf].Vz = Math.abs(Vx)
                    if (Math.abs(Mx) > maxValue_lf[iLastf].My) maxValue_lf[iLastf].My = Math.abs(Mx)
                    if (Math.abs(press) > maxValue_lf[iLastf].press) maxValue_lf[iLastf].press = Math.abs(press)
                    if (disp > maxValue_lf[iLastf].disp) maxValue_lf[iLastf].disp = disp

                    console.log("°°° Mx", Mx, Vx, Nx)
                    this.M_[iLastf][iteil] = Mx
                    this.V_[iLastf][iteil] = Vx
                    this.N_[iLastf][iteil] = Nx
                    this.u_[iLastf][iteil] = ux
                    this.w_[iLastf][iteil] = wx
                    this.phi_[iLastf][iteil] = phix
                    this.bettung_[iLastf][iteil] = press

                }
                else /*if (THIIO_flag === 1)*/ {


                    Nx = this.FL[3 * iteil]
                    Vx = this.FL[3 * iteil + 1]
                    Mx = this.FL[3 * iteil + 2]
                    ux = this.edispL[3 * iteil]
                    wx = this.edispL[3 * iteil + 1]
                    phix = -this.edispL[3 * iteil + 2]

                    for (let ieload = 0; ieload < neloads; ieload++) {

                        if (eload[ieload].element === ielem) {
                            const index = eload[ieload].lf - 1
                            if (kombiTabelle[iLastf][index] !== 0.0) {

                                if (eload[ieload].art === 8) {         // Knotenverformung
                                    if (iteil === 0) {
                                        ux += eload[ieload].dispL0[0] * kombiTabelle[iLastf][index];
                                        wx += eload[ieload].dispL0[1] * kombiTabelle[iLastf][index];
                                        phix += eload[ieload].dispL0[2] * kombiTabelle[iLastf][index];
                                    } else {
                                        ux += eload[ieload].dispL0[3] * kombiTabelle[iLastf][index];
                                        wx += eload[ieload].dispL0[4] * kombiTabelle[iLastf][index];
                                        phix += eload[ieload].dispL0[5] * kombiTabelle[iLastf][index];
                                    }
                                }
                            }
                        }
                    }

                    press = -wx * this.k_0

                    disp = Math.sqrt(ux * ux + wx * wx) * 1000.0

                    if (Math.abs(Nx) > maxValue_komb[iLastf].N) maxValue_komb[iLastf].N = Math.abs(Nx)
                    if (Math.abs(Vx) > maxValue_komb[iLastf].Vz) maxValue_komb[iLastf].Vz = Math.abs(Vx)
                    if (Math.abs(Mx) > maxValue_komb[iLastf].My) maxValue_komb[iLastf].My = Math.abs(Mx)
                    if (Math.abs(press) > maxValue_komb[iLastf].press) maxValue_komb[iLastf].press = Math.abs(press)
                    if (disp > maxValue_komb[iLastf].disp) maxValue_komb[iLastf].disp = disp

                    this.M_komb[iLastf][iteil] = Mx
                    this.V_komb[iLastf][iteil] = Vx
                    this.N_komb[iLastf][iteil] = Nx
                    this.u_komb[iLastf][iteil] = ux
                    this.uG_komb[iLastf][iteil] = uxG
                    this.w_komb[iLastf][iteil] = wx
                    this.wG_komb[iLastf][iteil] = wxG
                    this.phi_komb[iLastf][iteil] = phix
                    this.bettung_komb[iLastf][iteil] = -wx * this.k_0

                }  // ende TH II Ordnung
            }

        }
        else {

            //let d_x = this.sl / (nelTeilungen)
            let x = 0.0
            let dV = 0.0, dM = 0.0

            for (let iteil = 0; iteil < this.nTeilungen; iteil++) {
                x = this.x_[iteil]
                const x2 = x * x
                const x3 = x2 * x
                Vx = this.VL
                Mx = this.ML + Vx * x
                Nx = this.NL
                //ux = 0.0
                //wx = 0.0

                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2. * x3 - 3. * sl * x2 - 12. * eta * x + sl3 + 12. * eta * sl) / nenner;
                Nw[1] = -((sl * x3 + (-2. * sl2 - 6. * eta) * x2 + (sl3 + 6. * eta * sl) * x) / nenner);
                Nw[2] = -((2. * x3 - 3. * sl * x2 - 12. * eta * x) / nenner);
                Nw[3] = -((sl * x3 + (6. * eta - sl2) * x2 - 6. * eta * sl * x) / nenner);
                Nphi[0] = 6.0 * (sl * x - x2) / nenner
                Nphi[1] = (3 * sl * x2 + (-12 * eta - 4 * sl2) * x + 12 * sl * eta + sl3) / nenner
                Nphi[2] = -6.0 * (sl * x - x2) / nenner
                Nphi[3] = (3 * sl * x2 + (12 * eta - 2 * sl2) * x) / nenner
                ux = Nu[0] * edisp[0] + Nu[1] * edisp[3]
                wx = Nw[0] * edisp[1] + Nw[1] * edisp[2] + Nw[2] * edisp[4] + Nw[3] * edisp[5];
                uxG = Nu[0] * edispG[0] + Nu[1] * edispG[3]
                wxG = Nw[0] * edispG[1] + Nw[1] * edispG[2] + Nw[2] * edispG[4] + Nw[3] * edispG[5];
                phix = -(Nphi[0] * edisp[1] + Nphi[1] * edisp[2] + Nphi[2] * edisp[4] + Nphi[3] * edisp[5]);  // im Uhrzeigersinn
                phixG = -(Nphi[0] * edispG[1] + Nphi[1] * edispG[2] + Nphi[2] * edispG[4] + Nphi[3] * edispG[5]);  // im Uhrzeigersinn
                //console.log("phix", x, phix)


                if (THIIO_flag === 1) {

                    dwx = wxG - wLG
                    dwxG = wxG - wLG
                    if (this.NL < 0.0) Mx = Mx - this.NL * (wxG - wLG)  //?
                    //if (Nm < 0.0) Mx = Mx - Nm * (wxG - wLG)  //?

                    for (let i = 0; i < nstabvorverfomungen; i++) {
                        if (stabvorverformung[i].element === this.ielem) {
                            const index = stabvorverformung[i].lf - 1
                            const fact = kombiTabelle[iLastf][index]
                            //console.log("Element ", +i + 1, ' hat Stabvorverformungen')
                            let w0a = stabvorverformung[i].p[0] * fact
                            let w0e = stabvorverformung[i].p[1] * fact
                            let v0m = stabvorverformung[i].p[2] * fact
                            let w0x = (w0e - w0a) * x / sl + 4.0 * v0m * x / sl * (1.0 - x / sl)
                            let phi0x = (w0e - w0a) / sl + 4.0 * v0m / sl * (1.0 - 2 * x / sl)
                            if (this.NL < 0.0) Mx = Mx - this.NL * w0x
                            wxG += w0x + w0a;
                            phixG += phi0x;
                        }

                    }

                }

                // normale Elementlasten hinzufügen

                if (THIIO_flag === 0 && matprop_flag === 0) {

                    for (let ieload = 0; ieload < neloads; ieload++) {
                        if ((eload[ieload].element === ielem) && (eload[ieload].lf - 1 === iLastf)) {

                            if (eload[ieload].art === 0) {                            // Trapezstreckenlast senkrecht auf Stab

                                const pL = eload[ieload].pL
                                const pR = eload[ieload].pR
                                const dp = pR - pL

                                Vx = Vx - pL * x - dp * x * x / sl / 2.
                                Mx = Mx - pL * x * x / 2. - dp * x * x * x / sl / 6.

                                //wx += pL / 24.0 * (x ** 4 - 2 * sl * x ** 3 + sl * sl * x * x) / EI
                                let temp = pL / 24.0 * x ** 4 + dp / 120 / sl * x ** 5 - eload[ieload].C1 / 6 * x ** 3 - eload[ieload].C2 / 2 * x * x
                                temp += this.eta * (-pL / 2 * x * x - dp / sl / 6 * x ** 3 + eload[ieload].C1 * x)
                                wx = wx + temp / EI
                                temp = pL / 6.0 * x ** 3 + dp / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x ** 2 - eload[ieload].C2 * x
                                phix = phix + temp / EI
                            }
                            else if (eload[ieload].art === 1) {                       // Trapezstreckenlast z-Richtung

                                const pL = eload[ieload].pL
                                const pR = eload[ieload].pR

                                let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                                let pzR = this.cosinus * pR
                                let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                                let pxR = this.sinus * pR

                                const dpx = pxR - pxL
                                const dpz = pzR - pzL

                                Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.

                                ux += (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA

                                let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 / 6 * x ** 3 - eload[ieload].C2 / 2 * x * x
                                wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * x)) / EI
                                //console.log("wl",THIIO_flag,ielem,ieload,wl,- this.NL * wl)
                                // if (THIIO_flag === 1) Mx = Mx - this.NL * wl

                                wx += wl
                                phix += (pzL / 6.0 * x3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x2 - eload[ieload].C2 * x) / EI

                            }
                            else if (eload[ieload].art === 2) {                       // Trapezstreckenlast z-Richtung, Projektion

                                //console.log("Projektion",this.dx, sl)
                                const pL = eload[ieload].pL * this.dx / this.sl0
                                const pR = eload[ieload].pR * this.dx / this.sl0

                                let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                                let pzR = this.cosinus * pR
                                let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                                let pxR = this.sinus * pR

                                const dpx = pxR - pxL
                                const dpz = pzR - pzL

                                Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.

                                ux += (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA

                                let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 / 6 * x ** 3 - eload[ieload].C2 / 2 * x * x
                                wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * x)) / EI
                                wx += wl
                                phix += (pzL / 6.0 * x3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x2 - eload[ieload].C2 * x) / EI

                            }
                            else if (eload[ieload].art === 3) {                         // Trapezstreckenlast x-Richtung

                                const pL = eload[ieload].pL
                                const pR = eload[ieload].pR

                                let pzL = -this.sinus * pL                              // Lastanteil senkrecht auf Stab
                                let pzR = -this.sinus * pR
                                let pxL = this.cosinus * pL                             // Lastanteil parallel zum Stab
                                let pxR = this.cosinus * pR

                                const dpx = pxR - pxL
                                const dpz = pzR - pzL

                                Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.

                                ux += (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA

                                let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 / 6 * x ** 3 - eload[ieload].C2 / 2 * x * x
                                wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * x)) / EI
                                //console.log("wl",THIIO_flag,ielem,ieload,wl,- this.NL * wl)
                                // if (THIIO_flag === 1) Mx = Mx - this.NL * wl

                                wx += wl
                                phix += (pzL / 6.0 * x3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x2 - eload[ieload].C2 * x) / EI

                            }
                            else if (eload[ieload].art === 4) {                         // Trapezstreckenlast x-Richtung, Projektion

                                //console.log("Projektion",this.dx, sl)
                                const pL = eload[ieload].pL * this.dz / sl
                                const pR = eload[ieload].pR * this.dz / sl

                                let pzL = -this.sinus * pL                              // Lastanteil senkrecht auf Stab
                                let pzR = -this.sinus * pR
                                let pxL = this.cosinus * pL                             // Lastanteil parallel zum Stab
                                let pxR = this.cosinus * pR

                                const dpx = pxR - pxL
                                const dpz = pzR - pzL

                                Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.

                                ux += (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA

                                let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 / 6 * x ** 3 - eload[ieload].C2 / 2 * x * x
                                wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * x)) / EI
                                wx += wl
                                phix += (pzL / 6.0 * x3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x2 - eload[ieload].C2 * x) / EI

                            }

                            else if (eload[ieload].art === 6) {         // Einzellast oder Moment

                                const xP = eload[ieload].x
                                const P = eload[ieload].P
                                const M = eload[ieload].M
                                let edisp = Array(6).fill(0.0);

                                if (iteil > 0) {
                                    let xxx = Math.abs(x - this.x_[iteil - 1])
                                    let xxxx = Math.abs(x - eload[ieload].x)
                                    //If (x > eload(ieload).xP) Or (x = x_(j - 1) And x = eload(ieload).xP) Then
                                    if ((x > xP) || (xxx < 0.000000000001 && xxxx < 0.000000000001)) {

                                        Vx = Vx - P
                                        Mx = Mx - M - P * (x - xP)
                                        edisp[1] = eload[ieload].CwP + eload[ieload].CwM; edisp[2] = eload[ieload].CphiP + eload[ieload].CphiM;

                                        const xx = x - xP;
                                        const xx2 = xx * xx
                                        const sl = this.sl - xP
                                        const nenner = sl ** 3 + 12. * eta * sl
                                        Nw[0] = (2. * xx ** 3 - 3. * sl * xx ** 2 - 12. * eta * xx + sl ** 3 + 12. * eta * sl) / nenner;
                                        Nw[1] = -((sl * xx ** 3 + (-2. * sl ** 2 - 6. * eta) * xx ** 2 + (sl ** 3 + 6. * eta * sl) * xx) / nenner);
                                        Nw[2] = -((2. * xx ** 3 - 3. * sl * xx ** 2 - 12. * eta * xx) / nenner);
                                        Nw[3] = -((sl * xx ** 3 + (6. * eta - sl ** 2) * xx ** 2 - 6. * eta * sl * xx) / nenner);
                                        wx += Nw[0] * edisp[1] + Nw[1] * edisp[2] + Nw[2] * edisp[4] + Nw[3] * edisp[5];
                                        Nphi[0] = 6.0 * (sl * xx - xx2) / nenner
                                        Nphi[1] = (3 * sl * xx2 + (-12 * eta - 4 * sl ** 2) * xx + 12 * sl * eta + sl ** 3) / nenner
                                        Nphi[2] = -6.0 * (sl * xx - xx2) / nenner
                                        Nphi[3] = (3 * sl * xx2 + (12 * eta - 2 * sl ** 2) * xx) / nenner
                                        phix -= Nphi[0] * edisp[1] + Nphi[1] * edisp[2] + Nphi[2] * edisp[4] + Nphi[3] * edisp[5];  // im Uhrzeigersinn

                                        //console.log("Nw,edisp", wx, edisp, Nw)
                                    } else {
                                        edisp[4] = eload[ieload].CwP + eload[ieload].CwM; edisp[5] = eload[ieload].CphiP + eload[ieload].CphiM;
                                        const sl = xP
                                        const sl2 = sl * sl
                                        const nenner = sl ** 3 + 12. * eta * sl
                                        Nw[0] = (2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x + sl ** 3 + 12. * eta * sl) / nenner;
                                        Nw[1] = -((sl * x ** 3 + (-2. * sl ** 2 - 6. * eta) * x ** 2 + (sl ** 3 + 6. * eta * sl) * x) / nenner);
                                        Nw[2] = -((2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x) / nenner);
                                        Nw[3] = -((sl * x ** 3 + (6. * eta - sl ** 2) * x ** 2 - 6. * eta * sl * x) / nenner);
                                        wx += Nw[0] * edisp[1] + Nw[1] * edisp[2] + Nw[2] * edisp[4] + Nw[3] * edisp[5];
                                        //console.log("Nw,edisp", wx, edisp, Nw)
                                        Nphi[0] = 6.0 * (sl * x - x2) / nenner
                                        Nphi[1] = (3 * sl * x2 + (-12 * eta - 4 * sl2) * x + 12 * sl * eta + sl2 * sl) / nenner
                                        Nphi[2] = -6.0 * (sl * x - x2) / nenner
                                        Nphi[3] = (3 * sl * x2 + (12 * eta - 2 * sl2) * x) / nenner
                                        phix -= Nphi[0] * edisp[1] + Nphi[1] * edisp[2] + Nphi[2] * edisp[4] + Nphi[3] * edisp[5];  // im Uhrzeigersinn

                                    }

                                }
                                else {
                                    if (Math.abs(x - xP) < 0.000000000001) {
                                        Vx = Vx - P
                                        Mx = Mx - M
                                    }
                                }
                            }
                            else if (eload[ieload].art === 8) {         // Knotenverformung

                                let edisp0 = Array(6)
                                for (let i = 0; i < 6; i++) edisp0[i] = eload[ieload].dispL0[i];

                                Nu[0] = (1.0 - x / sl);
                                Nu[1] = x / sl
                                Nw[0] = (2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x + sl ** 3 + 12. * eta * sl) / nenner;
                                Nw[1] = -((sl * x ** 3 + (-2. * sl ** 2 - 6. * eta) * x ** 2 + (sl ** 3 + 6. * eta * sl) * x) / nenner);
                                Nw[2] = -((2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x) / nenner);
                                Nw[3] = -((sl * x ** 3 + (6. * eta - sl ** 2) * x ** 2 - 6. * eta * sl * x) / nenner);
                                ux += Nu[0] * edisp0[0] + Nu[1] * edisp0[3]
                                wx += Nw[0] * edisp0[1] + Nw[1] * edisp0[2] + Nw[2] * edisp0[4] + Nw[3] * edisp0[5];

                                Nphi[0] = 6.0 * (sl * x - x2) / nenner
                                Nphi[1] = (3 * sl * x2 + (-12 * eta - 4 * sl2) * x + 12 * sl * eta + sl3) / nenner
                                Nphi[2] = -6.0 * (sl * x - x2) / nenner
                                Nphi[3] = (3 * sl * x2 + (12 * eta - 2 * sl2) * x) / nenner
                                phix -= Nphi[0] * edisp0[1] + Nphi[1] * edisp0[2] + Nphi[2] * edisp0[4] + Nphi[3] * edisp0[5];  // im Uhrzeigersinn

                            }
                        }
                    }

                    disp = Math.sqrt(ux * ux + wx * wx) * 1000.0      // in mm

                    // Bettung berücksichtigen

                    if (iteil > 0 && this.k_0 > 0.0) {
                        let dx = x - this.x_[iteil - 1]
                        let wl = this.w_[iLastf][iteil - 1]
                        dM += dV * dx
                        dV += this.k_0 * (wl + wx) * dx / 2.
                        Vx += dV
                        dM += this.k_0 * (wl * dx * dx / 2. + (wx - wl) * dx / 2. * dx / 3.)
                        Mx += dM
                    }

                    if (Math.abs(Nx) > maxValue_lf[iLastf].N) maxValue_lf[iLastf].N = Math.abs(Nx)
                    if (Math.abs(Vx) > maxValue_lf[iLastf].Vz) maxValue_lf[iLastf].Vz = Math.abs(Vx)
                    if (Math.abs(Mx) > maxValue_lf[iLastf].My) maxValue_lf[iLastf].My = Math.abs(Mx)
                    if (disp > maxValue_lf[iLastf].disp) maxValue_lf[iLastf].disp = disp

                    this.M_[iLastf][iteil] = Mx
                    this.V_[iLastf][iteil] = Vx
                    this.N_[iLastf][iteil] = Nx
                    this.u_[iLastf][iteil] = ux
                    this.w_[iLastf][iteil] = wx
                    this.phi_[iLastf][iteil] = phix
                    this.bettung_[iLastf][iteil] = 0.0

                }
                else if (THIIO_flag === 1 || matprop_flag > 0) { // ikomb=iLastf

                    for (let ieload = 0; ieload < neloads; ieload++) {

                        if (eload[ieload].element === ielem) {
                            const index = eload[ieload].lf - 1
                            //console.log("elem kombi index", index, kombiTabelle[iLastf][index])
                            if (kombiTabelle[iLastf][index] !== 0.0) {

                                let fact = kombiTabelle[iLastf][index]

                                if (eload[ieload].art === 0) {              // Trapezstreckenlast senkrecht auf Stab

                                    const pL = eload[ieload].pL * kombiTabelle[iLastf][index]
                                    const pR = eload[ieload].pR * kombiTabelle[iLastf][index]
                                    const dp = pR - pL

                                    Vx = Vx - pL * x - dp * x * x / sl / 2.
                                    Mx = Mx - pL * x * x / 2 - dp * x * x * x / sl / 6.

                                    let wl = pL / 24.0 * x ** 4 + dp / 120 / sl * x ** 5 - eload[ieload].C1 * fact / 6 * x ** 3 - eload[ieload].C2 * fact / 2 * x * x
                                    wl = (wl + this.eta * (-pL / 2 * x * x - dp / sl / 6 * x ** 3 + eload[ieload].C1 * fact * x)) / EI
                                    //console.log("wl0", THIIO_flag, ielem, ieload, wl, - this.NL * wl, Mx, Mx - this.NL * wl)
                                    if (this.NL < 0.0) Mx = Mx - this.NL * wl

                                    wx += wl
                                    wxG += wl

                                }
                                else if (eload[ieload].art === 1) {         // Trapezstreckenlast z-Richtung

                                    const pL = eload[ieload].pL * kombiTabelle[iLastf][index]
                                    const pR = eload[ieload].pR * kombiTabelle[iLastf][index]

                                    let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                                    let pzR = this.cosinus * pR
                                    let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                                    let pxR = this.sinus * pR

                                    const dpx = pxR - pxL
                                    const dpz = pzR - pzL

                                    Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                    Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                    Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.


                                    let ul = (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA
                                    ux += ul
                                    uxG += ul

                                    let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 * fact / 6 * x ** 3 - eload[ieload].C2 * fact / 2 * x * x
                                    wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * fact * x)) / EI
                                    if (this.NL < 0.0) Mx = Mx - this.NL * wl + (pxL + pxR) * x / 4 * dwx
                                    //console.log("wl1", ielem, x, ieload, wl, - this.NL * wl, Mx)

                                    wx += wl
                                    wxG += wl

                                    phix += (pzL / 6.0 * x ** 3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x ** 2 - eload[ieload].C2 * x) / EI

                                }
                                else if (eload[ieload].art === 2) {         // Trapezstreckenlast z-Richtung, Projektion

                                    const pL = eload[ieload].pL * this.dx / this.sl0 * kombiTabelle[iLastf][index]
                                    const pR = eload[ieload].pR * this.dx / this.sl0 * kombiTabelle[iLastf][index]

                                    let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                                    let pzR = this.cosinus * pR
                                    let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                                    let pxR = this.sinus * pR

                                    const dpx = pxR - pxL
                                    const dpz = pzR - pzL

                                    //console.log("2 p---", pxL, pxR, pzL, pzR, dpx, dpz)
                                    Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                    Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                    Mx = Mx - pzL * x * x / 2. - dpz * x * x * x / sl / 6.

                                    let ul = (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA
                                    ux += ul
                                    uxG += ul

                                    let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 * fact / 6 * x ** 3 - eload[ieload].C2 * fact / 2 * x * x
                                    wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * fact * x)) / EI
                                    //console.log("wl2", THIIO_flag, ielem, ieload, wl, - this.NL * wl, Mx, Mx - Nx * wl)
                                    if (this.NL < 0.0) Mx = Mx - this.NL * wl + (pxL + pxR) * x / 4 * dwx
                                    //if (Nm < 0.0) Mx = Mx - Nm * wl + (pxL + pxR) * x / 4 * dwx

                                    wx += wl
                                    wxG += wl

                                    phix += (pzL / 6.0 * x ** 3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x ** 2 - eload[ieload].C2 * x) / EI

                                }
                                else if (eload[ieload].art === 3) {                         // Trapezstreckenlast x-Richtung

                                    const pL = eload[ieload].pL
                                    const pR = eload[ieload].pR

                                    let pzL = -this.sinus * pL                              // Lastanteil senkrecht auf Stab
                                    let pzR = -this.sinus * pR
                                    let pxL = this.cosinus * pL                             // Lastanteil parallel zum Stab
                                    let pxR = this.cosinus * pR

                                    const dpx = pxR - pxL
                                    const dpz = pzR - pzL

                                    Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                    Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                    Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.

                                    let ul = (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA
                                    ux += ul
                                    uxG += ul

                                    let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 * fact / 6 * x ** 3 - eload[ieload].C2 * fact / 2 * x * x
                                    wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * fact * x)) / EI
                                    //console.log("wl",THIIO_flag,ielem,ieload,wl,- this.NL * wl)
                                    if (this.NL < 0.0) Mx = Mx - this.NL * wl + (pxL + pxR) * x / 4 * dwxG
                                    //console.log("Mx3", ielem, x, Mx)

                                    wx += wl
                                    wxG += wl

                                    phix += (pzL / 6.0 * x3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x2 - eload[ieload].C2 * x) / EI

                                }
                                else if (eload[ieload].art === 4) {                         // Trapezstreckenlast x-Richtung, Projektion

                                    //console.log("Projektion",this.dx, sl)
                                    const pL = eload[ieload].pL * this.dz / sl
                                    const pR = eload[ieload].pR * this.dz / sl

                                    let pzL = -this.sinus * pL                              // Lastanteil senkrecht auf Stab
                                    let pzR = -this.sinus * pR
                                    let pxL = this.cosinus * pL                             // Lastanteil parallel zum Stab
                                    let pxR = this.cosinus * pR

                                    const dpx = pxR - pxL
                                    const dpz = pzR - pzL

                                    Nx = Nx - pxL * x - dpx * x * x / sl / 2.
                                    Vx = Vx - pzL * x - dpz * x * x / sl / 2.
                                    Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / sl / 6.

                                    let ul = (pxL + dpx * x / 3.0) * x * (sl - x) / 2.0 / EA
                                    ux += ul
                                    uxG += ul

                                    let wl = pzL / 24.0 * x ** 4 + dpz / 120 / sl * x ** 5 - eload[ieload].C1 * fact / 6 * x ** 3 - eload[ieload].C2 * fact / 2 * x * x
                                    wl = (wl + this.eta * (-pzL / 2 * x * x - dpz / sl / 6 * x ** 3 + eload[ieload].C1 * fact * x)) / EI
                                    wx += wl
                                    wxG += wl

                                    phix += (pzL / 6.0 * x3 + dpz / 24 / sl * x ** 4 - eload[ieload].C1 / 2 * x2 - eload[ieload].C2 * x) / EI

                                    if (this.NL < 0.0) Mx = Mx - this.NL * wl + (pxL + pxR) * x / 4 * dwx
                                }
                                else if (eload[ieload].art === 6) {         // Einzellast oder Moment

                                    const xP = eload[ieload].x
                                    const P = eload[ieload].P * fact
                                    const M = eload[ieload].M * fact
                                    let edisp = Array(6).fill(0.0);
                                    let wl = 0.0

                                    if (iteil > 0) {
                                        let xxx = Math.abs(x - this.x_[iteil - 1])
                                        let xxxx = Math.abs(x - eload[ieload].x)
                                        //If (x > eload(ieload).xP) Or (x = x_(j - 1) And x = eload(ieload).xP) Then
                                        if ((x > xP) || (xxx < 0.000000000001 && xxxx < 0.000000000001)) {

                                            Vx = Vx - P
                                            Mx = Mx - M - P * (x - xP)
                                            edisp[1] = fact * (eload[ieload].CwP + eload[ieload].CwM); edisp[2] = fact * (eload[ieload].CphiP + eload[ieload].CphiM);

                                            const xx = x - xP;
                                            const xx2 = xx * xx
                                            const sl = this.sl - xP
                                            const nenner = sl ** 3 + 12. * eta * sl
                                            Nw[0] = (2. * xx ** 3 - 3. * sl * xx ** 2 - 12. * eta * xx + sl ** 3 + 12. * eta * sl) / nenner;
                                            Nw[1] = -((sl * xx ** 3 + (-2. * sl ** 2 - 6. * eta) * xx ** 2 + (sl ** 3 + 6. * eta * sl) * xx) / nenner);
                                            Nw[2] = -((2. * xx ** 3 - 3. * sl * xx ** 2 - 12. * eta * xx) / nenner);
                                            Nw[3] = -((sl * xx ** 3 + (6. * eta - sl ** 2) * xx ** 2 - 6. * eta * sl * xx) / nenner);
                                            wx += wl = Nw[0] * edisp[1] + Nw[1] * edisp[2] + Nw[2] * edisp[4] + Nw[3] * edisp[5];
                                            Nphi[0] = 6.0 * (sl * xx - xx2) / nenner
                                            Nphi[1] = (3 * sl * xx2 + (-12 * eta - 4 * sl ** 2) * xx + 12 * sl * eta + sl ** 3) / nenner
                                            Nphi[2] = -6.0 * (sl * xx - xx2) / nenner
                                            Nphi[3] = (3 * sl * xx2 + (12 * eta - 2 * sl ** 2) * xx) / nenner
                                            phix -= Nphi[0] * edisp[1] + Nphi[1] * edisp[2] + Nphi[2] * edisp[4] + Nphi[3] * edisp[5];  // im Uhrzeigersinn

                                            //console.log("Nw,edisp", wx, edisp, Nw)
                                        } else {
                                            edisp[4] = fact * (eload[ieload].CwP + eload[ieload].CwM); edisp[5] = fact * (eload[ieload].CphiP + eload[ieload].CphiM);
                                            const sl = xP
                                            const sl2 = sl * sl
                                            const nenner = sl ** 3 + 12. * eta * sl
                                            Nw[0] = (2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x + sl ** 3 + 12. * eta * sl) / nenner;
                                            Nw[1] = -((sl * x ** 3 + (-2. * sl ** 2 - 6. * eta) * x ** 2 + (sl ** 3 + 6. * eta * sl) * x) / nenner);
                                            Nw[2] = -((2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x) / nenner);
                                            Nw[3] = -((sl * x ** 3 + (6. * eta - sl ** 2) * x ** 2 - 6. * eta * sl * x) / nenner);
                                            wx += wl = Nw[0] * edisp[1] + Nw[1] * edisp[2] + Nw[2] * edisp[4] + Nw[3] * edisp[5];
                                            //console.log("Nw,edisp", wx, edisp, Nw)
                                            Nphi[0] = 6.0 * (sl * x - x2) / nenner
                                            Nphi[1] = (3 * sl * x2 + (-12 * eta - 4 * sl2) * x + 12 * sl * eta + sl2 * sl) / nenner
                                            Nphi[2] = -6.0 * (sl * x - x2) / nenner
                                            Nphi[3] = (3 * sl * x2 + (12 * eta - 2 * sl2) * x) / nenner
                                            phix -= Nphi[0] * edisp[1] + Nphi[1] * edisp[2] + Nphi[2] * edisp[4] + Nphi[3] * edisp[5];  // im Uhrzeigersinn

                                        }
                                        if (this.NL < 0.0) Mx = Mx - this.NL * wl
                                        wxG += wl

                                    }
                                    else {
                                        if (Math.abs(x - xP) < 0.000000000001) {
                                            Vx = Vx - P
                                            Mx = Mx - M
                                        }
                                    }
                                }
                                // else if (eload[ieload].art === 8) {         // Knotenverformung
                                //     let edisp0 = Array(6)
                                //     for (let i = 0; i < 6; i++) edisp0[i] = eload[ieload].dispL0[i] * kombiTabelle[iLastf][index];
                                //     //console.log("ART=8,edisp0", edisp0)

                                //     Nu[0] = (1.0 - x / sl);
                                //     Nu[1] = x / sl
                                //     Nw[0] = (2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x + sl ** 3 + 12. * eta * sl) / nenner;
                                //     Nw[1] = -((sl * x ** 3 + (-2. * sl ** 2 - 6. * eta) * x ** 2 + (sl ** 3 + 6. * eta * sl) * x) / nenner);
                                //     Nw[2] = -((2. * x ** 3 - 3. * sl * x ** 2 - 12. * eta * x) / nenner);
                                //     Nw[3] = -((sl * x ** 3 + (6. * eta - sl ** 2) * x ** 2 - 6. * eta * sl * x) / nenner);
                                //     ux += Nu[0] * edisp0[0] + Nu[1] * edisp0[3]
                                //     let wx0 = Nw[0] * edisp0[1] + Nw[1] * edisp0[2] + Nw[2] * edisp0[4] + Nw[3] * edisp0[5];
                                //     //Mx = Mx - this.NL * (wx0 - wL)
                                //     wx += wx0
                                // }
                            }
                        }
                    }

                    disp = Math.sqrt(ux * ux + wx * wx) * 1000.0


                    if (Math.abs(Nx) > maxValue_komb[iLastf].N) maxValue_komb[iLastf].N = Math.abs(Nx)
                    if (Math.abs(Vx) > maxValue_komb[iLastf].Vz) maxValue_komb[iLastf].Vz = Math.abs(Vx)
                    if (Math.abs(Mx) > maxValue_komb[iLastf].My) maxValue_komb[iLastf].My = Math.abs(Mx)
                    if (disp > maxValue_komb[iLastf].disp) maxValue_komb[iLastf].disp = disp

                    this.M_komb[iLastf][iteil] = Mx
                    this.V_komb[iLastf][iteil] = Vx
                    this.N_komb[iLastf][iteil] = Nx
                    this.u_komb[iLastf][iteil] = ux
                    this.uG_komb[iLastf][iteil] = uxG
                    this.w_komb[iLastf][iteil] = wx
                    this.wG_komb[iLastf][iteil] = wxG
                    this.phi_komb[iLastf][iteil] = phix
                    this.phiG_komb[iLastf][iteil] = phixG
                    this.bettung_komb[iLastf][iteil] = 0.0

                    if (this.normalkraft >= 0.0) {
                        this.Vb_komb[iLastf][iteil] = Vx
                        this.Nb_komb[iLastf][iteil] = Nx
                    } else {
                        let Nb = Nx + Vx * phixG
                        let Vb = Vx - Nx * phixG
                        this.Vb_komb[iLastf][iteil] = Vb
                        this.Nb_komb[iLastf][iteil] = Nb
                        if (Math.abs(Vb) > maxValue_komb[iLastf].Vz) maxValue_komb[iLastf].Vz = Math.abs(Vb)
                        if (Math.abs(Nb) > maxValue_komb[iLastf].N) maxValue_komb[iLastf].N = Math.abs(Nb)
                    }
                }  // ende TH II Ordnung

                // console.log("x, Vx, Mx", x, Vx, Mx, wx, phix)
                //x += d_x
            }
        }

    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Moment(Mx: number[], iLastf: number) {

        if (THIIO_flag === 0 && matprop_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  Mx[i] = this.M_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  Mx[i] = this.M_komb[iLastf - nlastfaelle][i]
            }
        } else {
            for (let i = 0; i < this.nTeilungen; i++) Mx[i] = this.M_komb[iLastf][i]
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Querkraft(Vx: number[], iLastf: number, use_gleichgewichtSG: boolean) {


        if (THIIO_flag === 0 && matprop_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  Vx[i] = this.V_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  Vx[i] = this.V_komb[iLastf - nlastfaelle][i]
            }
        } else {
            if (use_gleichgewichtSG) {
                for (let i = 0; i < this.nTeilungen; i++) Vx[i] = this.V_komb[iLastf][i]
            } else {
                for (let i = 0; i < this.nTeilungen; i++) Vx[i] = this.Vb_komb[iLastf][i]
            }
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Normalkraft(Nx: number[], iLastf: number, use_gleichgewichtSG: boolean) {


        if (THIIO_flag === 0 && matprop_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  Nx[i] = this.N_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  Nx[i] = this.N_komb[iLastf - nlastfaelle][i]
            }
        } else {
            if (use_gleichgewichtSG) {
                for (let i = 0; i < this.nTeilungen; i++) Nx[i] = this.N_komb[iLastf][i]
            } else {
                for (let i = 0; i < this.nTeilungen; i++) Nx[i] = this.Nb_komb[iLastf][i]
            }
        }
    }


    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_bettung(bettung: number[], iLastf: number) {


        if (THIIO_flag === 0 && matprop_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  bettung[i] = this.bettung_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  bettung[i] = this.bettung_komb[iLastf - nlastfaelle][i]
            }
        } else {
            for (let i = 0; i < this.nTeilungen; i++) bettung[i] = this.bettung_komb[iLastf][i]
        }
    }


    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_u_w_phi(ux: number[], wx: number[], phix: number[], iLastf: number, gesamt: boolean) {


        if (THIIO_flag === 0 && matprop_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++) {
                    ux[i] = this.u_[iLastf][i]
                    wx[i] = this.w_[iLastf][i]
                    phix[i] = this.phi_[iLastf][i]
                }
            } else {
                for (let i = 0; i < this.nTeilungen; i++) {
                    ux[i] = this.u_komb[iLastf - nlastfaelle][i]
                    wx[i] = this.w_komb[iLastf - nlastfaelle][i]
                    phix[i] = this.phi_komb[iLastf - nlastfaelle][i]
                }
            }
        } else {
            for (let i = 0; i < this.nTeilungen; i++) {
                if (gesamt) {
                    ux[i] = this.uG_komb[iLastf][i]
                    wx[i] = this.wG_komb[iLastf][i];
                    phix[i] = this.phiG_komb[iLastf][i]
                } else {
                    ux[i] = this.u_komb[iLastf][i]
                    wx[i] = this.w_komb[iLastf][i];
                    phix[i] = this.phi_komb[iLastf][i]
                }
            }
        }
    }


}