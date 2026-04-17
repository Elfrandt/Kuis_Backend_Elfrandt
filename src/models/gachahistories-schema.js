module.exports = (db) =>
  db.model(
    'GachaHistories',
    db.Schema(
      {
        userId: {
          type: db.Schema.Types.ObjectId,
          ref: 'Users',
          required: true,
        },
        prizeId: {
          type: db.Schema.Types.ObjectId,
          ref: 'Prizes',
          default: null, //
        },
      },
      {
        timestamps: true,
      }
    )
  );
