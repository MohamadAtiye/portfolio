import { ACTIONS, useData } from "../../helpers/useData";

export default function CurrentImg() {
  const { currentImage, activeAction } = useData();
  return (
    <img
      src={currentImage?.imageDataUrl}
      style={{
        objectFit: "contain",
        minWidth: "350px",
        position: "absolute",
        top: 0,
        left: 0,

        height: `100%`,
        width: `100%`,
        opacity: activeAction === ACTIONS.crop ? 0.2 : 1,
      }}
    />
  );
}
