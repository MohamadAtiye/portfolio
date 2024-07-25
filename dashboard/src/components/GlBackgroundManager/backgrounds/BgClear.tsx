
interface BgClearProps {
  color: string;
}
export default function BgClear({ color }: BgClearProps) {
  return (
    <canvas
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        background: color ?? "transparent",
        zIndex: -1,
      }}
    />
  );
}
