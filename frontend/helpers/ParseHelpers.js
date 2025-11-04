
function buildMusicianInstrumentMap(userInstruments) {
  const parsed = { instruments: {} };
  userInstruments.forEach(inst => {
    parsed.instruments[inst.id] = inst.MusicianLevel.level;
  });
  return parsed;
}

export { buildMusicianInstrumentMap };
