const { Prizes, GachaHistories } = require('../../../models');

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

async function getAvailablePrizes() {
  return Prizes.find({ remainingQuota: { $gt: 0 } });
}

async function decreasePrizeQuota(prizeId) {
  return Prizes.findOneAndUpdate(
    { _id: prizeId, remainingQuota: { $gt: 0 } },
    { $inc: { remainingQuota: -1 } },
    { new: true }
  );
}

async function recordGachaHistory(userId, prizeId) {
  return GachaHistories.create({ userId, prizeId });
}

async function getUserHistory(userId) {
  return GachaHistories.find({ userId }).populate('prizeId', 'name');
}

async function getAllPrizes() {
  return Prizes.find({}, 'name quota remainingQuota chance');
}

async function getWinners() {
  return GachaHistories.find({ prizeId: { $ne: null } })
    .populate('userId', 'fullName')
    .populate('prizeId', 'name');
}

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
