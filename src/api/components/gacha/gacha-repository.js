const { Prizes, GachaHistories } = require('../../../models');

// Menghitung jumlah gacha user hari ini
async function countUserGachaToday(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return GachaHistories.countDocuments({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
}

// Mendapatkan hadiah yang kuotanya masih ada
async function getAvailablePrizes() {
  return Prizes.find({ remainingQuota: { $gt: 0 } });
}

// Mengurangi kuota hadiah secara atomic agar tidak tembus kuota
async function decreasePrizeQuota(prizeId) {
  return Prizes.findOneAndUpdate(
    { _id: prizeId, remainingQuota: { $gt: 0 } },
    { $inc: { remainingQuota: -1 } },
    { new: true }
  );
}

// Mencatat histori gacha
async function recordGachaHistory(userId, prizeId) {
  return GachaHistories.create({ userId, prizeId });
}

// Mengambil histori gacha user tertentu
async function getUserHistory(userId) {
  return GachaHistories.find({ userId }).populate('prizeId', 'name');
}

// Mengambil semua daftar hadiah dan sisa kuota
async function getAllPrizes() {
  return Prizes.find({}, 'name quota remainingQuota chance');
}

// Mengambil daftar pemenang (user yang hadiahnya tidak null)
async function getWinners() {
  return GachaHistories.find({ prizeId: { $ne: null } })
    .populate('userId', 'fullName')
    .populate('prizeId', 'name');
}

// (FUNGSI BARU) Untuk membuat hadiah saat database masih kosong (Seeding)
async function createPrize(name, quota, chance) {
  return Prizes.create({
    name,
    quota,
    remainingQuota: quota,
    chance,
  });
}

module.exports = {
  countUserGachaToday,
  getAvailablePrizes,
  decreasePrizeQuota,
  recordGachaHistory,
  getUserHistory,
  getAllPrizes,
  getWinners,
  createPrize,
};
