export function plotPoints(fn: (x: number) => number, min: number, max: number, mapX: (x: number) => number, mapY: (y: number) => number, count = 121) {
  return Array.from({ length: count }, (_, index) => {
    const x = min + (max - min) * index / (count - 1)
    return `${mapX(x)},${mapY(fn(x))}`
  }).join(' ')
}

export const formatMath = (value: number, digits = 2) => Number(value.toFixed(digits)).toString()
