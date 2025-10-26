import { useMemo } from 'react';

export type DefiMoment = 'morning' | 'evening' | 'onDemand';

// Basit mock veriler (emoji yok, sadece düz metin döneceğiz)
const mock = {
  userName: 'Dostum',
  canavarEnergy: 50,
  stepsToday: 0,
  walkingMinutesToday: 0,
  supplementsTaken: false,
  carbTotal: 90,
  completedMeals: 2,
};

function pct(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function useDefiCoach(moment: DefiMoment = 'onDemand') {
  const message = useMemo(() => {
    const name = mock.userName;
    const energy = pct(mock.canavarEnergy);

    if (moment === 'morning') {
      if (energy >= 70)
        return `Günaydın ${name}! Canavar bugün yüzde ${energy} enerjik. Bu ivmeyle kahvaltıda planlı hareket edelim.`;
      return `Günaydın ${name}! Bugün canavarı yüzde ${energy} seviyesinden yüzde ${Math.min(
        100,
        energy + 10
      )} hedefine çekelim. 15 dakika yürüyüşle başlıyoruz.`;
    }

    if (moment === 'evening') {
      const stepsOk = mock.stepsToday >= 3000 || mock.walkingMinutesToday >= 15;
      const suppOk = mock.supplementsTaken;
      if (stepsOk && suppOk)
        return `Akşam değerlendirmesi: Yürüyüş ve takviyeler tamam. Canavar mutlu, yarın hedef yüzde ${Math.min(
          100,
          energy + 5
        )}.`;
      if (!stepsOk && !suppOk)
        return `Akşam: Bugün kısa kaldı. 10 dakika esneme ve su iç; yarın 15 dakika yürüyüşle telafi ederiz. Vazgeçmek yok.`;
      if (!stepsOk)
        return `Akşam: Takviyeler tamam. Yürüyüş eksik kaldıysa ev içinde 1000 adım mini hedef deneyelim.`;
      return `Akşam: Yürüyüş güzel. Takviyeyi atladıysan uygun saatse şimdi almayı düşünebilirsin.`;
    }

    if (mock.completedMeals >= 3)
      return `Harika gidiyoruz. Günün menüsü neredeyse tam. Su içmeyi unutma.`;
    if (mock.carbTotal > 110)
      return `Bugün karbonhidrat biraz yüksek görünüyor (${mock.carbTotal} g). Yarın dengelemek için porsiyonu yüzde 10 küçültelim.`;
    return `Adım adım ilerliyoruz. Küçük kazanımlar, büyük dönüşüm: Regenerasyon modundayız.`;
  }, [moment]);

  return { message };
}