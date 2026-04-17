const WineDetails = ({
  wineName,
  vintage,
  quantity,
  size,
  datePurchased,
  purchasedFrom,
  dateStored,
  storage,
  notes,
  drinkBy,
  drinkStatus,
}) => {
  return (
    <div className="bg-green-400 mb-4 border-solid border-2 border-gray-300 rounded shadow">
      <h1 className="bg-amber-50  font-medium min-h-20 flex items-center justify-center text-center line-clamp-2 px-2">{wineName}</h1>
      <div className="p-2">
        <p>Vintage: {vintage}</p>
        <p>Quantity: {quantity}</p>
        <p>Size: {size}</p>
        <p>Date Purchased: {datePurchased}</p>
        <p>Purchased From: {purchasedFrom}</p>
        <p>Date Stored: {dateStored}</p>
      <p>Storage: {storage}</p>
      <p>Notes: {notes}</p>
      <p>Drink By: {drinkBy}</p>
      <p>Drink Status: {drinkStatus}</p>
    </div>
    </div>
  );
};

export default WineDetails;
