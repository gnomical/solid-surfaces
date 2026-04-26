import styles from "./Chip.module.css"

export function Chip(props: {
  vertical?: boolean;
  edge: "top" | "right" | "bottom" | "left";
  span?: "inset" | "full";
  order?: number;
  breakpoint?: number;
  type: "Rail" | "Overlay";
  reveal?: "always" | "scroll-toward" | "scroll-away";
}) {
  const tokens = () => ([
    ["edge", props.edge, false],
    ["span", props.span ?? "full", false],
    props.order != null && ["order", String(props.order), true],
    props.breakpoint != null && ["breakpoint", String(props.breakpoint), true],
    props.reveal && ["reveal", props.reveal, false],
  ] as const).filter(Boolean) as [string, string, boolean][];

  return (
    <span classList={{
      [styles.chip]: true,
      [styles.vertical]: props.vertical,
    }}>
      <span class={styles.type}>{props.type}</span>
      {tokens().map(([k, v, isNum]) => (
        <>
          <span class={styles.dot}>·</span>
          <span>
            <span class={styles.key}>{k}</span>={isNum ? "{" : `"`}
            <span class={styles.value}>{v}</span>
            {isNum ? "}" : `"`}
          </span>
        </>
      ))}
    </span>
  )
}
