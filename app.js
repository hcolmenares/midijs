// Constantes y variables //

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const melody = {
    "C4": { frequency:  261.63, duration:  1, color: "#FF0000" }, // Rojo
    "D4": { frequency:  293.66, duration:  1, color: "#FF7F00" }, // Naranja
    "E4": { frequency:  329.63, duration:  1, color: "#FFFF00" }, // Amarillo
    "F4": { frequency:  349.23, duration:  1, color: "#00FF00" }, // Verde
    "G4": { frequency:  392.00, duration:  1, color: "#0000FF" }, // Azul
    "A4": { frequency:  440, duration:  1, color: "#4B0082" }, // Morado
    "B4": { frequency:  493.88, duration:  1, color: "#9400D3" }, // Violeta
    "C5": { frequency:  523.25, duration:  1, color: "#FF00FF" }, // Magenta
    "D5": { frequency:  587.33, duration:  1, color: "#00FFFF" }, // Cian
    "E5": { frequency:  659.25, duration:  1, color: "#008080" }, // Verde azulado
    "F5": { frequency:  698.46, duration:  1, color: "#008000" }, // Verde oscuro
    "G5": { frequency:  783.99, duration:  1, color: "#800000" }, // Marrón
    "A5": { frequency:  880, duration:  1, color: "#800080" }, // Morado oscuro
    "B5": { frequency:  988, duration:  1, color: "#FFFFFF" }, // Blanco
    "C6": { frequency:  1046.50, duration:  1, color: "#FF0000" } // Rojo
};

const melodyVisualizer = document.getElementById('melody-visualizer');

// Funciones

function createNotes() {
    melodyVisualizer.innerHTML = ''; // Limpiar el visualizador

    Object.keys(melody).forEach(key => {
        const note = melody[key];
        const noteElement = document.createElement('div');

        noteElement.classList.add('note');
        noteElement.id = key;
        noteElement.addEventListener('click', () => {
            // Reproducir la nota cuando se haga clic en el círculo
            playNote(note.frequency, note.duration, note.color, noteElement.id);
        });
        melodyVisualizer.appendChild(noteElement);
    });
}

// Función para reproducir una nota
async function playNote(frequency, duration, color, id) {
    const noteElement = document.getElementById(id);
    noteElement.style.backgroundColor = color;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine'; // Tipo de onda

    // Configuración del volumen
    gainNode.gain.value =   0.5;

    // Duración de la nota
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    // Esperar la duración de la nota antes de cambiar el color de vuelta a blanco
    await new Promise(resolve => setTimeout(resolve, duration *   1000));
    noteElement.style.backgroundColor = "#FFFFFF"; // Cambiar el color de vuelta a blanco
}

// Función para reproducir la melodía
async function playMelody() {
    // Desactivar el botón "play"
    const playButton = document.getElementById('play');
    playButton.classList.add('disabled');
    playButton.disabled = true;

    // Función recursiva para reproducir las notas de manera secuencial
    async function playNotes(index) {
        if (index >= Object.keys(melody).length) {
            // Si hemos llegado al final de la melodía, reactivar el botón "play"
            playButton.classList.remove('disabled');
            playButton.disabled = false;
            return;
        }

        const key = Object.keys(melody)[index];
        const note = melody[key];
        await playNote(note.frequency, note.duration, note.color, key);

        // Llamar a sí misma para la siguiente nota
        playNotes(index +   1);
    }

    // Iniciar la reproducción de la melodía
    playNotes(0);
}

