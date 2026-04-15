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
    <div className=" border mb-4 rounded mx-auto bg-zinc-500">
      <h1>{wineName}</h1>
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
  );
};

export default WineDetails;
