// Current price plus an optional struck-through original price. Reads as
// "Price ₹29, original price ₹199" to screen readers; sighted users get the
// price, a space and the struck-through original.
export default function Price({
  price,
  originalPrice,
  className = "",
}: {
  price: string;
  originalPrice?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="sr-only">Price </span>
      <span className="font-semibold">{price}</span>
      {originalPrice ? (
        <>
          {" "}
          <del className="ml-1 font-normal text-ink/50">
            <span className="sr-only">, original price </span>
            {originalPrice}
          </del>
        </>
      ) : null}
    </span>
  );
}
