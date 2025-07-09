import { HistoricalArrow } from "../../types";

interface BattleArrowProps {
  arrow: HistoricalArrow;
  progress?: number;
}

/**
 * Komponent renderujący symetryczną strzałkę bitewną w kształcie znaku kierunkowego
 */
export default function BattleArrow({ arrow, progress = 1 }: BattleArrowProps) {
  // Obliczanie punktu końcowego na podstawie postępu animacji
  const endX = arrow.start.x + (arrow.end.x - arrow.start.x) * progress;
  const endY = arrow.start.y + (arrow.end.y - arrow.start.y) * progress;
  
  // Obliczenie kąta strzałki
  const angle = Math.atan2(endY - arrow.start.y, endX - arrow.start.x);
  
  // Domyślny kolor - niebieski jak na obrazkach, można nadpisać z propsa
  const arrowColor = arrow.color || "#3F51B5";
  
  // Obliczamy odległość między punktami
  const distance = Math.sqrt(
    Math.pow(endX - arrow.start.x, 2) + 
    Math.pow(endY - arrow.start.y, 2)
  );
  
  // Bazowa wysokość strzałki w SVG to 21.5, dopasujmy skalę do odległości
  // Dodajemy mnożnik 1.2, aby strzałka była nieco dłuższa niż odległość między punktami
  const scale = distance / 21.5 * 1.2;
  
  // Konwersja z rad na stopnie i dodanie 90 stopni, aby górna część strzałki wskazywała kierunek
  const rotationDegrees = angle * (180 / Math.PI) + 90;
  
  // Szerokość strzałki (po skalowaniu) - zmniejszona o 30% dla smuklejszego wyglądu
  const arrowWidth = 10 * scale;
  
  // Przesunięcie tak, aby strzałka zaczynała się w punkcie start i wskazywała punkt end
  // Centrujemy strzałkę względem osi X
  const translateX = arrow.start.x - (arrowWidth / 2);
  // Przesuwamy strzałkę tak, aby punkt start był na dole strzałki
  const translateY = arrow.start.y - (21.5 * scale);
  
  // Tworzymy symetryczny path dla strzałki
  const arrowPath = `
    M ${arrowWidth / 2} ${0.5 * scale} 
    L ${0 * scale} ${13.5 * scale} 
    L ${2.5 * scale} ${13.5 * scale} 
    L ${2.5 * scale} ${21.5 * scale} 
    L ${4.5 * scale} ${21.5 * scale} 
    L ${4.5 * scale} ${11.5 * scale} 
    L ${3 * scale} ${11.5 * scale} 
    L ${arrowWidth / 2} ${5.5 * scale} 
    L ${arrowWidth - 3 * scale} ${11.5 * scale} 
    L ${arrowWidth - 4.5 * scale} ${11.5 * scale} 
    L ${arrowWidth - 4.5 * scale} ${21.5 * scale} 
    L ${arrowWidth - 2.5 * scale} ${21.5 * scale} 
    L ${arrowWidth - 2.5 * scale} ${13.5 * scale} 
    L ${arrowWidth} ${13.5 * scale} 
    Z
  `;

  // Transformacja - najpierw przesunięcie, potem obrót wokół punktu początkowego
  const transform = `translate(${translateX}, ${translateY}) rotate(${rotationDegrees}, ${arrowWidth / 2}, ${21.5 * scale})`;
  
  return (
    <path
      d={arrowPath}
      fill={arrowColor}
      transform={transform}
    />
  );
}