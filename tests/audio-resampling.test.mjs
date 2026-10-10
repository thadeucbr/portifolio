import test from "node:test";
import assert from "node:assert/strict";
import { mixAudioChannelsToMono, resampleMonoAudio } from "../src/ai/audioResampling.mjs";

test("mixes two audio channels to mono without changing frame count", () => {
  const mono = mixAudioChannelsToMono([
    new Float32Array([1, 0.5, -1]),
    new Float32Array([-1, 0.5, 1]),
  ]);
  assert.deepEqual([...mono], [0, 0.5, 0]);
});

test("resamples audio with linear interpolation to the requested rate", () => {
  const result = resampleMonoAudio(new Float32Array([0, 3, 6, 9, 12, 15]), 48_000, 16_000);
  assert.deepEqual([...result], [0, 9]);
});

test("preserves samples at equal rates and returns an empty buffer for empty audio", () => {
  const input = new Float32Array([0.2, -0.2]);
  const output = resampleMonoAudio(input, 16_000, 16_000);
  assert.deepEqual([...output], [...input]);
  assert.notStrictEqual(output, input);
  assert.equal(resampleMonoAudio(new Float32Array(), 48_000, 16_000).length, 0);
});

test("rejects invalid sample rates instead of emitting broken audio", () => {
  assert.throws(() => resampleMonoAudio(new Float32Array([1]), 0, 16_000), /sample rate/i);
});
