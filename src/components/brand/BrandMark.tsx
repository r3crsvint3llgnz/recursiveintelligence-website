import R3IMark from "./R3IMark";
import RLambdaMark from "./RLambdaMark";

// Toggle here which mark you want in the header:
const ACTIVE: "r3i" | "lambda" = "r3i";

export default function BrandMark({ size = 20 }: { size?: number }) {
  if (ACTIVE === "r3i") {
    return <R3IMark boxed={false} size={size} />;
  }
  return <RLambdaMark boxed={false} outline="white" size={size} />;
}
