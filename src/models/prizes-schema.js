module.exports = (mongoose) =>
  mongoose.model(
    'Prizes',
    mongoose.Schema({
      name: { type: String, required: true },
      quota: { type: Number, required: true },
      remainingQuota: { type: Number, required: true },
      chance: { type: Number, required: true },
    })
  );
