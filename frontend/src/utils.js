export const inr = (n) => '₹' + Number(n || 0).toFixed(2);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';

// Category emoji icon helper
export const getCategoryIcon = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('dairy')) return '🥛';
  if (cat.includes('bakery') || cat.includes('bread')) return '🍞';
  if (cat.includes('grocery') || cat.includes('atta') || cat.includes('dal') || cat.includes('rice')) return '🌾';
  if (cat.includes('snack') || cat.includes('chips')) return '🥨';
  if (cat.includes('beverage') || cat.includes('juice') || cat.includes('tea') || cat.includes('drink')) return '🧃';
  if (cat.includes('stationery') || cat.includes('pen') || cat.includes('book')) return '📓';
  if (cat.includes('personal') || cat.includes('soap') || cat.includes('shampoo')) return '🧴';
  if (cat.includes('clean')) return '🧹';
  if (cat.includes('frozen') || cat.includes('ice cream')) return '🧊';
  if (cat.includes('health')) return '💊';
  if (cat.includes('breakfast')) return '🥣';
  return '📦';
};

// Play modern POS supermarket scan beep using Web Audio API
export const playScanBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant dual chime
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6
    osc.frequency.setValueAtTime(2637, ctx.currentTime + 0.06); // E7

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
  } catch {
    // Ignore audio errors if blocked
  }
};
