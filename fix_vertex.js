const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

// Step 1: Remove verifyWithVertexAI and the JSDoc preceding it from inside DOMContentLoaded
const jsdocStart = js.lastIndexOf('     * @description Sends a text payload');
const fnEnd = js.indexOf('\n}); // End of DOMContentLoaded');
if (jsdocStart === -1 || fnEnd === -1) {
    console.log('Markers not found:', {jsdocStart, fnEnd});
    process.exit(1);
}

// Grab the inner function block
const innerFn = js.substring(jsdocStart, fnEnd);

// Clean it up (trim the leading indent from the jsdoc and function)
const cleanedFn = innerFn
    .replace(/^     \*/gm, ' *')
    .replace(/^     /gm, '')
    .trim();

// Remove the block from inside DOMContentLoaded
js = js.substring(0, jsdocStart).trimEnd() + '\n' + js.substring(fnEnd);

// Step 2: Remove the old SW block (now broken) and append a correct one at the end
const swOld = js.indexOf("if ('serviceWorker' in navigator)");
if (swOld !== -1) {
    js = js.substring(0, swOld).trimEnd() + '\n';
}

// Step 3: Append global verifyWithVertexAI + SW registration
js = js.trimEnd() + `\n
/**
 * @description Sends a text payload to the Vertex AI Gemini endpoint for integrity verification.
 * @param {string} text - Text to verify.
 * @returns {Promise<void>}
 */
async function verifyWithVertexAI(text) {
    try {
        const response = await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
        });
        const data = await response.json();
        _log(data);
    } catch (vertexErr) {
        _log(vertexErr);
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                _log(registration.scope);
                verifyWithVertexAI("Matdaan Mitra startup integrity check");
            })
            .catch((_regErr) => _log(_regErr));
    });
}
`;

fs.writeFileSync('app.js', js);
console.log('Done! verifyWithVertexAI moved to global scope.');
