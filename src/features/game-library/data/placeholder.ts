const PALETTE = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#64748b', '#475569'];

const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomColor = () => PALETTE[getRandom(0, PALETTE.length - 1)];

const createRandomShape = (): string => {
  const type = getRandom(1, 3);
  switch (type) {
    case 1: // Circle
      return `<circle cx="${getRandom(50, 350)}" cy="${getRandom(50, 250)}" r="${getRandom(20, 60)}" fill="${getRandomColor()}" />`;
    case 2: // Rectangle
      return `<rect x="${getRandom(50, 300)}" y="${getRandom(50, 200)}" width="${getRandom(40, 120)}" height="${getRandom(40, 120)}" rx="15" transform="rotate(${getRandom(-45, 45)} ${getRandom(150, 250)} ${getRandom(100, 200)})" fill="${getRandomColor()}" />`;
    case 3: // Triangle Path
      const x1 = getRandom(50, 350);
      const y1 = getRandom(50, 250);
      const x2 = x1 + getRandom(-80, 80);
      const y2 = y1 + getRandom(40, 100);
      const x3 = x1 + getRandom(-80, 80);
      const y3 = y1 + getRandom(40, 100);
      return `<path d="M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z" fill="${getRandomColor()}" />`;
    default:
      return '';
  }
};

export const createRandomPlaceholderSVG = (): string => {
  const shapes = Array.from({ length: getRandom(3, 5) }, createRandomShape).join('');
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f1f5f9"/><g opacity="0.7">${shapes}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};
