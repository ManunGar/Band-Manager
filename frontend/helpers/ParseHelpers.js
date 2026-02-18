import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function buildMusicianInstrumentMap(userInstruments) {
  const parsed = { instruments: {} };
  userInstruments.forEach(inst => {
    parsed.instruments[inst.id] = inst.MusicianLevel.level;
  });
  return parsed;
}

// Format date and time to a readable format in Spanish, e.g. "Lunes, 5 de Julio a las 20:30"
function parseDateTime(date, time) {
  let dateTime;
  
  if (time) {
    const dateOnly = date.split('T')[0];
    dateTime = new Date(`${dateOnly}T${time}`);
  } else {
    dateTime = new Date(date);
  }
  const formatted = format(dateTime, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es });
  
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}


export { buildMusicianInstrumentMap, parseDateTime };

