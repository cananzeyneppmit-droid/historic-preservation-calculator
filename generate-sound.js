/**
 * Generate a simple typewriter-like click sound
 * Creates a WAV file with a short percussive sound
 */

import { writeFileSync } from 'fs';

function generateClickSound() {
  const sampleRate = 44100;
  const duration = 0.05; // 50ms click
  const numSamples = Math.floor(sampleRate * duration);

  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Create a short noise burst with exponential decay
    const noise = (Math.random() * 2 - 1) * 0.5;
    const decay = Math.exp(-t * 100);

    // Add a high-frequency tone for the "click"
    const tone = Math.sin(2 * Math.PI * 3000 * t) * 0.3;
    const toneDecay = Math.exp(-t * 150);

    samples[i] = (noise * decay + tone * toneDecay) * 0.8;
  }

  return samples;
}

function floatTo16BitPCM(float32Array) {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

function writeWavFile(filename, samples, sampleRate) {
  const data = floatTo16BitPCM(samples);
  const buffer = new ArrayBuffer(44 + data.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + data.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, data.length * 2, true);

  // Write samples
  for (let i = 0; i < data.length; i++) {
    view.setInt16(44 + i * 2, data[i], true);
  }

  writeFileSync(filename, Buffer.from(buffer));
  console.log(`Generated ${filename} (${data.length} samples at ${sampleRate}Hz)`);
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Generate the sound
const samples = generateClickSound();
writeWavFile('./src/assets/typewriter-click.wav', samples, 44100);

console.log('Sound generated! You may need to convert to MP3 or use the WAV file directly.');
console.log('Update the audio element in index.html to use .wav extension if needed.');
