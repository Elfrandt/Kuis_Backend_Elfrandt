const mongoose = require('mongoose');
const gachaService = require('./gacha-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

async function playGacha(request, response, next) {
  try {
    const userId = request.body.user_id;

    if (!userId) {
      throw errorResponder(errorTypes.VALIDATION_ERROR, 'User ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Invalid User ID format'
      );
    }

    const result = await gachaService.playGacha(userId);

    if (result.error === 'LIMIT_EXCEEDED') {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Limit gacha telah mencapai maksimum hari ini (maks 5 kali)'
      );
    }

    return response.status(200).json({
      message: result.prize
        ? 'Selamat, Lu menang gacha-nya!.'
        : 'Lu ga menang apa-apa kali ini, coba lagi ya.',
      prize: result.prize ? result.prize.name : null,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserHistory(request, response, next) {
  try {
    const { userId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Invalid User ID format'
      );
    }

    const history = await gachaService.getUserHistory(userId);

    // Merapikan output histori biar ga berantakan
    const formattedHistory = history.map((record) => ({
      mainTanggal: record.createdAt,
      hasil: record.prizeId ? 'Menang' : 'Zonk',
      namaHadiah: record.prizeId ? record.prizeId.name : '-',
    }));

    return response.status(200).json({
      userId: userId,
      totalMain: formattedHistory.length,
      history: formattedHistory,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPrizeQuotas(request, response, next) {
  try {
    const prizes = await gachaService.getPrizeQuotas();
    const format = prizes.map((prize) => ({
      prize_name: prize.name,
      total_quota: prize.quota,
      remaining_quota: prize.remainingQuota,
      status: prize.remainingQuota > 0 ? 'Tersedia' : 'Habis',
      win_chance: `${(prize.chance * 100).toFixed(1)}%`,
    }));

    return response.status(200).json(format);
  } catch (error) {
    return next(error);
  }
}
async function getWinners(request, response, next) {
  try {
    const winners = await gachaService.getWinnersList();

    return response.status(200).json(winners);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  playGacha,
  getUserHistory,
  getPrizeQuotas,
  getWinners,
};
