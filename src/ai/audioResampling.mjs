export function mixAudioChannelsToMono(channels) {
  if (!Array.isArray(channels) || channels.length === 0) return new Float32Array();
  const frameCount = Math.min(...channels.map((channel) => channel?.length ?? 0));
  if (!frameCount) return new Float32Array();

  const mono = new Float32Array(frameCount);
  for (const channel of channels) {
    for (let frame = 0; frame < frameCount; frame++) mono[frame] += channel[frame] / channels.length;
  }
  return mono;
}

export function resampleMonoAudio(input, sourceRate, targetRate) {
  if (!(input instanceof Float32Array)) throw new TypeError("Audio must be a Float32Array.");
  if (!Number.isFinite(sourceRate) || sourceRate <= 0 || !Number.isFinite(targetRate) || targetRate <= 0) {
    throw new RangeError("Audio sample rates must be positive numbers.");
  }
  if (input.length === 0) return new Float32Array();
  if (sourceRate === targetRate) return input.slice();

  const outputLength = Math.max(1, Math.round(input.length * targetRate / sourceRate));
  const output = new Float32Array(outputLength);
  const step = sourceRate / targetRate;
  for (let index = 0; index < outputLength; index++) {
    const position = index * step;
    const left = Math.min(Math.floor(position), input.length - 1);
    const right = Math.min(left + 1, input.length - 1);
    const fraction = position - left;
    output[index] = input[left] * (1 - fraction) + input[right] * fraction;
  }
  return output;
}
