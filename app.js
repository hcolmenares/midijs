// app.js

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const melodyVisualizer = document.getElementById('melody-visualizer');
const melodyInput = document.getElementById('melody-input');
const playMelodyBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const clearTextAreaBtn = document.getElementById('clear');
// Evento para actualizar noteTime cuando el valor del input cambie
document.getElementById('note-time-input').addEventListener('input', updateNoteTime);

let isPaused = false;
let noteTime = 0.5;

const melody = {
    "Do4":  { frequency: 261.63, color: "#FF0000" },
    "Re4":  { frequency: 293.66, color: "#FF7F00" },
    "Mi4":  { frequency: 329.63, color: "#FFFF00" },
    "Fa4":  { frequency: 349.23, color: "#00FF00" },
    "Sol4": { frequency: 392.00, color: "#0000FF" },
    "La4":  { frequency: 440,    color: "#4B0082" },
    "Si4":  { frequency: 493.88, color: "#9400D3" },
    "*": { frequency:  0 } // Nota de silencio
};

Object.keys(melody).forEach(key => {
    melody[key].duration = noteTime;
});

function updateNoteTime() {
    const noteTimeInput = document.getElementById('note-time-input');
    noteTime = parseFloat(noteTimeInput.value);
    Object.keys(melody).forEach(key => {
        melody[key].duration = noteTime;
    });
}

function createNotes() {
    melodyVisualizer.innerHTML = ''; // Limpiar el visualizador
    Object.keys(melody).forEach(key => {
        const note = melody[key];
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.id = key;
        noteElement.textContent = key; // Agregar el nombre de la nota al elemento
        noteElement.addEventListener('click', () => {
            // Agregar el nombre de la nota al textarea
            melodyInput.value += `${key} - `;
        });
        melodyVisualizer.appendChild(noteElement);
    });
}

function playNote(frequency, duration, id, color) {
    return new Promise(resolve => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const noteElement = document.getElementById(id);
        noteElement.style.backgroundColor = color;

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine'; // Tipo de onda

        // Configuración del volumen
        gainNode.gain.value =  0.5;

        // Duración de la nota
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        // Resolver la promesa cuando la nota haya terminado de reproducirse
        setTimeout(() => {
            noteElement.style.backgroundColor = '#333';
            resolve();
        }, duration *  1000); // Convertir la duración de segundos a milisegundos

        // Pausar y reanudar la nota
        oscillator.onended = () => {
            if (!isPaused) {
                resolve();
            }
        };
    });
}

async function playMelodyFromInput() {
    // Desactivar el botón "play"
    const playButton = document.getElementById('play');
    const clearButton = document.getElementById('clear');
    const noteInput = document.getElementById('note-time-input');
    playButton.classList.add('disabled');
    noteInput.classList.add('disabled');
    clearButton.classList.add('disabled');
    noteInput.disabled = true;
    playButton.disabled = true;
    clearButton.disabled = true;

    const inputNotes = melodyInput.value.split(' - ');
    let startTime = audioContext.currentTime;

    for (const noteName of inputNotes) {
        const note = melody[noteName.trim()];
        if (!note) continue; // Si la nota no existe en el objeto melody, continuar

        await playNote(note.frequency, note.duration, noteName, note.color);
    }

    // Si hemos llegado al final de la melodía, reactivar el botón "play"
    playButton.classList.remove('disabled');
    clearButton.classList.remove('disabled');
    noteInput.classList.remove('disabled');
    playButton.disabled = false;
    noteInput.disabled = false;
    clearButton.disabled = false;
}

function clearTextArea()  {
    melodyInput.value = '';
}

updateNoteTime();
createNotes();
playMelodyBtn.addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
        playMelodyFromInput(); // Reanudar la melodía
    } else {
        playMelodyFromInput(); // Iniciar la melodía
    }
});
clearTextAreaBtn.addEventListener('click', clearTextArea);
pauseBtn.addEventListener('click', () => {
    isPaused = true;
});