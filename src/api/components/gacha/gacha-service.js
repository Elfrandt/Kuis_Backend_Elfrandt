const gachaRepository = require('./gacha-repository');

const PRIZE_LIST = [
  { name: 'Emas 10 gram', quota: 1, chance: 0.001 },
  { name: 'Smartphone X', quota: 5, chance: 0.005 },
  { name: 'Smartwatch Y', quota: 10, chance: 0.006 },
  { name: 'Voucher Rp100.000', quota: 100, chance: 0.1 },
  { name: 'Pulsa Rp50.000', quota: 500, chance: 0.4 },
];

async function syncPrizes() {
  try {
    const existingPrizes = await gachaRepository.getAllPrizes();
    if (existingPrizes.length === 0) {
      await Promise.all(
        PRIZE_LIST.map((p) =>
          gachaRepository.createPrize(p.name, p.quota, p.chance)
        )
      );
      console.log('Sinkronisasi hadiah berhasil.');
    }
  } catch (error) {
    console.error('CRITICAL ERROR: Gagal sinkronisasi hadiah:', error);
  }
}

syncPrizes();

// Fungsi bantuan untuk menyamarkan nama SECARA ACAK (Sesuai soal bonus point 3)
function maskName(name) {
  if (!name) return '';
  return name
    .split('')
    .map((char) => {
      if (char === ' ') return ' ';
      // 50% peluang karakter diubah menjadi '*'
      return Math.random() > 0.5 ? '*' : char;
    })
    .join('');
}

async function playGacha(userId) {
  // 1. Cek limit gacha per hari (maksimal 5 kali)
  const gachaCount = await gachaRepository.countUserGachaToday(userId);
  if (gachaCount >= 5) {
    return { error: 'LIMIT_EXCEEDED' };
  }

  // 2. Ambil daftar hadiah yang masih tersedia
  const availablePrizes = await gachaRepository.getAvailablePrizes();

  let wonPrize = null;

  // 3. Logika Gacha: Algoritma Peluang Kumulatif
  if (availablePrizes.length > 0) {
    const rand = Math.random();
    let cumulativeChance = 0;
    let selectedPrizeToWin = null;

    for (let i = 0; i < availablePrizes.length; i += 1) {
      cumulativeChance += availablePrizes[i].chance;

      if (rand < cumulativeChance) {
        selectedPrizeToWin = availablePrizes[i];
        break;
      }
    }

    if (selectedPrizeToWin) {
      const updatedPrize = await gachaRepository.decreasePrizeQuota(
        selectedPrizeToWin.id
      );

      if (updatedPrize) {
        wonPrize = updatedPrize;
      }
    }
  }

  // 4. Catat histori hadiah
  const prizeId = wonPrize ? wonPrize.id : null;
  await gachaRepository.recordGachaHistory(userId, prizeId);

  return { success: true, prize: wonPrize };
}

async function getUserHistory(userId) {
  return gachaRepository.getUserHistory(userId);
}

async function getPrizeQuotas() {
  return gachaRepository.getAllPrizes();
}

async function getWinnersList() {
  const winners = await gachaRepository.getWinners();

  return winners.map((record) => ({
    hadiah: record.prizeId?.name || 'Hadiah Tidak Diketahui',
    namaPemenang: maskName(record.userId?.fullName || 'Unknown User'),
    waktuMenang: record.createdAt,
  }));
}

module.exports = {
  playGacha,
  getUserHistory,
  getPrizeQuotas,
  getWinnersList,
};
