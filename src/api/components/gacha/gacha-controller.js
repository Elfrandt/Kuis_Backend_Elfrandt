const mongoose = require('mongoose');
const gachaService = require('./gacha-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

async function playGacha(request, response, next) {
  try {
    const userId = request.body.user_id;

    // Validasi input
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

    // Validasi limit harian
    if (result.error === 'LIMIT_EXCEEDED') {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Gacha limit exceeded for today (Max 5 times)'
      );
    }

    // Response gacha simpel
    return response.status(200).json({
      message: result.prize
        ? 'Congratulations! You won a prize.'
        : 'You did not win anything this time. Try again!',
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

    // Langsung return data asli dari service
    return response.status(200).json(history);
  } catch (error) {
    return next(error);
  }
}

async function getPrizeQuotas(request, response, next) {
  try {
    // 1. Ambil data mentah dari service
    const prizes = await gachaService.getPrizeQuotas();
    // 2. Format (Map) datanya agar rapih
    const format = prizes.map((prize) => ({
      prize_name: prize.name,
      total_quota: prize.quota,
      remaining_quota: prize.remainingQuota,
      status: prize.remainingQuota > 0 ? 'Tersedia' : 'Habis',
      win_chance: `${(prize.chance * 100).toFixed(1)}%`, // Ubah desimal jadi persen (contoh: 0.5%)
    }));

    // 3. Return data yang sudah dirapikan
    return response.status(200).json(format);
  } catch (error) {
    return next(error);
  }
}
async function getWinners(request, response, next) {
  try {
    const winners = await gachaService.getWinnersList();

    // Langsung return data asli dari service
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
