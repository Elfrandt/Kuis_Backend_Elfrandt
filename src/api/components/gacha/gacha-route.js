const express = require('express');
const gachaController = require('./gacha-controller');

const route = express.Router();

module.exports = (app) => {
  app.use('/gacha', route);

  // Endpoint untuk bermain gacha
  route.post('/play', gachaController.playGacha);

  // Bonus Point 1: Histori gacha user beserta hadiah
  route.get('/history/:userId', gachaController.getUserHistory);

  // Bonus Point 2: Daftar hadiah dan sisa kuota
  route.get('/prizes', gachaController.getPrizeQuotas);

  // Bonus Point 3: Daftar pemenang dengan nama yang disamarkan
  route.get('/winners', gachaController.getWinners);
};
