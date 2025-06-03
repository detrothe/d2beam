
import './styles/global.css';
import './styles/contextMenu.css';

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
if (process.env.NODE_ENV !== "development") {
    console.log = () => { };
}

import './pages/haupt';
import { write } from './pages/utility'
import { str_inputToJSON, read_daten } from './pages/dateien'
import { rechnen } from './pages/rechnen'
import { ConfirmDialog } from './pages/confirm_dialog';

const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
console.log("isAndroid =", isAndroid, navigator.userAgent.toLowerCase().indexOf("android"))

// let dbPromise: any;
let input: string | null;

if (isAndroid) {

    window.addEventListener('load', () => {
        input = window.localStorage.getItem('current_input');
        // write('LOAD  current input = ' + input.length)
        //console.log('LOAD  current input = ', input.length)
        if (input !== null && input.length > 0) {
            autoEingabeLesen();
            // read_daten(input);
            // rechnen(1)
        }
    });


    //     // window.addEventListener('popstate', function (event) {
    //     //     write('Android popstate')
    //     //     window.history.pushState({}, '')
    //     //     event.preventDefault();
    //     // })

    window.addEventListener('beforeunload', function () {
        //event.preventDefault();
        // Google Chrome < 119 requires returnValue to be set.
        //event.returnValue = true;

        //write("beforeunload")

        window.localStorage.setItem('current_input', str_inputToJSON());

    });

    document.addEventListener('visibilitychange', function () {
        //write(navigator.userAgent);
        //write('Android visibilitychange = ' + document.visibilityState)
        // fires when user switches tabs, apps, goes to homescreen, etc.
        if (document.visibilityState === 'hidden') {
            //write('Android hidden')
             window.localStorage.setItem('current_input', str_inputToJSON());
        }

        // fires when app transitions from prerender, user returns to the app / tab.
        if (document.visibilityState === 'visible') {
            //write('Android visible')
            }
    });

    //     window.addEventListener('beforeunload', function (event) {
    //         //window.alert('beforeunload');
    //         event.preventDefault();
    //         // Google Chrome requires returnValue to be set.
    //         event.returnValue = '';
    //         //write("beforeunload " + event)

    //         // if (dbPromise) {
    //         //     dbPromise.then(db => db.close());
    //         //     dbPromise = null;
    //         // }
    //         window.localStorage.setItem('current_input', str_inputToJSON());

    //     });

    //     window.addEventListener('pageshow', (event) => {
    //         if (event.persisted) {
    //             write('This page was restored from the bfcache.');
    //         } else {
    //             write('This page was loaded normally.');
    //             // openDB();
    //             const input = window.localStorage.getItem('current_input');
    //             write('PAGE SHOW  current input = ' + input)
    //         }
    //     });

    //     window.addEventListener('pagehide', (event) => {
    //         if (event.persisted) {
    //             write('This page *might* be entering the bfcache.');
    //             //window.alert('This page *might* be entering the bfcache.');
    //         } else {
    //             write('This page will unload normally and be discarded.');
    //             //window.alert('This page will unload normally and be discarded.');
    //         }
    //     });

    //     // window.addEventListener('load', function () {
    //     //     write('Android load')
    //     //     window.history.pushState({ noBackExitsApp: true }, '')
    //     //     // window.history.back();
    //     //     // window.history.forward();
    //     // })

    //     // window.addEventListener('popstate', function (event) {
    //     //     write('Android popstate'+event.state)
    //     //     if (event.state && event.state.noBackExitsApp) {
    //     //         window.history.pushState({ noBackExitsApp: true }, '')
    //     //         // window.history.back();
    //     //         // window.history.forward();
    //     //     }
    //     // })




} else {

    // Damit man nicht versehentlich das Browserfenster löscht und Eingaben verliert

    window.addEventListener('beforeunload', function (event) {
        event.preventDefault();
        // Google Chrome < 119 requires returnValue to be set.
        event.returnValue = true;
        console.log("beforeunload", navigator.userAgent)


        // if (dbPromise) {
        //     dbPromise.then(db => db.close());
        //     dbPromise = null;
        // }

        window.localStorage.setItem('current_input', str_inputToJSON());

    });

    // if ('launchQueue' in window) {
    //     console.log('File Handling API is supported!');

    //     //@ts-ignore
    //     launchQueue.setConsumer(launchParams => {
    //         handleFiles(launchParams.files);
    //     });
    // } else {
    //     console.error('File Handling API is not supported!');
    // }


    // window.addEventListener('pageshow', (event) => {
    //     if (event.persisted) {
    //         //write('This page was restored from the bfcache.');
    //     } else {
    //         //write('This page was loaded normally.');
    //         // openDB();
    //         const input = window.localStorage.getItem('current_input');
    //         //write('current input = ' + input)

    //     }
    // });

    window.addEventListener('load', () => {
        input = window.localStorage.getItem('current_input');
        //write('LOAD  current input = ' + input.length)
        //console.log('LOAD  current input = ', input.length)
        if (input !== null && input.length > 0) {
            autoEingabeLesen();
        }
    });

    // document.addEventListener("readystatechange", (event: any) => {
    //     console.log("readystatechange", event.target.readyState, document.readyState)
    //     console.log('LOADED  current input = ', input)
    //     if (event.target.readyState === "complete") {
    //         //if (input) read_daten(input);;
    //     }
    // });

}

async function handleFiles(files: any) {
    for (const file of files) {
        const blob = await file.getFile();
        blob.handle = file;
        const text = await blob.text();

        console.log(`${file.name} handled, content: ${text}`);
    }
}

async function autoEingabeLesen() {
    const dialog = new ConfirmDialog({
        trueButton_Text: 'ja',
        falseButton_Text: 'nein',
        question_Text: 'letzte (automatisch) gespeicherte Eingabe einlesen'
    });
    const loesche = await dialog.confirm();

    if (loesche) {
        if (input !== null) read_daten(input);
        rechnen(1)
    }

}

// function openDB() {
//     if (!dbPromise) {
//         dbPromise = new Promise((resolve, reject) => {
//             const req = indexedDB.open('my-db', 1);
//             req.onupgradeneeded = () => req.result.createObjectStore('keyval');
//             req.onerror = () => reject(req.error);
//             req.onsuccess = () => resolve(req.result);
//         });
//     }
//     return dbPromise;
// }
